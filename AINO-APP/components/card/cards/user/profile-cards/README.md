# GenericFormCard 通用表单卡片组件

## 📋 概述

`GenericFormCard` 是一个通用的可配置表单卡片组件，通过配置文件驱动，避免重复编写表单代码。支持多种字段类型、智能联动、不同展示布局等功能。

## 🚀 快速开始

### 基本用法

```typescript
import { GenericFormCard, type FieldConfig, type DisplayConfig } from '@/components/card/profile-cards'

// 1. 定义字段配置
const myFields: FieldConfig[] = [
  {
    key: "name",
    label: "姓名", 
    type: "text",
    placeholder: "请输入姓名",
    required: true
  }
]

// 2. 定义展示配置
const myDisplay: DisplayConfig = {
  icon: <User className="w-5 h-5" />,
  titleField: "name",
  layout: "simple",
  showActions: true
}

// 3. 使用组件
<GenericFormCard
  title="个人信息"
  data={myData}
  onUpdate={setMyData}
  fields={myFields}
  displayConfig={myDisplay}
/>
```

## 📝 字段配置 (FieldConfig)

### 基础属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | string | ✅ | 字段唯一标识，对应数据字段名 |
| `label` | string | ✅ | 字段显示标签 |
| `type` | FieldType | ✅ | 字段类型，见下方类型列表 |
| `placeholder` | string | ❌ | 输入提示文本 |
| `required` | boolean | ❌ | 是否必填，默认false |
| `gridColumn` | 1\|2 | ❌ | 布局列数，1=全宽，2=半宽 |

### 字段类型 (type)

| 类型 | 说明 | 示例 |
|------|------|------|
| `text` | 单行文本输入 | 姓名、公司名称 |
| `textarea` | 多行文本输入 | 描述、备注 |
| `select` | 下拉选择 | 学历、性别 |
| `yearMonth` | 年月选择器 | 开始时间、结束时间 |
| `date` | 日期选择器 | 生日、到岗时间 |
| `city` | 城市选择器 | 工作地点、居住城市 |
| `switch` | 开关按钮 | 目前在读、随时到岗 |
| `tags` | 标签输入 | 技能、关键词 |

### 下拉选择配置

```typescript
{
  key: "degree",
  label: "学历",
  type: "select",
  required: true,
  options: [
    { value: "本科", label: "本科" },
    { value: "硕士", label: "硕士" },
    { value: "博士", label: "博士" }
  ]
}
```

### 智能联动配置

| 属性 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `dependsOn` | string | 依赖的字段key | "isCurrently" |
| `hideWhen` | any | 依赖字段为此值时隐藏 | true |
| `showWhen` | any | 依赖字段为此值时显示 | false |
| `disableWhen` | any | 依赖字段为此值时禁用 | "locked" |
| `replaceWith` | string | 隐藏时显示的替代文本 | "至今" |

#### 联动示例：目前在读

```typescript
// 开关字段
{
  key: "isCurrently",
  label: "目前在读",
  type: "switch"
},
// 依赖字段
{
  key: "endDate", 
  label: "结束时间",
  type: "yearMonth",
  dependsOn: "isCurrently",  // 依赖"目前在读"
  hideWhen: true,           // 当"目前在读"为true时隐藏
  replaceWith: "至今"       // 隐藏时显示"至今"
}
```

## 🎨 展示配置 (DisplayConfig)

### 基础属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `icon` | ReactNode | ✅ | 展示图标 |
| `titleField` | string | ✅ | 主标题字段key |
| `subtitleField` | string | ❌ | 副标题字段key |
| `descriptionField` | string | ❌ | 描述字段key |
| `layout` | Layout | ✅ | 展示布局类型 |
| `showActions` | boolean | ❌ | 是否显示编辑/删除按钮 |

### 布局类型 (layout)

#### `timeline` - 时间线布局
```typescript
// 适用于：工作经历、教育经历
{
  icon: <Briefcase className="w-5 h-5" />,
  titleField: "company",
  subtitleField: "position", 
  layout: "timeline",
  showActions: true
}
```
- 左边框线样式
- 垂直排列
- 适合按时间顺序的内容

#### `grid` - 网格布局
```typescript
// 适用于：项目经历、证书资质
{
  icon: <Award className="w-5 h-5" />,
  titleField: "name",
  subtitleField: "issuer",
  layout: "grid", 
  showActions: true
}
```
- 左右两列信息展示
- 左边框高亮
- 适合结构化信息

#### `simple` - 简单布局
```typescript
// 适用于：求职期望、单条记录
{
  icon: <Target className="w-5 h-5" />,
  titleField: "position",
  subtitleField: "industry",
  layout: "simple",
  showActions: true
}
```
- 简洁的单行展示
- 适合概要信息

## 📋 完整配置示例

### 工作经历配置

```typescript
// work-experience-config.tsx
import { Briefcase } from "lucide-react"

export const workExperienceFields: FieldConfig[] = [
  {
    key: "company",
    label: "公司名称",
    type: "text", 
    required: true,
    gridColumn: 2
  },
  {
    key: "position",
    label: "职位",
    type: "text",
    required: true, 
    gridColumn: 2
  },
  {
    key: "startDate",
    label: "开始时间",
    type: "yearMonth",
    required: true,
    gridColumn: 2
  },
  {
    key: "endDate",
    label: "结束时间", 
    type: "yearMonth",
    gridColumn: 2,
    dependsOn: "isCurrently",
    hideWhen: true,
    replaceWith: "至今"
  },
  {
    key: "isCurrently",
    label: "目前在职",
    type: "switch"
  },
  {
    key: "description",
    label: "工作描述",
    type: "textarea",
    rows: 4
  }
]

export const workExperienceDisplay: DisplayConfig = {
  icon: <Briefcase className="w-5 h-5 mt-1" style={{ color: "var(--card-accent-color, #3b82f6)" }} />,
  titleField: "company",
  subtitleField: "position",
  descriptionField: "description", 
  layout: "timeline",
  showActions: true
}
```

### 页面中使用

```typescript
<GenericFormCard
  title="工作经历"
  data={userProfile.workExperience}
  onUpdate={(workExperience) => setUserProfile(prev => ({ ...prev, workExperience }))}
  fields={workExperienceFields}
  displayConfig={workExperienceDisplay}
  allowMultiple={true}
  emptyText="暂无工作经历"
  addButtonText="添加工作经历"
/>
```

## 🎯 组件属性

### GenericFormCard Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 卡片标题 |
| `data` | DataItem[] | ✅ | 数据数组 |
| `onUpdate` | function | ✅ | 数据更新回调 |
| `fields` | FieldConfig[] | ✅ | 字段配置数组 |
| `displayConfig` | DisplayConfig | ✅ | 展示配置 |
| `allowMultiple` | boolean | ❌ | 是否允许多条记录，默认true |
| `emptyText` | string | ❌ | 空数据提示文本 |
| `addButtonText` | string | ❌ | 添加按钮文本 |

## 🔧 高级功能

### 条件字段显示

```typescript
// 高级用户才显示的字段
{
  key: "advancedSettings",
  label: "高级设置",
  type: "text",
  dependsOn: "userLevel",
  showWhen: "advanced"  // 只有当userLevel为"advanced"时才显示
}
```

### 字段禁用

```typescript
// 某些状态下禁用的字段
{
  key: "editableField",
  label: "可编辑字段", 
  type: "text",
  dependsOn: "status",
  disableWhen: "locked"  // 当status为"locked"时禁用
}
```

## 📂 文件结构

```
components/card/profile-cards/
├── generic-form-card.tsx           # 通用组件
├── education-config.tsx            # 教育经历配置
├── work-experience-config.tsx      # 工作经历配置  
├── project-config.tsx              # 项目经历配置
├── certificate-config.tsx          # 证书资质配置
├── job-expectation-config.tsx      # 求职期望配置
└── index.ts                        # 统一导出
```

## 💡 最佳实践

### 1. 字段排序
- 必填字段放在前面
- 相关字段放在一起
- 开关字段放在其影响字段之前

### 2. 布局建议
- 短字段使用 `gridColumn: 2`（半宽）
- 长字段使用 `gridColumn: 1`（全宽）
- 开关字段通常全宽显示

### 3. 联动设计
- 开关字段影响时间字段时使用 `replaceWith`
- 复杂联动可以组合使用多个条件

### 4. 用户体验
- 必填字段用 `*` 标记
- 提供清晰的 `placeholder` 文本
- 合理的字段分组和布局

## 🎨 样式定制

所有样式都使用统一的设计令牌：
- `var(--card-title-color)` - 标题颜色
- `var(--card-text-color)` - 文本颜色
- `var(--card-accent-color)` - 强调色
- `var(--card-background-secondary)` - 次要背景色

## 🐛 常见问题

### Q: 如何添加新的字段类型？
A: 在 `renderField` 函数的 switch 语句中添加新的 case。

### Q: 如何实现复杂的字段联动？
A: 使用 `dependsOn`、`hideWhen`、`showWhen` 等属性组合实现。

### Q: 如何自定义展示样式？
A: 修改 `DisplayConfig` 中的 `layout` 属性，或在 `renderDataDisplay` 函数中添加新的布局类型。

---

**更新时间**: 2024年
**维护者**: AINO开发团队
