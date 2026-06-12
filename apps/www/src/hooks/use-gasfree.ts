import { useMutation, useQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc";

/** All tokens supported for GasFree transfers. */
export const useTokens = () =>
  useQuery(orpc.gasfree.config.tokens.queryOptions());

/** All available Service-Providers. */
export const useProviders = () =>
  useQuery(orpc.gasfree.config.providers.queryOptions());

/** GasFree account info (nonce, gasFreeAddress, assets) for the given EOA. */
export const useAccountInfo = (address?: string | null) =>
  useQuery({
    ...orpc.gasfree.account.queryOptions({
      input: { accountAddress: address ?? "" },
    }),
    enabled: Boolean(address),
  });

/** Submit a signed GasFree transfer authorization. */
export const useSubmitTransfer = () =>
  useMutation(
    orpc.gasfree.submit.mutationOptions({
      onError: (error) => {
        console.error("useSubmitTransfer: ", error);
      },
    })
  );
