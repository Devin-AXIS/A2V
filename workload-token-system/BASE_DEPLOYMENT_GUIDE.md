# WorkloadToken 部署到 Base 链指南

## 网络
- 测试网: Base Sepolia (84532, https://sepolia.base.org)
- 主网: Base Mainnet (8453, https://mainnet.base.org)

## 测试网部署步骤
1) 进入合约目录并准备环境变量
```
cd smart-contract
npm install
cp env.base.example .env
# 编辑 .env, 填写 PRIVATE_KEY/BASESCAN_API_KEY(可选)
```

2) 编译与部署
```
npx hardhat compile --config hardhat.config.base.js
npx hardhat run scripts/deploy-base.js --network baseSepolia --config hardhat.config.base.js
```

3) 更新服务配置
- mcp-server/.env: WEB3_PROVIDER_URL=https://sepolia.base.org, CONTRACT_ADDRESS=部署生成地址
- client/.env: RPC_URL=https://sepolia.base.org, CHAIN_ID=84532, CONTRACT_ADDRESS=部署生成地址

4) 启动与验证
```
npm run start:mcp
npm run start:client
npm run start:demo
```

提示: Base Sepolia 需要测试ETH，可搜索 “Base Sepolia faucet” 领取。


