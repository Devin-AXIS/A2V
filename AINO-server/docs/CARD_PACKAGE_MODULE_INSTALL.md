# 模块卡片包绑定功能

## 功能概述

本功能为模块安装系统添加了卡片包绑定能力，支持三种类型的模块：

1. **通用自定义模块** (`blank-template`) - 不绑定特定卡片包，用户可自由配置
2. **教育类通用模块** (`edu`) - 绑定教育管理卡片包，自动创建相关数据表
3. **招聘类通用模块** (`recruitment`) - 绑定招聘管理卡片包，自动创建相关数据表

## 核心特性

### 1. 卡片包绑定
- 模块在注册时可以指定绑定的卡片包
- 安装模块时自动绑定对应的卡片包
- 卡片包信息存储在 `installConfig` 中，不修改数据库结构

### 2. 自动数据表创建
- 安装绑定了卡片包的模块时，自动创建所需的数据表
- 支持表名前缀，避免不同应用间的表名冲突
- 包含完整的字段定义、索引和约束

### 3. 灵活的配置
- 支持在安装时覆盖默认的卡片包配置
- 可以选择是否自动创建数据表
- 支持自定义表名前缀

## 技术实现

### 1. 模块注册表扩展
```typescript
// 在模块manifest中添加卡片包配置
moduleRegistry.register({
  key: 'edu',
  name: '教育模块',
  // ... 其他配置
  cardPackage: {
    packageId: 'education-package',
    packageName: '教育管理',
    autoCreateTables: true,
  },
})
```

### 2. 安装请求扩展
```typescript
// 安装请求支持卡片包配置
const installRequest = {
  moduleKey: 'edu',
  moduleVersion: '1.0.0',
  installConfig: {},
  cardPackageConfig: {
    packageId: 'education-package',
    autoCreateTables: true,
    tablePrefix: 'my_app',
  },
}
```

### 3. 数据表定义
- 招聘卡片包：`job_positions`, `job_applications`, `job_skills`, `job_position_skills`
- 教育卡片包：`courses`, `students`, `enrollments`, `assignments`

## 使用方法

### 1. 安装教育模块
```javascript
const moduleService = new ModuleService()
await moduleService.installModule(appId, {
  moduleKey: 'edu',
  cardPackageConfig: {
    autoCreateTables: true,
    tablePrefix: 'edu_',
  }
})
```

### 2. 安装招聘模块
```javascript
await moduleService.installModule(appId, {
  moduleKey: 'recruitment',
  cardPackageConfig: {
    autoCreateTables: true,
    tablePrefix: 'rec_',
  }
})
```

### 3. 安装通用自定义模块
```javascript
await moduleService.installModule(appId, {
  moduleKey: 'blank-template',
  // 不提供cardPackageConfig，不会创建数据表
})
```

## 数据表结构

### 招聘模块数据表
- **job_positions**: 职位信息表
- **job_applications**: 申请记录表
- **job_skills**: 技能信息表
- **job_position_skills**: 职位技能关联表

### 教育模块数据表
- **courses**: 课程信息表
- **students**: 学生信息表
- **enrollments**: 注册记录表
- **assignments**: 作业信息表

## 测试

运行测试脚本验证功能：
```bash
node scripts/test-card-package-install.js
```

## 注意事项

1. **数据库兼容性**: 不修改现有数据库结构，通过 `installConfig` JSONB 字段存储卡片包信息
2. **错误处理**: 数据表创建失败不会影响模块安装，只记录错误日志
3. **表名冲突**: 使用表名前缀避免不同应用间的表名冲突
4. **向后兼容**: 现有模块安装功能完全不受影响
