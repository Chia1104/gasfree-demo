import type * as z from "zod";

import { env } from "../env";
import * as pipe from "../pipes/gasfree.pipe";
import { gasFreeRequest } from "../repos/gasfree.repo";

/**
 * Error thrown when the GasFree provider returns a non-200 envelope.
 *
 * GasFree always responds with HTTP 200; failures are signalled in the body
 * via `code` (400 = input error, 500 = runtime error) along with `reason`
 * (exception name) and `message`.
 */
export class GasFreeApiError extends Error {
  readonly code: number;
  readonly reason: string | null;

  constructor(code: number, reason: string | null, message: string | null) {
    super(message ?? reason ?? `GasFree request failed with code ${code}`);
    this.name = "GasFreeApiError";
    this.code = code;
    this.reason = reason;
  }
}

interface RequestOptions<TSchema extends z.ZodType> {
  method: "GET" | "POST";
  /** Endpoint path after the network prefix, e.g. `/api/v1/config/token/all`. */
  path: string;
  /** Schema used to validate and transform the `data` payload. */
  data: TSchema;
  body?: unknown;
}

/**
 * Performs a signed GasFree request, validates/transforms the response
 * envelope through the given pipe schema, and returns the parsed `data`.
 *
 * Throws {@link GasFreeApiError} when the envelope reports a non-200 `code`,
 * and a Zod error when the payload does not match the schema.
 */
async function request<TSchema extends z.ZodType>({
  method,
  path,
  data,
  body,
}: RequestOptions<TSchema>): Promise<z.infer<TSchema>> {
  // The signature is computed over the prefixed path, so we sign and request
  // the exact same path including the network prefix (e.g. `/nile`, `/tron`).
  const signedPath = `${env.GF_API_PATH_PREFIX}${path}`;

  const raw = await gasFreeRequest<unknown>({
    baseUrl: env.GF_BASE_URL,
    method,
    path: signedPath,
    body,
    apiKey: env.GF_API_KEY,
    apiSecret: env.GF_API_SECRET,
  });

  const envelope = pipe.BaseResponse.parse(raw);

  if (envelope.code !== 200 || envelope.data == null) {
    throw new GasFreeApiError(envelope.code, envelope.reason, envelope.message);
  }

  return data.parse(envelope.data);
}

/**
 * GET /api/v1/config/token/all
 *
 * Fetches all tokens supported for GasFree authorized transfers.
 */
export function getAllTokens(): Promise<pipe.TokenConfigResult> {
  return request({
    method: "GET",
    path: "/api/v1/config/token/all",
    data: pipe.TokenConfigResult,
  });
}

/**
 * GET /api/v1/config/provider/all
 *
 * Fetches all available Service-Providers.
 */
export function getAllProviders(): Promise<pipe.ProviderResult> {
  return request({
    method: "GET",
    path: "/api/v1/config/provider/all",
    data: pipe.ProviderResult,
  });
}

/**
 * GET /api/v1/address/{accountAddress}
 *
 * Fetches a user's GasFree account info (activation state, nonce, assets).
 *
 * @param accountAddress User EOA address.
 */
export function getAccountInfo(
  accountAddress: string
): Promise<pipe.AccountInfo> {
  return request({
    method: "GET",
    path: `/api/v1/address/${accountAddress}`,
    data: pipe.AccountInfo,
  });
}

/**
 * POST /api/v1/gasfree/submit
 *
 * Submits a signed GasFree transfer authorization.
 */
export function submitTransfer(
  body: pipe.SubmitTransferRequest
): Promise<pipe.SubmitTransferResult> {
  return request({
    method: "POST",
    path: "/api/v1/gasfree/submit",
    body: pipe.SubmitTransferRequest.parse(body),
    data: pipe.SubmitTransferResult,
  });
}

/**
 * GET /api/v1/gasfree/{traceId}
 *
 * Fetches the detailed status of a GasFree transfer authorization.
 *
 * @param traceId The transfer authorization traceId (not a transactionId).
 */
export function getTransferDetail(
  traceId: string
): Promise<pipe.TransferDetail> {
  return request({
    method: "GET",
    path: `/api/v1/gasfree/${traceId}`,
    data: pipe.TransferDetail,
  });
}
