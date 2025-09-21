# AINO Manifest 规范文档

## 📋 概述

本文档详细描述了 AINO 平台的 Manifest 规范，这是连接前端卡片系统与后端模块系统的核心契约。Manifest 作为唯一真相源，定义了模块的完整结构、视图配置、权限策略和性能优化提示。

### ✅ 核心特性

1. **统一契约**：前后端唯一的数据契约，消除耦合
2. **版本管理**：支持 Schema 版本控制和变更追踪
3. **权限集成**：内置字段级和记录级权限策略
4. **性能优化**：声明式索引提示和物化配置
5. **视图配置**：支持多种布局和展示方式

## 🏗️ Manifest 结构定义

### 1. 核心接口定义

```typescript
// 模块 Manifest 主接口
interface ModuleManifest {
  // 基础信息
  moduleKey: string
  schemaVersion: string
  title: string
  description?: string
  
  // 数据结构定义
  fields: FieldDefinition[]
  relations: RelationDefinition[]
  
  // 视图配置
  views: ViewDefinition[]
  
  // 权限策略
  policies: PolicyDefinition
  
  // 性能优化
  indexHints: IndexHint[]
  materialize: MaterializeConfig[]
  
  // 变更记录
  changelog: ChangelogEntry[]
  
  // 元数据
  metadata: {
    author?: string
    createdAt: string
    updatedAt: string
    tags?: string[]
  }
}
```

### 2. 字段定义

```typescript
// 字段定义接口
interface FieldDefinition {
  // 基础信息
  key: string
  label: string
  type: FieldType
  required: boolean
  defaultValue?: any
  
  // 验证规则
  validators?: ValidatorConfig[]
  
  // UI 配置
  ui?: UIConfig
  
  // 性能优化
  index?: boolean
  materialize?: boolean
  
  // 权限控制
  permissions?: {
    read: string
    write: string
  }
  
  // 关联配置
  relation?: RelationConfig
  
  // 计算配置
  computed?: ComputedConfig
  
  // 状态管理
  status: 'active' | 'deprecated' | 'hidden'
  replacementKey?: string
  deprecationMessage?: string
}

// 字段类型枚举
type FieldType = 
  | 'text' | 'number' | 'boolean' | 'date' | 'datetime'
  | 'select' | 'multiselect' | 'radio' | 'checkbox'
  | 'textarea' | 'richText' | 'markdown'
  | 'email' | 'url' | 'phone'
  | 'file' | 'image' | 'video'
  | 'json' | 'array' | 'object'
  | 'relation' | 'lookup' | 'computed'
  | 'chart' | 'table' | 'list'

// UI 配置
interface UIConfig {
  widget?: string
  placeholder?: string
  helpText?: string
  width?: number
  height?: number
  options?: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: string
  }
  display?: {
    format?: string
    unit?: string
    prefix?: string
    suffix?: string
  }
}

// 验证器配置
interface ValidatorConfig {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
  condition?: string
}
```

### 3. 关联定义

```typescript
// 关联定义接口
interface RelationDefinition {
  key: string
  label: string
  type: 'oneToOne' | 'oneToMany' | 'manyToMany'
  targetModule: string
  targetField?: string
  displayField?: string
  cascade?: {
    delete?: boolean
    update?: boolean
  }
  constraints?: {
    required?: boolean
    unique?: boolean
  }
}

// 关联配置
interface RelationConfig {
  targetModule: string
  targetField?: string
  displayField?: string
  cardinality: '1:1' | '1:N' | 'N:N'
  cascade?: boolean
}
```

### 4. 视图定义

```typescript
// 视图定义接口
interface ViewDefinition {
  key: string
  version: string
  name: string
  description?: string
  
  // 布局配置
  layout: 'grid' | 'table' | 'kanban' | 'list' | 'card'
  
  // 列配置
  columns: ColumnDefinition[]
  
  // 排序配置
  sort: SortExpression[]
  
  // 筛选配置
  filters: FilterDefinition[]
  
  // 分页配置
  pagination: PaginationConfig
  
  // 卡片模板
  cardTemplate?: string
  
  // 权限控制
  permissions?: {
    read: string
    write: string
  }
  
  // 状态管理
  status: 'active' | 'draft' | 'archived'
}

// 列定义
interface ColumnDefinition {
  field: string
  label: string
  width?: number
  sortable?: boolean
  filterable?: boolean
  visible?: boolean
  format?: string
  component?: string
}

// 排序表达式
type SortExpression = [string, 'asc' | 'desc']

// 筛选定义
interface FilterDefinition {
  field: string
  label: string
  type: 'text' | 'select' | 'date' | 'number' | 'boolean'
  options?: Array<{ label: string; value: any }>
  defaultValue?: any
  required?: boolean
}

// 分页配置
interface PaginationConfig {
  pageSize: number
  maxPageSize: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
}
```

### 5. 权限策略定义

```typescript
// 权限策略定义
interface PolicyDefinition {
  // 字段级权限
  fieldLevel: Record<string, {
    read: string
    write: string
  }>
  
  // 记录级权限
  recordLevel: {
    read: string
    write: string
    delete: string
  }
  
  // 视图级权限
  viewLevel: Record<string, {
    read: string
    write: string
  }>
  
  // 动作权限
  actions: Record<string, string>
}

// 权限表达式语法
// 支持的角色和条件：
// - role: admin, user, guest
// - field: 字段值条件
// - context: 上下文条件
// - 操作符: >=, <=, ==, !=, in, not in
// - 逻辑符: and, or, not
// 
// 示例：
// "role >= admin"
// "role == user and field.status == 'active'"
// "role in ['admin', 'hr'] or field.owner == context.userId"
```

### 6. 性能优化配置

```typescript
// 索引提示配置
interface IndexHint {
  field: string
  type: 'btree' | 'gin' | 'gist' | 'hash'
  expression?: string
  unique?: boolean
  partial?: string
  materialize?: boolean
}

// 物化配置
interface MaterializeConfig {
  field: string
  expression: string
  refreshInterval: string
  dependencies?: string[]
}

// 计算配置
interface ComputedConfig {
  expression: string
  dependencies: string[]
  cache?: boolean
  refreshTrigger?: 'onChange' | 'onSave' | 'onLoad'
}
```

### 7. 变更记录

```typescript
// 变更记录
interface ChangelogEntry {
  version: string
  date: string
  type: 'added' | 'modified' | 'removed' | 'deprecated'
  description: string
  fields?: string[]
  breaking?: boolean
  migration?: string
}
```

## 🎯 Manifest 示例

### 1. 职位模块 Manifest

```json
{
  "moduleKey": "jobs",
  "schemaVersion": "1.2.0",
  "title": "职位管理",
  "description": "企业职位发布和管理模块",
  
  "fields": [
    {
      "key": "title",
      "label": "职位标题",
      "type": "text",
      "required": true,
      "ui": {
        "placeholder": "请输入职位标题",
        "validation": {
          "min": 2,
          "max": 100
        }
      },
      "index": true,
      "status": "active"
    },
    {
      "key": "salary",
      "label": "薪资范围",
      "type": "object",
      "required": false,
      "ui": {
        "widget": "salaryRange"
      },
      "permissions": {
        "read": "role >= user",
        "write": "role >= hr"
      },
      "status": "active"
    },
    {
      "key": "city",
      "label": "工作城市",
      "type": "select",
      "required": true,
      "ui": {
        "options": [
          { "label": "北京", "value": "beijing" },
          { "label": "上海", "value": "shanghai" },
          { "label": "深圳", "value": "shenzhen" }
        ]
      },
      "index": true,
      "status": "active"
    },
    {
      "key": "company",
      "label": "所属公司",
      "type": "relation",
      "required": true,
      "relation": {
        "targetModule": "companies",
        "displayField": "name",
        "cardinality": "N:1"
      },
      "status": "active"
    },
    {
      "key": "experience",
      "label": "工作经验",
      "type": "number",
      "required": false,
      "ui": {
        "validation": {
          "min": 0,
          "max": 20
        },
        "display": {
          "suffix": "年"
        }
      },
      "index": true,
      "status": "active"
    },
    {
      "key": "priority",
      "label": "优先级",
      "type": "select",
      "required": false,
      "ui": {
        "options": [
          { "label": "高", "value": "high" },
          { "label": "中", "value": "medium" },
          { "label": "低", "value": "low" }
        ]
      },
      "status": "active"
    }
  ],
  
  "relations": [
    {
      "key": "company",
      "label": "所属公司",
      "type": "manyToOne",
      "targetModule": "companies",
      "displayField": "name"
    },
    {
      "key": "applications",
      "label": "求职申请",
      "type": "oneToMany",
      "targetModule": "applications",
      "displayField": "candidateName"
    }
  ],
  
  "views": [
    {
      "key": "list_grid",
      "version": "1.0.0",
      "name": "网格列表",
      "layout": "grid",
      "columns": [
        { "field": "title", "label": "职位标题", "sortable": true },
        { "field": "company", "label": "公司", "sortable": true },
        { "field": "city", "label": "城市", "filterable": true },
        { "field": "experience", "label": "经验", "sortable": true },
        { "field": "priority", "label": "优先级", "filterable": true }
      ],
      "sort": [["createdAt", "desc"]],
      "filters": [
        {
          "field": "city",
          "label": "城市",
          "type": "select",
          "options": [
            { "label": "北京", "value": "beijing" },
            { "label": "上海", "value": "shanghai" },
            { "label": "深圳", "value": "shenzhen" }
          ]
        },
        {
          "field": "experience",
          "label": "工作经验",
          "type": "number"
        }
      ],
      "pagination": {
        "pageSize": 20,
        "maxPageSize": 100,
        "showSizeChanger": true
      },
      "status": "active"
    },
    {
      "key": "list_table",
      "version": "1.0.0",
      "name": "表格列表",
      "layout": "table",
      "columns": [
        { "field": "title", "label": "职位标题", "width": 200, "sortable": true },
        { "field": "company", "label": "公司", "width": 150, "sortable": true },
        { "field": "city", "label": "城市", "width": 100, "filterable": true },
        { "field": "experience", "label": "经验", "width": 80, "sortable": true },
        { "field": "priority", "label": "优先级", "width": 80, "filterable": true },
        { "field": "createdAt", "label": "发布时间", "width": 120, "sortable": true }
      ],
      "sort": [["createdAt", "desc"]],
      "pagination": {
        "pageSize": 50,
        "maxPageSize": 200
      },
      "status": "active"
    }
  ],
  
  "policies": {
    "fieldLevel": {
      "props.salary": {
        "read": "role >= user",
        "write": "role >= hr"
      },
      "props.priority": {
        "read": "role >= user",
        "write": "role >= admin"
      }
    },
    "recordLevel": {
      "read": "status == 'active' or role >= admin",
      "write": "role >= hr",
      "delete": "role >= admin"
    },
    "viewLevel": {
      "list_grid": {
        "read": "role >= user",
        "write": "role >= hr"
      },
      "list_table": {
        "read": "role >= user",
        "write": "role >= hr"
      }
    },
    "actions": {
      "publish": "role >= hr",
      "unpublish": "role >= hr",
      "duplicate": "role >= user"
    }
  },
  
  "indexHints": [
    {
      "field": "props.city",
      "type": "btree"
    },
    {
      "field": "props.experience",
      "type": "btree"
    },
    {
      "field": "props.title",
      "type": "gin",
      "expression": "to_tsvector('chinese', props.title)"
    }
  ],
  
  "materialize": [
    {
      "field": "props.salaryRange",
      "expression": "concat(props.salaryMin, '-', props.salaryMax, 'K')",
      "refreshInterval": "onChange"
    }
  ],
  
  "changelog": [
    {
      "version": "1.2.0",
      "date": "2024-01-15",
      "type": "added",
      "description": "新增优先级字段",
      "fields": ["priority"]
    },
    {
      "version": "1.1.0",
      "date": "2024-01-01",
      "type": "added",
      "description": "新增薪资范围字段",
      "fields": ["salary"]
    }
  ],
  
  "metadata": {
    "author": "AINO Team",
    "createdAt": "2023-12-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "tags": ["hr", "recruitment", "jobs"]
  }
}
```

## 🔧 API 接口规范

### 1. Manifest 获取接口

```http
GET /api/apps/:appId/modules/:moduleKey/manifest
```

**响应头**：
```
X-Schema-Version: 1.2.0
X-Cache-Control: max-age=300
```

**响应体**：
```json
{
  "success": true,
  "data": {
    // ModuleManifest 对象
  }
}
```

### 2. Manifest 更新接口

```http
PUT /api/apps/:appId/modules/:moduleKey/manifest
```

**请求体**：
```json
{
  "schemaVersion": "1.3.0",
  "fields": [
    // 更新的字段定义
  ],
  "views": [
    // 更新的视图定义
  ]
}
```

**响应体**：
```json
{
  "success": true,
  "data": {
    "version": "1.3.0",
    "updatedAt": "2024-01-16T10:30:00Z"
  }
}
```

### 3. 版本检查接口

```http
HEAD /api/apps/:appId/modules/:moduleKey/manifest
```

**响应头**：
```
X-Schema-Version: 1.2.0
X-Last-Modified: Wed, 15 Jan 2024 10:30:00 GMT
```

## 🎯 最佳实践

### 1. 字段设计原则

#### 1.1 字段命名规范
- 使用小写字母和下划线：`job_title`, `created_at`
- 避免使用保留字：`id`, `type`, `class`
- 保持简洁明了：`name` 而不是 `user_name_field`

#### 1.2 字段类型选择
- 文本字段：`text` 用于短文本，`textarea` 用于长文本
- 数字字段：`number` 用于数值，`select` 用于枚举
- 日期字段：`date` 用于日期，`datetime` 用于时间戳
- 关联字段：`relation` 用于模块间关联

#### 1.3 验证规则设计
```typescript
// 好的验证规则示例
{
  "key": "email",
  "type": "email",
  "validators": [
    {
      "type": "required",
      "message": "邮箱地址不能为空"
    },
    {
      "type": "pattern",
      "value": "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$",
      "message": "请输入有效的邮箱地址"
    }
  ]
}
```

### 2. 视图设计原则

#### 2.1 布局选择
- **网格布局**：适合卡片式展示，用户体验好
- **表格布局**：适合数据密集展示，信息量大
- **看板布局**：适合状态流转展示，流程清晰
- **列表布局**：适合简单信息展示，加载快速

#### 2.2 列配置优化
```typescript
// 好的列配置示例
{
  "field": "title",
  "label": "职位标题",
  "width": 200,
  "sortable": true,
  "filterable": true,
  "format": "truncate:50"
}
```

### 3. 权限设计原则

#### 3.1 权限粒度
- **字段级权限**：控制敏感字段的访问
- **记录级权限**：控制数据的可见性
- **视图级权限**：控制功能的可用性
- **动作级权限**：控制操作的执行

#### 3.2 权限表达式
```typescript
// 好的权限表达式示例
{
  "fieldLevel": {
    "props.salary": {
      "read": "role >= user and field.status == 'published'",
      "write": "role >= hr"
    }
  },
  "recordLevel": {
    "read": "status == 'active' or role >= admin",
    "write": "role >= hr or field.owner == context.userId"
  }
}
```

### 4. 性能优化原则

#### 4.1 索引策略
- 为经常查询的字段创建索引
- 为排序字段创建索引
- 为外键字段创建索引
- 避免过度索引

#### 4.2 物化策略
```typescript
// 好的物化配置示例
{
  "field": "props.displayName",
  "expression": "concat(props.firstName, ' ', props.lastName)",
  "refreshInterval": "onChange",
  "dependencies": ["props.firstName", "props.lastName"]
}
```

## 🚀 实施指南

### 1. 创建新模块 Manifest

#### 1.1 步骤
1. 定义模块基础信息
2. 设计字段结构
3. 配置关联关系
4. 创建视图配置
5. 设置权限策略
6. 添加性能优化
7. 编写变更记录

#### 1.2 模板
```typescript
const moduleManifest: ModuleManifest = {
  moduleKey: "your_module",
  schemaVersion: "1.0.0",
  title: "模块标题",
  description: "模块描述",
  
  fields: [
    // 字段定义
  ],
  
  relations: [
    // 关联定义
  ],
  
  views: [
    // 视图定义
  ],
  
  policies: {
    // 权限策略
  },
  
  indexHints: [
    // 索引提示
  ],
  
  materialize: [
    // 物化配置
  ],
  
  changelog: [
    // 变更记录
  ],
  
  metadata: {
    author: "作者",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["标签"]
  }
}
```

### 2. 版本管理策略

#### 2.1 版本号规则
- 主版本号：破坏性变更
- 次版本号：新增功能
- 修订版本号：bug 修复

#### 2.2 变更管理
```typescript
// 变更记录示例
{
  "version": "1.2.0",
  "date": "2024-01-15",
  "type": "added",
  "description": "新增优先级字段",
  "fields": ["priority"],
  "breaking": false,
  "migration": "ALTER TABLE dir_jobs ADD COLUMN props->>'priority'"
}
```

### 3. 测试策略

#### 3.1 单元测试
- 字段定义验证
- 权限表达式测试
- 视图配置测试

#### 3.2 集成测试
- Manifest 加载测试
- 数据查询测试
- 权限控制测试

#### 3.3 性能测试
- 索引效果测试
- 查询性能测试
- 大数据量测试

## 📊 总结

Manifest 规范是 AINO 平台的核心契约，它：

1. **统一了前后端接口**：消除了数据结构的耦合
2. **提供了完整的配置能力**：支持字段、视图、权限的全面配置
3. **实现了性能优化**：通过声明式配置实现性能优化
4. **支持了版本管理**：提供了完整的变更追踪机制
5. **确保了数据安全**：通过权限策略确保数据安全访问

通过遵循这个规范，开发者可以快速创建和维护模块，用户可以获得一致的使用体验，系统可以获得最佳的性能表现。
