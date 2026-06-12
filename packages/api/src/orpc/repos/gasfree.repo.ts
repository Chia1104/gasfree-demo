import crypto from "node:crypto";

import ky from "ky";

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

export async function gasFreeRequest<T>({
  baseUrl,
  method,
  path,
  body,
  apiKey,
  apiSecret,
}: {
  baseUrl: string;
  method: GasFreeMethod;
  path: string;
  body?: unknown;
  apiKey: string;
  apiSecret: string;
}): Promise<T> {
  const headers = createGasFreeHeaders(method, path, apiKey, apiSecret);

  return await ky(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).json<T>();
}
