# GenericFormCard 配置示例

## 🎯 现有配置示例

### 1. 教育经历配置

```typescript
// education-config.tsx
import { GraduationCap } from "lucide-react"

export const educationFields: FieldConfig[] = [
  {
    key: "school",
    label: "学校名称",
    type: "text",
    placeholder: "请输入学校名称",
    required: true
  },
  {
    key: "degree", 
    label: "学历",
    type: "select",
    required: true,
    gridColumn: 2,
    options: [
      { value: "博士", label: "博士" },
      { value: "硕士", label: "硕士" },
      { value: "本科", label: "本科" },
      { value: "专科", label: "专科" }
    ]
  },
  {
    key: "major",
    label: "专业", 
    type: "text",
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
    label: "目前在读",
    type: "switch"
  },
  {
    key: "description",
    label: "详细描述",
    type: "textarea",
    rows: 4
  }
]

export const educationDisplay: DisplayConfig = {
  icon: <GraduationCap className="w-5 h-5 mt-1" style={{ color: "var(--card-accent-color, #3b82f6)" }} />,
  titleField: "school",
  subtitleField: "degree", 
  descriptionField: "description",
  layout: "timeline",
  showActions: true
}
```

### 2. 工作经历配置

```typescript
// work-experience-config.tsx
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
    key: "salary",
    label: "薪资",
    type: "text",
    placeholder: "如：15K-20K"
  }
]
```

### 3. 求职期望配置

```typescript
// job-expectation-config.tsx  
export const jobExpectationFields: FieldConfig[] = [
  {
    key: "position",
    label: "期望职位",
    type: "text",
    required: true,
    gridColumn: 2
  },
  {
    key: "industry",
    label: "期望行业", 
    type: "select",
    gridColumn: 2,
    options: [
      { value: "互联网", label: "互联网" },
      { value: "金融", label: "金融" },
      { value: "教育", label: "教育" }
    ]
  },
  {
    key: "workLocation",
    label: "工作地点",
    type: "city",
    gridColumn: 2
  },
  {
    key: "availableDate",
    label: "到岗时间",
    type: "date", 
    gridColumn: 2,
    dependsOn: "immediatelyAvailable",
    hideWhen: true,
    replaceWith: "随时到岗"
  },
  {
    key: "immediatelyAvailable",
    label: "随时到岗",
    type: "switch"
  }
]
```

## 🆕 创建新配置

### 步骤1：创建配置文件

```typescript
// skills-config.tsx
import { Star } from "lucide-react"

export const skillsFields: FieldConfig[] = [
  {
    key: "name",
    label: "技能名称",
    type: "text",
    required: true,
    gridColumn: 2
  },
  {
    key: "level",
    label: "熟练程度",
    type: "select",
    gridColumn: 2,
    options: [
      { value: "初级", label: "初级" },
      { value: "中级", label: "中级" }, 
      { value: "高级", label: "高级" },
      { value: "专家", label: "专家" }
    ]
  },
  {
    key: "experience",
    label: "使用时长",
    type: "text",
    placeholder: "如：2年",
    gridColumn: 2
  },
  {
    key: "isCertified",
    label: "已认证",
    type: "switch"
  },
  {
    key: "certificationName",
    label: "认证名称",
    type: "text",
    placeholder: "请输入认证名称",
    dependsOn: "isCertified",
    showWhen: true  // 只有当"已认证"为true时才显示
  }
]

export const skillsDisplay: DisplayConfig = {
  icon: <Star className="w-5 h-5 mt-1" style={{ color: "var(--card-accent-color, #3b82f6)" }} />,
  titleField: "name",
  subtitleField: "level",
  layout: "simple",
  showActions: true
}
```

### 步骤2：添加到index.ts

```typescript
// index.ts
export { skillsFields, skillsDisplay } from './skills-config'
```

### 步骤3：在页面中使用

```typescript
// page.tsx
import { skillsFields, skillsDisplay } from '@/components/card/profile-cards'

<GenericFormCard
  title="技能特长"
  data={userProfile.skills}
  onUpdate={(skills) => setUserProfile(prev => ({ ...prev, skills }))}
  fields={skillsFields}
  displayConfig={skillsDisplay}
  allowMultiple={true}
  emptyText="暂无技能信息"
  addButtonText="添加技能"
/>
```

## 🔄 字段联动模式

### 模式1：开关控制显示/隐藏

```typescript
// 开关字段
{ key: "hasAdvanced", label: "高级选项", type: "switch" }

// 依赖字段
{ 
  key: "advancedConfig",
  label: "高级配置",
  type: "textarea",
  dependsOn: "hasAdvanced",
  showWhen: true  // 只有开关开启时才显示
}
```

### 模式2：选择控制字段

```typescript
// 选择字段
{
  key: "type",
  label: "类型", 
  type: "select",
  options: [
    { value: "personal", label: "个人" },
    { value: "company", label: "企业" }
  ]
}

// 依赖字段
{
  key: "companyName",
  label: "企业名称",
  type: "text",
  dependsOn: "type",
  showWhen: "company"  // 只有选择"企业"时才显示
}
```

### 模式3：替代文本显示

```typescript
{
  key: "endDate",
  label: "结束时间",
  type: "yearMonth",
  dependsOn: "isOngoing", 
  hideWhen: true,
  replaceWith: "进行中"  // 隐藏时显示替代文本
}
```

## 📱 布局最佳实践

### 表单布局建议

```typescript
// ✅ 推荐：相关字段分组
[
  // 基本信息组（全宽）
  { key: "title", type: "text", gridColumn: 1 },
  
  // 时间信息组（半宽）
  { key: "startDate", type: "yearMonth", gridColumn: 2 },
  { key: "endDate", type: "yearMonth", gridColumn: 2 },
  
  // 状态控制组（全宽）
  { key: "isActive", type: "switch", gridColumn: 1 },
  
  // 描述信息组（全宽）
  { key: "description", type: "textarea", gridColumn: 1 }
]
```

### 展示布局选择

- **timeline**: 时间相关、有明确顺序的数据
- **grid**: 结构化信息、需要对比的数据  
- **simple**: 单一记录、概要信息

---

有了这个配置文档，以后添加新功能就很简单了！只需要参考示例创建配置文件即可。
