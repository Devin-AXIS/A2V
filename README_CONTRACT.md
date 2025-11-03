# 智能合约部署说明

## 概述

这是一个基于签名验证的代币分发智能合约，部署在 Base 链上（目前是测试网）。

## 合约功能

### TokenDistributor

主要功能：
- 接收签名验证的代币分发请求
- 链下用私钥签名（包含代币数量、接收地址、nonce、过期时间）
- 链上验证签名并分发代币
- 防止重放攻击（通过 nonce）
- 支持签名过期验证

## 技术说明

由于哈希值在密码学上是不可逆的（单向函数），本合约采用了 **EIP-712 结构化数据签名**方案：

1. **链下签名**：使用私钥对包含代币数量和接收地址的结构化数据进行签名
2. **链上验证**：合约验证签名的有效性，提取信息并分发代币
3. **安全性**：使用 nonce 防止重放攻击，使用 deadline 确保签名不会永久有效

## 安装依赖

```bash
pnpm install
# 或
npm install
```

## 配置环境变量

1. 复制 `.env.example` 到 `.env`
2. 填写必要的环境变量：

```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
SIGNER_ADDRESS=0x...  # 签名者的地址（对应签名私钥的公钥地址）
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
TOKEN_ADDRESS=  # 可选，如果不提供会部署测试代币
```

### 获取测试网 ETH

部署到 Base Sepolia 测试网需要测试 ETH：
1. 访问 [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. 或使用其他 Base Sepolia 测试网水龙头

## 编译合约

```bash
pnpm run compile
# 或
npm run compile
```

## 部署合约

### 部署到 Base Sepolia 测试网

```bash
pnpm run deploy:base-sepolia
# 或
npm run deploy:base-sepolia
```

### 部署到 Base 主网

```bash
pnpm run deploy:base
# 或
npm run deploy:base
```

部署成功后，会显示：
- 合约地址
- 区块浏览器链接
- 部署信息保存位置

## 使用合约

### 1. 链下生成签名

使用 `scripts/sign-message.ts` 脚本生成签名，或使用以下代码：

```typescript
import { ethers } from "ethers";

const signerWallet = new ethers.Wallet(SIGNER_PRIVATE_KEY);

const domain = {
  name: "TokenDistributor",
  version: "1",
  chainId: 84532, // Base Sepolia
  verifyingContract: "合约地址",
};

const types = {
  DistributionMessage: [
    { name: "amount", type: "uint256" },
    { name: "recipient", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

const message = {
  amount: ethers.parseEther("100"),
  recipient: "接收者地址",
  nonce: Date.now(),
  deadline: Math.floor(Date.now() / 1000) + 3600,
};

const signature = await signerWallet.signTypedData(domain, types, message);
```

### 2. 调用合约分发代币

```typescript
const contract = new ethers.Contract(contractAddress, abi, provider);
await contract.distribute(
  amount,
  recipient,
  nonce,
  deadline,
  signature
);
```

## 合约接口

### distribute

分发代币给指定地址

```solidity
function distribute(
    uint256 amount,
    address recipient,
    uint256 nonce,
    uint256 deadline,
    bytes calldata signature
) external
```

**参数：**
- `amount`: 代币数量
- `recipient`: 接收者地址
- `nonce`: 防止重放攻击的随机数
- `deadline`: 签名过期时间戳
- `signature`: EIP-712 签名

### setSigner

更新签名者地址（仅所有者）

```solidity
function setSigner(address _newSigner) external onlyOwner
```

### setToken

更新代币合约地址（仅所有者）

```solidity
function setToken(address _newToken) external onlyOwner
```

### getDomainSeparator

获取 EIP-712 域分隔符（用于链下签名）

```solidity
function getDomainSeparator() external view returns (bytes32)
```

## 安全注意事项

1. **私钥安全**：永远不要将私钥提交到代码仓库
2. **Nonce 管理**：确保每个 nonce 只使用一次
3. **签名过期**：合理设置 deadline，避免签名长期有效
4. **代币余额**：确保合约有足够的代币余额用于分发
5. **签名者地址**：确保 SIGNER_ADDRESS 与签名私钥对应的地址一致

## 文件结构

```
.
├── contracts/
│   ├── TokenDistributor.sol  # 主合约
│   └── TestToken.sol          # 测试代币（可选）
├── scripts/
│   ├── deploy.ts              # 部署脚本
│   └── sign-message.ts        # 签名示例
├── hardhat.config.ts          # Hardhat 配置
├── .env.example              # 环境变量示例
└── README_CONTRACT.md        # 本文件
```

## 验证合约（可选）

如果需要在 BaseScan 上验证合约：

```bash
npx hardhat verify --network base-sepolia <合约地址> <代币地址> <签名者地址>
```

需要先设置 `BASESCAN_API_KEY` 环境变量。

