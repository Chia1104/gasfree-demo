import { Card } from "@heroui/react";

import { TransferForm } from "@/components/gasfree/transfer-form";
import { WalletButton } from "@/components/gasfree/wallet-button";
import { useWalletStore } from "@/stores/wallet";

export function GasFreeDemo() {
  const address = useWalletStore((state) => state.address);

  return (
    <Card className="w-full max-w-md" variant="tertiary">
      <Card.Header className="flex items-center justify-between gap-4">
        <div>
          <Card.Title>GasFree transfer</Card.Title>
          <Card.Description>
            Send TRC-20 tokens without paying TRX gas.
          </Card.Description>
        </div>
        <WalletButton />
      </Card.Header>

      <Card.Content>
        {address ? (
          <TransferForm address={address} />
        ) : (
          <p className="text-foreground/60 py-8 text-center text-sm">
            Connect your TronLink wallet to start a GasFree transfer.
          </p>
        )}
      </Card.Content>
    </Card>
  );
}
