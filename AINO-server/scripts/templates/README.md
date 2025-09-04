# 模板系统使用指南

## 概述

模板系统是一个独立的脚本系统，用于为新创建的应用自动添加默认的目录、字段和字段分类。它不修改任何核心代码，完全通过脚本实现。

## 架构设计

```
scripts/templates/
├── index.ts                    # 主入口脚本
├── user-module-template.ts     # 用户模块模板
├── types.ts                    # 类型定义
├── utils.ts                    # 工具函数
└── README.md                   # 使用文档
```

## 使用方法

### 1. 列出所有可用模板

```bash
npx tsx scripts/templates/index.ts list
```

### 2. 应用用户模块模板

```bash
# 方法1: 使用主脚本
npx tsx scripts/templates/index.ts <applicationId> user-module

# 方法2: 使用便捷脚本
npx tsx scripts/apply-user-template.ts <applicationId>
```

### 3. 示例

```bash
# 为应用ID为 123e4567-e89b-12d3-a456-426614174000 的应用添加用户模块
npx tsx scripts/apply-user-template.ts 123e4567-e89b-12d3-a456-426614174000
```

## 用户模块模板内容

### 目录
- **用户列表** (table类型)

### 字段分类 (3个)
1. **基础信息** - 用户基本信息
2. **用户履历** - 用户经历和履历  
3. **实名与认证** - 身份认证信息

### 默认字段 (19个)

#### 基础信息 (10个字段)
- 头像 (profile)
- 姓名 (text) - 必填
- 邮箱 (text)
- 手机号 (text) - 必填
- 性别 (select) - 必填，选项：男/女/其他
- 生日 (date)
- 居住城市 (text)
- 行业 (text)
- 职业 (text)
- 个人介绍 (textarea)

#### 用户履历 (7个字段)
- 工作经历 (experience)
- 教育经历 (experience)
- 项目经历 (experience)
- 荣誉证书 (experience)
- 技能 (multiselect)
- 星座 (select) - 12个星座选项
- 用户ID (text)

#### 实名与认证 (2个字段)
- 实名认证 (text)
- 社会身份认证 (text)

## 扩展新模板

### 1. 创建模板定义

在 `scripts/templates/` 目录下创建新的模板文件，例如 `product-module-template.ts`：

```typescript
import type { ModuleTemplate } from './types'

export const productModuleTemplate: ModuleTemplate = {
  name: '产品管理',
  description: '产品管理模块',
  directories: [
    {
      name: '产品列表',
      type: 'table',
      supportsCategory: true,
      categories: [
        {
          name: '基本信息',
          description: '产品基本信息',
          order: 1,
          system: true
        }
      ],
      fields: [
        {
          key: 'name',
          label: '产品名称',
          type: 'text',
          required: true,
          showInList: true,
          showInForm: true,
          category: '基本信息'
        }
        // ... 更多字段
      ]
    }
  ]
}
```

### 2. 注册模板

在 `index.ts` 中添加新模板：

```typescript
import { productModuleTemplate } from './product-module-template'

const templates: Record<string, ModuleTemplate> = {
  'user-module': userModuleTemplate,
  'product-module': productModuleTemplate, // 新增
}
```

### 3. 使用新模板

```bash
npx tsx scripts/templates/index.ts <applicationId> product-module
```

## 优势

1. **不修改核心代码** - 完全独立的脚本系统
2. **易于扩展** - 添加新模板只需创建新文件
3. **类型安全** - 完整的TypeScript类型定义
4. **可重用** - 模板可以在多个应用中重复使用
5. **版本控制友好** - 模板变更不会影响核心功能

## 注意事项

1. 运行脚本前确保数据库连接正常
2. 应用ID必须是有效的UUID
3. 模板应用是幂等的，重复运行不会创建重复数据
4. 建议在测试环境先验证模板内容

## 故障排除

### 常见错误

1. **模板不存在**
   ```
   ❌ 模板 xxx 不存在
   ```
   解决：使用 `list` 命令查看可用模板

2. **应用ID无效**
   ```
   ❌ 应用不存在
   ```
   解决：检查应用ID是否正确

3. **数据库连接失败**
   ```
   ❌ 数据库连接失败
   ```
   解决：检查数据库配置和连接状态
