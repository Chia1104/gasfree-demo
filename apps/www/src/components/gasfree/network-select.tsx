import { Label, ListBox, Select } from "@heroui/react";

import type { GasFreeNetwork } from "@repo/api/orpc/network";

import { NETWORK_OPTIONS, useNetworkStore } from "@/stores/network";

export function NetworkSelect() {
  const network = useNetworkStore((state) => state.network);
  const setNetwork = useNetworkStore((state) => state.setNetwork);

  return (
    <Select
      className="w-full"
      value={network}
      onChange={(key) => {
        if (typeof key === "string") setNetwork(key as GasFreeNetwork);
      }}>
      <Label>Network</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {NETWORK_OPTIONS.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.id}
              textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
