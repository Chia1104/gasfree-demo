import { create } from "zustand";

import {
  getCurrentAddress,
  requestAccounts,
  subscribeAccountChange,
} from "@/lib/tron";

export type WalletStatus = "disconnected" | "connecting" | "connected";

interface WalletState {
  address: string | null;
  status: WalletStatus;
  error: string | null;
  /** Prompt TronLink and connect the active TRON account. */
  connect: () => Promise<void>;
  /** Clear the local connection (TronLink keeps its own approval). */
  disconnect: () => void;
  /** Restore an already-authorized session and bind account-change listeners. */
  restore: () => void;
}

// Bind the account-change listener once for the module lifetime (StrictMode
// mounts effects twice in dev, so guard against double-registration).
let listenersBound = false;

export const useWalletStore = create<WalletState>((set) => {
  const bindListeners = () => {
    if (listenersBound) return;
    listenersBound = true;

    subscribeAccountChange((address) => {
      set({
        address,
        status: address ? "connected" : "disconnected",
      });
    });
  };

  return {
    address: null,
    status: "disconnected",
    error: null,

    async connect() {
      set({ status: "connecting", error: null });
      try {
        bindListeners();
        const address = await requestAccounts();
        set({ address, status: "connected" });
      } catch (error) {
        set({
          status: "disconnected",
          error: error instanceof Error ? error.message : "Failed to connect",
        });
      }
    },

    disconnect() {
      set({ address: null, status: "disconnected" });
    },

    restore() {
      bindListeners();
      const address = getCurrentAddress();
      if (address) {
        set({ address, status: "connected" });
      }
    },
  };
});
