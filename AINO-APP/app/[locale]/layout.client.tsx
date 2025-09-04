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


const inter = Inter({ subsets: ["latin"] })

function DemoAwareBottomNavigation({ dict }: { dict: any }) {
  const pathname = usePathname()

  // 如果是Demo页面、PC页面或组件页面，不显示底部导航（这些页面有自己的专用导航或不需要导航）
  if (pathname.includes("/demo/") || pathname.includes("/pc") || pathname.includes("/components/")) {
    return null
  }

  return <BottomNavigation dict={dict} />
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
