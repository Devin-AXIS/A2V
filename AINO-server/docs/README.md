# AINO 后端服务

AINO 是一个现代化的应用管理平台，支持多租户、模块化设计和灵活的配置管理。

## 📋 目录

- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [API 文档](#api-文档)
- [用户体系](#用户体系)
- [开发指南](#开发指南)

## 🚀 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 14+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 环境配置

复制 `.env.example` 到 `.env` 并配置数据库连接：

```bash
cp .env.example .env
```

### 数据库迁移

```bash
pnpm db:push
```

### 启动服务

```bash
pnpm dev
```

服务将在 http://localhost:3001 启动。

## 📁 项目结构

```
src/
├── db/                 # 数据库相关
│   ├── schema.ts      # 数据库模式定义
│   └── index.ts       # 数据库连接
├── modules/           # 业务模块
│   ├── users/         # 用户管理
│   ├── applications/  # 应用管理
│   ├── directories/   # 目录管理
│   └── ...
├── middleware/        # 中间件
├── docs/             # API 文档
└── app.ts            # 应用入口
```

## 📚 API 文档

- **Swagger UI**: http://localhost:3001/docs/swagger
- **OpenAPI JSON**: http://localhost:3001/docs/openapi.json

## 👥 用户体系

AINO 采用简化的用户体系，明确区分系统用户和应用用户：

- **[用户体系详细说明](./USER-SYSTEM.md)** - 完整的用户体系文档
- **系统用户** - 登录平台，管理应用
- **应用用户** - 应用内部的业务用户

## 🛠️ 开发指南

### 添加新模块

1. 在 `src/modules/` 下创建模块目录
2. 实现 `routes.ts`、`service.ts`、`repo.ts`、`dto.ts`
3. 在 `src/app.ts` 中注册路由
4. 更新 API 文档

### 数据库操作

使用 Drizzle ORM 进行数据库操作：

```typescript
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

// 查询用户
const user = await db.select().from(users).where(eq(users.id, userId))
```

### 权限控制

- 系统用户通过 `applications.ownerId` 关联应用
- 只有应用所有者可以管理应用
- 应用用户与系统用户完全隔离

## 📝 脚本

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm db:push` - 推送数据库变更
- `pnpm studio` - 启动 Drizzle Studio

## 🔧 配置

### 环境变量

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5433
DB_USER=aino
DB_PASSWORD=pass
DB_NAME=aino

# 服务配置
PORT=3001
NODE_ENV=development
```

### 系统模块配置

系统模块在 `src/lib/system-modules.ts` 中配置，包括：
- 用户管理模块
- 系统配置模块
- 审计日志模块

## �� 许可证

MIT License
