import { getDictionary, type Locale } from "@/lib/dictionaries"
import { AppCard } from "@/components/layout/app-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Blocks, Navigation, Type, BarChart3, CreditCard, MessageSquare, Palette, Monitor, Smartphone, TrendingUp, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function PCHomePage({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  const categories = [
    {
      title: dict.mainPage?.basic || "Basic Components",
      description: locale === 'zh' ? "按钮、输入框、标签等基础UI组件" : "Buttons, inputs, badges and other basic UI components",
      icon: Blocks,
      href: `/pc/components/basic`,
      count: 12,
      color: "bg-blue-500"
    },
    {
      title: dict.mainPage?.navigation || "Navigation",
      description: locale === 'zh' ? "导航栏、标签页、面包屑等导航组件" : "Navigation bars, tabs, breadcrumbs and other navigation components",
      icon: Navigation,
      href: `/pc/components/navigation`,
      count: 8,
      color: "bg-green-500"
    },
    {
      title: dict.mainPage?.input || "Input Components",
      description: locale === 'zh' ? "表单输入、选择器、上传等输入组件" : "Form inputs, selectors, uploaders and other input components",
      icon: Type,
      href: `/pc/components/input`,
      count: 15,
      color: "bg-purple-500"
    },
    {
      title: dict.mainPage?.dataDisplay || "Data Display",
      description: locale === 'zh' ? "图表、表格、统计等数据展示组件" : "Charts, tables, statistics and other data display components",
      icon: BarChart3,
      href: `/pc/components/data-display`,
      count: 20,
      color: "bg-orange-500"
    },
    {
      title: dict.mainPage?.card || "Card Components",
      description: locale === 'zh' ? "各种样式和用途的卡片组件" : "Various styles and purposes of card components",
      icon: CreditCard,
      href: `/pc/components/card`,
      count: 25,
      color: "bg-pink-500"
    },
    {
      title: dict.mainPage?.feedback || "Feedback",
      description: locale === 'zh' ? "提示、弹窗、加载等反馈组件" : "Alerts, modals, loading and other feedback components",
      icon: MessageSquare,
      href: `/pc/components/feedback`,
      count: 10,
      color: "bg-red-500"
    }
  ]

  const stats = [
    {
      title: locale === 'zh' ? "总组件数" : "Total Components",
      value: "90+",
      icon: Blocks,
      color: "text-blue-600"
    },
    {
      title: locale === 'zh' ? "主题配置" : "Theme Options",
      value: "12",
      icon: Palette,
      color: "text-purple-600"
    },
    {
      title: locale === 'zh' ? "响应式支持" : "Responsive",
      value: "100%",
      icon: Monitor,
      color: "text-green-600"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <Badge variant="secondary" className="px-4 py-2">
            {locale === 'zh' ? "🚀 PC端组件库" : "🚀 PC Component Library"}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {locale === 'zh' ? "现代化桌面端UI组件库" : "Modern Desktop UI Component Library"}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {locale === 'zh' 
              ? "专为桌面端设计的现代化组��库，提供丰富的UI组件、主题定制和响应式设计支持"
              : "Modern component library designed for desktop applications, providing rich UI components, theme customization and responsive design support"
            }
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg" className="px-8">
            <Link href={`/${locale}/pc/components/basic`}>
              {locale === 'zh' ? "开始使用" : "Get Started"}
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8" asChild>
            <Link href={`/${locale}`}>
              <Smartphone className="w-4 h-4 mr-2" />
              {locale === 'zh' ? "移动端版本" : "Mobile Version"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <AppCard key={index} className="p-6 text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${stat.color.replace('text-', 'bg-').replace('-600', '-100')} dark:${stat.color.replace('text-', 'bg-').replace('-600', '-900')}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {stat.title}
            </div>
          </AppCard>
        ))}
      </div>

      {/* Theme Configuration */}
      <AppCard className="p-8">
        <div className="flex items-start space-x-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {locale === 'zh' ? "实时主题定制" : "Real-time Theme Customization"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              {locale === 'zh' 
                ? "使用顶部工具栏的配置按钮，实时调整界面主题。所有更改立即生效，让您轻松找到完美的视觉风格。"
                : "Use the configuration buttons in the top toolbar to adjust interface themes in real-time. All changes take effect immediately, helping you easily find the perfect visual style."
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {locale === 'zh' ? "背景渐变" : "Background Gradient"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {locale === 'zh' ? "自定义颜色" : "Custom Colors"}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {locale === 'zh' ? "卡片主题" : "Card Theme"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {locale === 'zh' ? "样式选择" : "Style Options"}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {locale === 'zh' ? "图表配色" : "Chart Colors"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {locale === 'zh' ? "数据可视化" : "Data Visualization"}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {locale === 'zh' ? "语言切换" : "Language Switch"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {locale === 'zh' ? "中英文支持" : "CN/EN Support"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      {/* Component Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {locale === 'zh' ? "组件分类" : "Component Categories"}
          </h2>
          <Badge variant="outline">
            {locale === 'zh' ? "90+ 组件" : "90+ Components"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link key={index} href={`/${locale}${category.href}`}>
              <AppCard className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </div>
              </AppCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AppCard className="p-6 text-center">
          <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {locale === 'zh' ? "高性能" : "High Performance"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {locale === 'zh' 
              ? "优化的组件架构，确保流畅的用户体验"
              : "Optimized component architecture ensuring smooth user experience"
            }
          </p>
        </AppCard>

        <AppCard className="p-6 text-center">
          <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {locale === 'zh' ? "易于使用" : "Easy to Use"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {locale === 'zh' 
              ? "直观的API设计，快速上手和集成"
              : "Intuitive API design for quick onboarding and integration"
            }
          </p>
        </AppCard>

        <AppCard className="p-6 text-center">
          <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {locale === 'zh' ? "现代化" : "Modern"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {locale === 'zh' 
              ? "采用最新的设计趋势和技术标准"
              : "Built with latest design trends and technical standards"
            }
          </p>
        </AppCard>
      </div>
    </div>
  )
}
