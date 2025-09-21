"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export type BottomNavItem = { key: string; label: string; route: string; icon?: React.ReactNode }

export function DynamicBottomNav({ items }: { items: BottomNavItem[] }) {
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "zh"

  if (!items || items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 h-14 border-t bg-white/90 backdrop-blur">
      <div className="h-full max-w-md mx-auto grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((it) => {
          const href = `/${locale}${it.route.startsWith("/") ? it.route : `/${it.route}`}`
          const isActive = pathname === href
          return (
            <Link key={it.key} href={href} className="flex flex-col items-center justify-center text-xs">
              <div className={`w-1.5 h-1.5 rounded-full mb-1 ${isActive ? 'bg-black' : 'bg-gray-300'}`} />
              <span className={isActive ? "text-gray-900" : "text-gray-500"}>{it.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
