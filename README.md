# AINO 项目

AINO 无代码系统构建平台，包含前端应用、后端API服务和数据库管理工具。

## 项目结构

```
AINO/
├── AINO-server/          # 后端API服务
├── AINO-studio/          # 前端应用
├── docs/                 # 项目文档
├── start-all.sh          # 一键启动所有服务
├── stop-all.sh           # 停止所有服务
├── status.sh             # 查看服务状态
└── logs/                 # 服务日志目录
```

## 快速开始

### 一键启动所有服务

```bash
./start-all.sh
```

这将启动：
- 🎨 前端应用 (AINO-studio): http://localhost:3000
- 📡 后端API (AINO-server): http://localhost:3001
- 🗄️ 数据库管理 (Drizzle Studio): https://local.drizzle.studio

### 查看服务状态

```bash
./status.sh
```

### 停止所有服务

```bash
./stop-all.sh
```

## 独立启动服务

### 启动后端服务

```bash
cd AINO-server
pnpm dev
```

### 启动前端服务

```bash
cd AINO-studio
pnpm dev
```

### 启动 Drizzle Studio

```bash
cd AINO-server
pnpm studio
```

## 服务地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:3001
- **健康检查**: http://localhost:3001/health
- **数据库管理**: https://local.drizzle.studio

## 日志文件

服务日志保存在 `logs/` 目录：
- `backend.log` - 后端服务日志
- `frontend.log` - 前端服务日志
- `drizzle.log` - Drizzle Studio 日志

## 开发说明

- 后端使用 Hono + TypeScript + Drizzle ORM
- 前端使用 Next.js + React + TypeScript
- 数据库使用 PostgreSQL
- 包管理器使用 pnpm
