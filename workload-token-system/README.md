# WorkloadToken 系统

基于工作量证明的代币支付系统，集成x402支付协议和智能合约。

## 🎯 系统概述

这是一个完整的"工作即挖矿"系统，AI代理通过完成实际任务来获得代币奖励。系统包含：

- **MCP服务器**: 执行任务并追踪工作量
- **智能合约**: 验证工作证明并分发代币
- **客户端**: AI代理，处理支付并提交工作证明

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI客户端      │    │   MCP服务器     │    │   智能合约      │
│                 │    │                 │    │                 │
│ • 工具调用      │◄──►│ • 任务执行      │    │ • 工作量验证    │
│ • 支付处理      │    │ • 工作量追踪    │    │ • 代币分发      │
│ • 工作证明提交  │    │ • x402支付协议  │    │ • 奖励计算      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
npm run install:mcp      # MCP服务器
npm run install:contract # 智能合约
npm run install:client   # 客户端
```

### 2. 部署智能合约

```bash
# 部署到本地网络
npm run deploy:contract

# 或者手动部署
cd smart-contract
npm run deploy:local
```

### 3. 启动MCP服务器

```bash
# 启动MCP服务器
npm run start:mcp

# 或者手动启动
cd mcp-server
npm start
```

### 4. 运行客户端

```bash
# 交互式客户端
npm run start:client

# 演示模式
npm run start:demo

# 或者手动运行
cd client
npm start
```

## 📁 项目结构

```
workload-token-system/
├── mcp-server/           # MCP服务器
│   ├── server.js         # 主服务器文件
│   ├── package.json      # 依赖配置
│   └── env.example       # 环境变量示例
├── smart-contract/       # 智能合约
│   ├── WorkloadToken.sol # 主合约文件
│   ├── scripts/          # 部署脚本
│   ├── package.json      # 依赖配置
│   └── hardhat.config.js # Hardhat配置
├── client/               # 客户端
│   ├── client.js         # 主客户端文件
│   ├── demo.js           # 演示脚本
│   ├── package.json      # 依赖配置
│   └── env.example       # 环境变量示例
├── docs/                 # 文档
├── package.json          # 根项目配置
└── README.md            # 项目说明
```

## 🛠️ 可用工具

### 免费工具
- **data-calculation**: 数学计算和数据处理 (0 WLT)

### 付费工具
- **text-processing**: 文本内容分析 (0.1 WLT)
- **image-analysis**: 图像内容分析 (0.5 WLT)
- **file-conversion**: 文件格式转换 (0.3 WLT)

## 💰 代币经济

### 奖励机制
- **基础奖励**: 根据工具类型设定
- **时间奖励**: 执行时间越长，奖励越多
- **质量奖励**: 输入输出大小影响奖励

### 代币配置
- **名称**: Workload Token (WLT)
- **精度**: 18位小数
- **总供应量**: 1,000,000 WLT
- **初始分配**: 全部给合约部署者

## 🔧 配置说明

### 环境变量

#### MCP服务器 (.env)
```env
PORT=3001
PAYMENT_ADDRESS=0x1234567890123456789012345678901234567890
WEB3_PROVIDER_URL=http://localhost:8545
CONTRACT_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12
```

#### 客户端 (.env)
```env
MCP_SERVER_URL=http://localhost:3001
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
PRIVATE_KEY=0x1234567890123456789012345678901234567890123456789012345678901234
RPC_URL=http://localhost:8545
```

## 📊 API接口

### MCP服务器接口

#### 获取工具列表
```http
GET /tools
```

#### 调用工具
```http
POST /call-tool
Content-Type: application/json

{
  "toolName": "text-processing",
  "input": { "text": "Hello World" },
  "paymentInfo": { "transactionHash": "0x..." }
}
```

#### 获取工作量记录
```http
GET /workload/:taskId
```

### 智能合约接口

#### 提交工作量证明
```solidity
function submitWorkProof(
  string memory taskId,
  string memory toolName,
  uint256 inputSize,
  uint256 outputSize,
  uint256 executionTime,
  bytes32 proofHash
) external
```

#### 获取用户工作量
```solidity
function getUserWorkload(address user) external view returns (
  uint256 totalTasks,
  uint256 totalTokensEarned,
  uint256 lastActivity
)
```

## 🔄 工作流程

1. **任务发现**: 客户端获取可用工具列表
2. **工具调用**: 客户端调用MCP服务器执行任务
3. **支付处理**: 如需付费，处理x402支付请求
4. **工作量记录**: 服务器记录任务执行数据
5. **工作证明**: 生成工作量证明哈希
6. **代币奖励**: 提交证明到智能合约获得代币

## 🧪 测试

```bash
# 运行所有测试
npm run test:all

# 分别测试各组件
npm run test:mcp      # MCP服务器测试
npm run test:contract # 智能合约测试
npm run test:client   # 客户端测试
```

## 🚀 部署

### 本地开发
```bash
# 一键启动所有服务
npm run dev

# 或者分别启动
npm run start:mcp
npm run start:client
```

### 生产环境
```bash
# 部署智能合约到测试网
cd smart-contract
npm run deploy:testnet

# 配置生产环境变量
# 启动MCP服务器
# 启动客户端
```

## 🔍 监控和日志

```bash
# 查看日志
npm run logs

# 健康检查
curl http://localhost:3001/health
```

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🆘 故障排除

### 常见问题

1. **MCP服务器无法启动**
   - 检查端口3001是否被占用
   - 确认Node.js版本 >= 16.0.0

2. **智能合约部署失败**
   - 确认Hardhat网络运行正常
   - 检查私钥和网络配置

3. **客户端连接失败**
   - 确认MCP服务器正在运行
   - 检查环境变量配置

4. **支付处理失败**
   - 确认区块链网络连接
   - 检查账户余额和私钥

### 获取帮助

- 查看 [文档](docs/)
- 提交 [Issue](https://github.com/aino-team/workload-token-system/issues)
- 联系开发团队

---

**注意**: 这是一个演示系统，生产环境使用前请进行充分的安全审计和测试。
