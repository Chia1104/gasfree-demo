import type { GasFreeNetwork } from "../pipes/gasfree.pipe";
import * as pipe from "../pipes/gasfree.pipe";
import { gasFreeRequest } from "../repos/gasfree.repo";

/**
 * GET /api/v1/config/token/all
 *
 * Fetches all tokens supported for GasFree authorized transfers.
 */
export function getAllTokens(
  network: GasFreeNetwork
): Promise<pipe.TokenConfigResult> {
  return gasFreeRequest({
    network,
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
export function getAllProviders(
  network: GasFreeNetwork
): Promise<pipe.ProviderResult> {
  return gasFreeRequest({
    network,
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
  network: GasFreeNetwork,
  accountAddress: string
): Promise<pipe.AccountInfo> {
  return gasFreeRequest({
    network,
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
  network: GasFreeNetwork,
  body: pipe.SubmitTransferRequest
): Promise<pipe.SubmitTransferResult> {
  return gasFreeRequest({
    network,
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
  network: GasFreeNetwork,
  traceId: string
): Promise<pipe.TransferDetail> {
  return gasFreeRequest({
    network,
    method: "GET",
    path: `/api/v1/gasfree/${traceId}`,
    data: pipe.TransferDetail,
  });
}
