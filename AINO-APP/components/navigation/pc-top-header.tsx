"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "@/components/theme/language-switcher"
// 颜色配置已整合到统一主题系统
import { Button } from "@/components/ui/button"
import { Bell, Settings, User, Home, Layout } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface PCTopHeaderProps {
  dict: any
  locale: string
}

export function PCTopHeader({ dict, locale }: PCTopHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 h-16 flex items-center justify-between px-6 transition-all duration-300",
        {
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 shadow-sm":
            isScrolled,
          "bg-transparent": !isScrolled,
        },
      )}
    >
      <div className="flex items-center space-x-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {locale === "zh" ? "iPollo PC 组件库" : "iPollo PC Components"}
        </h1>

        {/* 导航链接 */}
        <nav className="flex items-center space-x-4">
          <Link href={`/${locale}/pc`}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                pathname === `/${locale}/pc`
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              <Home className="w-4 h-4" />
              <span>{locale === "zh" ? "首页" : "Home"}</span>
            </Button>
          </Link>

          <Link href={`/${locale}/pc/custom`}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                pathname === `/${locale}/pc/custom`
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              <Layout className="w-4 h-4" />
              <span>{locale === "zh" ? "自定义页面" : "Custom Page"}</span>
            </Button>
          </Link>
        </nav>
      </div>

      {/* Right side - Actions and theme controls */}
      <div className="flex items-center space-x-2">
        {/* Theme Controls */}
        <div className="flex items-center space-x-1 mr-4">
          <LanguageSwitcher />
          {/* 颜色配置已整合到统一主题系统 */}
        </div>

        {/* Action Buttons */}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-10 h-10 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-10 h-10 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-10 h-10 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50"
        >
          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Button>
      </div>
    </header>
  )
}
