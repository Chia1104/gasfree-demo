import * as gasfreeRoutes from "./routes/gasfree.route";
import * as healthRoutes from "./routes/health.route";
import { contractOS } from "./utils";

export const router = contractOS.router({
  health: {
    server: healthRoutes.healthRoute,
  },
  gasfree: {
    config: {
      tokens: gasfreeRoutes.tokensRoute,
      providers: gasfreeRoutes.providersRoute,
    },
    account: gasfreeRoutes.accountRoute,
    submit: gasfreeRoutes.submitRoute,
    trace: gasfreeRoutes.traceRoute,
  },
});
