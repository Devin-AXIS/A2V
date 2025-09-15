# 数据库表结构修复说明

## 问题描述
用户模块创建时出现数据库插入错误，主要原因是数据库表结构与代码中使用的字段不匹配。

## 修复内容

### 1. field_categories 表
**问题**: 数据库表缺少 `description`、`order`、`enabled`、`system`、`predefined_fields` 字段

**修复**: 
- SQL脚本 (`scripts/init-database.sql`) 中的表定义已经正确
- JavaScript脚本 (`scripts/init-database.js`) 中的表定义已经正确
- 添加了相应的外键约束和索引

### 2. field_defs 表
**问题**: 数据库表缺少 `application_id` 字段，导致插入失败

**修复**:
- 在 `scripts/init-database.sql` 中添加了 `application_id UUID NOT NULL` 字段
- 在 `scripts/init-database.js` 中添加了 `application_id UUID NOT NULL` 字段
- 添加了外键约束: `field_defs_application_id_fkey`
- 添加了索引: `field_defs_application_id_idx`
- 更新了 Drizzle schema 定义 (`src/db/schema.ts`)
- 更新了应用程序服务代码 (`src/modules/applications/service.ts`)

### 3. 代码更新
**修复内容**:
- 更新了 `fieldDefs` schema 定义，添加 `applicationId` 字段
- 更新了 `createUserModuleDefaultFields` 函数签名，添加 `applicationId` 参数
- 更新了字段值映射，包含 `applicationId` 字段
- 更新了函数调用，传递 `applicationId` 参数

## 文件修改清单

1. `scripts/init-database.sql`
   - 添加 `field_defs.application_id` 字段
   - 添加外键约束和索引

2. `scripts/init-database.js`
   - 添加 `field_defs.application_id` 字段
   - 添加外键约束和索引
   - 添加字段检查逻辑

3. `src/db/schema.ts`
   - 更新 `fieldDefs` 表定义
   - 添加 `applicationId` 字段和索引

4. `src/modules/applications/service.ts`
   - 更新 `createUserModuleDefaultFields` 函数
   - 添加 `applicationId` 参数和字段映射

## 使用方法

在另一台机器上部署时，运行以下命令来应用这些修复：

```bash
# 运行数据库初始化脚本
node scripts/init-database.js

# 或者直接执行SQL脚本
psql -h <host> -p <port> -U <user> -d <database> -f scripts/init-database.sql
```

## 验证

修复后，用户模块创建应该能够正常工作，不再出现字段插入错误。
