# 05 · API 參考

> 對象:後端 + App。我們後端 5 個端點的 request / response 結構。型別來源:`packages/api/src/orpc/pipes/gasfree.pipe.ts`(本文件以此為準)。

## 通則

- **每個端點 input 都要帶 `network`**:`"mainnet" | "nile"`。
- 兩種呼叫方式:RPC(`/api/v1/rpc`,型別安全 oRPC client)或 REST(`/api/v1/rest`,下表「REST」欄)。
- 金額類欄位(`value`/`maxFee`/`activateFee`/`transferFee`/`frozen`/`amount`/`txn*`)單位皆為**該代幣最小單位**。
- 時間戳:`deadline` 為**秒**;`txnBlockTimestamp` 為**毫秒**;`createdAt`/`updatedAt`(token config)為 **epoch 毫秒數字**;`expiredAt`/`createdAt`(transfer)為 ISO 字串。

## 回應外層(envelope)

GasFree 一律回 HTTP 200,真正狀態在 body。我們後端會把它解析後:成功回傳 `data`,失敗丟 `ORPCError`(`code` + `data.reason`)。

```jsonc
{
  "code": 200,
  "reason": null,
  "message": null,
  "data": {
    /* ... */
  },
}
// 失敗:{ "code": 400, "reason": "DeadlineExceededException", "message": "...", "data": null }
```

---

## 1. `gasfree.config.tokens`

`GET /rest/gasfree/config/tokens` — 支援的代幣清單。

**Input**: `{ network }`
**Output**: `{ tokens: TokenConfig[] }`

`TokenConfig`:

| 欄位                      | 型別    | 說明                 |
| ------------------------- | ------- | -------------------- |
| `tokenAddress`            | string  | 代幣合約地址         |
| `symbol`                  | string  | 代幣名稱             |
| `decimal`                 | number  | 精度                 |
| `activateFee`             | number  | 啟用手續費(最小單位) |
| `transferFee`             | number  | 轉帳手續費(最小單位) |
| `supported`               | boolean | 是否支援             |
| `createdAt` / `updatedAt` | number  | epoch 毫秒           |

---

## 2. `gasfree.config.providers`

`GET /rest/gasfree/config/providers` — 可用 Service-Provider 清單。

**Input**: `{ network }`
**Output**: `{ providers: Provider[] }`

`Provider`:

| 欄位                             | 型別   | 說明                                             |
| -------------------------------- | ------ | ------------------------------------------------ |
| `address`                        | string | Provider 地址(簽章 message 的 `serviceProvider`) |
| `name` / `icon` / `website`      | string | 顯示資訊                                         |
| `config.maxPendingTransfer`      | number | 同時允許的 pending 授權數(目前 1)                |
| `config.minDeadlineDuration`     | number | 最小 deadline 間隔(秒)                           |
| `config.maxDeadlineDuration`     | number | 最大 deadline 間隔(秒)                           |
| `config.defaultDeadlineDuration` | number | 建議 deadline 間隔(秒)                           |

---

## 3. `gasfree.account`

`GET /rest/gasfree/address/{accountAddress}` — 使用者 GasFree 帳戶資訊。

**Input**: `{ network, accountAddress }`(`accountAddress` = 使用者 EOA)
**Output**: `AccountInfo`

| 欄位             | 型別    | 說明                               |
| ---------------- | ------- | ---------------------------------- |
| `accountAddress` | string  | 使用者 EOA                         |
| `gasFreeAddress` | string  | GasFree 帳戶地址(收款/扣款地址)    |
| `active`         | boolean | 是否已啟用                         |
| `nonce`          | number  | **下一筆要用的 nonce(務必用這個)** |
| `allowSubmit`    | boolean | 目前是否允許提交                   |
| `assets[]`       | array   | 進行中的資產情況(見下)             |

`assets[]`:`tokenAddress`, `tokenSymbol`, `activateFee`, `transferFee`, `decimal`, `frozen`(進行中金額,含手續費)。

> 可轉上限 ≈ 鏈上 `gasFreeAddress` 餘額 − `frozen`。詳見 [02](./02-accounts-and-funds.md)。

---

## 4. `gasfree.submit`

`POST /rest/gasfree/submit` — 提交簽好的授權。

**Input**: `SubmitTransferRequest & { network }`

| 欄位              | 型別          | 說明                          |
| ----------------- | ------------- | ----------------------------- |
| `network`         | enum          | `mainnet` / `nile`            |
| `requestId`       | string(uuid4) | 選填,便於追蹤                 |
| `token`           | string        | 代幣合約地址                  |
| `serviceProvider` | string        | Provider 地址                 |
| `user`            | string        | 使用者 EOA(非 gasFreeAddress) |
| `receiver`        | string        | 收款地址                      |
| `value`           | number        | 轉帳金額(最小單位)            |
| `maxFee`          | number        | 手續費上限(最小單位)          |
| `deadline`        | number        | 失效時間戳(秒)                |
| `version`         | number        | 簽章版本(目前 1)              |
| `nonce`           | number        | 授權 nonce                    |
| `sig`             | string        | TIP-712 簽章(去掉開頭 `0x`)   |

**Output**: `SubmitTransferResult`

`id`(= **traceId**), `createdAt`, `updatedAt`, `accountAddress`, `gasFreeAddress`, `providerAddress`, `targetAddress`, `tokenAddress`, `amount`, `maxFee`, `signature`, `version`, `nonce`, `expiredAt`, `state`, `estimatedActivateFee`, `estimatedTransferFee`。

> 注意:GasFree 範例回傳曾出現拼字 `estimateTransferFee`(少了 `d`);pipe 已用 transform 統一成 `estimatedTransferFee`,client 只需處理後者。

---

## 5. `gasfree.trace`

`GET /rest/gasfree/{traceId}` — 查授權後續狀態(輪詢用)。

**Input**: `{ network, traceId }`(uuid)
**Output**: `TransferDetail`

基本欄位:`id`(traceId)、`createdAt`、`accountAddress`、`gasFreeAddress`、`providerAddress`、`targetAddress`、`nonce`、`tokenAddress`、`amount`、`expiredAt`、`state`、`estimatedActivateFee`、`estimatedTransferFee`、`estimatedTotalFee`、`estimatedTotalCost`。

鏈上欄位(**上鏈前皆為 `null`**):`txnHash`、`txnBlockNum`、`txnBlockTimestamp`(毫秒)、`txnState`、`txnActivateFee`、`txnTransferFee`、`txnTotalFee`、`txnAmount`、`txnTotalCost`。

> `id` 是 traceId,**不是** on-chain transactionId;鏈上交易 hash 在 `txnHash`。

---

## 列舉

**`state`(授權狀態)**:`WAITING` → `INPROGRESS` → `CONFIRMING` → `SUCCEED` / `FAILED`

**`txnState`(鏈上交易狀態)**:`INIT`、`NOT_ON_CHAIN`、`ON_CHAIN`、`SOLIDITY`(已固化=最終成功)、`ON_CHAIN_FAILED`

**`network`**:`mainnet`、`nile`

## 錯誤 `reason`(submit 常見)

`ProviderAddressNotMatchException`、`DeadlineExceededException`、`InvalidSignatureException`、`UnsupportedTokenException`、`TooManyPendingTransferException`、`VersionNotSupportedException`、`NonceNotMatchException`、`MaxFeeExceededException`、`InsufficientBalanceException`、`ValidationException`(黑名單等)。

> 我們後端把這些放在 `ORPCError` 的 `data.reason`,App 可據此給對應提示。
