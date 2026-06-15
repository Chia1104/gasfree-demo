# GasFree 整合文件

這份文件說明 GasFree(TRON 上「用代幣付 gas、免持有 TRX」的轉帳方案)的運作流程,以及我們如何把它接到後端服務與(未來)React Native App。

> GasFree 讓使用者轉 TRC-20(如 USDT)時,**不需要持有 TRX 付 gas** —— gas 由 Service-Provider 代付,手續費直接從你轉的代幣裡扣。

## 這份文件給誰看

| 角色          | 先看                                                                                  | 重點                                              |
| ------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **PM / 產品** | [01 概念總覽](./01-overview.md)、[02 帳戶與資金流](./02-accounts-and-funds.md)        | GasFree 是什麼、能/不能做什麼、使用者體驗、限制   |
| **後端**      | [03 後端串接](./03-backend-integration.md)、[05 API 參考](./05-api-reference.md)      | 我們的 service 架構、API 鑑權、網路設定、錯誤處理 |
| **App(RN)**   | [04 App 串接](./04-app-integration.md)、[02 帳戶與資金流](./02-accounts-and-funds.md) | GasFree 帳戶管理、permit 簽章機制、轉帳流程、安全 |

## 文件索引

1. [概念總覽](./01-overview.md) — 角色、名詞、為什麼用 GasFree
2. [帳戶模型與資金流](./02-accounts-and-funds.md) — GasFree 帳戶怎麼存錢/扣錢、啟用、手續費、狀態
3. [後端串接](./03-backend-integration.md) — 我們的 oRPC service、鑑權、網路、錯誤映射
4. [App 串接(React Native)](./04-app-integration.md) — 帳戶管理 + permit 簽章機制
5. [API 參考](./05-api-reference.md) — 各端點的 request / response 資料結構

## 一分鐘 TL;DR

- 每個使用者有一個 **GasFree 帳戶位址(`gasFreeAddress`)**,由他的 EOA(一般 TRON 地址)衍生並控制。
- **錢存在 GasFree 帳戶裡**,不是 EOA。GasFree 轉帳是「從 GasFree 帳戶轉出」,EOA 只負責**簽授權**。
- 轉帳流程:使用者用 EOA 私鑰對一份 **TIP-712(EIP-712)typed-data(`PermitTransfer`)** 簽名 → 送給 Provider → Provider 代付 gas 上鏈,從 GasFree 帳戶扣「轉帳金額 + 手續費(代幣計價)」。
- 我們的後端 service 把 GasFree Provider API 包成 oRPC(`gasfree.config.tokens / providers / account / submit / trace`),**API Key/Secret 只放後端**,client 一律走我們的後端。
- 目前支援 **Nile 測試網**(預設)與 **主網**;每個請求與每次簽章都要帶/對齊 `network`。

## 名詞速查

| 名詞                                | 說明                                                                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **EOA**                             | 使用者的一般 TRON 地址(錢包帳號),GasFree 帳戶的**控制者 / 簽章者**。本身餘額不參與 GasFree 轉帳。                                                                 |
| **GasFree 帳戶 / `gasFreeAddress`** | 由 EOA 衍生的合約帳戶,**實際存錢、扣錢**的地址。                                                                                                                  |
| **Service-Provider**                | 收集授權、代付 TRX gas 並上鏈的服務商;成功後收手續費(代幣計價)。**鏈上白名單角色,不能自行新增**(見 [01](./01-overview.md));我們是「整合方」,用官方既有 provider。 |
| **PermitTransfer**                  | 使用者簽的 TIP-712 授權結構,授權把 GasFree 帳戶的代幣轉給某收款人。                                                                                               |
| **traceId**                         | 一筆 GasFree 授權的全網唯一 id(`submit` 回傳),用來追蹤後續上鏈狀態(≠ on-chain txHash)。                                                                           |

</content>
