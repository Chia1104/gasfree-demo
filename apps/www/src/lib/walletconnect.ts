import {
  WalletConnectWallet,
  WalletConnectChainID,
} from "@tronweb3/walletconnect-tron";

export const walletConnect = new WalletConnectWallet({
  network: WalletConnectChainID.Mainnet,
  options: {
    relayUrl: "wss://relay.walletconnect.com",
    projectId: "77bdbd41798a8d7bc6723bf1e481c19f",
    metadata: {
      name: "GasFree Demo",
      description: "GasFree Demo",
      url: "https://gasfree-demo.vercel.app",
      icons: ["https://gasfree-demo.vercel.app/favicon.ico"],
    },
  },
});
