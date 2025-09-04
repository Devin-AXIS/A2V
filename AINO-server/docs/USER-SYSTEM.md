# AINO 用户体系说明

## 📋 概述

AINO 平台采用简化的用户体系，明确区分系统用户和应用用户，避免混淆。

## 👥 用户类型

### 1. 系统用户 (`users` 表)

**用途**：登录 AINO 平台，管理应用
**特点**：
- 全局唯一，可以创建和管理多个应用
- 有完整的用户信息：姓名、邮箱、密码、角色、头像等
- 通过 `applications.ownerId` 关联应用

**字段说明**：
```sql
- id: 用户唯一标识
- name: 用户姓名
- email: 邮箱（唯一）
- password: 密码
- roles: 角色数组 ['admin', 'user', 'editor', 'viewer']
- avatar: 头像
- status: 状态 ['active', 'inactive', 'pending']
- lastLoginAt: 最后登录时间
- createdAt: 创建时间
- updatedAt: 更新时间
```

### 2. 应用用户 (`applicationUsers` 表)

**用途**：每个应用内部的业务用户
**特点**：
- 与系统用户完全无关
- 每个应用的用户都是独立的
- 用于业务数据管理
- 例如：电商的客户、教育的学生、企业的员工

**字段说明**：
```sql
- id: 用户唯一标识
- applicationId: 所属应用ID
- name: 用户姓名
- email: 邮箱
- phone: 手机号
- avatar: 头像
- status: 状态 ['active', 'inactive', 'pending']
- role: 角色 ['admin', 'user', 'guest']
- department: 部门
- position: 职位
- tags: 标签数组
- metadata: 扩展字段
- lastLoginAt: 最后登录时间
- createdAt: 创建时间
- updatedAt: 更新时间
```

## 🏗️ 权限体系

### 系统用户权限
- **应用所有者**：通过 `applications.ownerId` 直接关联
- **权限控制**：只有应用所有者可以管理应用
- **简化设计**：无需复杂的成员管理

### 应用用户权限
- **业务权限**：由应用内部管理
- **独立体系**：与系统用户权限无关

## 📁 用户模块

### 功能说明
用户模块管理的是**系统用户**，包括：

1. **用户列表** - 管理系统用户
   - 字段：姓名、邮箱、角色、状态、头像、最后登录、创建时间

2. **用户注册** - 系统用户注册
   - 字段：姓名、邮箱、密码、确认密码、角色

### 默认目录配置
```typescript
// 用户列表
{
  name: '用户列表',
  type: 'table',
  config: {
    fields: [
      { key: 'name', label: '姓名', type: 'text' },
      { key: 'email', label: '邮箱', type: 'email' },
      { key: 'roles', label: '角色', type: 'multiselect' },
      { key: 'status', label: '状态', type: 'select' },
      { key: 'avatar', label: '头像', type: 'image' },
      { key: 'lastLoginAt', label: '最后登录', type: 'datetime' },
      { key: 'createdAt', label: '创建时间', type: 'datetime' },
    ]
  }
}

// 用户注册
{
  name: '用户注册',
  type: 'form',
  config: {
    fields: [
      { key: 'name', label: '姓名', type: 'text' },
      { key: 'email', label: '邮箱', type: 'email' },
      { key: 'password', label: '密码', type: 'password' },
      { key: 'confirmPassword', label: '确认密码', type: 'password' },
      { key: 'roles', label: '角色', type: 'multiselect' },
    ]
  }
}
```

## 🔄 数据流程

### 系统用户流程
1. 系统用户注册/登录 AINO 平台
2. 创建应用（成为应用所有者）
3. 通过用户模块管理其他系统用户
4. 管理应用内的业务数据

### 应用用户流程
1. 应用所有者创建应用
2. 在应用内创建业务用户（应用用户）
3. 应用用户进行业务操作
4. 与系统用户完全隔离

## ⚠️ 重要说明

1. **职责分离**：系统用户和应用用户职责明确分离
2. **权限隔离**：系统用户权限和应用用户权限互不干扰
3. **数据独立**：每个应用的用户数据完全独立
4. **简化设计**：移除复杂的成员管理，简化权限体系

## 🎯 使用场景

### 系统用户场景
- 平台管理员管理所有系统用户
- 应用所有者管理自己的应用
- 用户角色管理

### 应用用户场景
- 电商应用管理客户
- 教育应用管理学生
- 企业应用管理员工
- 任何业务场景的用户管理
