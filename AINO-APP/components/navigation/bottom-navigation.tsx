"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutGrid, LayoutDashboard, MessageCircle, Search, User } from "lucide-react"
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

type NavItemInput = { href: string; label: string; icon?: React.ComponentType<any> }

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

  const navItems: NavItemInput[] = items && items.length > 0 ? items : defaultItems

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <AppCard className="px-4 py-1">
        <div className="flex items-center space-x-2 md:space-x-3">
          {navItems.map(({ href, icon: Icon, label }) => {
            const fullHref = `/${locale}${href === "/" ? "" : href}`
            const isActive = pathname === fullHref || (href === "/" && pathname === `/${locale}`)
            const IconComp = Icon ?? LayoutGrid

            return (
              <Link href={fullHref} key={label}>
                <Button
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
              </Link>
            )
          })}
          
          {/* 字体大小切换按钮 */}
          <div className="border-l border-gray-200/30 pl-2">
            <FontSizeToggleIcon />
          </div>
        </div>
      </AppCard>
    </div>
  )
}
