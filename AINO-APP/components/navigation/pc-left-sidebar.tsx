"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutGrid, LayoutDashboard, MessageCircle, Search, User, Blocks, Navigation, Type, BarChart3, CreditCard, MessageSquare } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCardTheme } from "@/components/providers/card-theme-provider"
import { useFontSizePreset } from "@/hooks/use-font-size-config"
import { useMemo, useEffect } from "react"

// Helper to check if a color is dark
function isColorDark(hexColor: string): boolean {
  if (!hexColor.startsWith("#")) return false
  const color = hexColor.substring(1)
  const rgb = Number.parseInt(color, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luma < 128
}

interface PCLeftSidebarProps {
  dict: any
  locale: string
}

export function PCLeftSidebar({ dict, locale }: PCLeftSidebarProps) {
  const pathname = usePathname()
  const { theme } = useCardTheme()
  const { setPreset, current } = useFontSizePreset()

  // Suppress ResizeObserver errors
  useEffect(() => {
    const handleResizeObserverError = (e: ErrorEvent) => {
      if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
        e.stopImmediatePropagation()
      }
    }
    
    window.addEventListener('error', handleResizeObserverError)
    return () => window.removeEventListener('error', handleResizeObserverError)
  }, [])

  // Determine colors based on the card's background
  const isDark = isColorDark(theme.background)
  const activeBgColor = useMemo(() => {
    return isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)"
  }, [isDark])

  const navItems = [
    { href: "/pc", label: locale === 'zh' ? "首页" : "Home", icon: LayoutGrid },
    { href: "/pc/dashboard", label: locale === 'zh' ? "仪表板" : "Dashboard", icon: LayoutDashboard },
    { href: "/pc/chat", label: locale === 'zh' ? "聊天" : "Chat", icon: MessageCircle },
    { href: "/pc/components/basic", label: dict.mainPage?.basic || "Components", icon: Blocks },
    { href: "/pc/components/card", label: dict.mainPage?.card || "Cards", icon: CreditCard },
    { href: "/pc/profile", label: locale === 'zh' ? "个人资料" : "Profile", icon: User },
  ]

  const renderNavItem = (href: string, icon: any, label: string) => {
    const Icon = icon
    const fullHref = `/${locale}${href}`
    const isActive = pathname === fullHref || (href === "/pc" && pathname === `/${locale}/pc`)

    return (
      <div key={label} className="relative group">
        <Link href={fullHref}>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 flex items-center justify-center transition-all duration-200 rounded-xl group-hover:transform group-hover:scale-105"
            style={{
              backgroundColor: isActive ? activeBgColor : "transparent",
              color: isActive ? theme.titleColor : theme.textColor,
            }}
          >
            <Icon className="w-4 h-4" />
          </Button>
        </Link>
        
        {/* Custom tooltip */}
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
            {label}
          </div>
        </div>
      </div>
    )
  }

  // 胶囊模块的通用样式
  const capsuleModuleStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  }

  return (
    <div className="fixed left-0 top-0 h-full w-20 z-40 flex flex-col items-center py-6 px-3 justify-center">
    
      {/* 主导航胶囊模块 */}
      <div 
        className="flex flex-col items-center p-3 space-y-2 transition-transform duration-300 hover:scale-[1.02]"
        style={capsuleModuleStyle}
      >
        {/* Logo section */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3">
          <span className="text-white font-bold text-xs">iP</span>
        </div>

        {/* Navigation items */}
        {navItems.map(({ href, icon, label }) => 
          renderNavItem(href, icon, label)
        )}

        {/* Separator */}
        <div 
          className="w-6 h-px my-2"
          style={{
            backgroundColor: theme.textColor + '30',
          }}
        />

        {/* Font Size Selector */}
        <div className="relative group">
          <div className="flex flex-col items-center space-y-1">
            {[
              { key: 'small', icon: 'S', scale: 0.8 },
              { key: 'normal', icon: 'N', scale: 1.0 },
              { key: 'large', icon: 'L', scale: 1.2 }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setPreset(option.key as any)}
                className="w-6 h-6 text-xs font-bold rounded-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
                style={{
                  backgroundColor: current.current === option.key 
                    ? activeBgColor 
                    : 'transparent',
                  color: current.current === option.key 
                    ? theme.titleColor 
                    : theme.textColor,
                  border: current.current === option.key 
                    ? `1px solid ${theme.textColor}20` 
                    : 'none'
                }}
                title={`字体大小：${option.key === 'small' ? '小' : option.key === 'normal' ? '正常' : '大'} (${Math.round(option.scale * 100)}%)`}
              >
                {option.icon}
              </button>
            ))}
          </div>
          
          {/* Custom tooltip */}
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
              字体大小
            </div>
          </div>
        </div>

        {/* Mobile switch */}
        <div className="relative group">
          <Link href={`/${locale}`}>
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 flex items-center justify-center rounded-xl transition-all duration-200 group-hover:transform group-hover:scale-105"
              style={{
                color: theme.textColor,
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
            </Button>
          </Link>
          
          {/* Custom tooltip */}
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
              {locale === 'zh' ? "移动端" : "Mobile"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
