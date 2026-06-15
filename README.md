# GasFree Demo

在 **TRON** 上用代幣(如 USDT)直接付 gas、**免持有 TRX** 的轉帳 demo。包含一個前端 demo、一個後端服務,以及把 GasFree Provider API 包成型別安全 oRPC 的共用套件。

> GasFree 的概念、資金流、permit 簽章與串接細節,完整文件在 **[`docs/gasfree/`](./docs/gasfree/README.md)**。

## 用 Docker Compose 啟動(最快)

不裝 Node/pnpm/Bun,直接用容器把整套(前端 + 後端 + Postgres + Redis)跑起來。

```bash
# 1) 準備全域環境變數(compose 會讀 .env.global)
cp .env.global.example .env.global
#    填入 GasFree 金鑰:GF_API_KEY / GF_API_SECRET(主網)
#    Nile 測試網填 TEST_GF_API_KEY / TEST_GF_API_SECRET

# 2) 建置並啟動全部
docker compose up -d --build

# 停止(加 -v 連 volume 一起清掉)
docker compose down
```

起來後:

- 前端 → **http://localhost:3000**
- 後端 → **http://localhost:3001**(容器內聽 `8080`,對外映射 3001;健康檢查 `GET /api/v1/health`)
- Postgres → `localhost:5433`、Redis → `localhost:6380`

> `docker-compose.yaml` 會用 `apps/service/Dockerfile`、`apps/www/Dockerfile` 建置兩個 app(透過 `turbo prune` 精簡),並一併起 Postgres + Redis。

### 只起 DB + Redis(本地用 pnpm 開發時)

想用本機的 `pnpm dev` 跑 app、但要 Postgres/Redis 時:

```bash
docker compose -f db.docker-compose.yaml up -d
# 等同:pnpm db:up
```

---

## 專案結構(pnpm + Turborepo monorepo)

```
apps/
  www       前端 demo — React 19 + Vite + TanStack Router + HeroUI v3
  service   後端服務 — Bun + Hono,掛載 oRPC(RPC + OpenAPI)
packages/
  api       GasFree oRPC contracts / router / service / pipes(zod)
  kv        共用 KV / 快取
  utils     共用工具
docs/
  gasfree   GasFree 串接說明文件(PM / 後端 / App)
```

| 套件           | 說明                                           | 對外                  |
| -------------- | ---------------------------------------------- | --------------------- |
| `apps/www`     | GasFree 轉帳 demo UI                           | http://localhost:3000 |
| `apps/service` | API gateway:持 GasFree API 金鑰、轉發並鑑權    | http://localhost:3001 |
| `packages/api` | oRPC 合約與服務邏輯(被 `www` / `service` 共用) | —                     |

## 技術棧

- **Monorepo**:pnpm workspaces + Turborepo;lint/format 用 [oxc](https://oxc.rs)(oxlint / oxfmt);TypeScript。
- **前端(www)**:React 19、Vite、TanStack Router、HeroUI v3(Tailwind CSS v4)、zustand、react-hook-form + zod、`@orpc/client` + TanStack Query、tronweb。
- **後端(service)**:Bun、Hono、oRPC(`RPCHandler` + `OpenAPIHandler`)。
- **API 層(packages/api)**:oRPC contract-first、zod schema 驗證/轉換。
- **測試**:Vitest。

## 先決條件

| 工具     | 版本                                | 備註                                      |
| -------- | ----------------------------------- | ----------------------------------------- |
| **Node** | `>= 22`(repo pin `v26`,見 `.nvmrc`) |                                           |
| **pnpm** | `11.5.2`(見 `packageManager`)       | 用 corepack 啟用,免手動安裝               |
| **Bun**  | `1.3.14`(見 `.bun-version`)         | `apps/service` 的 dev / build 跑在 Bun 上 |

## 快速開始

```bash
# 1) 啟用 pnpm(透過 corepack)
corepack enable

# 2) 安裝相依
pnpm install

# 3) 設定環境變數(見下方「環境變數」)
cp apps/service/.env.example apps/service/.env
cp packages/api/.env.example packages/api/.env
#   填入 GasFree 金鑰:主網用 GF_API_KEY/GF_API_SECRET,
#   Nile 測試網用 TEST_GF_API_KEY/TEST_GF_API_SECRET

# 4) 啟動全部(Turborepo 同時跑 www + service)
pnpm dev
```

啟動後:

- 前端 → **http://localhost:3000**
- 後端 → **http://localhost:3001**(健康檢查:`GET /api/v1/health`)

> 前端預設打 `http://localhost:3001`(可用 `VITE_SERVICE_ENDPOINT` 覆寫)。請確保 service 有跑、且 GasFree 金鑰已設定,否則連接錢包後的查詢/送出會失敗。

### 只啟動單一服務

```bash
pnpm --filter service dev   # 只跑後端
pnpm --filter www dev       # 只跑前端
```

## 環境變數

GasFree API 需要 **API Key/Secret**,且**只能放在後端**(絕不放前端)。金鑰需向 GasFree 開發者中心申請。

### `apps/service`(`.env`)

| 變數                                     | 必填 | 說明                                              |
| ---------------------------------------- | ---- | ------------------------------------------------- |
| `PORT`                                   |      | 服務埠號(範例 `3001`,程式預設 `3005`)             |
| `NODE_ENV`                               |      | `development` / `production`                      |
| `CORS_ALLOWED_ORIGIN`                    |      | 允許來源,逗號分隔(範例含 `http://localhost:3000`) |
| `GF_API_KEY` / `GF_API_SECRET`           | ✅   | **主網** GasFree 金鑰                             |
| `TEST_GF_API_KEY` / `TEST_GF_API_SECRET` |      | **Nile 測試網** 金鑰(未設則 fallback 主網那組)    |

> 其餘 `SENTRY_DSN`、`REDIS_*` 等為選用,見 `apps/service/.env.example`。

### `packages/api`(`.env`)

與上述相同的 `GF_*` / `TEST_GF_*` 金鑰。供 `packages/api` 單獨跑測試(含打真實 GasFree API 的整合測試)使用。

### `apps/www`(選用)

| 變數                    | 預設                    | 說明         |
| ----------------------- | ----------------------- | ------------ |
| `VITE_SERVICE_ENDPOINT` | `http://localhost:3001` | 後端服務位址 |

> 網路(Nile / 主網)在 UI 上切換(預設 **Nile 測試網**),不需 env。

## 常用指令(在 repo 根目錄)

| 指令                                | 作用                                          |
| ----------------------------------- | --------------------------------------------- |
| `pnpm dev`                          | Turborepo 同時啟動所有 app(`--continue`)      |
| `pnpm build`                        | 建置所有可建置的 app                          |
| `pnpm start`                        | 啟動已建置的產物                              |
| `pnpm test`                         | 跑 Vitest(`pnpm test:watch` / `pnpm test:ui`) |
| `pnpm lint` / `pnpm lint:fix`       | oxlint                                        |
| `pnpm format` / `pnpm format:check` | oxfmt                                         |
| `pnpm type:check`                   | 全 workspace `tsc --noEmit`                   |
| `pnpm clean`                        | 清掉 `node_modules` / 快取                    |

可用 `--filter` 指定單一套件,例如 `pnpm --filter @repo/api test:watch`。

## 建置

```bash
pnpm build
```

- **`apps/www`** → `vite build`,產物在 `apps/www/dist/`(靜態前端,可丟 CDN / 靜態主機)。
- **`apps/service`** → `bun build --compile`,產出單一執行檔 `apps/service/.output/server`(Bun 編譯,含 runtime)。
- **`packages/api`** 為原始碼套件,經 workspace 直接被引用,不需獨立建置。

## API 端點(service)

service 在 `/api/v1` 下掛三組:

| 路徑                     | 用途                                            |
| ------------------------ | ----------------------------------------------- |
| `GET /api/v1/health`     | 健康檢查                                        |
| `/api/v1/rpc/*`          | oRPC RPC(前端用 `@orpc/client` 走這個,型別安全) |
| `/api/v1/rest/gasfree/*` | OpenAPI REST(給一般 REST / 第三方)              |

GasFree 端點(`tokens` / `providers` / `account` / `submit` / `trace`)與資料結構見 [`docs/gasfree/05-api-reference.md`](./docs/gasfree/05-api-reference.md)。

## 測試

```bash
pnpm test
```

- 單元測試用 mock,不需網路。
- `packages/api` 另有打**真實 GasFree Nile API** 的整合測試(`*.integration.test.ts`),**僅在偵測到 `GF_*` 金鑰時才執行**,否則自動跳過,CI 無金鑰也不會壞。

## 文件

- [`docs/gasfree/`](./docs/gasfree/README.md) — GasFree 完整說明
  - [01 概念總覽](./docs/gasfree/01-overview.md) · [02 帳戶與資金流](./docs/gasfree/02-accounts-and-funds.md) · [03 後端串接](./docs/gasfree/03-backend-integration.md) · [04 App 串接(RN)](./docs/gasfree/04-app-integration.md) · [05 API 參考](./docs/gasfree/05-api-reference.md)

## 備註

- GasFree 目前僅支援 **TRON**(主網 + Nile 測試網);demo 預設走 **Nile**。
- Provider 是**鏈上白名單**、不能自行新增 —— 我們以「整合方」身分使用官方既有 provider(見文件 01)。
- 正式上線建議對一般使用者關閉測試網入口,避免填錯收款地址造成資產損失。
