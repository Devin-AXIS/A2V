# Workload Contracts (Base)

基于工作量证明（MCP）的代币发放合约，适配 Base 链（Sepolia/Mainnet），用于在 `bmcp` 单仓中直接开发与部署。

## 快速开始

1) 安装依赖并准备环境

```bash
cd /workload-contracts
npm install
cp .env.example .env
# 编辑 .env，填入 PRIVATE_KEY、RPC 等
```

2) 编译与部署（默认 Base Sepolia）

```bash
npx hardhat compile --config hardhat.config.base.js
npx hardhat run scripts/deploy-base.js --network baseSepolia --config hardhat.config.base.js
```

3) 输出
- 控制台将打印合约地址，并在 `deployments/` 写入部署信息 JSON。

## 环境变量（.env）
- PRIVATE_KEY: 部署私钥（0x前缀）
- BASESCAN_API_KEY: Basescan Key（可选，用于自动验证）
- BASE_SEPOLIA_RPC: Base Sepolia RPC（默认 `https://sepolia.base.org`）
- BASE_MAINNET_RPC: Base Mainnet RPC（默认 `https://mainnet.base.org`）
- TOKEN_NAME: 代币名（默认 `Workload Token`）
- TOKEN_SYMBOL: 代币符号（默认 `WLT`）
- INITIAL_SUPPLY: 初始供应量（默认 `1000000`）

## 合约接口
- `submitWorkProof(string taskId, string toolName, uint256 inputSize, uint256 outputSize, uint256 executionTime, uint256 timestamp, bytes32 proofHash)`
- `getUserWorkload(address user) -> (uint256 totalTasks, uint256 totalTokensEarned, uint256 lastActivity)`
- `updateTaskReward(...)`、`batchMint(...)`（仅 owner）
