import { useMutation, useQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc";
import { useNetworkStore } from "@/stores/network";

/** All tokens supported for GasFree transfers on the selected network. */
export const useTokens = () => {
  const network = useNetworkStore((state) => state.network);
  return useQuery(
    orpc.gasfree.config.tokens.queryOptions({ input: { network } })
  );
};

/** All available Service-Providers on the selected network. */
export const useProviders = () => {
  const network = useNetworkStore((state) => state.network);
  return useQuery(
    orpc.gasfree.config.providers.queryOptions({ input: { network } })
  );
};

/** GasFree account info (nonce, gasFreeAddress, assets) for the given EOA. */
export const useAccountInfo = (address?: string | null) => {
  const network = useNetworkStore((state) => state.network);
  return useQuery({
    ...orpc.gasfree.account.queryOptions({
      input: { network, accountAddress: address ?? "" },
    }),
    enabled: Boolean(address),
  });
};

/** Submit a signed GasFree transfer authorization. */
export const useSubmitTransfer = () =>
  useMutation(
    orpc.gasfree.submit.mutationOptions({
      onError: (error) => {
        console.error("useSubmitTransfer: ", error);
      },
    })
  );
