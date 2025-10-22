# 职位列表组件

这个目录包含了职位列表相关的所有组件，用于创建类似图片中展示的职位列表页面。

## 组件说明

### JobCard
职位卡片组件，显示单个职位的详细信息。

**Props:**
- `job: JobData` - 职位数据对象
- `className?: string` - 自定义样式类名

**JobData 接口:**
```typescript
interface JobData {
  id: string
  title: string
  company: string
  companySize?: string
  salary: string
  location: string
  tags: string[]
  contact: {
    name: string
    position: string
  }
  activity: string
  isActive?: boolean
  onRemoveLocation?: () => void
}
```

### JobListPage
完整的职位列表页面组件，包含状态栏、头部、搜索筛选、标签页导航和职位列表。

**Props:**
- `className?: string` - 自定义样式类名

### JobBottomNavigation
职位列表专用的底部导航组件，包含消息通知和红点提示。

**Props:**
- `activeTab?: string` - 当前激活的标签页
- `onTabChange?: (tab: string) => void` - 标签页切换回调

### MobileStatusBar
移动端状态栏组件，显示时间、网络状态和电池信息。

**Props:**
- `className?: string` - 自定义样式类名

## 使用方法

### 基本使用
```tsx
import { JobListPage } from "@/components/job"

export default function JobsPage() {
  return <JobListPage />
}
```

### 单独使用职位卡片
```tsx
import { JobCard, JobData } from "@/components/job"

const jobData: JobData = {
  id: "1",
  title: "前端开发工程师",
  company: "示例公司",
  salary: "15-30K",
  location: "北京",
  tags: ["React", "TypeScript"],
  contact: {
    name: "张先生",
    position: "HR"
  },
  activity: "今日活跃"
}

export default function JobCardExample() {
  return <JobCard job={jobData} />
}
```

## 页面路由

职位列表页面位于：`/app/[locale]/jobs/page.tsx`

访问路径：`/en/jobs` 或 `/zh/jobs`

## 样式特性

- 完全响应式设计，适配移动端
- 使用项目统一的设计系统
- 支持毛玻璃效果（frosted effect）
- 集成项目的主题系统
- 符合项目的组件约束规范

## 功能特性

- 职位卡片展示
- 搜索和筛选功能
- 标签页导航（推荐、附近、最新）
- 底部导航栏
- 消息通知徽章
- 位置筛选
- 移动端状态栏
