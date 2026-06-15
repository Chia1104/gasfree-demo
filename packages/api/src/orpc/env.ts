import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    GF_API_KEY: z.string(),
    GF_API_SECRET: z.string(),
    TEST_GF_API_KEY: z.string().optional(),
    TEST_GF_API_SECRET: z.string().optional(),
  },
  runtimeEnv: {
    GF_API_KEY: process.env.GF_API_KEY,
    GF_API_SECRET: process.env.GF_API_SECRET,
    TEST_GF_API_KEY: process.env.TEST_GF_API_KEY,
    TEST_GF_API_SECRET: process.env.TEST_GF_API_SECRET,
  },
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" ||
    process.env.SKIP_ENV_VALIDATION === "1",
});
