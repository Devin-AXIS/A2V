# 应用用户模块

## 概述

应用用户模块是 AINO 平台的内置系统模块，用于管理每个应用内的独立用户。每个应用的用户都是完全独立的，通过 `applicationId` 进行隔离。

## 架构设计

### 核心特性
- **应用隔离**: 每个应用的用户完全独立，通过 `applicationId` 隔离
- **系统模块**: 作为内置系统模块，每个应用创建时自动包含
- **模块化路由**: 通过 `/api/modules/system/user/*` 统一访问
- **扩展字段**: 支持 `metadata` 字段存储扩展数据

### 数据库设计

```sql
-- 应用用户表
CREATE TABLE application_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'active' NOT NULL, -- active, inactive, pending
  role TEXT DEFAULT 'user' NOT NULL, -- admin, user, guest
  department TEXT,
  position TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## API 接口

### 基础路径
- **模块路由**: `/api/modules/system/user/*`
- **直接访问**: `/api/application-users/*`

### 接口列表

#### 1. 获取用户列表
```
GET /api/modules/system/user?applicationId={applicationId}
```

**查询参数**:
- `applicationId` (必需): 应用ID
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认20
- `search` (可选): 搜索关键词
- `status` (可选): 用户状态
- `role` (可选): 用户角色
- `department` (可选): 部门
- `sortBy` (可选): 排序字段
- `sortOrder` (可选): 排序方向

#### 2. 创建用户
```
POST /api/modules/system/user?applicationId={applicationId}
```

**请求体**:
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "avatar": "https://example.com/avatar.jpg",
  "role": "user",
  "department": "技术部",
  "position": "工程师",
  "tags": ["前端", "React"],
  "metadata": {
    "employeeId": "EMP001",
    "hireDate": "2024-01-01"
  }
}
```

#### 3. 获取用户详情
```
GET /api/modules/system/user/{userId}?applicationId={applicationId}
```

#### 4. 更新用户
```
PUT /api/modules/system/user/{userId}?applicationId={applicationId}
```

#### 5. 删除用户
```
DELETE /api/modules/system/user/{userId}?applicationId={applicationId}
```

#### 6. 批量操作
```
PATCH /api/modules/system/user/batch?applicationId={applicationId}
DELETE /api/modules/system/user/batch?applicationId={applicationId}
```

## 使用示例

### 前端调用示例

```javascript
// 获取用户列表
const response = await fetch('/api/modules/system/user?applicationId=app-123', {
  headers: {
    'Authorization': 'Bearer your-token'
  }
})

// 创建用户
const response = await fetch('/api/modules/system/user?applicationId=app-123', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'user'
  })
})
```

### 后端集成示例

```typescript
import { ApplicationUserService } from './modules/application-users/service'

const service = new ApplicationUserService()

// 获取用户列表
const users = await service.getApplicationUsers('app-123', {
  page: 1,
  limit: 20,
  search: '张三'
})

// 创建用户
const user = await service.createApplicationUser('app-123', {
  name: '张三',
  email: 'zhangsan@example.com',
  role: 'user'
})
```

## 权限控制

### 角色定义
- **admin**: 管理员，可以管理所有用户
- **user**: 普通用户，只能查看和编辑自己的信息
- **guest**: 访客，只能查看公开信息

### 权限检查
- 用户只能访问自己所属应用的数据
- 管理员可以管理应用内的所有用户
- 系统会检查是否为最后一个管理员，防止误删

## 扩展功能

### 自定义字段
通过 `metadata` 字段可以存储任意扩展数据：

```json
{
  "metadata": {
    "employeeId": "EMP001",
    "hireDate": "2024-01-01",
    "skills": ["JavaScript", "React", "Node.js"],
    "preferences": {
      "theme": "dark",
      "language": "zh-CN"
    }
  }
}
```

### 标签系统
支持给用户添加标签，便于分类和搜索：

```json
{
  "tags": ["前端", "React", "资深", "导师"]
}
```

## 开发规范

### 代码结构
```
src/modules/application-users/
├── dto.ts          # 数据传输对象
├── repo.ts         # 数据访问层
├── service.ts      # 业务逻辑层
└── routes.ts       # 路由层
```

### 错误处理
- 所有接口都返回统一的错误格式
- 详细的错误信息便于调试
- 业务逻辑错误返回 400，系统错误返回 500

### 数据验证
- 使用 Zod 进行类型验证
- 邮箱唯一性检查
- 必填字段验证

## 下一步计划

1. **用户认证**: 实现应用内用户的登录认证
2. **权限管理**: 完善细粒度权限控制
3. **用户组**: 支持用户分组管理
4. **导入导出**: 支持批量导入导出用户
5. **审计日志**: 记录用户操作历史
6. **通知系统**: 用户状态变更通知

## 相关文档

- [系统模块架构](./system-modules.md)
- [API 文档](./api-docs.md)
- [开发约束](./../docs/开发约束.md)
