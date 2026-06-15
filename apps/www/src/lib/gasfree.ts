import BigNumber from "bignumber.js";

import type { GasFreeNetwork } from "@repo/api/orpc/network";

import { getTronWeb } from "./tron";

export const GASFREE_SIGN_VERSION = 1;

const NETWORKS: Record<
  GasFreeNetwork,
  { chainId: number; verifyingContract: string }
> = {
  mainnet: {
    chainId: 728126428,
    verifyingContract: "TFFAMQLZybALaLb4uxHA9RBE7pxhUAjF3U",
  },
  nile: {
    chainId: 3448148188,
    verifyingContract: "THQGuFzL87ZqhxkgqYEryRAd7gqFqL5rdc",
  },
};

/** Builds the EIP-712 signing domain for the chosen network. */
export const getPermitDomain = (network: GasFreeNetwork) => ({
  name: "GasFreeController",
  version: "V1.0.0",
  chainId: NETWORKS[network].chainId,
  verifyingContract: NETWORKS[network].verifyingContract,
});

export type PermitDomain = ReturnType<typeof getPermitDomain>;

export const PERMIT_TYPES = {
  PermitTransfer: [
    { name: "token", type: "address" },
    { name: "serviceProvider", type: "address" },
    { name: "user", type: "address" },
    { name: "receiver", type: "address" },
    { name: "value", type: "uint256" },
    { name: "maxFee", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "version", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

export interface PermitTransferMessage {
  token: string;
  serviceProvider: string;
  user: string;
  receiver: string;
  value: string;
  maxFee: string;
  deadline: string;
  version: number;
  nonce: number;
}

/**
 * Signs a GasFree transfer authorization with the injected TronLink provider.
 * Returns the signature with the leading `0x` stripped, as the API expects.
 */
export const signPermitTransfer = async (
  network: GasFreeNetwork,
  message: PermitTransferMessage
): Promise<string> => {
  const tronWeb = getTronWeb();

  if (!tronWeb?.trx?._signTypedData) {
    throw new Error(
      "TronLink not detected. Unlock TronLink to sign the GasFree authorization."
    );
  }

  const domain = getPermitDomain(network);

  try {
    const signature = await tronWeb.trx._signTypedData(
      domain,
      PERMIT_TYPES,
      message
    );

    return signature.replace(/^0x/, "");
  } catch (error) {
    console.error("signPermitTransfer: ", error);
    const detail = error instanceof Error ? error.message : String(error);

    // TronLink falls back to (keyless) local signing when the domain chainId
    // does not match the active network — surface an actionable message.
    if (/invalid private key/i.test(detail)) {
      throw new Error(
        `TronLink could not sign the authorization. Switch the wallet to the ${network} network (the signing domain uses chainId ${domain.chainId}) and make sure it is unlocked.`
      );
    }

    throw new Error(detail);
  }
};

/**
 * Converts a human-readable decimal amount into the token's smallest unit,
 * e.g. `toBaseUnits("1.5", 6)` → `"1500000"`.
 */
export const toBaseUnits = (amount: string, decimals: number): string =>
  new BigNumber(amount || "0")
    .shiftedBy(decimals)
    .integerValue(BigNumber.ROUND_DOWN)
    .toFixed(0);

/**
 * Converts a smallest-unit amount back into a human-readable decimal string,
 * e.g. `fromBaseUnits(1500000, 6)` → `"1.5"`.
 */
export const fromBaseUnits = (
  amount: number | string,
  decimals: number
): string => new BigNumber(amount).shiftedBy(-decimals).toFixed();

/** Shortens an address for display, e.g. `THKbW…m3B3E`. */
export const truncateAddress = (address: string, visible = 5): string =>
  address.length <= visible * 2
    ? address
    : `${address.slice(0, visible)}…${address.slice(-visible)}`;
