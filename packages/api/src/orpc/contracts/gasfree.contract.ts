import { oc } from "@orpc/contract";
import * as z from "zod";

import * as pipe from "../pipes/gasfree.pipe";

/** GET /api/v1/config/token/all — all tokens supported for GasFree transfers. */
export const TokensContract = oc
  .route({ method: "GET", path: "/gasfree/config/tokens" })
  .output(pipe.TokenConfigResult);

/** GET /api/v1/config/provider/all — all available Service-Providers. */
export const ProvidersContract = oc
  .route({ method: "GET", path: "/gasfree/config/providers" })
  .output(pipe.ProviderResult);

/** GET /api/v1/address/{accountAddress} — a user's GasFree account info. */
export const AccountContract = oc
  .route({ method: "GET", path: "/gasfree/address/{accountAddress}" })
  .input(z.object({ accountAddress: z.string() }))
  .output(pipe.AccountInfo);

/** POST /api/v1/gasfree/submit — submit a signed transfer authorization. */
export const SubmitContract = oc
  .route({ method: "POST", path: "/gasfree/submit" })
  .input(pipe.SubmitTransferRequest)
  .output(pipe.SubmitTransferResult);

/** GET /api/v1/gasfree/{traceId} — detailed status of a transfer authorization. */
export const TraceContract = oc
  .route({ method: "GET", path: "/gasfree/{traceId}" })
  .input(z.object({ traceId: z.uuid() }))
  .output(pipe.TransferDetail);
