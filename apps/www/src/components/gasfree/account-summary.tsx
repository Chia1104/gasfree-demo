import { Chip } from "@heroui/react";

import { truncateAddress } from "@/lib/gasfree";

interface AccountSummaryProps {
  account: {
    gasFreeAddress: string;
    active: boolean;
    nonce: number;
    allowSubmit: boolean;
  };
}

export function AccountSummary({ account }: AccountSummaryProps) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <dt className="text-foreground/60">GasFree address</dt>
      <dd className="text-right font-mono">
        {truncateAddress(account.gasFreeAddress)}
      </dd>

      <dt className="text-foreground/60">Status</dt>
      <dd className="text-right">
        <Chip color={account.active ? "success" : "default"} size="sm">
          {account.active ? "Activated" : "Not activated"}
        </Chip>
      </dd>

      <dt className="text-foreground/60">Nonce</dt>
      <dd className="text-right font-mono">{account.nonce}</dd>

      <dt className="text-foreground/60">Can submit</dt>
      <dd className="text-right">
        <Chip color={account.allowSubmit ? "success" : "danger"} size="sm">
          {account.allowSubmit ? "Yes" : "Pending transfer"}
        </Chip>
      </dd>
    </dl>
  );
}
