## 项目概述

BMCP（Blockchain MCP Market）是一个基于区块链的 MCP 价值化市场平台，采用 Monorepo 管理前端（Next.js）、服务（Registrar/Compiler）与共享包（Schema、SDK）、以及工作量证明代币合约（WorkloadToken）。

- 前端 `apps/web`：提供将现有 MCP 服务注册为 BMCP 服务的界面。
- 服务 `services/registrar`：注册/解析、代理网关、计量/402（占位但提供基础接口）。
- 服务 `services/compiler`：将 OpenAPI 自动编译为 MCP（占位，提供编译接口）。
- 包 `packages/schema`：Drizzle + Zod 的类型与表结构。
- 合约 `packages/workload-contracts`：`WorkloadToken` ERC20，基于 AI 任务工作量证明发放奖励。


## 目录与关键文件

- `apps/web`：Next.js 15，创建页面位于 `app/create/page.tsx`
- `services/registrar`：注册/解析/代理 API（README 摘要列出路由）
- `services/compiler`：OpenAPI → MCP 编译接口
- `packages/schema`：数据库结构与类型
- `packages/workload-contracts`：合约与 Hardhat 脚本
- `scripts/dev.sh`：一键本地启动（安装、构建、迁移、并行启服务）
- `scripts/deploy-workload-base.sh`：一键部署合约到 Base（默认 Base Sepolia）
- 根 `README.md`：接口与工作区指令摘要


## 本地开发与一键启动

前置要求：

- Node.js >= 20，npm >= 9
- 可访问的 Postgres（默认：`postgres://postgres:postgres@localhost:5432/bmcp`）
- 可选在仓库根目录添加 `.env` 覆盖默认值

一键启动（推荐）：

```bash
cd /Users/wemo/new-flow/ai/AINO/bmcp
./scripts/dev.sh
```

脚本行为：

- 校验 Node/NPM 版本，安装 monorepo 依赖（自动回退 npm@10 兼容）
- 构建共享包（`@bmcp/schema`）
- 若存在迁移命令则执行数据库迁移
- 并行启动 Registrar / Compiler / Web：
  - Web: http://localhost:3007
  - Registrar: http://localhost:3005（或 `REGISTRAR_PORT`）
  - Compiler: http://localhost:3011（可通过 `NEXT_PUBLIC_BMCP_COMPILER` 覆盖）

常用环境变量（脚本有默认值，可在 `.env` 覆盖）：

- `REGISTRAR_PORT`（默认 3005）
- `DATABASE_URL`（默认 `postgres://postgres:postgres@localhost:5432/bmcp`）
- `GATEWAY_BASE`（默认 `http://localhost:${REGISTRAR_PORT}`）
- `SIGNATURE_SECRET`（默认 `dev-secret`）
- `NEXT_PUBLIC_BMCP_REGISTRAR`（默认 `http://localhost:${REGISTRAR_PORT}`）
- `NEXT_PUBLIC_BMCP_COMPILER`（默认 `http://localhost:3011`）

手动启动（按工作区）：

```bash
# 根目录
npm install
npm run build

# 各服务开发
npm --workspace @bmcp/registrar run dev
npm --workspace @bmcp/compiler  run dev
npm --workspace @bmcp/web       run dev
```


## 测试链与合约部署（Base Sepolia）

项目提供将 `WorkloadToken` 合约一键部署到 Base 网络（默认 Base Sepolia）的脚本。注意当前部署脚本强制链 ID=84532（即 Base Sepolia）。

前置要求：

- 在 `bmcp/packages/workload-contracts/.env` 或环境中配置 `PRIVATE_KEY`（账户需有 Base Sepolia 测试币）
- 配置 `hardhat.config.base.js` RPC（脚本会用 `npx hardhat` 编译与部署）
- 可选：`TOKEN_NAME`、`TOKEN_SYMBOL`、`INITIAL_SUPPLY`

部署命令：

```bash
# 默认部署到 Base Sepolia
/Users/wemo/new-flow/ai/AINO/bmcp/scripts/deploy-workload-base.sh

# 指定主网（如需）
/Users/wemo/new-flow/ai/AINO/bmcp/scripts/deploy-workload-base.sh baseMainnet
```

部署结果：

- 在 `packages/workload-contracts/deployments/*.json` 输出部署信息（含地址）
- 终端打印合约地址，并提示将地址配置进服务/前端


## 人工手动测试（E2E 与分层）

### 1) Web 端：创建 BMCP

步骤：

1. 打开 http://localhost:3007/create
2. 在“原 MCP 基址”输入可访问的 MCP URL（如 `https://example.com/mcp`）
3. 点击“生成 BMCP 地址”，页面显示 Registrar 返回的 JSON 结果

说明：页面会向 `${NEXT_PUBLIC_BMCP_REGISTRAR}/api/register` 发送 POST 请求，默认 `http://localhost:3005`。

### 2) Registrar 接口（curl）

- 注册：

```bash
curl -X POST "http://localhost:3005/api/register" \
  -H "content-type: application/json" \
  -d '{
        "originalUrl":"https://example.com/mcp",
        "kind":"mcp",
        "pricing":{"policy":"flat_per_call","pricePerCall":0.001},
        "enable402":true,
        "settlementToken":"USDC",
        "publisherId":"'"$(uuidgen)"'"
      }'
```

- 解析：

```bash
curl "http://localhost:3005/api/resolve/<id>"
```

- 代理（示例健康检查路径）：

```bash
curl "http://localhost:3005/proxy/<id>/v1/health"
```

- 账单查询与支付（如实现）：

```bash
curl "http://localhost:3005/api/invoices"
curl -X POST "http://localhost:3005/api/invoices/<invoiceId>/pay"
```

API 摘要（来自 README）：`POST /api/register`、`GET /api/resolve/:id`、`ALL /proxy/:id/*`、`GET /api/invoices`、`POST /api/invoices/:id/pay`、`PUT /api/publisher/:id/pricing|splits|wallet`。

### 3) Compiler 接口（OpenAPI → MCP）

尽管前端的 OpenAPI 入口当前注释隐藏，但后端编译接口可直接调用：

```bash
curl -X POST "${NEXT_PUBLIC_BMCP_COMPILER:-http://localhost:3011}/api/compile/openapi" \
  -H "content-type: application/json" \
  -d '{"openapiUrl":"https://example.com/openapi.json"}'
```

### 4) 合约侧（Base Sepolia）

目标：验证 `submitWorkProof` 能通过校验并铸币，`getUserWorkload` 指标增长。

操作示例（Hardhat 控制台）：

```bash
cd /Users/wemo/new-flow/ai/AINO/bmcp/packages/workload-contracts
npx hardhat console --network baseSepolia --config hardhat.config.base.js
```

控制台内（示意）：

```js
const w = await ethers.getContractAt("WorkloadToken", "<DEPLOYED_ADDRESS>");
const taskId = "t1";
const tool = "text-processing";
const inp = 1000n, out = 500n, exec = 2000n;
const ts = BigInt(Math.floor(Date.now()/1000))*1000n; // ms
const enc = ethers.AbiCoder.defaultAbiCoder();
const hash = ethers.keccak256(enc.encode(["string","string","uint256","uint256","uint256","uint256"], [taskId,tool,inp,out,exec,ts]));
await w.submitWorkProof(taskId, tool, inp, out, exec, ts, hash);
await w.getUserWorkload("<YOUR_ADDRESS>");
```


## 可用性验收清单

- 应用联通：
  - Web 可打开并提交表单，返回 JSON
  - Registrar：`/api/register` 可注册、`/api/resolve/:id` 可解析、`/proxy/:id/*` 可转发
  - Compiler：`/api/compile/openapi` 返回结构化结果/错误
- 配置与数据：
  - 数据库连接正常，无连接错误；必要迁移可执行
  - Web 环境变量正确指向本地 Registrar/Compiler
- 合约可用：
  - Base Sepolia 部署成功，`deployments/*.json` 有记录
  - `submitWorkProof` 成功、余额/统计随之变化
- 错误处理：
  - 非法输入（空 taskId、超界输入、错误哈希）得到合理错误
  - Proxy 转发失败有明确状态码与消息
- 端到端：
  - Web → Registrar 注册 → 解析 → Proxy 调通目标端点
- 基础安全：
  - 敏感操作仅合约所有者可改（任务奖励、校验者授权）


## 常见问题与排查

- Node 版本不足：脚本会直接退出提示升级（要求 Node >= 20）。
- npm 兼容性：脚本会在检测到旧 npm 时临时使用 `npm@10`。
- 合约部署失败：检查 `PRIVATE_KEY`、RPC 配置、Base Sepolia 测试币余额，确保网络 chainId=84532。


## 附：关键端口与变量默认值

- Web：`http://localhost:3007`
- Registrar：`http://localhost:3005`
- Compiler：`http://localhost:3011`
- 数据库：`postgres://postgres:postgres@localhost:5432/bmcp`

如需调整，请在仓库根 `.env` 中覆盖，或在运行命令前导出环境变量。


