# 快速开始指南

## 智能合约已创建完成

我已经为您创建了一个支持链上解密的代币分发合约，以下是文件清单和使用说明。

## 创建的文件

1. **合约文件**: `contracts/EncryptedTokenDistributor.sol`
   - 实现了链上解密功能
   - 接收加密的代币数量和接收地址
   - 自动解密并分发代币

2. **部署脚本**: `scripts/deploy-encrypted-distributor.ts`
   - 自动部署到 Base Sepolia 测试网
   - 支持自动部署测试代币
   - 从 `.env` 文件读取配置

3. **加密工具**: `scripts/encrypt-amount.ts`
   - 用于加密代币数量
   - 生成可用的加密值

4. **文档**: `README_ENCRYPTED_DISTRIBUTOR.md`
   - 详细的使用说明和示例

## 快速部署步骤

### 1. 配置环境变量

在项目根目录创建或编辑 `.env` 文件：

```env
# 必须：部署者私钥
DEPLOYER_PRIVATE_KEY=your_private_key_here

# 可选：解密密钥（如果不提供会自动生成）
DECRYPTION_KEY=your_secret_key_here

# 可选：Base Sepolia RPC
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# 可选：代币合约地址（如果不提供会自动部署测试代币）
TOKEN_ADDRESS=
```

### 2. 编译合约

```bash
pnpm run compile
```

### 3. 部署到 Base Sepolia 测试网

```bash
pnpm run deploy:encrypted-distributor:base-sepolia
```

或者：

```bash
npx hardhat run scripts/deploy-encrypted-distributor.ts --network base-sepolia
```

### 4. 使用合约

#### 加密代币数量

```bash
# 使用环境变量中的密钥
pnpm run encrypt 1000

# 或指定密钥
npx ts-node scripts/encrypt-amount.ts 1000 your-secret-key
```

#### 调用合约

使用 Hardhat Console：

```bash
npx hardhat console --network base-sepolia
```

```javascript
const distributor = await ethers.getContractAt(
  "EncryptedTokenDistributor",
  "合约地址"
);

const encryptedValue = "0x..."; // 从加密脚本获取
const recipient = "0x..."; // 接收地址

await distributor.distribute(encryptedValue, recipient);
```

## 合约特性

✅ **链上解密**: 解密过程在链上完成，确保不可篡改  
✅ **重放攻击防护**: 每个加密值只能使用一次  
✅ **批量分发**: 支持一次性分发多个代币  
✅ **权限控制**: 只有所有者可以更新密钥和代币地址  
✅ **紧急提取**: 所有者可以提取合约中的代币  

## 工作原理

1. **加密**（链下）：
   ```
   代币数量 → XOR 加密（使用密钥）→ 加密值
   ```

2. **解密**（链上）：
   ```
   加密值 → XOR 解密（使用合约中的密钥）→ 代币数量
   ```

3. **分发**：
   ```
   验证加密值 → 解密数量 → 转账到接收地址
   ```

## 注意事项

⚠️ **重要提醒**：
- 确保部署账户有足够的 ETH 支付 gas 费
- Base Sepolia 测试网需要测试 ETH
- 请安全保存解密密钥
- 使用相同的密钥进行加密才能正确解密

## 获取测试 ETH

Base Sepolia 测试网水龙头：
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- https://portal.caldera.xyz/account/faucet

## 更多信息

详细文档请查看 `README_ENCRYPTED_DISTRIBUTOR.md`

