"use client"

import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DynamicPageComponent } from "@/components/dynamic-page/dynamic-page-component"

export default function MobileDynamicPage() {
  const params = useParams<{ locale: string; id: string }>()
  const locale = params?.locale || "zh"
  const id = params?.id || "unknown"

  // 兼容：若配置层写入 APP_PAGE_{id}，我们尝试作为种子初始化 DynamicPageComponent 的本地布局
  const storageKey = useMemo(() => `dynamic_page_layout_p-${id}_${locale}`,[id, locale])
  const appPageKey = useMemo(() => `APP_PAGE_${id}`,[id])
  const [pageMeta, setPageMeta] = useState<{ title?: any; layout?: string; route?: string; options?: any } | null>(null)

  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const raw = localStorage.getItem(appPageKey)
      if (raw) {
        const page = JSON.parse(raw)
        const defaultOptions = { showHeader: true, showBottomNav: false, showBack: false }
        const mergedOptions = { ...defaultOptions, ...(page?.options || {}) }
        setPageMeta({ title: page?.title, layout: page?.layout, route: page?.route, options: mergedOptions })
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
  }, [storageKey, appPageKey])

  // category 采用 p-{id}，保证各页布局隔离
  const category = useMemo(() => `p-${id}`,[id])

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
      />
    </main>
  )
}


