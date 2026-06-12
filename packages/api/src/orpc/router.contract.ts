import * as gasfreeContracts from "./contracts/gasfree.contract";
import * as healthContracts from "./contracts/health.contract";

export const routerContract = {
  health: {
    server: healthContracts.HealthContract,
  },
  gasfree: {
    config: {
      tokens: gasfreeContracts.TokensContract,
      providers: gasfreeContracts.ProvidersContract,
    },
    account: gasfreeContracts.AccountContract,
    submit: gasfreeContracts.SubmitContract,
    trace: gasfreeContracts.TraceContract,
  },
};
