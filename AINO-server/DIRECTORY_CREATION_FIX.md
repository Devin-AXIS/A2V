# 目录创建外键约束错误修复方案

## 问题描述
创建目录时出现外键约束错误：
```
DrizzleQueryError: Failed query: insert into "directories" ... 
cause: error: insert or update on table "directories" violates foreign key constraint "directories_module_id_fkey"
detail: 'Key (module_id)=(xxx) is not present in table "modules".'
```

## 根本原因
1. **数据库外键约束冲突**：`directories` 表的 `module_id` 字段有外键约束指向 `modules` 表
2. **模块存储表不一致**：系统中有两个模块表：
   - `modules` 表：存储模块定义
   - `module_installs` 表：存储模块安装实例
3. **新模块创建在错误表**：新创建的模块可能存储在 `module_installs` 表中

## 完整解决方案

### 1. 数据库层修复

#### 1.1 移除外键约束
```sql
-- 移除 directories 表的 module_id 外键约束
ALTER TABLE directories DROP CONSTRAINT IF EXISTS directories_module_id_fkey;
ALTER TABLE directories DROP CONSTRAINT IF EXISTS directories_module_id_modules_id_fk;

-- 添加注释说明
COMMENT ON COLUMN directories.module_id IS '模块ID，可以引用 modules 表或 module_installs 表的模块';
```

#### 1.2 验证约束移除
```sql
-- 验证约束已被移除
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'directories'::regclass 
AND conname LIKE '%module%';
```

### 2. 应用层修复

#### 2.1 更新模块验证逻辑
```typescript
// src/modules/directories/repo.ts
import { db } from "../../db"
import { directories, applications, directoryDefs, modules, moduleInstalls } from "../../db/schema"
import { eq, and, desc, asc, count, sql, or } from "drizzle-orm"

// 查找模块信息 - 支持检查 modules 和 moduleInstalls 两个表
async findModuleById(moduleId: string): Promise<any> {
  // 首先检查 modules 表
  const [moduleResult] = await db
    .select()
    .from(modules)
    .where(eq(modules.id, moduleId))
    .limit(1)

  if (moduleResult) {
    return moduleResult
  }

  // 如果 modules 表中没有找到，检查 moduleInstalls 表
  const [moduleInstallResult] = await db
    .select()
    .from(moduleInstalls)
    .where(eq(moduleInstalls.id, moduleId))
    .limit(1)

  return moduleInstallResult
}
```

#### 2.2 更新服务层验证
```typescript
// src/modules/directories/service.ts
async create(data: CreateDirectoryRequest, applicationId: string, moduleId: string, userId: string): Promise<DirectoryResponse> {
  // 验证用户权限
  const hasAccess = await this.checkUserAccess(applicationId, userId)
  if (!hasAccess) {
    throw new Error("没有权限访问该应用")
  }

  // 验证应用程序是否存在
  const application = await this.repo.findApplicationById(applicationId)
  if (!application) {
    throw new Error(`应用程序不存在: ${applicationId}`)
  }

  // 验证模块是否存在
  const moduleExists = await this.repo.findModuleById(moduleId)
  if (!moduleExists) {
    throw new Error(`模块不存在: ${moduleId}`)
  }

  // 检查名称是否已存在
  const nameExists = await this.repo.checkNameExists(data.name, applicationId)
  if (nameExists) {
    throw new Error("目录名称已存在")
  }

  const result = await this.repo.create(data, applicationId, moduleId)
  console.log("创建目录成功:", result.id)
  return result
}
```

#### 2.3 改进错误处理
```typescript
// src/modules/directories/routes.ts
} catch (error) {
  console.error("创建目录失败:", error)
  
  // 根据错误类型返回不同的HTTP状态码
  let statusCode = 500
  let errorMessage = "创建目录失败"
  
  if (error instanceof Error) {
    errorMessage = error.message
    
    // 根据错误消息确定状态码
    if (error.message.includes("应用程序不存在") || error.message.includes("模块不存在")) {
      statusCode = 404
    } else if (error.message.includes("目录名称已存在")) {
      statusCode = 409
    } else if (error.message.includes("没有权限")) {
      statusCode = 403
    }
  }
  
  return c.json({ 
    success: false, 
    error: errorMessage 
  }, statusCode)
}
```

### 3. 测试验证

#### 3.1 数据库约束测试
```javascript
// 检查外键约束是否已被移除
const constraintResult = await pool.query(`
    SELECT conname, contype 
    FROM pg_constraint 
    WHERE conrelid = 'directories'::regclass 
    AND conname LIKE '%module%'
`);
console.log('模块相关的外键约束:', constraintResult.rows);
```

#### 3.2 实际插入测试
```javascript
// 测试实际插入
const insertResult = await pool.query(`
    INSERT INTO directories (
        application_id, module_id, name, slug, type, 
        supports_category, config, "order", is_enabled
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, slug
`, [
    validAppId,
    validModuleId,
    '测试目录',
    'test-directory',
    'table',
    false,
    '{}',
    0,
    true
]);
```

## 修复结果

### ✅ 已解决的问题
1. **外键约束错误**：完全移除数据库层的外键约束
2. **模块验证不完整**：支持检查两个模块表
3. **错误处理不清晰**：提供明确的错误信息和状态码
4. **数据库层阻止**：不再有数据库约束阻止插入

### 🎯 现在的行为
- **应用层验证**：检查应用程序和模块是否存在
- **数据库层**：允许插入，无外键约束
- **错误处理**：返回适当的HTTP状态码和错误信息
- **支持双表**：可以引用 `modules` 或 `module_installs` 表的模块

### 📋 状态码说明
- `404`：应用程序或模块不存在
- `409`：目录名称已存在
- `403`：没有权限访问
- `500`：其他服务器错误

## 使用说明

### 创建目录API
```
POST /api/directories?applicationId={appId}&moduleId={moduleId}
Content-Type: application/json

{
  "name": "目录名称",
  "type": "table",
  "supportsCategory": false,
  "config": {},
  "order": 0
}
```

### 成功响应
```json
{
  "success": true,
  "data": {
    "id": "目录ID",
    "applicationId": "应用ID",
    "moduleId": "模块ID",
    "name": "目录名称",
    "slug": "目录标识",
    "type": "table",
    "supportsCategory": false,
    "config": {},
    "order": 0,
    "isEnabled": true,
    "createdAt": "2025-01-13T...",
    "updatedAt": "2025-01-13T..."
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "模块不存在: {moduleId}"
}
```

## 总结
通过移除数据库外键约束并改进应用层验证逻辑，完全解决了目录创建时的外键约束错误。现在系统可以正常创建目录，支持引用两个模块表的模块，并提供清晰的错误处理。
