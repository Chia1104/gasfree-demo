import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { AccountSummary } from "@/components/gasfree/account-summary";
import {
  useAccountInfo,
  useProviders,
  useSubmitTransfer,
  useTokens,
} from "@/hooks/use-gasfree";
import {
  GASFREE_SIGN_VERSION,
  signPermitTransfer,
  toBaseUnits,
  truncateAddress,
} from "@/lib/gasfree";
import type { PermitTransferMessage } from "@/lib/gasfree";

const schema = z.object({
  token: z.string().min(1, "Please select a token"),
  receiver: z.string().min(1, "Receiver address is required"),
  amount: z
    .string()
    .refine((value) => Number(value) > 0, "Amount must be greater than 0"),
});

type FormValues = z.infer<typeof schema>;

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const reason = (error as { data?: { reason?: string } }).data?.reason;
    const message = (error as { message?: string }).message;
    if (message) return reason ? `${message} (${reason})` : message;
  }
  return "Transfer submission failed";
};

export function TransferForm({ address }: { address: string }) {
  const tokensQuery = useTokens();
  const providersQuery = useProviders();
  const accountQuery = useAccountInfo(address);
  const submit = useSubmitTransfer();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>(
    {
      resolver: zodResolver(schema),
      defaultValues: { token: "", receiver: "", amount: "" },
    }
  );

  const tokens = tokensQuery.data?.tokens ?? [];
  const provider = providersQuery.data?.providers[0];
  const account = accountQuery.data;

  const selectedTokenAddress = watch("token");
  const selectedToken = tokens.find(
    (token) => token.tokenAddress === selectedTokenAddress
  );
  const firstTokenAddress = tokens[0]?.tokenAddress;

  // Default the token selection to the first supported token.
  useEffect(() => {
    if (!selectedTokenAddress && firstTokenAddress) {
      setValue("token", firstTokenAddress);
    }
  }, [firstTokenAddress, selectedTokenAddress, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (!account || !provider || !selectedToken) {
      setSubmitError("Account, provider, or token data is not ready yet.");
      return;
    }

    try {
      const value = toBaseUnits(values.amount, selectedToken.decimal);
      const activateFee = account.active ? 0 : selectedToken.activateFee;
      const maxFee = String(selectedToken.transferFee + activateFee);
      const deadline =
        Math.floor(Date.now() / 1000) + provider.config.defaultDeadlineDuration;

      const message: PermitTransferMessage = {
        token: selectedToken.tokenAddress,
        serviceProvider: provider.address,
        user: address,
        receiver: values.receiver,
        value,
        maxFee,
        deadline: String(deadline),
        version: GASFREE_SIGN_VERSION,
        nonce: account.nonce,
      };

      const sig = await signPermitTransfer(message);

      await submit.mutateAsync({
        requestId: crypto.randomUUID(),
        token: selectedToken.tokenAddress,
        serviceProvider: provider.address,
        user: address,
        receiver: values.receiver,
        value: Number(value),
        maxFee: Number(maxFee),
        deadline,
        version: GASFREE_SIGN_VERSION,
        nonce: account.nonce,
        sig,
      });

      reset({ token: values.token, receiver: "", amount: "" });
      void accountQuery.refetch();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  if (tokensQuery.isLoading || accountQuery.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      {account ? <AccountSummary account={account} /> : null}

      <Controller
        control={control}
        name="token"
        render={({ field, fieldState }) => (
          <Select
            className="w-full"
            placeholder="Select a token"
            value={field.value || null}
            onChange={(key) =>
              field.onChange(typeof key === "string" ? key : "")
            }
            isInvalid={Boolean(fieldState.error)}>
            <Label>Token</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {tokens.map((token) => (
                  <ListBox.Item
                    key={token.tokenAddress}
                    id={token.tokenAddress}
                    textValue={token.symbol}>
                    {token.symbol}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      />

      <Controller
        control={control}
        name="receiver"
        render={({ field, fieldState }) => (
          <TextField
            className="w-full"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            isInvalid={Boolean(fieldState.error)}>
            <Label>Receiver address</Label>
            <Input ref={field.ref} onBlur={field.onBlur} placeholder="T..." />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <TextField
            className="w-full"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            isInvalid={Boolean(fieldState.error)}>
            <Label>
              Amount {selectedToken ? `(${selectedToken.symbol})` : ""}
            </Label>
            <Input
              ref={field.ref}
              onBlur={field.onBlur}
              inputMode="decimal"
              placeholder="0.0"
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      {submitError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Transfer failed</Alert.Title>
            <Alert.Description>{submitError}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      {submit.data ? (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Transfer submitted</Alert.Title>
            <Alert.Description>
              traceId {truncateAddress(submit.data.id, 6)} · state{" "}
              {submit.data.state}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <Button
        type="submit"
        fullWidth
        isPending={submit.isPending}
        isDisabled={!account?.allowSubmit || !provider}>
        {account?.allowSubmit ? "Send" : "Pending transfer in progress"}
      </Button>
    </form>
  );
}
