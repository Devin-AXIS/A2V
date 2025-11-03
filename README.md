<<<<<<< HEAD
# MCP 服务器调用工具

这是一个基于 Next.js 和官方 MCP SDK 的 Web 应用，用于连接和调用 MCP（Model Context Protocol）服务器。

## 功能特性

- ✅ 连接 MCP 服务器（通过 stdio 传输）
- ✅ 列出和调用工具（Tools）
- ✅ 列出和读取资源（Resources）
- ✅ 列出和获取提示词（Prompts）
- ✅ 实时响应日志
- ✅ 现代化的 Web UI
- ✅ 基于 Next.js 14 App Router

## 安装步骤

1. **安装依赖**

```bash
npm install
```

2. **开发模式启动**

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

3. **生产构建**

```bash
npm run build
npm start
```

## 使用方法

### 1. 连接 MCP 服务器

在 Web 界面中填写：
- **命令 (Command)**: 要执行的命令，例如 `node`, `python`, `npm` 等
- **参数 (Arguments)**: 命令的参数，例如 `server.js` 或 `--version`
- **连接ID (可选)**: 留空将自动生成

示例：
- Command: `node`
- Arguments: `./path/to/mcp-server.js`

或者：
- Command: `python`
- Arguments: `-m mcp_server`

### 2. 使用工具

连接成功后：
1. 点击 "列出工具" 查看可用的工具
2. 点击工具旁边的 "调用" 按钮
3. 在弹出窗口中填写参数（如有）
4. 点击 "执行" 调用工具

### 3. 读取资源

1. 点击 "列出资源" 查看可用的资源
2. 点击资源旁边的 "读取" 按钮查看资源内容

### 4. 获取提示词

1. 点击 "列出提示词" 查看可用的提示词
2. 点击提示词旁边的 "获取" 按钮
3. 填写参数（如有）并获取提示词内容

## 项目结构

```
BMCP/
├── package.json              # 项目配置和依赖
├── next.config.js            # Next.js 配置
├── tsconfig.json             # TypeScript 配置
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 主页面（React组件）
│   ├── globals.css          # 全局样式
│   └── api/                 # API 路由
│       ├── connect/         # 连接MCP服务器
│       ├── disconnect/     # 断开连接
│       ├── tools/           # 工具相关API
│       ├── resources/       # 资源相关API
│       └── prompts/         # 提示词相关API
├── lib/                      # 工具函数
│   └── mcp-client.ts        # MCP客户端管理
└── README.md                 # 本文件
```

## 技术栈

- **框架**: Next.js 14 (App Router)
- **前端**: React + TypeScript
- **后端**: Next.js API Routes
- **MCP SDK**: `@modelcontextprotocol/sdk` (官方 SDK)

## API 端点

- `POST /api/connect` - 连接到 MCP 服务器
- `POST /api/disconnect` - 断开连接
- `GET /api/tools/:connectionId` - 列出工具
- `POST /api/call-tool` - 调用工具
- `GET /api/resources/:connectionId` - 列出资源
- `POST /api/read-resource` - 读取资源
- `GET /api/prompts/:connectionId` - 列出提示词
- `POST /api/get-prompt` - 获取提示词
- `GET /api/connections` - 获取所有活跃连接

## 注意事项

1. MCP 服务器必须支持 stdio 传输方式
2. 确保 MCP 服务器的命令和参数正确
3. 某些工具可能需要特定的参数格式
4. 连接失败时，请检查命令路径和参数是否正确

## 开发模式

Next.js 自动支持热重载：

```bash
npm run dev
```

## 注意事项

1. MCP 服务器必须支持 stdio 传输方式
2. 确保 MCP 服务器的命令和参数正确
3. 某些工具可能需要特定的参数格式
4. 连接失败时，请检查命令路径和参数是否正确
5. 项目使用 TypeScript，如遇到类型错误请检查 `tsconfig.json`

## 许可证

MIT
=======

>>>>>>> 205c39b58570bc1b4cd4b1ad9b5c6c43cc974fc5
