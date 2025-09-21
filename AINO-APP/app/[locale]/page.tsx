import {
  LayoutGrid,
  Grid3x3,
  List,
  ImageIcon,
  RectangleHorizontal,
  MessageSquare,
  Monitor,
  Layers,
} from "lucide-react"
import { MaybeHeader } from "@/components/layout/maybe-header"
import { CategoryCard } from "@/components/browser/category-card"
import { AppCard } from "@/components/layout/app-card"
import Link from "next/link"
import { getDictionary } from "@/lib/dictionaries"
import type { Locale } from "@/lib/dictionaries"
import { Button } from "@/components/ui/button"

export default async function ComponentsBrowserPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const mainPageDict = dict.mainPage

  const componentCategories = [
    { name: mainPageDict.basic, icon: LayoutGrid, href: `/${locale}/components/basic` },
    { name: mainPageDict.navigation, icon: Grid3x3, href: `/${locale}/components/navigation` },
    { name: mainPageDict.input, icon: List, href: `/${locale}/components/input` },
    { name: mainPageDict.dataDisplay, icon: ImageIcon, href: `/${locale}/components/data-display` },
    { name: mainPageDict.card, icon: RectangleHorizontal, href: `/${locale}/components/card` },
    { name: mainPageDict.feedback, icon: MessageSquare, href: `/${locale}/components/feedback` },
    { name: locale === "en" ? "Card Library" : "卡片库", icon: Layers, href: `/${locale}/components/cards` },
  ]

  return (
    <div className="min-h-screen pb-32">
      <MaybeHeader title={dict.browserHeader.title} />

      {/* PC版本入口 */}
      <div className="px-4 pt-4">
        <AppCard className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 mb-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {locale === "en" ? "PC Version Available" : "PC版本可用"}
                </h3>
                <p className="text-sm text-gray-600">
                  {locale === "en" ? "Experience the desktop-optimized interface" : "体验专为桌面端优化的界面"}
                </p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link href={`/${locale}/pc`}>
                {locale === "en" ? "Access PC Version" : "访问PC版"}
              </Link>
            </Button>
          </div>
        </AppCard>


        {/* 实例demo入口区域 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {locale === "en" ? "Demo Examples" : "实例Demo展示"}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {/* 教育应用demo入口 */}
            <AppCard className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {locale === "en" ? "Education Application" : "教育应用"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {locale === "en" ? "Online learning platform and education management system" : "在线学习平台和教育管理系统"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                  asChild
                >
                  <Link href={`/${locale}/demo/education`}>
                    {locale === "en" ? "View Demo" : "查看Demo"}
                  </Link>
                </Button>
              </div>
            </AppCard>

          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-blue-500">AI</span> Design
            </h1>
            <p className="text-sm text-gray-500 mt-1">{mainPageDict.description}</p>
          </div>
        </div>

        <div className="space-y-8">
          {componentCategories.map((category) => (
            <Link href={category.href} key={category.name}>
              <CategoryCard name={category.name} icon={category.icon} />
            </Link>
          ))}
        </div>
      </div>
      <footer className="text-center text-xs text-gray-400 mt-12 px-4 space-y-1">
        <p>
          <Link href="#" className="text-blue-600">
            {mainPageDict.serviceAgreement}
          </Link>
        </p>
        <p>{mainPageDict.privacyNotice}</p>
        <p className="pt-2">Copyright © 1998 - 2025 iPollo. All Rights Reserved.</p>
      </footer>
    </div>
  )
}
