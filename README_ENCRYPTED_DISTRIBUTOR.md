# EncryptedTokenDistributor 合约使用说明

## 概述

`EncryptedTokenDistributor` 是一个智能合约，可以接收加密的代币数量，在链上解密后自动分发代币到指定地址。合约确保了解密过程的不可篡改性。

## 工作原理

1. **加密过程**（链下）：
   - 使用密钥（字符串）通过 `keccak256` 哈希转换为 `bytes32`
   - 将代币数量转换为 `bytes32`
   - 使用 XOR 操作对代币数量进行加密

2. **解密过程**（链上）：
   - 合约存储了解密密钥（bytes32）
   - 使用 XOR 操作对加密值进行解密
   - 得到原始代币数量

3. **分发过程**：
   - 验证加密值未被使用（防止重放攻击）
   - 解密得到代币数量
   - 从合约余额中转出代币到指定地址

## 部署步骤

### 1. 配置环境变量

在项目根目录创建 `.env` 文件（如果不存在），添加以下配置：

```env
# 部署者私钥（用于部署合约）
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Base Sepolia 测试网 RPC（可选，有默认值）
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# 解密密钥（可选，如果不提供将生成随机密钥）
DECRYPTION_KEY=your_secret_key_here

# 代币合约地址（可选，如果不提供将自动部署测试代币）
TOKEN_ADDRESS=

# BaseScan API Key（可选，用于验证合约）
BASESCAN_API_KEY=
```

### 2. 编译合约

```bash
pnpm run compile
```

### 3. 部署合约到 Base Sepolia 测试网

```bash
pnpm run deploy:base-sepolia
```

或者直接运行部署脚本：

```bash
npx hardhat run scripts/deploy-encrypted-distributor.ts --network base-sepolia
```

部署成功后，脚本会输出：
- 合约地址
- 代币地址
- 解密密钥哈希值
- 使用示例

## 使用方法

### 加密代币数量

使用提供的脚本加密代币数量：

```bash
# 方式1: 使用环境变量中的密钥
npx ts-node scripts/encrypt-amount.ts 1000

# 方式2: 通过命令行参数指定密钥
npx ts-node scripts/encrypt-amount.ts 1000 my-secret-key
```

脚本会输出加密后的 `bytes32` 值，可以用于调用合约。

### 调用合约分发代币

#### 方式1: 使用 Hardhat Console

```bash
npx hardhat console --network base-sepolia
```

```javascript
const EncryptedTokenDistributor = await ethers.getContractFactory("EncryptedTokenDistributor");
const distributor = await EncryptedTokenDistributor.attach("合约地址");

const encryptedValue = "0x..."; // 使用加密脚本生成的加密值
const recipient = "0x..."; // 接收地址

await distributor.distribute(encryptedValue, recipient);
```

#### 方式2: 使用 ethers.js 脚本

```typescript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
const wallet = new ethers.Wallet("你的私钥", provider);
const contract = new ethers.Contract("合约地址", abi, wallet);

const encryptedValue = "0x..."; // 加密后的值
const recipient = "0x..."; // 接收地址

await contract.distribute(encryptedValue, recipient);
```

### 批量分发

合约支持批量分发功能：

```javascript
const encryptedValues = ["0x...", "0x...", "0x..."];
const recipients = ["0x...", "0x...", "0x..."];

await distributor.distributeBatch(encryptedValues, recipients);
```

## 合约功能

### 主要函数

- `distribute(bytes32 encryptedValue, address recipient)`: 分发代币
- `distributeBatch(bytes32[] encryptedValues, address[] recipients)`: 批量分发代币
- `decrypt(bytes32 encryptedValue)`: 查看解密后的代币数量（只读）
- `isUsed(bytes32 encryptedValue)`: 检查加密值是否已使用
- `setDecryptionKey(bytes32 newKey)`: 更新解密密钥（仅所有者）
- `setToken(address newToken)`: 更新代币合约地址（仅所有者）
- `emergencyWithdraw(address token)`: 紧急提取代币（仅所有者）

### 事件

- `TokensDistributed`: 代币分发成功时触发
- `DecryptionKeyUpdated`: 解密密钥更新时触发
- `TokenUpdated`: 代币合约地址更新时触发

## 安全注意事项

1. **密钥管理**：
   - 解密密钥存储在链上，任何人可以查看合约代码
   - 但密钥本身是 `bytes32` 类型，通过哈希值无法反推出原始密钥
   - 建议使用强密钥，并安全保存

2. **重放攻击防护**：
   - 每个加密值只能使用一次
   - 合约会记录所有已使用的加密值

3. **余额检查**：
   - 合约会检查余额是否足够
   - 确保在分发前合约有足够的代币余额

4. **权限控制**：
   - 只有合约所有者可以更新密钥和代币地址
   - 任何人都可以调用 `distribute` 函数（这是预期的行为）

## 加密/解密示例

### JavaScript/TypeScript

```typescript
import { ethers } from "ethers";

// 加密
function encryptAmount(amount: string, key: string): string {
  const amountInWei = ethers.parseEther(amount);
  const keyBytes32 = ethers.id(key);
  const amountBytes32 = ethers.toBeHex(amountInWei, 32);
  const encrypted = BigInt(amountBytes32) ^ BigInt(keyBytes32);
  return ethers.toBeHex(encrypted, 32);
}

// 使用示例
const key = "my-secret-key";
const amount = "1000";
const encrypted = encryptAmount(amount, key);
console.log("加密值:", encrypted);
```

### Python

```python
from web3 import Web3

def encrypt_amount(amount: str, key: str) -> str:
    amount_wei = Web3.to_wei(amount, 'ether')
    key_bytes32 = Web3.keccak(text=key)
    amount_bytes32 = Web3.to_bytes(hexstr=Web3.to_hex(amount_wei).zfill(66))
    encrypted = int.from_bytes(amount_bytes32, 'big') ^ int.from_bytes(key_bytes32, 'big')
    return Web3.to_hex(encrypted).zfill(66)

# 使用示例
key = "my-secret-key"
amount = "1000"
encrypted = encrypt_amount(amount, key)
print(f"加密值: {encrypted}")
```

## 测试

运行测试（如果有测试文件）：

```bash
pnpm run test
```

## 故障排查

1. **部署失败 - 余额不足**：
   - 确保部署账户有足够的 ETH 支付 gas 费
   - Base Sepolia 测试网需要测试 ETH

2. **分发失败 - 余额不足**：
   - 确保合约中有足够的代币余额
   - 如果部署时自动部署了测试代币，会自动转入部分代币到合约

3. **解密失败**：
   - 确保使用的密钥与部署时使用的密钥相同
   - 确保加密时使用了正确的密钥

4. **重放攻击错误**：
   - 每个加密值只能使用一次
   - 如果已使用，需要生成新的加密值

## 注意事项

- 这是一个测试合约，用于演示链上解密功能
- XOR 加密不是最强的加密方式，但对于某些应用场景足够
- 生产环境建议使用更强的加密方案或零知识证明
- 确保密钥的安全性和唯一性

