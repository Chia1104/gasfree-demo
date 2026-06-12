import * as z from "zod";

export const BaseResponse = z.object({
  code: z.number(),
  reason: z.string().nullable(),
  message: z.string().nullable(),
  data: z.unknown(),
});

export type BaseResponse<TData> = Omit<z.infer<typeof BaseResponse>, "data"> & {
  data: TData | null;
};

/**
 * Builds a typed GasFree response envelope schema, validating (and
 * transforming, when `data` carries a transform) the `data` payload with the
 * given schema. On a successful response `data` is the parsed payload; on an
 * error response it is `null`.
 */
export const createBaseResponse = <TSchema extends z.ZodType>(data: TSchema) =>
  z.object({
    code: z.number(),
    reason: z.string().nullable(),
    message: z.string().nullable(),
    data: data.nullable(),
  });

export const TokenConfig = z.object({
  tokenAddress: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  activateFee: z.number(),
  transferFee: z.number(),
  supported: z.boolean(),
  symbol: z.string(),
  decimal: z.number(),
});

export type TokenConfig = z.infer<typeof TokenConfig>;

export const TokenConfigs = z.array(TokenConfig);

export type TokenConfigs = z.infer<typeof TokenConfigs>;

export const Provider = z.object({
  address: z.string(),
  name: z.string(),
  icon: z.string(),
  website: z.string(),
  config: z.object({
    maxPendingTransfer: z.number(),
    minDeadlineDuration: z.number(),
    maxDeadlineDuration: z.number(),
    defaultDeadlineDuration: z.number(),
  }),
});

export type Provider = z.infer<typeof Provider>;

export const Providers = z.array(Provider);

export type Providers = z.infer<typeof Providers>;

/**
 * GET /api/v1/config/token/all
 *
 * `data` payload: the list of all supported tokens.
 */
export const TokenConfigResult = z.object({
  tokens: TokenConfigs,
});

export type TokenConfigResult = z.infer<typeof TokenConfigResult>;

/**
 * GET /api/v1/config/provider/all
 *
 * `data` payload: the list of all available Service-Providers.
 */
export const ProviderResult = z.object({
  providers: Providers,
});

export type ProviderResult = z.infer<typeof ProviderResult>;

/**
 * The current state of a GasFree transfer authorization.
 *
 * - `WAITING`: not started
 * - `INPROGRESS`: in progress
 * - `CONFIRMING`: confirming
 * - `SUCCEED`: succeeded
 * - `FAILED`: failed
 */
export const TransferState = z.enum([
  "WAITING",
  "INPROGRESS",
  "CONFIRMING",
  "SUCCEED",
  "FAILED",
]);

export type TransferState = z.infer<typeof TransferState>;

/**
 * The state of the corresponding on-chain transaction.
 *
 * - `INIT`: initial state
 * - `NOT_ON_CHAIN`: not yet on chain
 * - `ON_CHAIN`: on chain but not solidified
 * - `SOLIDITY`: solidified
 * - `ON_CHAIN_FAILED`: failed to be put on chain
 */
export const TxnState = z.enum([
  "INIT",
  "NOT_ON_CHAIN",
  "ON_CHAIN",
  "SOLIDITY",
  "ON_CHAIN_FAILED",
]);

export type TxnState = z.infer<typeof TxnState>;

/**
 * An asset currently being processed by the GasFree service-provider for an
 * account (part of {@link AccountInfo}).
 */
export const AccountAsset = z.object({
  /** Token contract address. */
  tokenAddress: z.string(),
  /** Token symbol. */
  tokenSymbol: z.string(),
  /** Activation fee for the token, in the token's smallest unit. */
  activateFee: z.number(),
  /** Transfer fee for the token, in the token's smallest unit. */
  transferFee: z.number(),
  /** Token decimals. */
  decimal: z.number(),
  /** Amount of in-flight GasFree transfers (including fees), smallest unit. */
  frozen: z.number(),
});

export type AccountAsset = z.infer<typeof AccountAsset>;

/**
 * GET /api/v1/address/{accountAddress}
 *
 * Information about a user's GasFree account: activation state, nonce,
 * supported tokens and their in-flight assets.
 */
export const AccountInfo = z.object({
  /** User EOA address. */
  accountAddress: z.string(),
  /** The user's GasFree account address. */
  gasFreeAddress: z.string(),
  /** Whether the GasFree account has been activated. */
  active: z.boolean(),
  /** Recommended nonce to use for the next transfer. */
  nonce: z.number(),
  /** Whether the user is currently allowed to submit a transfer authorization. */
  allowSubmit: z.boolean(),
  /** Assets currently being processed by the service-provider. */
  assets: z.array(AccountAsset),
});

export type AccountInfo = z.infer<typeof AccountInfo>;

/**
 * POST /api/v1/gasfree/submit
 *
 * Request body for submitting a GasFree transfer authorization.
 */
export const SubmitTransferRequest = z.object({
  /** Optional uuid4 request id, useful for troubleshooting. */
  requestId: z.uuid().optional(),
  /** Token contract address being transferred. */
  token: z.string(),
  /** Service-Provider address. */
  serviceProvider: z.string(),
  /** User EOA address (not the GasFree address). */
  user: z.string(),
  /** Recipient address. */
  receiver: z.string(),
  /** Transfer amount, in the token's smallest unit. */
  value: z.number(),
  /** Maximum fee limit (transfer fee + activation fee), smallest unit. */
  maxFee: z.number(),
  /** Expiration timestamp of this authorization, in seconds. */
  deadline: z.number(),
  /** Signature version of the transfer authorization. */
  version: z.number(),
  /** Nonce of this transfer authorization. */
  nonce: z.number(),
  /** User's signature over the GasFree transfer authorization. */
  sig: z.string(),
});

export type SubmitTransferRequest = z.infer<typeof SubmitTransferRequest>;

/**
 * POST /api/v1/gasfree/submit
 *
 * `data` payload: the basic record of the submitted GasFree transfer
 * authorization.
 */
export const SubmitTransferResult = z
  .object({
    /** The traceId of the transfer authorization record (not a transactionId). */
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    /** User EOA address. */
    accountAddress: z.string(),
    /** The user's GasFree account address. */
    gasFreeAddress: z.string(),
    /** Service-Provider address. */
    providerAddress: z.string(),
    /** Recipient address. */
    targetAddress: z.string(),
    /** Token contract address being transferred. */
    tokenAddress: z.string(),
    /** Transfer amount. */
    amount: z.number(),
    /** Maximum fee limit. */
    maxFee: z.number(),
    /** User's signature. */
    signature: z.string(),
    /** Signature version of the transfer authorization. */
    version: z.number(),
    /** Nonce specified by the transfer authorization. */
    nonce: z.number(),
    /** Expiration time of this transfer. */
    expiredAt: z.string(),
    /** Current state of this transfer. */
    state: TransferState,
    /** Estimated activation fee. */
    estimatedActivateFee: z.number(),
    /**
     * Estimated transfer fee.
     *
     * NOTE: the spec example returns this field as `estimateTransferFee`
     * (missing the `d`), which differs from the documented `estimatedTransferFee`.
     * Both inbound keys are accepted and normalized to `estimatedTransferFee`
     * via the transform below.
     */
    estimatedTransferFee: z.number().optional(),
    estimateTransferFee: z.number().optional(),
  })
  .transform(({ estimateTransferFee, ...rest }) => ({
    ...rest,
    estimatedTransferFee: rest.estimatedTransferFee ?? estimateTransferFee,
  }));

export type SubmitTransferResult = z.infer<typeof SubmitTransferResult>;

/**
 * GET /api/v1/gasfree/{traceId}
 *
 * `data` payload: the detailed status of a GasFree transfer authorization.
 * If the authorization has not yet been submitted on chain (or failed
 * pre-submission validation), the `txn*` fields are null.
 */
export const TransferDetail = z.object({
  /** The traceId of the transfer authorization record (not a transactionId). */
  id: z.string(),
  /** Creation time of this transfer authorization. */
  createdAt: z.string(),
  /** User EOA address. */
  accountAddress: z.string(),
  /** The user's GasFree account address. */
  gasFreeAddress: z.string(),
  /** Service-Provider address. */
  providerAddress: z.string(),
  /** Recipient address. */
  targetAddress: z.string(),
  /** Nonce of this transfer authorization. */
  nonce: z.number(),
  /** Token contract address being transferred. */
  tokenAddress: z.string(),
  /** Amount received by the user. */
  amount: z.number(),
  /** Expiration time of this transfer. */
  expiredAt: z.string(),
  /** Current state of this transfer. */
  state: TransferState,
  /** Estimated activation fee. */
  estimatedActivateFee: z.number(),
  /** Estimated transfer fee. */
  estimatedTransferFee: z.number(),
  /** Estimated total fee. */
  estimatedTotalFee: z.number(),
  /** Estimated total cost for the user (fees + transfer amount). */
  estimatedTotalCost: z.number(),
  /** The transactionId of the corresponding on-chain transaction. */
  txnHash: z.string().nullable(),
  /** Block height of the corresponding on-chain transaction. */
  txnBlockNum: z.number().nullable(),
  /** Block timestamp of the on-chain transaction, in milliseconds. */
  txnBlockTimestamp: z.number().nullable(),
  /** State of the corresponding on-chain transaction. */
  txnState: TxnState.nullable(),
  /** Actual activation fee consumed. */
  txnActivateFee: z.number().nullable(),
  /** Actual transfer fee consumed. */
  txnTransferFee: z.number().nullable(),
  /** Actual total fee consumed. */
  txnTotalFee: z.number().nullable(),
  /** Actual amount received. */
  txnAmount: z.number().nullable(),
  /** Actual total cost paid by the user (fees + transfer amount). */
  txnTotalCost: z.number().nullable(),
});

export type TransferDetail = z.infer<typeof TransferDetail>;
