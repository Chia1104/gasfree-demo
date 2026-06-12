import { config } from "dotenv";
import { describe, expect, it } from "vitest";

config({ quiet: true });

const hasCredentials = Boolean(
  process.env.GF_API_KEY && process.env.GF_API_SECRET
);

const NETWORK_TIMEOUT = 20_000;

describe.skipIf(!hasCredentials)("GasFree live API (pipe validation)", () => {
  it(
    "getAllTokens parses the live token config list",
    async () => {
      const { getAllTokens } = await import("./gasfree.service");

      await expect(getAllTokens()).resolves.toBeDefined();
    },
    NETWORK_TIMEOUT
  );

  it(
    "getAllProviders parses the live provider list",
    async () => {
      const { getAllProviders } = await import("./gasfree.service");

      await expect(getAllProviders()).resolves.toBeDefined();
    },
    NETWORK_TIMEOUT
  );
});
