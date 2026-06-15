import { implement, ORPCError } from "@orpc/server";
import { os } from "@orpc/server";

import { routerContract } from "../router.contract";

import { GasFreeApiError } from "./gasfree";

export interface BaseContext {
  headers: Headers;
  clientIP: string;
  hooks?: {
    onPrepareOnrampUrl?: (options: {
      redirectUrl: string;
      useSandbox: boolean;
      partnerUserRef: string;
    }) => Promise<string>;
  };
}

export const baseOS = os.$context<BaseContext>();

export const contractOS = implement(routerContract).$context<BaseContext>();

/**
 * Maps a {@link GasFreeApiError} thrown from the service layer onto an oRPC
 * error. GasFree signals failures in the body via `code` (400 input error,
 * 500 runtime error); the original exception name is preserved in
 * `data.reason` so clients can branch on it (e.g. `DeadlineExceededException`,
 * `NonceNotMatchException`, `InsufficientBalanceException`).
 */
export const gasfreeErrorMw = baseOS.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof GasFreeApiError) {
      throw new ORPCError(
        error.code === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
        {
          message: error.message,
          data: { reason: error.reason },
          cause: error,
        }
      );
    }

    throw error;
  }
});
