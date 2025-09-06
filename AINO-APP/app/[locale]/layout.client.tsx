"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { UnifiedProvider } from "@/components/providers/unified-provider"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { MobileUnifiedConfig } from "@/components/theme/mobile-unified-config"
import { cn } from "@/lib/utils"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import type { Locale } from "@/lib/dictionaries"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"


const inter = Inter({ subsets: ["latin"] })

function DemoAwareBottomNavigation({ dict }: { dict: any }) {
  const pathname = usePathname()
  const [items, setItems] = useState<any[] | null>(null)

  useEffect(() => {
    try {
      // 优先读取页面级别配置（由 Studio 以 pageCfg 或本地存储写入）
      const route = "/" + (pathname?.split("/").slice(2).join("/") || "")
      const rawPage = localStorage.getItem(`APP_PAGE_ROUTE_${route}`)
      if (rawPage) {
        const cfg = JSON.parse(rawPage)
        const wantHide = cfg?.options?.showBottomNav === false
        if (wantHide) { setItems(null); return }
      }
      // 优先使用全局配置 APP_GLOBAL_CONFIG.nav，其次兼容旧的 CURRENT_APP_NAV_ITEMS
      const rawGlobal = localStorage.getItem('APP_GLOBAL_CONFIG')
      if (rawGlobal) {
        const cfg = JSON.parse(rawGlobal)
        if (Array.isArray(cfg?.nav) && cfg.nav.length > 0) {
          setItems(cfg.nav)
          return
        }
      }
      const rawLegacy = localStorage.getItem('CURRENT_APP_NAV_ITEMS')
      if (rawLegacy) setItems(JSON.parse(rawLegacy))
      else setItems(null)
    } catch { setItems(null) }
  }, [pathname])

  // 如果是Demo页面、PC页面或组件页面，不显示底部导航（这些页面有自己的专用导航或不需要导航）
  if (pathname.includes("/demo/") || pathname.includes("/pc") || pathname.includes("/components/") || pathname.includes("/preview/") || pathname.includes("/auth/")) {
    return null
  }

  return <BottomNavigation dict={dict} items={items || undefined} />
}

export function LayoutClient({
  children,
  dict,
  locale,
}: Readonly<{
  children: React.ReactNode
  dict: any
  locale: Locale
}>) {
  return (
    <div className={cn("min-h-screen font-sans antialiased", inter.className)}>
      <UnifiedProvider locale={locale} dict={dict}>
        <div className="relative min-h-screen overflow-hidden">
          <DynamicBackground />
          <main className="relative z-10">{children}</main>
          <DemoAwareBottomNavigation dict={dict.bottomNav} />
          <MobileUnifiedConfig />
        </div>
      </UnifiedProvider>
    </div>
  )
}
