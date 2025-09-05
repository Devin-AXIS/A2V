import { LayoutGrid, Grid3x3, List, ImageIcon, RectangleHorizontal, MessageSquare, Monitor, Smartphone } from 'lucide-react'
import { CategoryCard } from "@/components/browser/category-card"
import Link from "next/link"
import { getDictionary, type Locale } from "@/lib/dictionaries"

export default async function PCComponentsBrowserPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const mainPageDict = dict.mainPage

  const componentCategories = [
    { name: mainPageDict.basic, icon: LayoutGrid, href: `/pc/${locale}/components/basic` },
    { name: mainPageDict.navigation, icon: Grid3x3, href: `/pc/${locale}/components/navigation` },
    { name: mainPageDict.input, icon: List, href: `/pc/${locale}/components/input` },
    { name: mainPageDict.dataDisplay, icon: ImageIcon, href: `/pc/${locale}/components/data-display` },
    { name: mainPageDict.card, icon: RectangleHorizontal, href: `/pc/${locale}/components/card` },
    { name: mainPageDict.feedback, icon: MessageSquare, href: `/pc/${locale}/components/feedback` },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* PC Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Monitor className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">
                  <span className="text-blue-500">AI</span> Design PC
                </h1>
              </div>
              <div className="hidden md:block h-6 w-px bg-gray-300" />
              <p className="hidden md:block text-sm text-gray-600">{mainPageDict.description}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href={`/${locale}`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>移动端</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">组件库</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            探索我们精心设计的组件集合，为您的PC应用程序提供现代化的用户界面解决方案
          </p>
        </div>

        {/* Component Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {componentCategories.map((category) => (
            <Link href={category.href} key={category.name} className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-white/20">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors">
                  <category.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">
                  查看 {category.name.toLowerCase()} 相关的组件示例
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">响应式设计</h3>
            <p className="text-gray-600 mb-4">
              所有组件都经过精心设计，确保在不同屏幕尺寸下都能完美显示，从桌面到平板电脑。
            </p>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">桌面优化</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">平板适配</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">主题定制</h3>
            <p className="text-gray-600 mb-4">
              支持深色/浅色主题切换，以及自定义颜色方案，让您的应用程序与品牌保持一致。
            </p>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">主题切换</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">颜色定制</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              <Link href="#" className="text-blue-600 hover:text-blue-700">
                {mainPageDict.serviceAgreement}
              </Link>
            </p>
            <p className="text-sm text-gray-600">{mainPageDict.privacyNotice}</p>
            <p className="text-xs text-gray-500 pt-2">
              Copyright © 1998 - 2025 iPollo. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
