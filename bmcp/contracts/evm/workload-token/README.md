# BMCP WorkloadToken (Base)

- 位置: `bmcp/contracts/evm/workload-token`
- 合约: `contracts/WorkloadToken.sol`
- 网络: Base Sepolia(84532) / Base Mainnet(8453)

## 环境

复制 `.env.example` 为 `.env`，设置：

```
PRIVATE_KEY=0x...
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_MAINNET_RPC=https://mainnet.base.org
BASESCAN_API_KEY=可选
TOKEN_NAME=Workload Token
TOKEN_SYMBOL=WLT
INITIAL_SUPPLY=1000000
```

## 编译与部署

```bash
npm install
npm run compile
npm run deploy:base-sepolia
```

成功后会输出合约地址，可用于 `publisher` 服务。


