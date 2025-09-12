"use client"

import { useParams, useSearchParams } from "next/navigation"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { useEffect, useMemo, useState } from "react"
import { DynamicPageComponent } from "@/components/dynamic-page/dynamic-page-component"
import type { ContentNavConfig } from "@/components/navigation/content-navigation"
import { setDatas } from "@/components/card/set-datas"

export default function MobileDynamicPage() {
  const params = useParams<{ locale: string; id: string }>()
  const sp = useSearchParams()
  const locale = params?.locale || "zh"
  const id = params?.id || "unknown"

  // 兼容：若配置层写入 APP_PAGE_{id}，我们尝试作为种子初始化 DynamicPageComponent 的本地布局
  const storageKey = useMemo(() => `dynamic_page_layout_p-${id}_${locale}`, [id, locale])
  const appPageKey = useMemo(() => `APP_PAGE_${id}`, [id])
  const [pageMeta, setPageMeta] = useState<{ title?: any; layout?: string; route?: string; options?: any; contentNav?: ContentNavConfig; topBar?: any; tabContent?: any } | null>(null)

  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    // 同步 preview 的数据源选择应用逻辑
    try { setDatas() } catch { }
  }, [])

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      // 优先读取 Studio 传入的配置：pageCfg（直接JSON）或 cfgId（后端存储ID）
      const cfgStr = sp?.get('pageCfg')
      const cfgId = sp?.get('cfgId')
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
          setPageMeta({ title: cfg?.title, layout: cfg?.layout, route: cfg?.route, options: mergedOptions, contentNav: cfg?.contentNav, topBar: cfg?.topBar, tabContent: cfg?.tabContent })
        } catch { }
      } else if (cfgId) {
        (async () => {
          try {
            const res = await fetch(`http://localhost:3007/api/page-configs/${encodeURIComponent(cfgId)}`)
            const j = await res.json().catch(() => null)
            const data = j && (j.data ?? j)
            if (res.ok && data) {
              const defaultOptions = { showHeader: true, showBottomNav: false, showBack: false }
              const mergedOptions = { ...defaultOptions, ...(data?.options || {}) }
              localStorage.setItem(appPageKey, JSON.stringify({ ...data, options: mergedOptions }))
              const routeKey = `/p-${id}`
              localStorage.setItem(`APP_PAGE_ROUTE_${routeKey}`, JSON.stringify({ ...data, options: mergedOptions }))
              setPageMeta({ title: data?.title, layout: data?.layout, route: data?.route, options: mergedOptions, contentNav: data?.contentNav, topBar: data?.topBar, tabContent: data?.tabContent })
            }
          } catch { }
        })()
      }
      const raw = localStorage.getItem(appPageKey)
      if (raw) {
        const page = JSON.parse(raw)
        const defaultOptions = { showHeader: true, showBottomNav: false, showBack: false }
        const mergedOptions = { ...defaultOptions, ...(page?.options || {}) }
        setPageMeta({ title: page?.title, layout: page?.layout, route: page?.route, options: mergedOptions, contentNav: page?.contentNav, topBar: page?.topBar, tabContent: page?.tabContent })
      }

      // Seed initial layout only when not present
      const existing = localStorage.getItem(storageKey)
      if (!existing && raw) {
        const page = JSON.parse(raw)
        const cards = Array.isArray(page?.cards) ? page.cards : []
        const payload = { cards: cards.map((t: any) => (typeof t === 'string' ? { type: t } : { type: t?.type || t })), themes: {}, updatedAt: Date.now() }
        localStorage.setItem(storageKey, JSON.stringify(payload))
      }
    } catch { }
    setSeeded(true)
  }, [storageKey, appPageKey, sp, id])

  // category 采用 p-{id}，保证各页布局隔离
  const category = useMemo(() => `p-${id}`, [id])

  const topTabsConfig = (() => {
    // 优先使用 topBar
    const tb = (pageMeta as any)?.topBar
    if (tb && tb.enabled && Array.isArray(tb.tabs) && tb.tabs.length > 0) {
      return { type: 'text', items: tb.tabs.map((t: any) => ({ title: (t?.title || '').trim() || '标签' })) }
    }
    // 兼容旧模型：若 contentNav 为文本型，则当作顶部标签栏
    return pageMeta?.contentNav?.type === 'text' ? pageMeta?.contentNav : null
  })()
  const contentNavConfig = pageMeta?.contentNav?.type === 'iconText' ? pageMeta?.contentNav : null
  const initialTabIndex = useMemo(() => {
    const t = sp?.get('tab')
    return t ? Number(t) : 0
  }, [sp])

  if (!seeded) return null
  return (
    <main className="min-h-[100dvh] bg-transparent">
      <DynamicPageComponent
        // 关键：以 tab 作为 key，确保切换标签时强制重挂载，形成页面级隔离
        key={`p-${id}-tab-${initialTabIndex}`}
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
        initialTabIndex={initialTabIndex}
        pageId={id}
      />
      <BottomNavigation />
    </main>
  )
}


