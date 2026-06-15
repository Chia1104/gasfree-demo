import type {
  PERMIT_TYPES,
  PermitDomain,
  PermitTransferMessage,
} from "./gasfree";

export interface TronWebLike {
  defaultAddress?: { base58?: string | false; hex?: string | false };
  trx: {
    _signTypedData: (
      domain: PermitDomain,
      types: typeof PERMIT_TYPES,
      message: PermitTransferMessage
    ) => Promise<string>;
  };
}

interface TronLinkProvider {
  ready?: boolean;
  tronWeb?: TronWebLike;
  request: (args: {
    method: string;
    params?: unknown;
  }) => Promise<{ code?: number; message?: string } | unknown>;
}

declare global {
  interface Window {
    tronLink?: TronLinkProvider;
    tron?: { tronWeb?: TronWebLike };
    tronWeb?: TronWebLike;
  }
}

export class TronLinkNotFoundError extends Error {
  constructor() {
    super(
      "TronLink not detected. Please install and unlock the TronLink wallet."
    );
    this.name = "TronLinkNotFoundError";
  }
}

const getProvider = (): TronLinkProvider | null =>
  typeof window === "undefined" ? null : (window.tronLink ?? null);

export const getTronWeb = (): TronWebLike | null => {
  if (typeof window === "undefined") return null;
  return (
    window.tronLink?.tronWeb ?? window.tron?.tronWeb ?? window.tronWeb ?? null
  );
};

/** Returns the currently active address, or null if locked/disconnected. */
export const getCurrentAddress = (): string | null => {
  const base58 = getTronWeb()?.defaultAddress?.base58;
  return typeof base58 === "string" && base58.length > 0 ? base58 : null;
};

/** Prompts the user to connect TronLink and returns the active address. */
export const requestAccounts = async (): Promise<string> => {
  const provider = getProvider();
  if (!provider?.request) {
    throw new TronLinkNotFoundError();
  }

  const result = (await provider.request({
    method: "tron_requestAccounts",
  })) as { code?: number; message?: string };

  // 200 = granted, 4001 = rejected, 4000 = request already queued.
  if (typeof result?.code === "number" && result.code !== 200) {
    throw new Error(result.message ?? "Wallet connection was rejected.");
  }

  const address = getCurrentAddress();
  if (!address) {
    throw new Error("Unable to read the wallet address. Is TronLink unlocked?");
  }

  return address;
};

/**
 * Subscribes to TronLink account changes. TronLink broadcasts state changes as
 * `window.postMessage` events; the listener receives the new address (or null
 * when the wallet is locked / switched away).
 */
export const subscribeAccountChange = (
  listener: (address: string | null) => void
): (() => void) => {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: MessageEvent) => {
    const message = (
      event.data as
        | { message?: { action?: string; data?: { address?: string | false } } }
        | undefined
    )?.message;

    if (!message?.action) return;

    if (
      message.action === "accountsChanged" ||
      message.action === "setAccount"
    ) {
      const address = message.data?.address;
      listener(
        typeof address === "string" && address.length > 0 ? address : null
      );
    } else if (message.action === "disconnect") {
      listener(null);
    }
  };

  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
};
