# AINO 后端服务

AINO 无代码系统构建平台的后端 API 服务。

## 技术栈

- **框架**: Hono (轻量级 Web 框架)
- **语言**: TypeScript
- **数据库**: PostgreSQL + Drizzle ORM (待接入)
- **验证**: Zod (类型安全的数据验证)

## 项目结构

```
AINO-server/
├── src/
│   ├── app.ts              # Hono 应用实例 + 中间件
│   ├── server.ts           # 服务器启动文件
│   ├── env.ts              # 环境变量配置
│   ├── db/                 # 数据库相关 (待实现)
│   ├── platform/           # 平台核心功能 (待实现)
│   └── modules/            # 业务模块
│       ├── users/          # 用户模块
│       │   ├── dto.ts      # 数据传输对象
│       │   ├── routes.ts   # API 路由
│       │   ├── service.ts  # 业务逻辑
│       │   └── repo.ts     # 数据访问层
│       └── catalog/        # 目录模块 (待实现)
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

服务器将在 http://localhost:3001 启动

### 3. 测试健康检查

```bash
curl http://localhost:3001/health
```

应该返回: `ok`

## API 接口

### 健康检查

- `GET /health` - 服务器健康检查

### 用户模块

- `POST /api/users/login` - 用户登录
- `POST /api/users/register` - 用户注册
- `GET /api/users/me` - 获取当前用户信息
- `GET /api/users` - 获取用户列表

### 示例请求

#### 用户登录

```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aino.com",
    "password": "admin123"
  }'
```

#### 用户注册

```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新用户",
    "email": "newuser@aino.com",
    "password": "password123"
  }'
```

## 开发说明

### 模块化架构

每个业务模块都遵循三层架构：

1. **routes.ts** - 路由层：处理 HTTP 请求/响应
2. **service.ts** - 业务层：处理业务逻辑
3. **repo.ts** - 数据层：处理数据访问

### 数据验证

使用 Zod 进行类型安全的数据验证：

```typescript
import { z } from 'zod'

export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
```

### 错误处理

所有 API 都返回统一的错误格式：

```json
{
  "success": false,
  "error": "错误信息"
}
```

## 下一步计划

1. ✅ 基础服务器架构
2. ✅ 用户认证模块
3. 🔄 数据库接入 (PostgreSQL + Drizzle)
4. 🔄 应用管理模块
5. 🔄 目录和字段管理
6. 🔄 模块系统
7. 🔄 权限管理

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 3001 | 服务器端口 |
| NODE_ENV | development | 运行环境 |
