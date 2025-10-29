# WorkloadToken 系统演示指南

## 🎯 演示目标

本演示将展示一个完整的基于工作量证明的代币支付系统，包括：

1. **MCP服务器** - 执行AI任务并追踪工作量
2. **智能合约** - 验证工作证明并分发代币
3. **AI客户端** - 处理支付并提交工作证明

## 🚀 快速演示

### 1. 一键启动

```bash
# 进入项目目录
cd workload-token-system

# 一键启动所有服务
./start.sh
```

### 2. 运行演示

```bash
# 运行完整演示
npm run start:demo
```

### 3. 交互式体验

```bash
# 启动交互式客户端
npm run start:client
```

## 📋 演示步骤详解

### 步骤1: 系统启动

```bash
# 检查系统状态
curl http://localhost:3001/health

# 预期输出
{
  "success": true,
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "toolsAvailable": 4,
  "workloadRecords": 0
}
```

### 步骤2: 查看可用工具

```bash
# 获取工具列表
curl http://localhost:3001/tools

# 预期输出
{
  "success": true,
  "tools": [
    {
      "name": "text-processing",
      "description": "处理文本内容，计算字符数、词数等",
      "cost": 0.1,
      "requiresPayment": true
    },
    {
      "name": "image-analysis",
      "description": "分析图片内容，提取特征",
      "cost": 0.5,
      "requiresPayment": true
    },
    {
      "name": "data-calculation",
      "description": "执行数学计算和数据处理",
      "cost": 0,
      "requiresPayment": false
    },
    {
      "name": "file-conversion",
      "description": "转换文件格式",
      "cost": 0.3,
      "requiresPayment": true
    }
  ]
}
```

### 步骤3: 使用免费工具

```bash
# 调用数据计算工具
curl -X POST http://localhost:3001/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "data-calculation",
    "input": {
      "data": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
  }'

# 预期输出
{
  "success": true,
  "taskId": "uuid-task-id",
  "output": {
    "statistics": {
      "sum": 55,
      "average": 5.5,
      "maximum": 10,
      "minimum": 1,
      "count": 10
    },
    "calculatedAt": "2024-01-01T12:00:00.000Z"
  },
  "workProof": {
    "taskId": "uuid-task-id",
    "toolName": "data-calculation",
    "inputSize": 25,
    "outputSize": 120,
    "executionTime": 1250,
    "timestamp": 1704110400000,
    "hash": "0x..."
  },
  "executionTime": 1250,
  "cost": 0
}
```

### 步骤4: 使用付费工具（触发支付）

```bash
# 调用文本处理工具（需要支付）
curl -X POST http://localhost:3001/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "text-processing",
    "input": {
      "text": "这是一个测试文本，用于演示文本处理功能。"
    }
  }'

# 预期输出（402支付请求）
{
  "success": false,
  "error": "需要支付",
  "paymentRequired": {
    "amount": 0.1,
    "currency": "WLT",
    "taskId": "uuid-task-id",
    "paymentAddress": "0x1234567890123456789012345678901234567890",
    "message": "请支付 0.1 WLT 代币以使用 text-processing 工具"
  }
}
```

### 步骤5: 处理支付并重新调用

```bash
# 使用支付信息重新调用
curl -X POST http://localhost:3001/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "text-processing",
    "input": {
      "text": "这是一个测试文本，用于演示文本处理功能。"
    },
    "paymentInfo": {
      "transactionHash": "0x1234567890abcdef...",
      "amount": 0.1,
      "currency": "WLT"
    }
  }'

# 预期输出
{
  "success": true,
  "taskId": "uuid-task-id",
  "output": {
    "characterCount": 25,
    "wordCount": 8,
    "lineCount": 1,
    "processedAt": "2024-01-01T12:00:00.000Z",
    "analysis": {
      "averageWordLength": 3.125,
      "hasNumbers": false,
      "hasSpecialChars": true
    }
  },
  "workProof": {
    "taskId": "uuid-task-id",
    "toolName": "text-processing",
    "inputSize": 25,
    "outputSize": 180,
    "executionTime": 2100,
    "timestamp": 1704110400000,
    "hash": "0x..."
  },
  "executionTime": 2100,
  "cost": 0.1
}
```

### 步骤6: 查看工作量记录

```bash
# 获取特定任务的工作量记录
curl http://localhost:3001/workload/{taskId}

# 获取所有工作量记录
curl http://localhost:3001/workload

# 预期输出
{
  "success": true,
  "total": 2,
  "workloads": [
    {
      "taskId": "uuid-task-id-2",
      "toolName": "text-processing",
      "inputSize": 25,
      "outputSize": 180,
      "executionTime": 2100,
      "timestamp": 1704110400000,
      "hash": "0x...",
      "status": "completed",
      "recordedAt": 1704110402000
    },
    {
      "taskId": "uuid-task-id-1",
      "toolName": "data-calculation",
      "inputSize": 25,
      "outputSize": 120,
      "executionTime": 1250,
      "timestamp": 1704110390000,
      "hash": "0x...",
      "status": "completed",
      "recordedAt": 1704110392000
    }
  ]
}
```

## 🤖 客户端演示

### 交互式客户端

```bash
# 启动交互式客户端
npm run start:client
```

客户端将提供以下功能：

1. **工具选择** - 从可用工具列表中选择
2. **输入收集** - 根据工具类型收集必要输入
3. **支付处理** - 自动处理x402支付请求
4. **工作证明提交** - 将工作量证明提交到智能合约
5. **统计查看** - 显示用户工作量和代币余额

### 演示脚本

```bash
# 运行自动化演示
npm run start:demo
```

演示脚本将自动执行：

1. 显示初始状态
2. 获取可用工具列表
3. 使用免费工具（数据计算）
4. 使用付费工具（文本处理、图像分析、文件转换）
5. 显示最终统计信息

## 🔧 智能合约演示

### 部署合约

```bash
# 进入智能合约目录
cd smart-contract

# 编译合约
npx hardhat compile

# 部署到本地网络
npx hardhat run scripts/deploy.js --network localhost
```

### 合约交互

```javascript
// 获取合约实例
const contract = new web3.eth.Contract(ABI, contractAddress);

// 提交工作量证明
await contract.methods.submitWorkProof(
  taskId,
  toolName,
  inputSize,
  outputSize,
  executionTime,
  proofHash
).send({ from: userAddress });

// 获取用户工作量
const workload = await contract.methods.getUserWorkload(userAddress).call();

// 获取代币余额
const balance = await contract.methods.balanceOf(userAddress).call();
```

## 📊 监控和调试

### 查看日志

```bash
# 查看MCP服务器日志
tail -f mcp-server/logs/mcp-server.log

# 查看客户端日志
tail -f client/logs/client.log

# 查看所有日志
npm run logs
```

### 健康检查

```bash
# MCP服务器健康检查
curl http://localhost:3001/health

# 检查进程状态
ps aux | grep -E "(mcp-server|client)"
```

### 停止系统

```bash
# 停止所有服务
./stop.sh

# 或者手动停止
npm run stop
```

## 🎯 演示要点

### 1. x402支付协议
- 展示如何通过HTTP 402状态码请求支付
- 演示支付信息的处理和验证

### 2. 工作量证明
- 展示工作量数据的收集和记录
- 演示工作量证明哈希的生成

### 3. 智能合约集成
- 展示工作证明的链上验证
- 演示代币奖励的自动分发

### 4. 用户体验
- 展示交互式工具选择
- 演示自动化的支付处理流程

## 🚨 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :3001
   
   # 杀死占用进程
   kill -9 $(lsof -ti:3001)
   ```

2. **依赖安装失败**
   ```bash
   # 清理并重新安装
   npm run clean
   npm run install:all
   ```

3. **区块链连接失败**
   ```bash
   # 启动本地区块链网络
   npx hardhat node
   ```

4. **合约部署失败**
   ```bash
   # 检查网络配置
   npx hardhat console --network localhost
   ```

## 📈 扩展演示

### 添加新工具

1. 在MCP服务器中添加新工具定义
2. 实现工具执行逻辑
3. 更新智能合约的任务奖励配置
4. 测试新工具的完整流程

### 自定义奖励机制

1. 修改智能合约的奖励计算逻辑
2. 调整不同工具的基础奖励
3. 添加时间或质量乘数
4. 测试新的奖励机制

### 多用户场景

1. 创建多个客户端实例
2. 模拟并发任务执行
3. 展示代币分配和竞争机制
4. 测试系统的可扩展性

---

**注意**: 这是一个演示系统，生产环境使用前请进行充分的安全审计和测试。
