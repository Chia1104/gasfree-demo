import * as gasfree from "../services/gasfree.service";
import { contractOS, gasfreeErrorMw } from "../utils";

export const tokensRoute = contractOS.gasfree.config.tokens
  .use(gasfreeErrorMw)
  .handler(({ input }) => gasfree.getAllTokens(input.network));

export const providersRoute = contractOS.gasfree.config.providers
  .use(gasfreeErrorMw)
  .handler(({ input }) => gasfree.getAllProviders(input.network));

export const accountRoute = contractOS.gasfree.account
  .use(gasfreeErrorMw)
  .handler(({ input }) =>
    gasfree.getAccountInfo(input.network, input.accountAddress)
  );

export const submitRoute = contractOS.gasfree.submit
  .use(gasfreeErrorMw)
  .handler(({ input }) => {
    const { network, ...body } = input;
    return gasfree.submitTransfer(network, body);
  });

export const traceRoute = contractOS.gasfree.trace
  .use(gasfreeErrorMw)
  .handler(({ input }) =>
    gasfree.getTransferDetail(input.network, input.traceId)
  );
