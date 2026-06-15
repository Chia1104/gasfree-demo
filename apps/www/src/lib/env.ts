import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  client: {
    VITE_SERVICE_ENDPOINT: z.url().default("http://localhost:3001"),
  },
  runtimeEnv: {
    VITE_SERVICE_ENDPOINT: import.meta.env.VITE_SERVICE_ENDPOINT,
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
});
