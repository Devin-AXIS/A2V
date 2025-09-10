"use client"

import React, { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter, useParams } from "next/navigation"
import { Search, Bell } from "lucide-react"

export type NavEventConfig = {
  action?: "navigate" | "switchTab"
  pageType?: "internal" | "external"
  page?: string
  url?: string
  tabKey?: string
  tabIndex?: number
  params?: string
}

export type ContentNavItem = {
  title: string
  image?: string
  event?: NavEventConfig
}

export type ContentNavConfig = {
  type: "iconText" | "text"
  layout?: "grid-4" | "grid-5" | "scroll"
  items: ContentNavItem[]
  header?: { title?: string; search?: boolean; notify?: boolean }
}

type Props = {
  config: ContentNavConfig
  className?: string
  onSwitchTab?: (payload: { tabKey?: string; tabIndex?: number; index: number }) => void
  activeIndex?: number // 受控激活索引（可选）
  disableNavigate?: boolean // 强制禁用内部导航，统一当作切换
}

export function ContentNavigation({ config, className, onSwitchTab, activeIndex: controlledIndex, disableNavigate }: Props) {
  const router = useRouter()
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || "zh"
  const [currentIndex, setCurrentIndex] = useState(controlledIndex ?? 0)

  // 同步外部受控索引
  useEffect(() => {
    if (typeof controlledIndex === 'number' && controlledIndex !== currentIndex) {
      setCurrentIndex(controlledIndex)
    }
  }, [controlledIndex])

  const cols = useMemo(() => (config.layout === "grid-5" ? 5 : 4), [config.layout])

  const handleClick = (idx: number, item: ContentNavItem) => {
    const ev = item?.event
    if (disableNavigate || !ev || !ev.action || ev.action === "switchTab") {
      setCurrentIndex(idx)
      onSwitchTab?.({ tabKey: ev?.tabKey, tabIndex: ev?.tabIndex, index: idx })
      return
    }
    if (ev.action === "navigate") {
      if (ev.pageType === "internal") {
        const page = ev.page || "home"
        const path = page.startsWith("p-") ? `/${locale}/p/${page.replace(/^p-/, "")}` : `/${locale}/${page.replace(/^\//, "")}`
        router.push(path)
      } else if (ev.pageType === "external" && ev.url) {
        try { window.open(ev.url, "_blank") } catch { location.href = ev.url }
      }
    }
  }

  if (!config || !Array.isArray(config.items) || config.items.length === 0) return null

  if (config.type === "text") {
    return (
      <div className={cn(
        "w-full rounded-2xl shadow-md backdrop-blur-md bg-white/60 dark:bg-neutral-900/30",
        className,
      )}>
        {/* Header with title and optional actions */}
        {(config.header?.title || config.header?.search || config.header?.notify) && (
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex-1" />
            <div className="text-base font-semibold select-none">{config.header?.title}</div>
            <div className="flex-1 flex items-center justify-end gap-2">
              {config.header?.search && (
                <button className="size-8 rounded-full flex items-center justify-center hover:bg-muted/70 text-muted-foreground" aria-label="search">
                  <Search className="w-4 h-4" />
                </button>
              )}
              {config.header?.notify && (
                <button className="size-8 rounded-full flex items-center justify-center hover:bg-muted/70 text-muted-foreground" aria-label="notify">
                  <Bell className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
        {/* Scrollable text tabs */}
        <div className="px-2 py-2 overflow-x-auto scrollbar-hide" style={{ background: 'white' }}>
          <div className="flex items-center gap-6 px-2 min-w-max">
            {config.items.map((it, idx) => (
              <button
                key={idx}
                className={cn(
                  "relative text-sm font-medium transition-colors pb-2",
                  idx === currentIndex ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => { setCurrentIndex(idx); onSwitchTab?.({ index: idx }) }}
              >
                {it.title || `Tab ${idx + 1}`}
                {idx === currentIndex && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-0.5 w-6 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // icon + text
  if (config.layout === "scroll") {
    return (
      <div className={cn("w-full rounded-xl bg-card text-card-foreground shadow-sm px-4 py-3", className)}>
        <div className="flex items-stretch gap-4 overflow-x-auto scrollbar-hide">
          {config.items.map((it, idx) => (
            <button key={idx} className="flex-shrink-0 w-20 flex flex-col items-center gap-2" onClick={() => handleClick(idx, it)}>
              <div className={cn("w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shadow-sm")}>
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt={it.title || "icon"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">img</span>
                )}
              </div>
              <div className={cn("text-xs", idx === currentIndex ? "text-primary" : "text-foreground")}>{it.title || `Item ${idx + 1}`}</div>
              {idx === currentIndex && <div className="h-0.5 w-6 rounded bg-primary" />}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // grid 4/5 with auto wrap
  return (
    <div className={cn("w-full rounded-xl bg-card text-card-foreground shadow-sm px-4 py-4", className)}>
      <div className={cn("grid gap-4", cols === 5 ? "grid-cols-5" : "grid-cols-4")}>
        {config.items.map((it, idx) => (
          <button key={idx} className="flex flex-col items-center gap-2" onClick={() => handleClick(idx, it)}>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shadow-sm">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt={it.title || "icon"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">img</span>
              )}
            </div>
            <div className={cn("text-xs", idx === currentIndex ? "text-primary" : "text-foreground")}>{it.title || `Item ${idx + 1}`}</div>
            {idx === currentIndex && <div className="h-0.5 w-6 rounded bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ContentNavigation


