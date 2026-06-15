import { oc } from "@orpc/contract";
import * as z from "zod";

import { GasFreeNetwork } from "../pipes/gasfree.pipe";
import * as pipe from "../pipes/gasfree.pipe";

/** Validates the per-request network against the supported GasFree networks. */
const networkSchema = z.enum(GasFreeNetwork);

/** GET /api/v1/config/token/all — all tokens supported for GasFree transfers. */
export const TokensContract = oc
  .route({ method: "GET", path: "/gasfree/config/tokens" })
  .input(z.object({ network: networkSchema }))
  .output(pipe.TokenConfigResult);

/** GET /api/v1/config/provider/all — all available Service-Providers. */
export const ProvidersContract = oc
  .route({ method: "GET", path: "/gasfree/config/providers" })
  .input(z.object({ network: networkSchema }))
  .output(pipe.ProviderResult);

/** GET /api/v1/address/{accountAddress} — a user's GasFree account info. */
export const AccountContract = oc
  .route({ method: "GET", path: "/gasfree/address/{accountAddress}" })
  .input(z.object({ network: networkSchema, accountAddress: z.string() }))
  .output(pipe.AccountInfo);

/** POST /api/v1/gasfree/submit — submit a signed transfer authorization. */
export const SubmitContract = oc
  .route({ method: "POST", path: "/gasfree/submit" })
  .input(pipe.SubmitTransferRequest.extend({ network: networkSchema }))
  .output(pipe.SubmitTransferResult);

/** GET /api/v1/gasfree/{traceId} — detailed status of a transfer authorization. */
export const TraceContract = oc
  .route({ method: "GET", path: "/gasfree/{traceId}" })
  .input(z.object({ network: networkSchema, traceId: z.uuid() }))
  .output(pipe.TransferDetail);
