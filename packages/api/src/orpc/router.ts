import * as healthRoutes from "./routes/health.route";
import { contractOS } from "./utils";

export const router = contractOS.router({
  health: {
    server: healthRoutes.healthRoute,
  },
});
