"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "@/components/theme/language-switcher"
// 颜色配置已整合到统一主题系统
import { Button } from "@/components/ui/button"
import { Bell, Settings, User, Home, Layout } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CardRegistry } from "@/components/card/registry"

interface PCTopHeaderProps {
  dict: any
  locale: string
}

export function PCTopHeader({ dict, locale }: PCTopHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [pcTopNav, setPcTopNav] = useState<any[]>([])
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 获取PC顶部导航配置
  const loadPcTopNavConfig = () => {
    try {
      if (typeof window === 'undefined') return
      
      // 尝试从多个可能的localStorage key读取配置
      const possibleKeys = [
        'CURRENT_APP_CONFIG',
        'APPLICATION_CONFIG',
        // 从URL参数获取appId，构建studio配置key
        ...(window.location.search ? [() => {
          const urlParams = new URLSearchParams(window.location.search)
          const appId = urlParams.get('appId')
          return appId ? `STUDIO_CLIENT_CFG_${appId}` : null
        }] : [])
      ]
      
      let config = null
      for (const key of possibleKeys) {
        const keyValue = typeof key === 'function' ? key() : key
        if (keyValue) {
          const stored = localStorage.getItem(keyValue)
          if (stored) {
            config = JSON.parse(stored)
            break
          }
        }
      }
      
      if (config) {
        setPcTopNav(config.app?.pcTopNav || [])
      }
    } catch {
      setPcTopNav([])
    }
  }

  useEffect(() => {
    loadPcTopNavConfig()
    
    // 监听localStorage变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes('STUDIO_CLIENT_CFG_') || e.key === 'CURRENT_APP_CONFIG' || e.key === 'APPLICATION_CONFIG')) {
        loadPcTopNavConfig()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // 定期检查配置变化（用于同窗口内的变化）
    const interval = setInterval(loadPcTopNavConfig, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
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
        {/* 动态导航链接 */}
        <nav className="flex items-center space-x-4">
          {pcTopNav.map((item: any) => (
            <Button
              key={item.key}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Layout className="w-4 h-4" />
              <span>{item.label}</span>
            </Button>
          ))}
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
