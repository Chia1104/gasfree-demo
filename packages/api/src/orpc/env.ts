import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    GF_API_KEY: z.string(),
    GF_API_SECRET: z.string(),
    /** Provider host, e.g. `https://open.gasfree.io` (mainnet) or `https://open-test.gasfree.io` (Nile). */
    GF_BASE_URL: z.url().default("https://open-test.gasfree.io"),
    /** Network path prefix included in the signed path, e.g. `/tron` (mainnet) or `/nile` (Nile). */
    GF_API_PATH_PREFIX: z.string().default("/nile"),
  },
  runtimeEnv: {
    GF_API_KEY: process.env.GF_API_KEY,
    GF_API_SECRET: process.env.GF_API_SECRET,
    GF_BASE_URL: process.env.GF_BASE_URL,
    GF_API_PATH_PREFIX: process.env.GF_API_PATH_PREFIX,
  },
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" ||
    process.env.SKIP_ENV_VALIDATION === "1",
});
