# AINO 模块架构补充优化方案

## 📋 设计原则

**核心原则**：保持现有架构不变，只做补充和增强
- ✅ **保持不动**：现有数据库表结构、API路由、模块注册表
- 🔧 **补充增强**：模块生命周期、索引优化、权限声明、审计规范

## 🏗️ 现有架构保持不动

### ✅ 核心设计保持不变

#### 1. 模块抽象设计
```typescript
// 保持现有设计
- 系统模块：不可卸载，自动包含
- 扩展模块：可安装/卸载，通过模块市场
- applicationId 作为隔离键，保证多租户安全
```

#### 2. 统一路由设计
```typescript
// 保持现有路由结构
- /api/modules/system/:moduleKey/* (系统模块)
- /api/modules/:moduleKey/* (扩展模块)
- ModuleRegistry 统一注册管理
```

#### 3. 数据库极简化设计
```sql
-- 保持现有表结构
CREATE TABLE application_users (
  id UUID PRIMARY KEY,
  application_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  -- 核心字段保持不变
  metadata JSONB DEFAULT '{}', -- 扩展字段
  -- 其他字段保持不变
);
```

#### 4. 模块注册表设计
```typescript
// 保持现有 ModuleRegistry 设计
class ModuleRegistry {
  register(manifest: TModuleManifest): void
  get(key: string): TModuleManifest | undefined
  getAll(): TModuleManifest[]
  // 现有方法保持不变
}
```

## 🔧 补充增强方案

### 1. 模块生命周期管理（新增）

#### 1.1 模块安装登记表（新增）
```sql
-- 新增表：模块安装记录
CREATE TABLE module_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  module_version TEXT NOT NULL,
  install_type TEXT NOT NULL, -- 'system', 'market', 'custom'
  install_config JSONB DEFAULT '{}',
  install_status TEXT DEFAULT 'active', -- 'active', 'disabled', 'uninstalling'
  installed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(application_id, module_key)
);
```

#### 1.2 模块安装服务（新增）
```typescript
// 新增服务：模块安装管理
export class ModuleInstallService {
  // 安装模块
  async installModule(applicationId: string, moduleKey: string, version: string): Promise<void>
  
  // 升级模块
  async upgradeModule(applicationId: string, moduleKey: string, newVersion: string): Promise<void>
  
  // 卸载模块
  async uninstallModule(applicationId: string, moduleKey: string): Promise<void>
  
  // 获取已安装模块列表
  async getInstalledModules(applicationId: string): Promise<ModuleInstall[]>
  
  // 检查模块依赖
  async checkDependencies(moduleKey: string): Promise<DependencyCheckResult>
}
```

#### 1.3 模块迁移脚本管理（新增）
```typescript
// 新增：模块迁移脚本管理
export class ModuleMigrationService {
  // 执行模块迁移
  async runMigrations(moduleKey: string, fromVersion: string, toVersion: string): Promise<void>
  
  // 获取迁移脚本
  async getMigrationScripts(moduleKey: string, fromVersion: string, toVersion: string): Promise<MigrationScript[]>
  
  // 回滚迁移
  async rollbackMigration(moduleKey: string, version: string): Promise<void>
}
```

### 2. 索引优化策略（补充）

#### 2.1 JSONB 索引优化（新增）
```sql
-- 为现有表的 JSONB 字段添加索引
-- application_users 表
CREATE INDEX idx_application_users_metadata_gin 
ON application_users USING gin(metadata jsonb_path_ops);

-- 高频查询字段的表达式索引
CREATE INDEX idx_application_users_department 
ON application_users ((metadata->>'department'));

CREATE INDEX idx_application_users_position 
ON application_users ((metadata->>'position'));

-- 为未来的 dir_* 表添加索引
-- 通用模板：为所有 props 字段添加 GIN 索引
-- CREATE INDEX idx_{table_name}_props_gin 
-- ON {table_name} USING gin(props jsonb_path_ops);
```

#### 2.2 索引管理服务（新增）
```typescript
// 新增：索引管理服务
export class IndexManagementService {
  // 为模块表创建索引
  async createModuleIndexes(moduleKey: string, tableName: string): Promise<void>
  
  // 创建 JSONB 索引
  async createJsonbIndex(tableName: string, columnName: string): Promise<void>
  
  // 创建表达式索引
  async createExpressionIndex(tableName: string, expression: string, indexName: string): Promise<void>
  
  // 分析查询性能
  async analyzeQueryPerformance(query: string): Promise<PerformanceAnalysis>
}
```

### 3. 权限声明系统（补充）

#### 3.1 模块权限声明（增强现有）
```typescript
// 增强现有模块 Manifest
export const ModuleManifest = z.object({
  key: z.string(),
  name: z.string(),
  version: z.string(),
  kind: z.enum(['local', 'remote']),
  routes: z.array(ModuleRoute),
  // 新增：权限声明
  permissions: z.object({
    roles: z.array(z.string()), // ['admin', 'user', 'guest']
    resources: z.array(z.object({
      type: z.string(), // 'directory', 'field', 'record'
      actions: z.array(z.string()), // ['read', 'write', 'delete']
      conditions: z.record(z.any()).optional(), // 权限条件
    })),
  }).optional(),
  // 其他现有字段保持不变
});
```

#### 3.2 权限检查服务（新增）
```typescript
// 新增：权限检查服务
export class PermissionService {
  // 检查模块权限
  async checkModulePermission(
    userId: string, 
    moduleKey: string, 
    resource: string, 
    action: string
  ): Promise<boolean>
  
  // 获取用户权限
  async getUserPermissions(userId: string, applicationId: string): Promise<UserPermissions>
  
  // 验证权限声明
  async validatePermissionDeclaration(manifest: TModuleManifest): Promise<ValidationResult>
}
```

### 4. 审计模块规范（补充）

#### 4.1 统一审计日志表（保持现有）
```sql
-- 保持现有 audit_logs 表结构
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID,
  module_key TEXT, -- 新增：模块标识
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### 4.2 审计钩子系统（新增）
```typescript
// 新增：审计钩子系统
export class AuditHookService {
  // 注册审计钩子
  async registerAuditHook(moduleKey: string, event: string, handler: AuditHandler): Promise<void>
  
  // 触发审计事件
  async triggerAuditEvent(
    moduleKey: string, 
    event: string, 
    context: AuditContext
  ): Promise<void>
  
  // 查询审计日志
  async queryAuditLogs(
    applicationId: string, 
    filters: AuditFilters
  ): Promise<AuditLog[]>
}
```

### 5. 模块市场基础（新增）

#### 5.1 模块包结构（新增）
```typescript
// 新增：模块包结构定义
export interface ModulePackage {
  manifest: TModuleManifest;
  migrations: MigrationScript[];
  uiSchema?: UISchema; // 前端配置
  permissions: PermissionDeclaration;
  dependencies: ModuleDependency[];
  assets?: ModuleAsset[];
}
```

#### 5.2 模块市场服务（新增）
```typescript
// 新增：模块市场服务
export class ModuleMarketService {
  // 发布模块
  async publishModule(package: ModulePackage): Promise<ModulePublication>
  
  // 搜索模块
  async searchModules(query: ModuleSearchQuery): Promise<ModuleSearchResult[]>
  
  // 下载模块
  async downloadModule(moduleKey: string, version: string): Promise<ModulePackage>
  
  // 验证模块签名
  async verifyModuleSignature(package: ModulePackage): Promise<boolean>
}
```

## 📋 实施计划

### 阶段1：基础增强（优先级：高）
1. **模块安装登记表**：创建 `module_installs` 表
2. **索引优化**：为现有 JSONB 字段添加 GIN 索引
3. **模块安装服务**：实现基础的安装/卸载逻辑

### 阶段2：权限和审计（优先级：中）
1. **权限声明系统**：增强模块 Manifest
2. **审计钩子系统**：实现统一审计日志
3. **权限检查服务**：实现细粒度权限控制

### 阶段3：模块市场（优先级：低）
1. **模块包结构**：定义完整的模块包格式
2. **模块市场服务**：实现模块发布和下载
3. **迁移脚本管理**：实现模块版本升级

## 🎯 关键原则

### ✅ 保持不动的部分
1. **现有数据库表结构**：不修改任何现有表
2. **现有API路由**：保持现有路由不变
3. **现有模块注册表**：保持现有注册逻辑
4. **现有业务逻辑**：不修改现有服务类

### 🔧 新增补充的部分
1. **模块生命周期管理**：新增安装/升级/卸载功能
2. **索引优化策略**：新增性能优化索引
3. **权限声明系统**：新增细粒度权限控制
4. **审计钩子系统**：新增统一审计日志
5. **模块市场基础**：新增模块发布和下载

## 📊 预期效果

### 性能提升
- JSONB 查询性能提升 3-5 倍
- 复杂查询响应时间减少 50%

### 功能增强
- 模块安装/升级/卸载完整生命周期
- 细粒度权限控制
- 统一审计日志
- 模块市场基础

### 维护性提升
- 模块版本管理
- 依赖关系检查
- 迁移脚本自动化
- 权限声明标准化

## 🚀 总结

这个补充优化方案完全遵循"保持现有架构不变"的原则：

1. **核心架构保持不变**：数据库表、API路由、模块注册表都不变
2. **只做补充增强**：新增表、新增服务、新增功能
3. **渐进式实施**：分阶段实施，不影响现有功能
4. **向后兼容**：所有新增功能都是可选的，不影响现有模块

通过这种方式，我们可以在不破坏现有架构的前提下，逐步增强平台的能力，最终实现完整的模块市场和高级功能。
