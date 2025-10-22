"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutGrid, LayoutDashboard, MessageCircle, Search, User, Home, Settings, Bell, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppCard } from "@/components/layout/app-card"
import { useCardTheme } from "@/components/providers/card-theme-provider"
import { FontSizeToggleIcon } from "@/components/theme/font-size-toggle-button"
import { useMemo } from "react"

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

type NavItemInput = { href: string; label: string; icon?: React.ComponentType<any>; iconName?: string }

interface BottomNavigationProps {
  dict?: {
    browseComponents: string
    dashboard: string
    chat: string
    search: string
    profile: string
  }
  items?: NavItemInput[]
}

export function BottomNavigation({ dict, items }: BottomNavigationProps) {
  const pathname = usePathname()
  const { theme } = useCardTheme()
  const locale = pathname.split("/")[1]
  const isChatPage = pathname.endsWith("/chat")

  // Determine a good highlight color based on the card's background
  const activeBgColor = useMemo(() => {
    return isColorDark(theme.background) ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
  }, [theme.background])

  if (isChatPage) {
    return null
  }

  const fallbackDict = {
    browseComponents: "组件",
    dashboard: "仪表板",
    chat: "AI",
    search: "搜索",
    profile: "我的",
  }
  const D = dict || fallbackDict

  const defaultItems: NavItemInput[] = [
    { href: "/", label: D.browseComponents, icon: LayoutGrid },
    { href: "/dashboard", label: D.dashboard, icon: LayoutDashboard },
    { href: "/chat", label: D.chat, icon: MessageCircle },
    { href: "/search", label: D.search, icon: Search },
    { href: "/profile", label: D.profile, icon: User },
  ]

  // 优先级：props.items > 全局配置(APP_GLOBAL_CONFIG.nav) > 兼容(CURRENT_APP_NAV_ITEMS) > 默认(仅非预览/非App运行时)
  // 预览页和 App 运行时没有配置时不展示底部导航（保持原有行为）
  const isPreviewOrApp = pathname.includes('/preview/') || pathname.includes('/app/')
  let navItems: NavItemInput[] = []
  if (items && items.length > 0) {
    navItems = items
  } else {
    try {
      if (typeof window !== 'undefined') {
        const rawGlobal = localStorage.getItem('APPLICATION_CONFIG')
        if (rawGlobal) {
          const cfg = JSON.parse(rawGlobal)
          const nav = Array.isArray(cfg?.config?.clientManifest?.app?.bottomNav) ? cfg.config.clientManifest.app.bottomNav : []
          if (nav.length > 0) {
            navItems = nav
              .filter((i: any) => i?.visible !== false)
              .map((i: any) => ({ href: i.route || '/', label: (i.label?.[locale] || i.label?.zh || i.label?.en || i.id || ''), iconName: i.icon || 'grid' }))
          }
        }
        if (navItems.length === 0) {
          const rawLegacy = localStorage.getItem('CURRENT_APP_NAV_ITEMS')
          if (rawLegacy) {
            const legacy = JSON.parse(rawLegacy)
            if (Array.isArray(legacy) && legacy.length > 0) {
              navItems = legacy
                .filter((i: any) => i && (i.visible !== false))
                .map((i: any) => {
                  let href = i.route || i.href || '/'
                  if (href === '/me') href = '/profile'
                  return { href, label: i.label || i.key || '', iconName: i.icon || i.iconName }
                })
            }
          }
        }
      }
    } catch { }
  }

  if (navItems.length === 0 && !isPreviewOrApp) {
    navItems = defaultItems
  }

  if (navItems.length === 0) {
    return null
  }

  const profileItem = navItems.find(item => item.href === "/profile");
  navItems[1] = {
    href: "/jobs",
    iconName: "grid",
    label: "",
  }
  navItems.push(profileItem)

  const iconMap: Record<string, React.ComponentType<any>> = {
    home: Home,
    user: User,
    profile: User,
    search: Search,
    dashboard: LayoutDashboard,
    grid: LayoutGrid,
    menu: LayoutGrid,
    chat: MessageCircle,
    message: MessageCircle,
    settings: Settings,
    bell: Bell,
    star: Star,
    heart: Heart,
  }

  const hrefQs = typeof window !== 'undefined' ? localStorage.getItem('QUERY_STRING') : null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <AppCard className="px-4 py-1">
        <div className="flex items-center space-x-2 md:space-x-3">
          {navItems.map(({ href, icon: Icon, iconName, label }, index) => {
            // 特殊处理预览页面，确保包含必要的参数
            let fullHref = `/${locale}${href === "/" ? "" : href}`
            if (href === "/preview") {
              // 对于预览页面，优先使用当前页面的参数
              const currentUrl = typeof window !== 'undefined' ? window.location.search : ''
              const currentParams = new URLSearchParams(currentUrl)
              const cfgId = currentParams.get('cfgId')
              const previewId = currentParams.get('previewId')
              const appId = currentParams.get('appId')
              const mainPath = window.localStorage.getItem('MAIN_PATH')

              if (cfgId) {
                // 如果有 cfgId，使用 cfgId 参数
                fullHref = `/${locale}/preview?cfgId=${cfgId}&device=mobile&isEdite=true`
              } else if (previewId && appId) {
                // 否则使用存储的预览参数
                fullHref = `/${locale}/preview?previewId=${previewId}&device=mobile&appId=${appId}`
              } else if (mainPath) {
                // 如果没有预览参数，回退到首页
                fullHref = mainPath
              } else {
                // 如果没有预览参数，回退到首页
                fullHref = `/${locale}`
              }
            } else {
              fullHref += hrefQs || ""
            }
            const isActive = pathname === fullHref || (href === "/" && pathname === `/${locale}`)
            const IconComp = Icon ?? (iconName ? iconMap[iconName] : undefined) ?? LayoutGrid

            const jump = () => {
              window.location.href = fullHref
            }

            return (
              // <Link href={fullHref} key={`${label}-${index}-${href}`}>
              <Button
                onClick={jump}
                variant="ghost"
                className="rounded-2xl w-12 h-12 flex flex-col items-center justify-center transition-all duration-300 group"
                style={{
                  backgroundColor: isActive ? activeBgColor : "transparent",
                }}
              >
                <IconComp
                  className="w-6 h-6 transition-colors"
                  style={{
                    color: theme.fontColor,
                    opacity: isActive ? 1 : 0.7,
                  }}
                />
                <span className="sr-only">{label}</span>
              </Button>
              // </Link>
            )
          })}

          {/* 字体大小切换按钮 */}
          {/* <div className="border-l border-gray-200/30 pl-2">
            <FontSizeToggleIcon />
          </div> */}
        </div>
      </AppCard>
    </div>
  )
}
