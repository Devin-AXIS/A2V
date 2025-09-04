# AINO-app 组件使用指南

## 📋 概述

本文档详细介绍了 AINO-app 中各个组件系统的使用方法、配置选项和最佳实践。帮助开发者快速上手并正确使用各种组件。

## 🎨 基础组件

### 1. 按钮组件

#### PillButton - 胶囊按钮
```typescript
import { PillButton } from "@/components/basic/pill-button"

// 基础用法
<PillButton>点击我</PillButton>

// 带图标
<PillButton icon={<Plus className="h-4 w-4" />}>
  添加项目
</PillButton>

// 不同变体
<PillButton variant="primary">主要按钮</PillButton>
<PillButton variant="secondary">次要按钮</PillButton>
<PillButton variant="outline">轮廓按钮</PillButton>
<PillButton variant="ghost">幽灵按钮</PillButton>

// 不同尺寸
<PillButton size="sm">小按钮</PillButton>
<PillButton size="default">默认按钮</PillButton>
<PillButton size="lg">大按钮</PillButton>

// 禁用状态
<PillButton disabled>禁用按钮</PillButton>

// 加载状态
<PillButton loading>加载中...</PillButton>
```

#### FloatingButton - 浮动按钮
```typescript
import { FloatingButton } from "@/components/basic/floating-button"

// 基础用法
<FloatingButton>
  <Plus className="h-6 w-6" />
</FloatingButton>

// 带标签
<FloatingButton label="添加新项目">
  <Plus className="h-6 w-6" />
</FloatingButton>

// 不同位置
<FloatingButton position="bottom-right">
  <Plus className="h-6 w-6" />
</FloatingButton>

<FloatingButton position="bottom-left">
  <Plus className="h-6 w-6" />
</FloatingButton>
```

### 2. 导航组件

#### AppHeader - 应用头部
```typescript
import { AppHeader } from "@/components/navigation/app-header"

// 基础用法
<AppHeader title="我的应用" />

// 带操作按钮
<AppHeader 
  title="我的应用"
  actions={
    <Button size="sm">
      <Settings className="h-4 w-4" />
    </Button>
  }
/>

// 带面包屑
<AppHeader 
  title="当前页面"
  breadcrumbs={[
    { label: "首页", href: "/" },
    { label: "分类", href: "/category" },
    { label: "当前页面" }
  ]}
/>
```

#### BottomNavigation - 底部导航
```typescript
import { BottomNavigation } from "@/components/navigation/bottom-navigation"

// 基础用法
<BottomNavigation 
  dict={{
    browseComponents: "浏览",
    dashboard: "仪表板",
    chat: "聊天",
    search: "搜索",
    profile: "个人"
  }}
/>

// 自定义导航项
<BottomNavigation 
  items={[
    { label: "首页", icon: <Home className="h-5 w-5" />, href: "/" },
    { label: "分类", icon: <Grid3X3 className="h-5 w-5" />, href: "/category" },
    { label: "搜索", icon: <Search className="h-5 w-5" />, href: "/search" },
    { label: "个人", icon: <User className="h-5 w-5" />, href: "/profile" }
  ]}
/>
```

#### FilterTabs - 过滤标签
```typescript
import { FilterTabs } from "@/components/navigation/filter-tabs"

// 基础用法
<FilterTabs 
  tabs={[
    { key: "all", label: "全部" },
    { key: "active", label: "活跃" },
    { key: "inactive", label: "非活跃" }
  ]}
  activeTab="all"
  onTabChange={(tab) => console.log("切换到:", tab)}
/>

// 带图标
<FilterTabs 
  tabs={[
    { key: "all", label: "全部", icon: <Grid3X3 className="h-4 w-4" /> },
    { key: "favorites", label: "收藏", icon: <Heart className="h-4 w-4" /> },
    { key: "recent", label: "最近", icon: <Clock className="h-4 w-4" /> }
  ]}
  activeTab="all"
  onTabChange={(tab) => setActiveTab(tab)}
/>
```

### 3. 输入组件

#### Calendar - 日历组件
```typescript
import { Calendar } from "@/components/input/calendar"

// 基础用法
<Calendar 
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>

// 多选模式
<Calendar 
  mode="multiple"
  selected={dates}
  onSelect={setDates}
  className="rounded-md border"
/>

// 范围选择
<Calendar 
  mode="range"
  selected={dateRange}
  onSelect={setDateRange}
  className="rounded-md border"
/>

// 带禁用日期
<Calendar 
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => date < new Date()}
  className="rounded-md border"
/>
```

## 🃏 卡片系统

### 1. 基础卡片

#### BaseCard - 基础卡片
```typescript
import { BaseCard } from "@/components/card/base-card"

// 基础用法
<BaseCard>
  <div className="p-4">
    <h3 className="text-lg font-semibold">卡片标题</h3>
    <p className="text-muted-foreground">卡片内容</p>
  </div>
</BaseCard>

// 带设置按钮
<BaseCard 
  showSettings={true}
  onSettingsClick={() => console.log("设置被点击")}
>
  <div className="p-4">
    <h3 className="text-lg font-semibold">可配置卡片</h3>
    <p className="text-muted-foreground">这个卡片有设置按钮</p>
  </div>
</BaseCard>

// 可拖拽卡片
<BaseCard 
  isDraggable={true}
  dragHandleProps={{
    "data-drag-handle": true
  }}
>
  <div className="p-4">
    <h3 className="text-lg font-semibold">可拖拽卡片</h3>
    <p className="text-muted-foreground">这个卡片可以拖拽</p>
  </div>
</BaseCard>
```

#### EnhancedBaseCard - 增强基础卡片
```typescript
import { EnhancedBaseCard } from "@/components/card/enhanced-base-card"

// 基础用法
<EnhancedBaseCard id="card-1">
  <div className="p-4">
    <h3 className="text-lg font-semibold">增强卡片</h3>
    <p className="text-muted-foreground">这个卡片有更多功能</p>
  </div>
</EnhancedBaseCard>

// 带数据和操作
<EnhancedBaseCard 
  id="card-1"
  data={{ title: "卡片数据" }}
  onAction={(action, data) => console.log(action, data)}
>
  <div className="p-4">
    <h3 className="text-lg font-semibold">数据卡片</h3>
    <p className="text-muted-foreground">这个卡片有数据和操作</p>
  </div>
</EnhancedBaseCard>
```

### 2. 业务卡片

#### 使用卡片注册系统
```typescript
import { CardRegistry } from "@/components/card/registry"
import { BusinessCardWrapper } from "@/components/card/business-card-wrapper"

// 通过注册系统使用卡片
<BusinessCardWrapper 
  cardName="learning-plan-summary"
  data={{
    title: "AI学习计划",
    totalHours: 120,
    completedHours: 45,
    targetSkills: ["React", "TypeScript", "Node.js"]
  }}
  onAction={(action, data) => console.log(action, data)}
/>

// 获取所有卡片
const allCards = CardRegistry.getAll()

// 按分类获取卡片
const educationCards = CardRegistry.getByCategory("教育")

// 按类型获取卡片
const chartCards = CardRegistry.getByType("chart")
```

#### 自定义业务卡片
```typescript
// 1. 创建卡片组件
export default function CustomCard({
  title = "自定义卡片",
  data = {},
  className = "",
  disableLocalTheme = false,
  onAction,
}: CustomCardProps) {
  return (
    <AppCard className={cn("p-6", className)} disableLocalTheme={disableLocalTheme}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-muted-foreground">
          {/* 卡片内容 */}
        </div>
      </div>
    </AppCard>
  )
}

// 2. 注册卡片
CardRegistry.register({
  name: "custom-card",
  displayName: "自定义卡片",
  category: "自定义",
  type: "widget",
  component: CustomCard,
  businessFlow: "自定义业务逻辑",
  developer: {
    name: "开发者名称",
    version: "1.0.0",
    description: "自定义卡片描述"
  }
})

// 3. 使用卡片
<BusinessCardWrapper 
  cardName="custom-card"
  data={customData}
  onAction={handleAction}
/>
```

### 3. 拖拽卡片容器

#### DraggableCardContainer - 可拖拽卡片容器
```typescript
import { DraggableCardContainer } from "@/components/card/draggable-card-container"

// 基础用法
<DraggableCardContainer 
  items={[
    { id: "1", content: <div>卡片1</div> },
    { id: "2", content: <div>卡片2</div> },
    { id: "3", content: <div>卡片3</div> }
  ]}
  onReorder={(newOrder) => console.log("新顺序:", newOrder)}
/>

// 自定义样式
<DraggableCardContainer 
  items={cardItems}
  onReorder={handleReorder}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
/>
```

#### EnhancedDraggableCardContainer - 增强拖拽容器
```typescript
import { EnhancedDraggableCardContainer } from "@/components/card/enhanced-draggable-card-container"

// 基础用法
<EnhancedDraggableCardContainer 
  items={[
    { id: "1", content: <div>增强卡片1</div> },
    { id: "2", content: <div>增强卡片2</div> }
  ]}
  onReorder={(newOrder) => setCardOrder(newOrder)}
/>

// 带拖拽预览
<EnhancedDraggableCardContainer 
  items={cardItems}
  onReorder={handleReorder}
  showDragPreview={true}
/>
```

## 🎭 主题系统

### 1. 全局主题

#### 使用主题 Provider
```typescript
import { ThemeProvider, useTheme } from "@/components/providers/theme-provider"

// 在应用根部使用
function App() {
  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  )
}

// 在组件中使用主题
function YourComponent() {
  const { 
    colors, 
    updateColor, 
    toggleColor, 
    applyPreset,
    gradientStyle,
    primaryColor,
    secondaryColor,
    accentColor 
  } = useTheme()

  return (
    <div style={gradientStyle}>
      <h1 style={{ color: primaryColor }}>主标题</h1>
      <p style={{ color: secondaryColor }}>副标题</p>
    </div>
  )
}
```

#### 主题预设
```typescript
import { presets } from "@/config/theme"

// 应用预设主题
const { applyPreset } = useTheme()

// 应用天空蓝主题
applyPreset(presets[1].colors) // ["#ffffff", "#dbeafe", "#ecfeff"]

// 应用薄荷绿主题
applyPreset(presets[2].colors) // ["#ffffff", "#d1fae5", "#ecfdf5"]
```

### 2. 卡片主题

#### 使用卡片主题 Provider
```typescript
import { CardThemeProvider, useCardTheme } from "@/components/providers/card-theme-provider"

// 在应用中使用
function App() {
  return (
    <CardThemeProvider>
      <YourAppContent />
    </CardThemeProvider>
  )
}

// 在组件中使用
function YourComponent() {
  const { theme, applyPreset } = useCardTheme()

  return (
    <div 
      style={{
        backgroundColor: theme.background,
        color: theme.textColor,
        fontFamily: theme.fontFamily
      }}
    >
      卡片内容
    </div>
  )
}
```

#### 卡片主题预设
```typescript
import { cardThemePresets } from "@/config/card-theme"

// 应用预设
const { applyPreset } = useCardTheme()

// 应用深色主题
applyPreset(cardThemePresets[1].config)

// 应用经典主题
applyPreset(cardThemePresets[2].config)
```

### 3. 局部主题

#### 使用局部主题 Provider
```typescript
import { LocalThemeKeyProvider } from "@/components/providers/local-theme-key"

// 为特定组件设置局部主题
<LocalThemeKeyProvider value="unique-theme-key">
  <YourComponent />
</LocalThemeKeyProvider>

// 在组件中使用局部主题
function YourComponent() {
  const localThemeKey = useLocalThemeKey()
  
  return (
    <div data-theme-key={localThemeKey}>
      局部主题内容
    </div>
  )
}
```

## 🌍 国际化系统

### 1. 字典使用

#### 获取字典
```typescript
import { getDictionary } from "@/lib/dictionaries"

// 在服务端组件中
export default async function Page({ params: { locale } }) {
  const dict = await getDictionary(locale)
  
  return (
    <div>
      <h1>{dict.mainPage.title}</h1>
      <p>{dict.mainPage.description}</p>
    </div>
  )
}
```

#### 客户端字典使用
```typescript
import { useLocale } from "@/hooks/use-locale"

function ClientComponent() {
  const { locale, dict } = useLocale()
  
  return (
    <div>
      <h1>{dict.mainPage.title}</h1>
      <p>当前语言: {locale}</p>
    </div>
  )
}
```

### 2. 语言切换

#### 语言切换组件
```typescript
import { useLocale } from "@/hooks/use-locale"
import { useRouter } from "next/navigation"

function LanguageSwitcher() {
  const { locale } = useLocale()
  const router = useRouter()
  
  const switchLanguage = (newLocale: string) => {
    router.push(`/${newLocale}`)
  }
  
  return (
    <div className="flex gap-2">
      <button 
        onClick={() => switchLanguage('zh')}
        className={locale === 'zh' ? 'font-bold' : ''}
      >
        中文
      </button>
      <button 
        onClick={() => switchLanguage('en')}
        className={locale === 'en' ? 'font-bold' : ''}
      >
        English
      </button>
    </div>
  )
}
```

## 🎬 动画系统

### 1. Framer Motion 使用

#### 基础动画
```typescript
import { motion } from "framer-motion"

// 基础动画
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  动画内容
</motion.div>

// 悬停动画
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  可交互元素
</motion.div>
```

#### 布局动画
```typescript
import { motion, AnimatePresence } from "framer-motion"

// 布局动画
<motion.div
  layout
  transition={{ type: "spring", stiffness: 400, damping: 40 }}
>
  布局变化内容
</motion.div>

// 进入/退出动画
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      条件渲染内容
    </motion.div>
  )}
</AnimatePresence>
```

### 2. 自定义动画 Hook

#### 创建动画 Hook
```typescript
import { useAnimation } from "framer-motion"

function useCustomAnimation() {
  const controls = useAnimation()
  
  const startAnimation = async () => {
    await controls.start({
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      transition: { duration: 1 }
    })
  }
  
  return { controls, startAnimation }
}

// 使用自定义动画
function AnimatedComponent() {
  const { controls, startAnimation } = useCustomAnimation()
  
  return (
    <motion.div
      animate={controls}
      onClick={startAnimation}
    >
      点击我触发动画
    </motion.div>
  )
}
```

## 📊 数据展示组件

### 1. 图表组件

#### 使用 Recharts
```typescript
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts"

const data = [
  { name: "1月", value: 400 },
  { name: "2月", value: 300 },
  { name: "3月", value: 200 },
  { name: "4月", value: 500 }
]

function ChartComponent() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### 2. 进度条组件

#### 使用 Progress 组件
```typescript
import { Progress } from "@/components/ui/progress"

// 基础用法
<Progress value={33} />

// 带标签
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>进度</span>
    <span>33%</span>
  </div>
  <Progress value={33} />
</div>

// 不同尺寸
<Progress value={50} className="h-2" />
<Progress value={50} className="h-4" />
```

## 🔧 工具函数

### 1. 样式工具

#### cn 函数
```typescript
import { cn } from "@/lib/utils"

// 合并类名
<div className={cn("base-class", condition && "conditional-class", className)} />

// 条件样式
<div className={cn(
  "flex items-center",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

### 2. 类型工具

#### 类型定义
```typescript
// 基础类型
interface BaseProps {
  className?: string
  children?: React.ReactNode
}

// 扩展类型
interface CardProps extends BaseProps {
  title: string
  data?: any
  onAction?: (action: string, data: any) => void
}

// 泛型类型
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}
```

## 📝 最佳实践

### 1. 组件设计原则

- **单一职责**: 每个组件只负责一个功能
- **可复用性**: 设计通用的组件接口
- **可配置性**: 通过 props 提供配置选项
- **类型安全**: 使用 TypeScript 确保类型安全

### 2. 性能优化

- **懒加载**: 使用 React.lazy 和 Suspense
- **记忆化**: 使用 useMemo 和 useCallback
- **虚拟化**: 对长列表使用虚拟滚动
- **代码分割**: 合理使用动态导入

### 3. 可访问性

- **语义化**: 使用正确的 HTML 标签
- **键盘导航**: 支持键盘操作
- **屏幕阅读器**: 提供适当的 ARIA 标签
- **颜色对比**: 确保足够的颜色对比度

### 4. 错误处理

- **边界错误**: 使用 ErrorBoundary 捕获错误
- **表单验证**: 使用 Zod 进行数据验证
- **网络错误**: 处理 API 调用失败
- **用户反馈**: 提供清晰的错误信息

## 🚀 总结

AINO-app 提供了完整的组件生态系统，包括：

- **基础组件**: 按钮、输入、导航等基础 UI 组件
- **卡片系统**: 统一的卡片设计和拖拽功能
- **主题系统**: 多层级主题管理和实时切换
- **国际化**: 完整的多语言支持
- **动画系统**: 基于 Framer Motion 的流畅动画
- **数据展示**: 图表和进度条等数据可视化组件

通过遵循本文档的指南和最佳实践，开发者可以快速构建出功能完整、用户体验良好的应用。
