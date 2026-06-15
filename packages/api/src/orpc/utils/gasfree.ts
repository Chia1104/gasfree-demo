import type { GasFreeNetwork } from "../pipes/gasfree.pipe";

export type { GasFreeNetwork };

interface NetworkConfig {
  /** Provider host, e.g. `https://open.gasfree.io`. */
  baseUrl: string;
  /** Network path prefix included in the signed path, e.g. `/tron`. */
  pathPrefix: string;
}

/**
 * Per-network GasFree provider configuration. The path prefix is part of the
 * signed path (e.g. `/tron`, `/nile`), so it must match the chosen `baseUrl`.
 */
export const GASFREE_NETWORKS: Record<GasFreeNetwork, NetworkConfig> = {
  mainnet: {
    baseUrl: "https://open.gasfree.io",
    pathPrefix: "/tron",
  },
  nile: {
    baseUrl: "https://open-test.gasfree.io",
    pathPrefix: "/nile",
  },
};

/** Default network used by clients that do not let the user pick one. */
export const DEFAULT_GASFREE_NETWORK: GasFreeNetwork = "nile";

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
