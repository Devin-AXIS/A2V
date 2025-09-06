"use client"

import React, { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter, useParams } from "next/navigation"

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
}

type Props = {
  config: ContentNavConfig
  className?: string
  onSwitchTab?: (payload: { tabKey?: string; tabIndex?: number; index: number }) => void
}

export function ContentNavigation({ config, className, onSwitchTab }: Props) {
  const router = useRouter()
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || "zh"
  const [activeIndex, setActiveIndex] = useState(0)

  const cols = useMemo(() => (config.layout === "grid-5" ? 5 : 4), [config.layout])

  const handleClick = (idx: number, item: ContentNavItem) => {
    const ev = item?.event
    if (!ev || !ev.action || ev.action === "switchTab") {
      setActiveIndex(idx)
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
      <div className={cn("w-full border-b border-border bg-background", className)}>
        <div className={cn("flex items-center justify-between px-4 py-3", cols === 5 ? "gap-2" : "gap-3")}>          
          {config.items.map((it, idx) => (
            <button
              key={idx}
              className={cn(
                "text-sm font-medium transition-colors",
                idx === activeIndex ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleClick(idx, it)}
            >
              {it.title || `Tab ${idx + 1}`}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // icon + text
  if (config.layout === "scroll") {
    return (
      <div className={cn("w-full px-4 py-3", className)}>
        <div className="flex items-stretch gap-4 overflow-x-auto scrollbar-hide">
          {config.items.map((it, idx) => (
            <button key={idx} className="flex-shrink-0 w-20 flex flex-col items-center gap-2" onClick={() => handleClick(idx, it)}>
              <div className={cn("w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden")}>                
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt={it.title || "icon"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">img</span>
                )}
              </div>
              <div className={cn("text-xs", idx === activeIndex ? "text-primary" : "text-foreground")}>{it.title || `Item ${idx + 1}`}</div>
              {idx === activeIndex && <div className="h-0.5 w-6 rounded bg-primary" />}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // grid 4/5 with auto wrap
  return (
    <div className={cn("w-full px-4 py-4", className)}>
      <div className={cn("grid gap-4", cols === 5 ? "grid-cols-5" : "grid-cols-4")}>        
        {config.items.map((it, idx) => (
          <button key={idx} className="flex flex-col items-center gap-2" onClick={() => handleClick(idx, it)}>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt={it.title || "icon"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">img</span>
              )}
            </div>
            <div className={cn("text-xs", idx === activeIndex ? "text-primary" : "text-foreground")}>{it.title || `Item ${idx + 1}`}</div>
            {idx === activeIndex && <div className="h-0.5 w-6 rounded bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ContentNavigation


