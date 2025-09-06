"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DynamicPageComponent } from "@/components/dynamic-page/dynamic-page-component"
import type { ContentNavConfig } from "@/components/navigation/content-navigation"

export default function MobileDynamicPage() {
  const params = useParams<{ locale: string; id: string }>()
  const sp = useSearchParams()
  const locale = params?.locale || "zh"
  const id = params?.id || "unknown"

  // 兼容：若配置层写入 APP_PAGE_{id}，我们尝试作为种子初始化 DynamicPageComponent 的本地布局
  const storageKey = useMemo(() => `dynamic_page_layout_p-${id}_${locale}`,[id, locale])
  const appPageKey = useMemo(() => `APP_PAGE_${id}`,[id])
  const [pageMeta, setPageMeta] = useState<{ title?: any; layout?: string; route?: string; options?: any; contentNav?: ContentNavConfig } | null>(null)

  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      // 优先读取 Studio 传入的 pageCfg 参数
      const cfgStr = sp?.get('pageCfg')
      if (cfgStr) {
        try {
          const cfg = JSON.parse(cfgStr)
          const defaultOptions = { showHeader: true, showBottomNav: false, showBack: false }
          const mergedOptions = { ...defaultOptions, ...(cfg?.options || {}) }
          // 写入按ID的页面配置
          localStorage.setItem(appPageKey, JSON.stringify({ ...cfg, options: mergedOptions }))
          // 写入按路由的页面配置，供底部导航判断显示/隐藏
          const routeKey = `/p-${id}`
          localStorage.setItem(`APP_PAGE_ROUTE_${routeKey}`, JSON.stringify({ ...cfg, options: mergedOptions }))
          setPageMeta({ title: cfg?.title, layout: cfg?.layout, route: cfg?.route, options: mergedOptions, contentNav: cfg?.contentNav })
        } catch {}
      }
      const raw = localStorage.getItem(appPageKey)
      if (raw) {
        const page = JSON.parse(raw)
        const defaultOptions = { showHeader: true, showBottomNav: false, showBack: false }
        const mergedOptions = { ...defaultOptions, ...(page?.options || {}) }
        setPageMeta({ title: page?.title, layout: page?.layout, route: page?.route, options: mergedOptions, contentNav: page?.contentNav })
      }

      // Seed initial layout only when not present
      const existing = localStorage.getItem(storageKey)
      if (!existing && raw) {
        const page = JSON.parse(raw)
        const cards = Array.isArray(page?.cards) ? page.cards : []
        const payload = { cards: cards.map((t: any) => (typeof t === 'string' ? { type: t } : { type: t?.type || t })), themes: {}, updatedAt: Date.now() }
        localStorage.setItem(storageKey, JSON.stringify(payload))
      }
    } catch {}
    setSeeded(true)
  }, [storageKey, appPageKey, sp, id])

  // category 采用 p-{id}，保证各页布局隔离
  const category = useMemo(() => `p-${id}`,[id])

  const topTabsConfig = pageMeta?.contentNav?.type === 'text' ? pageMeta?.contentNav : null
  const contentNavConfig = pageMeta?.contentNav?.type === 'iconText' ? pageMeta?.contentNav : null

  if (!seeded) return null
  return (
    <main className="min-h-[100dvh] bg-transparent">
      <DynamicPageComponent
        category={category}
        locale={locale}
        layout="mobile"
        showHeader={pageMeta?.options?.showHeader}
        showBottomNav={pageMeta?.options?.showBottomNav}
        headerTitle={(() => {
          const t = pageMeta?.title
          if (!t) return undefined
          if (typeof t === 'string') return t
          const locales = t as any
          return (locale === 'zh' ? locales.zh : locales.en) || locales.zh || locales.en
        })()}
        showBack={pageMeta?.options?.showBack}
        aiOpsUrl={pageMeta?.options?.aiOpsUrl}
        aiOpsLabel={pageMeta?.options?.aiOpsLabel}
        topTabsConfig={topTabsConfig as any}
        contentNavConfig={contentNavConfig as any}
      />
    </main>
  )
}


