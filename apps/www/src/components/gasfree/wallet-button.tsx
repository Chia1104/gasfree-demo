import { useEffect } from "react";

import { Button, Chip } from "@heroui/react";

import { truncateAddress } from "@/lib/gasfree";
import { useWalletStore } from "@/stores/wallet";

export function WalletButton() {
  const address = useWalletStore((state) => state.address);
  const status = useWalletStore((state) => state.status);
  const error = useWalletStore((state) => state.error);
  const connect = useWalletStore((state) => state.connect);
  const disconnect = useWalletStore((state) => state.disconnect);
  const restore = useWalletStore((state) => state.restore);

  useEffect(() => {
    restore();
  }, [restore]);

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <Chip variant="secondary">{truncateAddress(address)}</Chip>
        <Button variant="danger-soft" size="sm" onPress={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        isPending={status === "connecting"}
        onPress={() => {
          void connect();
        }}>
        Connect TronLink
      </Button>
      {error ? <span className="text-xs text-red-600/60">{error}</span> : null}
    </div>
  );
}
