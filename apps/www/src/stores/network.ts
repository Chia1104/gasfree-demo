import { create } from "zustand";

import { DEFAULT_GASFREE_NETWORK } from "@repo/api/orpc/network";
import type { GasFreeNetwork } from "@repo/api/orpc/network";

/** Selectable networks with display labels, in the order shown in the UI. */
export const NETWORK_OPTIONS: { id: GasFreeNetwork; label: string }[] = [
  { id: "nile", label: "Nile Testnet" },
  { id: "mainnet", label: "Mainnet" },
];

interface NetworkState {
  /** The GasFree network every request and signature targets. */
  network: GasFreeNetwork;
  setNetwork: (network: GasFreeNetwork) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  network: DEFAULT_GASFREE_NETWORK,
  setNetwork: (network) => set({ network }),
}));
