import * as gasfree from "../services/gasfree.service";
import { contractOS, gasfreeErrorMw } from "../utils";

export const tokensRoute = contractOS.gasfree.config.tokens
  .use(gasfreeErrorMw)
  .handler(() => gasfree.getAllTokens());

export const providersRoute = contractOS.gasfree.config.providers
  .use(gasfreeErrorMw)
  .handler(() => gasfree.getAllProviders());

export const accountRoute = contractOS.gasfree.account
  .use(gasfreeErrorMw)
  .handler(({ input }) => gasfree.getAccountInfo(input.accountAddress));

export const submitRoute = contractOS.gasfree.submit
  .use(gasfreeErrorMw)
  .handler(({ input }) => gasfree.submitTransfer(input));

export const traceRoute = contractOS.gasfree.trace
  .use(gasfreeErrorMw)
  .handler(({ input }) => gasfree.getTransferDetail(input.traceId));
