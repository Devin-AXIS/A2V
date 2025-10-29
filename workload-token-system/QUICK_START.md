# WorkloadToken 系统快速启动指南

## 🚀 一键启动 (推荐)

```bash
# 运行一键部署脚本
./setup-bnb-testnet.sh
```

## 📋 手动启动步骤

### 1. 准备环境

```bash
# 检查Node.js版本 (需要 >= 16)
node --version

# 安装所有依赖
npm run install:all
```

### 2. 配置私钥

```bash
# 进入智能合约目录
cd smart-contract

# 复制环境变量文件
cp env.bnb.example .env

# 编辑 .env 文件，填入你的测试私钥
nano .env
```

在 `.env` 文件中填入：
```env
PRIVATE_KEY=0x你的测试私钥
BSCSCAN_API_KEY=你的BSCScan_API_Key (可选)
```

### 3. 获取测试BNB

1. 访问 [BSC测试网水龙头](https://testnet.binance.org/faucet-smart)
2. 输入你的钱包地址
3. 获取测试BNB (每次0.1 BNB)

### 4. 部署智能合约

```bash
# 编译合约
npx hardhat compile

# 部署到BSC测试网
npx hardhat run scripts/deploy-bnb.js --network bscTestnet
```

记录返回的合约地址，例如：
```
📍 合约地址: 0x1234567890123456789012345678901234567890
```

### 5. 配置MCP服务器

```bash
# 回到项目根目录
cd ..

# 进入MCP服务器目录
cd mcp-server

# 复制环境变量文件
cp env.example .env

# 编辑 .env 文件
nano .env
```

在 `mcp-server/.env` 中填入：
```env
PORT=3001
PAYMENT_ADDRESS=0x你的钱包地址
WEB3_PROVIDER_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
CONTRACT_ADDRESS=0x你的合约地址
```

### 6. 配置客户端

```bash
# 进入客户端目录
cd ../client

# 复制环境变量文件
cp env.example .env

# 编辑 .env 文件
nano .env
```

在 `client/.env` 中填入：
```env
MCP_SERVER_URL=http://localhost:3001
CONTRACT_ADDRESS=0x你的合约地址
PRIVATE_KEY=0x你的测试私钥
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
NETWORK_ID=97
CHAIN_ID=97
```

### 7. 启动系统

```bash
# 回到项目根目录
cd ..

# 启动MCP服务器
npm run start:mcp
```

在另一个终端窗口：
```bash
# 启动客户端
npm run start:client
```

### 8. 测试系统

```bash
# 运行完整演示
npm run start:demo
```

## 🔧 系统验证

### 检查MCP服务器
```bash
curl http://localhost:3001/health
```

### 检查智能合约
访问 [BSC测试网浏览器](https://testnet.bscscan.com) 搜索你的合约地址

### 检查客户端
运行交互式客户端，测试工具调用和支付流程

## 📊 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI客户端      │    │   MCP服务器     │    │   BSC测试网     │
│   (Client)      │    │   (MCP Server)  │    │   (Testnet)     │
│                 │    │                 │    │                 │
│ • 工具调用      │◄──►│ • 任务执行      │    │ • 智能合约      │
│ • 支付处理      │    │ • 工作量追踪    │    │ • 代币分发      │
│ • 工作证明提交  │    │ • x402支付协议  │    │ • 交易确认      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ 可用工具

- **text-processing** - 文本处理 (0.1 WLT)
- **image-analysis** - 图像分析 (0.5 WLT)
- **data-calculation** - 数据计算 (免费)
- **file-conversion** - 文件转换 (0.3 WLT)

## 💰 费用说明

- **部署费用**: ~0.01-0.02 BNB (测试网)
- **交易费用**: ~0.001-0.01 BNB (测试网)
- **代币奖励**: 根据工作量自动计算

## 🚨 故障排除

### 常见问题

1. **私钥错误**
   ```bash
   # 检查私钥格式
   echo "0x你的私钥" | wc -c
   # 应该是66个字符 (0x + 64位十六进制)
   ```

2. **网络连接失败**
   ```bash
   # 尝试不同的RPC节点
   # 测试网: https://data-seed-prebsc-2-s1.binance.org:8545/
   ```

3. **Gas费用不足**
   ```bash
   # 检查BNB余额
   # 访问: https://testnet.bscscan.com/address/你的地址
   ```

4. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :3001
   
   # 杀死占用进程
   kill -9 $(lsof -ti:3001)
   ```

### 查看日志

```bash
# 查看MCP服务器日志
tail -f logs/mcp-server.log

# 查看所有日志
npm run logs
```

## 🎯 下一步

1. **测试功能**: 使用演示模式测试所有功能
2. **自定义工具**: 添加你自己的AI工具
3. **调整奖励**: 修改代币奖励机制
4. **部署主网**: 准备就绪后部署到BSC主网

---

**注意**: 这是测试网部署，使用测试代币，不会产生真实费用。
