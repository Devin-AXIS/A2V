# AINO-app 前端应用架构设计文档

## 📋 概述

AINO-app 是一个基于 Next.js 15 的现代化前端应用，专注于提供组件库展示、卡片化设计系统和多端适配能力。本文档详细描述了 AINO-app 的整体架构设计、核心系统实现和开发规范。

### ✅ 核心特性

- **🎨 组件库展示**：完整的 UI 组件库和业务组件展示
- **🃏 卡片化设计**：统一的卡片系统，支持拖拽和主题定制
- **📱 多端适配**：移动端和 PC 端完全分离的布局系统
- **🎭 主题系统**：多层级主题管理，支持实时切换
- **🌍 国际化**：完整的多语言支持系统
- **🎯 业务场景**：覆盖教育、招聘、内容管理等多个领域

## 🏗️ 技术架构

### 技术栈

```typescript
// 核心技术栈
{
  "framework": "Next.js 15.5.2 (App Router)",
  "ui": "React 19.1.1 + TypeScript 5.9.2",
  "styling": "Tailwind CSS 4.1.12 + shadcn/ui",
  "components": "Radix UI + Lucide Icons",
  "dragDrop": "@dnd-kit (core, sortable, utilities)",
  "animations": "Framer Motion",
  "charts": "Recharts",
  "forms": "React Hook Form + Zod",
  "i18n": "自定义国际化系统",
  "packageManager": "pnpm"
}
```

### Next.js 15 兼容性说明

#### 路由参数处理
- **Server Components**：`params` 现在是 Promise，需要使用 `await params`
- **Client Components**：使用 `use(params)` Hook 处理 Promise
- **禁止**：同步访问 `params` 属性

#### 组件类型约束
- **Server Components**：可以使用 `async` 函数，支持 `await`
- **Client Components**：不能使用 `async` 函数，使用 `use` Hook 处理 Promise
- **混合模式**：Server Components 可以导入 Client Components

#### SSR 规则
- 更严格的 `ssr: false` 使用规则
- 改进的静态生成和动态渲染策略
- 更好的并发特性支持

### React 19 特性说明

#### use Hook
- 用于在 Client Components 中处理 Promise
- 替代了 `useEffect` + `useState` 的异步数据获取模式
- 支持 Suspense 边界和错误边界

#### Hook 使用规则
- 更严格的 Hook 调用顺序检查
- 改进的并发渲染支持
- 更好的性能优化

### 项目结构

```
AINO-app/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # 国际化路由
│   │   ├── layout.tsx           # 移动端布局
│   │   ├── layout.client.tsx    # 客户端布局组件
│   │   ├── page.tsx             # 主页面
│   │   ├── components/          # 页面级组件
│   │   └── pc/                  # PC端页面
│   ├── globals.css              # 全局样式
│   └── layout.tsx               # 根布局
├── components/                   # 组件库
│   ├── basic/                   # 基础组件
│   ├── navigation/              # 导航组件
│   ├── input/                   # 输入组件
│   ├── data-display/            # 数据展示组件
│   ├── card/                    # 卡片系统
│   ├── ui/                      # shadcn/ui 组件
│   ├── providers/               # Context 提供者
│   └── theme/                   # 主题组件
├── config/                      # 配置文件
│   ├── theme.ts                 # 主题配置
│   ├── card-theme.ts            # 卡片主题配置
│   └── chart-theme.ts           # 图表主题配置
├── hooks/                       # 自定义 Hooks
├── lib/                         # 工具库
│   ├── dictionaries/            # 国际化字典
│   └── utils.ts                 # 工具函数
├── types/                       # TypeScript 类型定义
└── public/                      # 静态资源
```

## 🎨 核心系统设计

### 1. 多端适配架构

#### 移动端布局
```typescript
// app/[locale]/layout.client.tsx
export function LayoutClient({ children, dict, locale }) {
  return (
    <div className="min-h-screen font-sans antialiased">
      <ThemeProvider>
        <ChartThemeProvider>
          <DataChartThemeProvider>
            <CardThemeProvider>
              <FrostedEffectProvider>
                <div className="relative min-h-screen overflow-hidden">
                  <DynamicBackground />
                  <main className="relative z-10">{children}</main>
                  <DemoAwareBottomNavigation dict={dict.bottomNav} />
                  <MobileUnifiedConfig />
                </div>
              </FrostedEffectProvider>
            </CardThemeProvider>
          </DataChartThemeProvider>
        </ChartThemeProvider>
      </ThemeProvider>
    </div>
  )
}
```

#### PC端布局
```typescript
// app/[locale]/pc/layout.tsx
export default async function PCLayout({ children, params: { locale } }) {
  return (
    <ThemeProvider>
      <DataChartThemeProvider>
        <CardThemeProvider>
          <ChartThemeProvider>
            <FrostedEffectProvider>
              <div className="min-h-screen relative overflow-hidden">
                <PCDynamicBackground />
                <PCLeftSidebar dict={dict} locale={locale} />
                <div className="pl-20 transition-all duration-300">
                  <PCTopHeader dict={dict} locale={locale} />
                  <main className="relative z-10 p-6 pt-20">
                    <div className="max-w-7xl mx-auto">{children}</div>
                  </main>
                </div>
              </div>
            </FrostedEffectProvider>
          </ChartThemeProvider>
        </CardThemeProvider>
      </DataChartThemeProvider>
    </ThemeProvider>
  )
}
```

### 2. 卡片化设计系统

#### 卡片注册系统
```typescript
// components/card/registry.ts
class CardRegistry {
  private static cards = new Map<string, CardConfig>()
  private static actionHandlers = new Map<string, (action: CardAction) => void>()

  static register(config: CardConfig) {
    this.cards.set(config.name, config)
  }

  static getByCategory(category: string) {
    return Array.from(this.cards.values()).filter((card) => card.category === category)
  }
}

// 卡片注册示例
CardRegistry.register({
  name: "learning-plan-summary",
  displayName: "学习计划摘要",
  category: "教育",
  type: "summary",
  component: LearningPlanSummaryCard,
  businessFlow: "个性定制学习计划摘要，显示学习时长、目标和评估功能",
  developer: {
    name: "AI Education System",
    version: "1.0.0",
    description: "个性定制学习计划摘要卡片"
  }
})
```

#### 卡片工厂模式
```typescript
// components/card/card-factory.tsx
export function CardFactory({
  id,
  type,
  cardName,
  data,
  onAction,
  children,
  disableConstraints = false,
}: CardFactoryProps) {
  const cardConstraints = {
    isDraggable: !disableConstraints,
    showSettings: !disableConstraints,
    disableLocalTheme: disableConstraints,
  }

  if (type === "business" && cardName) {
    return (
      <EnhancedBaseCard id={id} data={data} onAction={onAction} {...cardConstraints}>
        <BusinessCardWrapper cardName={cardName} data={data} onAction={onAction} />
      </EnhancedBaseCard>
    )
  }

  if (type === "custom" && children) {
    return (
      <EnhancedBaseCard id={id} data={data} onAction={onAction} {...cardConstraints}>
        {children}
      </EnhancedBaseCard>
    )
  }

  return (
    <EnhancedBaseCard id={id} {...cardConstraints}>
      <div className="p-4 text-center text-muted-foreground">
        <p>卡片配置错误</p>
        <p className="text-sm">请检查卡片类型和参数</p>
      </div>
    </EnhancedBaseCard>
  )
}
```

### 3. 拖拽系统设计

#### 拖拽上下文
```typescript
// components/dynamic-page/pc-dynamic-page-component.tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  DragOverlay,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"

export function PCDynamicPageComponent({ category, locale, className }) {
  const [cards, setCards] = useState<PCCardItem[]>([])
  const [layoutMode, setLayoutMode] = useState<"grid" | "freeform">("freeform")
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 2 },
    }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      // 处理拖拽结束逻辑
    }
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* 拖拽内容 */}
      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div className="shadow-2xl">
            {activeCard.component}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
```

### 4. 主题系统设计

#### 多层级主题管理
```typescript
// components/providers/theme-provider.tsx
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ColorConfig[]>(initialColors)

  const updateColor = useCallback((id: number, newValue: string) => {
    setColors((prevColors) => 
      prevColors.map((color) => 
        color.id === id ? { ...color, value: newValue } : color
      )
    )
  }, [])

  const gradientStyle = useMemo(() => {
    const enabledColors = colors.filter((c) => c.enabled)
    if (enabledColors.length === 0) return { backgroundColor: "#ffffff" }
    if (enabledColors.length === 1) return { backgroundColor: enabledColors[0].value }

    if (enabledColors.length === 2) {
      return {
        background: `linear-gradient(135deg, ${enabledColors[0].value} 40%, ${enabledColors[1].value} 100%)`,
      }
    }

    if (enabledColors.length === 3) {
      return {
        background: `linear-gradient(135deg, ${enabledColors[0].value} 25%, ${enabledColors[1].value} 65%, ${enabledColors[2].value} 100%)`,
      }
    }

    return { backgroundColor: "#ffffff" }
  }, [colors])

  return (
    <ThemeContext.Provider value={{
      colors,
      updateColor,
      toggleColor,
      applyPreset,
      gradientStyle,
      getGlowColor,
      primaryColor,
      secondaryColor,
      accentColor,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

#### 卡片主题系统
```typescript
// components/providers/card-theme-provider.tsx
export function CardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<CardThemeConfig>(cardThemePresets[0].config)

  // 从 localStorage 读取全局卡片主题
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("card_theme_global")
        if (raw) {
          setTheme(JSON.parse(raw) as CardThemeConfig)
        }
      }
    } catch { }
  }, [])

  // 主题变更时持久化到 localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("card_theme_global", JSON.stringify(theme))
      }
    } catch { }
  }, [theme])

  return (
    <CardThemeContext.Provider value={{ theme, setTheme, applyPreset }}>
      {children}
    </CardThemeContext.Provider>
  )
}
```

### 5. 国际化系统设计

#### 字典管理
```typescript
// lib/dictionaries.ts
export const i18n = {
  defaultLocale: 'zh' as const,
  locales: ['zh', 'en'] as const,
}

export type Locale = (typeof i18n)['locales'][number]

export async function getDictionary(locale: Locale) {
  try {
    const module = await import(`./dictionaries/${locale}.ts`)
    return module.default
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error)
    // 回退到默认语言
    const fallbackModule = await import(`./dictionaries/${i18n.defaultLocale}.ts`)
    return fallbackModule.default
  }
}
```

#### 路由国际化
```typescript
// app/[locale]/layout.tsx
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <LayoutClient dict={dict} locale={locale}>
      {children}
    </LayoutClient>
  )
}
```

### 6. 动画系统设计

#### Framer Motion 集成
```typescript
// components/navigation/segmented-control.tsx
import { motion, AnimatePresence } from "framer-motion"

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  // 根据value找到对应的索引
  const activeIndex = options.findIndex(option => option.id === value)

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={cn("flex items-center space-x-1 p-1.5 bg-gray-200/80 rounded-full shadow-lg", className)}
    >
      {options.map((option, index) => (
        <button key={option.id} onClick={() => onChange(option.id)}>
          {activeIndex === index && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 rounded-full"
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            />
          )}
          <div className="relative z-10 flex items-center space-x-2">
            {option.icon && option.icon}
            <AnimatePresence>
              {activeIndex === index && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto", transition: { delay: 0.1 } }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-semibold overflow-hidden whitespace-nowrap"
                >
                  {option.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </button>
      ))}
    </motion.div>
  )
}
```

## 🎯 业务场景支持

### 1. 教育应用场景

#### 学习计划摘要卡片
```typescript
// components/card/business-cards/learning-plan-summary-card.tsx
export default function LearningPlanSummaryCard({
  title = "AI学习计划",
  totalHours = 120,
  completedHours = 45,
  targetSkills = ["React", "TypeScript", "Node.js"],
  className = "",
  disableLocalTheme = false,
}: LearningPlanSummaryCardProps) {
  const progressPercentage = (completedHours / totalHours) * 100

  return (
    <AppCard className={cn("p-6", className)} disableLocalTheme={disableLocalTheme}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="secondary">{completedHours}/{totalHours}小时</Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>学习进度</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">目标技能</h4>
          <div className="flex flex-wrap gap-2">
            {targetSkills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </AppCard>
  )
}
```

### 2. 招聘应用场景

#### 工作年限占比分析卡片
```typescript
// components/card/business-cards/job-experience-ratio-card.tsx
export default function JobExperienceRatioCard({
  title = "工作年限占比分析",
  data = defaultData,
  className = "",
  disableLocalTheme = false,
}: JobExperienceRatioCardProps) {
  return (
    <AppCard className={cn("p-6", className)} disableLocalTheme={disableLocalTheme}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">数据表格</h4>
            <div className="space-y-1">
              {data.map((item) => (
                <div key={item.experience} className="flex justify-between text-sm">
                  <span>{item.experience}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">可视化图表</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ experience, percentage }) => `${experience}: ${percentage}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppCard>
  )
}
```

### 3. 内容管理场景

#### 媒体编辑器卡片
```typescript
// components/card/business-cards/media-editor-card.tsx
export default function MediaEditorCard({
  title = "媒体编辑器",
  data = defaultData,
  className = "",
  disableLocalTheme = false,
  onAction,
}: MediaEditorCardProps) {
  const [selectedCover, setSelectedCover] = useState(data.cover)
  const [cast, setCast] = useState(data.cast)
  const [prompt, setPrompt] = useState(data.prompt)

  return (
    <AppCard className={cn("p-6", className)} disableLocalTheme={disableLocalTheme}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">封面选择</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {COVER_OPTIONS.map((cover) => (
                <button
                  key={cover.id}
                  onClick={() => setSelectedCover(cover)}
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                    selectedCover.id === cover.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Image
                    src={cover.image}
                    alt={cover.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">主演设置</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {cast.map((actor, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {actor}
                  <button
                    onClick={() => setCast(cast.filter((_, i) => i !== index))}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">提示词编辑</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入提示词..."
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </AppCard>
  )
}
```

## 🔧 开发规范

### 1. 组件开发规范

#### 组件结构
```typescript
// 标准组件结构
interface ComponentProps {
  // 必需属性
  title: string
  data: any
  
  // 可选属性
  className?: string
  disableLocalTheme?: boolean
  
  // 回调函数
  onAction?: (action: string, data: any) => void
}

export default function Component({
  title,
  data,
  className = "",
  disableLocalTheme = false,
  onAction,
}: ComponentProps) {
  // 状态管理
  const [state, setState] = useState(initialState)
  
  // 副作用
  useEffect(() => {
    // 副作用逻辑
  }, [dependencies])
  
  // 事件处理
  const handleAction = (action: string) => {
    onAction?.(action, data)
  }
  
  return (
    <AppCard className={cn("p-6", className)} disableLocalTheme={disableLocalTheme}>
      {/* 组件内容 */}
    </AppCard>
  )
}
```

#### 卡片注册规范
```typescript
// 卡片注册必须包含的字段
CardRegistry.register({
  name: "unique-card-name",           // 唯一标识
  displayName: "显示名称",             // 用户可见名称
  category: "分类",                   // 卡片分类
  type: "card-type",                 // 卡片类型
  component: CardComponent,           // 组件引用
  businessFlow: "业务描述",           // 业务功能描述
  developer: {                       // 开发者信息
    name: "开发者名称",
    version: "1.0.0",
    description: "详细描述"
  }
})
```

### 2. 样式开发规范

#### Tailwind CSS 使用规范
```typescript
// 使用 cn 工具函数合并类名
import { cn } from "@/lib/utils"

// 条件样式
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className // 允许外部传入的类名
)} />

// 响应式设计
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />

// 主题相关样式
<div className="bg-card text-card-foreground border border-border" />
```

#### 主题变量使用
```typescript
// 使用 CSS 变量
<div style={{ 
  backgroundColor: "var(--card-background)",
  color: "var(--card-text-color)"
}} />

// 使用主题 Hook
const { primaryColor, secondaryColor } = useTheme()
<div style={{ backgroundColor: primaryColor }} />
```

### 3. 状态管理规范

#### Context 使用规范
```typescript
// 创建 Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Provider 组件
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState)
  
  const value = useMemo(() => ({
    state,
    setState,
    // 其他方法
  }), [state])
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook 使用
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
```

#### 本地存储规范
```typescript
// 安全的本地存储操作
useEffect(() => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("key")
      if (stored) {
        setState(JSON.parse(stored))
      }
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error)
  }
}, [])

useEffect(() => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("key", JSON.stringify(state))
    }
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}, [state])
```

### 4. 性能优化规范

#### 组件优化
```typescript
// 使用 React.memo 优化
export default React.memo(function Component({ data }: ComponentProps) {
  // 组件逻辑
})

// 使用 useMemo 优化计算
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// 使用 useCallback 优化函数
const handleClick = useCallback((id: string) => {
  onAction?.(id)
}, [onAction])
```

#### 懒加载规范
```typescript
// 组件懒加载
const LazyComponent = lazy(() => import("./LazyComponent"))

// 使用 Suspense
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

## 🚀 部署和开发

### 开发环境启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 项目将在 http://localhost:3002 启动
```

### 构建和部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint
```

### 环境配置

```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig
```

## 📊 性能指标

### 核心指标

- **首屏加载时间**: < 2s
- **交互响应时间**: < 100ms
- **包大小**: < 1MB (gzipped)
- **Lighthouse 评分**: > 90

### 优化策略

1. **代码分割**: 使用动态导入和懒加载
2. **图片优化**: 使用 Next.js Image 组件
3. **缓存策略**: 合理使用浏览器缓存
4. **Bundle 分析**: 定期分析包大小

## 🔮 未来规划

### 短期目标

1. **组件完善**: 补充更多业务组件
2. **主题扩展**: 增加更多主题预设
3. **性能优化**: 进一步优化加载性能
4. **文档完善**: 补充组件使用文档

### 长期目标

1. **微前端架构**: 支持模块化部署
2. **设计系统**: 建立完整的设计系统
3. **自动化测试**: 增加单元测试和 E2E 测试
4. **国际化扩展**: 支持更多语言

## 📝 总结

AINO-app 是一个功能完整、架构清晰的前端应用，具有以下特点：

### 🏆 核心优势

1. **高度模块化**: 组件系统支持动态注册和配置
2. **多端适配**: 移动端和PC端完全分离的布局系统
3. **主题系统**: 多层级主题管理，支持实时切换
4. **拖拽布局**: 支持网格和自由布局的拖拽系统
5. **国际化**: 完整的多语言支持系统
6. **业务场景丰富**: 覆盖教育、招聘、内容管理等多个领域

### 🎯 技术特色

1. **现代技术栈**: 基于 Next.js 14 + React 18 + TypeScript
2. **组件化设计**: 使用 Radix UI + shadcn/ui 的组件系统
3. **动画系统**: 集成 Framer Motion 提供流畅动画
4. **拖拽功能**: 使用 @dnd-kit 实现强大的拖拽能力
5. **主题系统**: 多层级主题管理，支持实时切换

### 💡 设计亮点

1. **卡片工厂模式**: 统一的卡片创建和管理机制
2. **约束系统**: 确保所有卡片遵循统一的设计规范
3. **动态页面组件**: 支持多种页面类型的动态渲染
4. **Provider 链式管理**: 清晰的状态管理层次
5. **本地存储集成**: 主题配置的自动持久化

这个架构为构建复杂的业务应用和仪表板系统提供了坚实的基础，特别适合需要高度定制化和多端适配的场景。

## 🚀 架构优化升级方案

### 📋 核心优化目标

基于生产实践和未来扩展需求，AINO-app 架构需要进行以下关键优化：

#### ✅ 最高优先级（必须现在改/补齐）

##### 1. Manifest 成为唯一契约（Schema + View + Policy）

**目标**：建立统一的模块契约，消除前后端耦合

**实现方案**：
```typescript
// 模块 Manifest 接口
interface ModuleManifest {
  moduleKey: string
  schemaVersion: string
  fields: FieldDefinition[]
  relations: RelationDefinition[]
  views: ViewDefinition[]
  policies: PolicyDefinition
  indexHints: IndexHint[]
  materialize: MaterializeConfig[]
  changelog: ChangelogEntry[]
}

// API 端点
GET /apps/:appId/modules/:moduleKey/manifest
```

**验收标准**：
- 前端删除所有"写死字段"的代码后，仍能靠 Manifest 渲染列表/表单/详情
- 修改字段 label 或新增字段，不改前端代码即可生效
- 所有 CRUD 接口响应头统一加：`X-Schema-Version`

##### 2. 统一查询协议（filter/select/include/sort/pageToken）

**目标**：建立标准化的数据查询语言

**实现方案**：
```typescript
// 统一查询 DSL
interface QueryRequest {
  moduleKey: string
  filter?: FilterExpression
  select?: string[]
  include?: IncludeExpression[]
  sort?: SortExpression[]
  pageToken?: string
  limit?: number
}

// 查询示例
GET /records?moduleKey=jobs&filter={"and":[{"path":"props.city","op":"eq","value":"Shanghai"}]}&select=["id","props.title","props.salary"]&include=["company(name,logo)"]&sort=[["props.createdAt","desc"]]&pageToken=eyJpZCI6IjEyMyJ9
```

**验收标准**：
- 用统一 DSL 能完成所有列表页/筛选的场景
- 大表翻页不卡、无 offset 卡顿；N+1 查询不再出现

##### 3. 卡片容器（CardContainer）+ 卡片契约（CardDefinition）

**目标**：建立标准化的卡片渲染和配置体系

**实现方案**：
```typescript
// 卡片容器组件
<CardContainer
  moduleKey="jobs"
  viewKey="list_grid"
  adapterConfig={{
    fieldMap: { title: "props.title", salary: "props.salary" },
    relations: ["company"],
    compute: { displaySalary: "formatCurrency(props.salary)" }
  }}
/>

// 卡片契约定义
interface CardDefinition {
  key: string
  version: string
  dataContract: {
    required: string[]
    optional: string[]
  }
  slots: SlotDefinition[]
  actions: ActionDefinition[]
}
```

**验收标准**：
- 删除页面里与数据结构耦合的 UI 代码，只放一个 `<CardContainer/>` 就能完整渲染
- 新增字段，只改 Manifest/View/AdapterConfig，不改卡片代码即可展示

##### 4. 字段级权限与遮罩（Policies.fieldLevel + 安全裁剪）

**目标**：实现细粒度的数据安全控制

**实现方案**：
```typescript
// 字段级权限配置
interface PolicyDefinition {
  fieldLevel: {
    "props.salary": { read: "role>=admin", write: "role>=hr" }
    "props.phone": { read: "role>=user", write: "role>=hr" }
  }
  recordLevel: {
    read: "status=active OR role>=admin"
    write: "role>=hr"
  }
}
```

**验收标准**：
- 低权限用户拉同一条记录，敏感字段不可见（响应中也没有）
- 任意接口无法通过"猜字段"绕过前端拿到敏感字段

##### 5. 性能"宣言式"优化（indexHints/materialize）

**目标**：通过配置驱动性能优化

**实现方案**：
```typescript
// 索引提示配置
interface IndexHint {
  field: string
  type: "btree" | "gin" | "gist"
  expression?: string
  materialize?: boolean
}

// 物化配置
interface MaterializeConfig {
  field: string
  expression: string
  refreshInterval: string
}
```

**验收标准**：
- 热门筛选 < 200ms 首屏响应
- explain 结果无顺序扫描；大规模翻页稳定

#### 👍 中优先级（1-2 个迭代内完成）

##### 6. 视图配置（Views）收敛与版本化

**目标**：建立标准化的视图管理机制

**实现方案**：
```typescript
interface ViewDefinition {
  key: string
  version: string
  layout: "grid" | "table" | "kanban" | "list"
  columns: ColumnDefinition[]
  sort: SortExpression[]
  filters: FilterDefinition[]
  cardTemplate?: string
  pagination: PaginationConfig
}
```

##### 7. 统一动作协议（Actions + ActionRunner）

**目标**：建立标准化的交互动作体系

**实现方案**：
```typescript
interface ActionDefinition {
  key: string
  label: string
  kind: "server" | "client" | "link"
  endpoint?: string
  params?: Record<string, any>
  confirm?: string
  successToast?: string
  failureToast?: string
}
```

##### 8. 生成型 SDK（可选但强烈建议）

**目标**：基于 Manifest 自动生成类型安全的 SDK

**实现方案**：
```typescript
// 自动生成的类型
interface JobRecord {
  id: string
  props: {
    title: string
    salary: number
    city: string
  }
  company?: CompanyRecord
}

// 自动生成的 SDK
const jobs = await sdk.records.query({
  moduleKey: "jobs",
  filter: { "props.city": "Shanghai" }
})
```

##### 9. 事件总线（Schema/Data 变更感知）

**目标**：建立实时数据同步机制

**实现方案**：
```typescript
// 事件类型
type SchemaEvent = "schema.updated" | "index.built" | "relation.updated" | "record.changed"

// 事件订阅
eventBus.subscribe("schema.updated", (event) => {
  // 刷新缓存、重渲染
  refreshManifestCache(event.moduleKey)
})
```

#### 🧩 低优先级（可以稍后做，但方向要定）

##### 10. 卡片样式与数据绑定层（StyleConfig + Bindings）

**目标**：建立主题化的样式配置体系

**实现方案**：
```typescript
interface StyleConfig {
  theme: "default" | "dark" | "minimal"
  tokens: Record<string, string>
  bindings: {
    "card.title": "{{ props.title | truncate(20) }}"
    "card.subtitle": "{{ props.company.name }}"
  }
}
```

##### 11. 低代码计算（Adapter.compute 的安全沙箱）

**目标**：支持前端轻量级数据计算

**实现方案**：
```typescript
interface ComputeConfig {
  expressions: {
    displaySalary: "formatCurrency(props.salary)"
    experienceLevel: "props.experience > 5 ? 'senior' : 'junior'"
  }
  sandbox: {
    maxExecutionTime: 100
    maxMemoryUsage: 1024
    allowedFunctions: ["formatCurrency", "truncate"]
  }
}
```

##### 12. 数据导入/导出与校验（运营必备）

**目标**：支持批量数据操作

**实现方案**：
```typescript
// 导入接口
POST /import
{
  moduleKey: "jobs",
  format: "csv",
  mapping: { "职位": "props.title", "薪资": "props.salary" },
  data: "csv_content"
}

// 导出接口
GET /export?moduleKey=jobs&format=excel&select=["props.title","props.salary"]
```

### ⚙️ 推荐落地顺序（两周冲刺拆解）

#### 第 1-3 天
- Manifest/路由/响应头 X-Schema-Version
- 统一查询 DSL + select/include/sort/pageToken
- 基于 Manifest 的视图最小模型（list_default、detail_default）

#### 第 4-7 天
- `<CardContainer/>` + CardDefinition + AdapterConfig
- 字段级权限裁剪
- 首批 indexHints 生效（迁移 + 索引）

#### 第 8-10 天
- Actions 协议 + ActionRunner
- 事件 schema.updated → 前端热更新
- 生成型 SDK（或先放到下个迭代）

#### 第 11-14 天
- 性能压测与 explain 调优
- 视图版本与灰度
- 初版 StyleConfig/Bindings（先手动配置，不接 AI）

### 🧪 验收用例

1. **给"职位"新增字段 priority（枚举）**
   - Manifest + 视图更新；前端 0 改动出现新列和筛选

2. **把"薪资上限"设置为仅管理员可见**
   - 低权限用户响应体中该字段不存在；列表也不显示

3. **"职位列表"切换到卡片栅格视图**
   - 仅改视图配置，页面代码不改

4. **列表筛选按"城市+年限"组合**
   - 统一 DSL 请求稳定，响应 < 200ms

5. **破坏性变更（重命名 fieldId）演练**
   - 走 deprecated→replacementKey，前端出现提示但不崩

### 🎯 优化总结

通过实施上述优化方案，AINO-app 将成为一个真正的"配置即应用"平台，其中：

- **Manifest（契约）**：建立前后端统一的数据契约
- **查询协议（语言）**：提供标准化的数据访问接口
- **卡片容器/适配器（装配线）**：实现组件化的数据展示
- **权限裁剪（安全）**：确保数据安全访问
- **索引/物化（性能）**：保证系统高性能运行

这些改进将使系统具备强大的扩展性和维护性，为未来的 AI 集成和自动化配置奠定坚实基础。
