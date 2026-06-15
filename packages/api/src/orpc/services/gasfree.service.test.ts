import ky from "ky";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GasFreeApiError } from "../utils/gasfree";

import {
  getAccountInfo,
  getAllProviders,
  getAllTokens,
  getTransferDetail,
} from "./gasfree.service";

vi.mock("../env", () => ({
  env: {
    GF_API_KEY: "test-key",
    GF_API_SECRET: "test-secret",
  },
}));

vi.mock("ky", () => ({ default: vi.fn() }));

const mockKy = vi.mocked(ky);

/** Stubs the next `ky` call to resolve with the given GasFree envelope. */
const respond = (envelope: unknown) =>
  mockKy.mockReturnValue({
    json: () => Promise.resolve(envelope),
  } as unknown as ReturnType<typeof ky>);

/** Wraps a `data` payload in a successful GasFree envelope. */
const ok = (data: unknown) => ({
  code: 200,
  reason: null,
  message: null,
  data,
});

beforeEach(() => {
  mockKy.mockReset();
});

describe("getAllTokens", () => {
  const tokens = {
    tokens: [
      {
        tokenAddress: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
        createdAt: 1733474531733,
        updatedAt: 1780302190159,
        activateFee: 10000000,
        transferFee: 10000000,
        supported: true,
        symbol: "USDT",
        decimal: 6,
      },
    ],
  };

  it("signs the nile-prefixed url and returns the parsed tokens", async () => {
    respond(ok(tokens));

    const result = await getAllTokens("nile");

    expect(result).toEqual(tokens);
    expect(mockKy).toHaveBeenCalledWith(
      "https://open-test.gasfree.io/nile/api/v1/config/token/all",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^ApiKey test-key:/),
        }),
      })
    );
  });

  it("targets the mainnet host and /tron prefix", async () => {
    respond(ok(tokens));

    await getAllTokens("mainnet");

    expect(mockKy).toHaveBeenCalledWith(
      "https://open.gasfree.io/tron/api/v1/config/token/all",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("rejects payloads that do not match the schema", async () => {
    respond(ok({ tokens: [{ tokenAddress: 123 }] }));

    await expect(getAllTokens("nile")).rejects.toThrow();
  });
});

describe("getAllProviders", () => {
  const providers = {
    providers: [
      {
        address: "TQ6qStrS2ZJ96jcieJC8AutTxwqJEtmjfp",
        name: "Provider-1",
        icon: "",
        website: "",
        config: {
          maxPendingTransfer: 1,
          minDeadlineDuration: 60,
          maxDeadlineDuration: 600,
          defaultDeadlineDuration: 180,
        },
      },
    ],
  };

  it("requests the provider list and returns the parsed providers", async () => {
    respond(ok(providers));

    const result = await getAllProviders("nile");

    expect(result).toEqual(providers);
    expect(mockKy).toHaveBeenCalledWith(
      "https://open-test.gasfree.io/nile/api/v1/config/provider/all",
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("getAccountInfo", () => {
  const account = {
    accountAddress: "THKbWd2g5aS9tY59xk8hp5xMnbE8m3B3E",
    gasFreeAddress: "TLCvf7MktLG7XkbJRyUwnvCeDnaEXYkcbC",
    active: true,
    nonce: 1,
    allowSubmit: false,
    assets: [
      {
        tokenAddress: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
        tokenSymbol: "USDT",
        activateFee: 1000000,
        transferFee: 1000000,
        decimal: 6,
        frozen: 0,
      },
    ],
  };

  it("interpolates the account address into the url", async () => {
    respond(ok(account));

    const result = await getAccountInfo("nile", account.accountAddress);

    expect(result).toEqual(account);
    expect(mockKy).toHaveBeenCalledWith(
      `https://open-test.gasfree.io/nile/api/v1/address/${account.accountAddress}`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("getTransferDetail", () => {
  const base = {
    id: "6ab4c27c-f66b-4328-b40f-ffdc6cf1ca60",
    createdAt: "2024-09-10T08:11:50.822+00:00",
    accountAddress: "TKtWbdzEq5ss9vTS9kwRhBp5mXmBfBns3E",
    gasFreeAddress: "TLGVf7MRsLG7XxBkJKy8wnCVcDnAeXYNCb",
    providerAddress: "TQ6qStrS2ZJ96gieZJC8AurTxwqJETmjfp",
    targetAddress: "TQ6qStrS2ZJ96gieZJC8AurTxwqJETmjfp",
    nonce: 0,
    tokenAddress: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
    amount: 1000000,
    expiredAt: "2024-09-11T08:05:08.000+00:00",
    state: "WAITING",
    estimatedActivateFee: 1000,
    estimatedTransferFee: 300,
    estimatedTotalFee: 1300,
    estimatedTotalCost: 1001300,
  };

  it("accepts null txn fields before the transfer is on chain", async () => {
    const detail = {
      ...base,
      txnHash: null,
      txnBlockNum: null,
      txnBlockTimestamp: null,
      txnState: null,
      txnActivateFee: null,
      txnTransferFee: null,
      txnTotalFee: null,
      txnAmount: null,
      txnTotalCost: null,
    };
    respond(ok(detail));

    const result = await getTransferDetail("nile", base.id);

    expect(result).toEqual(detail);
    expect(mockKy).toHaveBeenCalledWith(
      `https://open-test.gasfree.io/nile/api/v1/gasfree/${base.id}`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("parses populated on-chain txn fields", async () => {
    const detail = {
      ...base,
      state: "SUCCEED",
      txnHash: "abc123",
      txnBlockNum: 12345,
      txnBlockTimestamp: 1728638679000,
      txnState: "SOLIDITY",
      txnActivateFee: 1000,
      txnTransferFee: 300,
      txnTotalFee: 1300,
      txnAmount: 1000000,
      txnTotalCost: 1001300,
    };
    respond(ok(detail));

    await expect(getTransferDetail("nile", base.id)).resolves.toEqual(detail);
  });

  it("rejects an unknown txnState", async () => {
    respond(ok({ ...base, txnState: "NOT_A_REAL_STATE" }));

    await expect(getTransferDetail("nile", base.id)).rejects.toThrow();
  });
});

describe("error envelopes", () => {
  it("throws GasFreeApiError with code and reason on a non-200 envelope", async () => {
    respond({
      code: 400,
      reason: "GasFreeAddressNotFoundException",
      message: "not found",
      data: null,
    });

    await expect(getAllTokens("nile")).rejects.toMatchObject({
      name: "GasFreeApiError",
      code: 400,
      reason: "GasFreeAddressNotFoundException",
      message: "not found",
    });
  });

  it("throws when a 200 envelope has null data", async () => {
    respond(ok(null));

    await expect(getAccountInfo("nile", "Tabc")).rejects.toBeInstanceOf(
      GasFreeApiError
    );
  });
});
