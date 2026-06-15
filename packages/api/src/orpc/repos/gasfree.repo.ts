import crypto from "node:crypto";

import ky from "ky";
import type * as z from "zod";

import { env } from "../env";
import type { GasFreeNetwork } from "../pipes/gasfree.pipe";
import * as pipe from "../pipes/gasfree.pipe";
import { GASFREE_NETWORKS, GasFreeApiError } from "../utils/gasfree";

type GasFreeMethod = "GET" | "POST";

export function createGasFreeHeaders(
  method: GasFreeMethod,
  path: string,
  apiKey: string,
  apiSecret: string
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const message = `${method}${path}${timestamp}`;
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(message, "utf8")
    .digest("base64");

  return {
    Timestamp: String(timestamp),
    Authorization: `ApiKey ${apiKey}:${signature}`,
    "Content-Type": "application/json",
  };
}

interface GasFreeRequestOptions<TSchema extends z.ZodType> {
  /** Network to target; resolves the provider host and signed path prefix. */
  network: GasFreeNetwork;
  method: GasFreeMethod;
  /** Endpoint path after the network prefix, e.g. `/api/v1/config/token/all`. */
  path: string;
  /** Schema used to validate and transform the `data` payload. */
  data: TSchema;
  body?: unknown;
}

/**
 * Performs a signed GasFree request against the chosen network, validates and
 * transforms the response envelope through the given schema, and returns the
 * parsed `data`.
 *
 * Throws {@link GasFreeApiError} when the envelope reports a non-200 `code`,
 * and a Zod error when the payload does not match the schema.
 */
export async function gasFreeRequest<TSchema extends z.ZodType>({
  network,
  method,
  path,
  data,
  body,
}: GasFreeRequestOptions<TSchema>): Promise<z.infer<TSchema>> {
  const { baseUrl, pathPrefix } = GASFREE_NETWORKS[network];

  // The signature is computed over the prefixed path, so we sign and request
  // the exact same path including the network prefix (e.g. `/nile`, `/tron`).
  const signedPath = `${pathPrefix}${path}`;
  const headers = createGasFreeHeaders(
    method,
    signedPath,
    network === "mainnet"
      ? env.GF_API_KEY
      : (env.TEST_GF_API_KEY ?? env.GF_API_KEY),
    network === "mainnet"
      ? env.GF_API_SECRET
      : (env.TEST_GF_API_SECRET ?? env.GF_API_SECRET)
  );

  const raw = await ky(`${baseUrl}${signedPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).json<unknown>();

  const envelope = pipe.BaseResponse.parse(raw);

  if (envelope.code !== 200 || envelope.data == null) {
    throw new GasFreeApiError(envelope.code, envelope.reason, envelope.message);
  }

  return data.parse(envelope.data);
}
