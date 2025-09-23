"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { DynamicPageComponent } from "@/components/dynamic-page/dynamic-page-component"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { setDatas } from "@/components/card/config/set-datas"
import { getIframeBridge, startAutoHeightReporting } from "@/lib/iframe-bridge"

export default function PreviewPage() {
  const params = useParams<{ locale: string; id: string }>()
  const sp = useSearchParams()
  const router = useRouter()
  const qs = new URLSearchParams(window.location.search)
  const applicationId = qs.get('appId')
  window.localStorage.setItem('APP_ID', applicationId || '')
  const parentOrigin = qs.get('origin') || qs.get('parentOrigin') || '*'
  const dataParam = qs.get('data')
  if (dataParam) {
    try {
      const parsed = JSON.parse(dataParam)
      window.localStorage.setItem('PREVIEW_SELECTED_DATA', JSON.stringify(parsed))
    } catch {
      window.localStorage.setItem('PREVIEW_SELECTED_DATA_RAW', dataParam)
    }
  }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [manifest, setManifest] = useState<any>(null)
  const bridge = useMemo(() => getIframeBridge({ targetOrigin: parentOrigin, channel: applicationId || undefined }), [parentOrigin, applicationId])

  // 仅做 App(移动) 版本预览；PC 版本后续再做
  const device = "mobile"
  const locale = params.locale || "zh"
  const id = params.id

  useEffect(() => {
    setDatas();
  }, [])

  // Notify parent ready and start auto height reporting
  useEffect(() => {
    const stop = startAutoHeightReporting(bridge)
    bridge.post('aino:ready', { appId: applicationId, id, locale })
    return () => { if (typeof stop === 'function') stop() }
  }, [bridge, applicationId, id, locale])

  useEffect(() => {
    let canceled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:3007/api/preview-manifests/${id}`)
        const data = await res.json()
        if (!res.ok || !data?.success) throw new Error(data?.message || "failed")
        if (!canceled) {
          const mf = data.data?.manifest || {}
          try {
            if (typeof window !== 'undefined' && mf?.app?.appKey) {
              localStorage.setItem('CURRENT_APP_ID', String(mf.app.appKey))
            }
          } catch { }
          setManifest(mf)
          // send manifest to parent when available
          try { bridge.post('aino:manifest', { manifest: mf }) } catch { }
        }
      } catch (e: any) {
        if (!canceled) setError(e?.message || "error")
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    run()
    return () => { canceled = true }
  }, [id])

  // Report error to parent
  useEffect(() => {
    if (!error) return
    try { bridge.post('aino:error', { message: error }) } catch { }
  }, [error, bridge])

  // Seed default cards to localStorage once (for demo preview only)
  const [renderKey, setRenderKey] = useState(0)
  useEffect(() => {
    if (!manifest) return
    try {
      const cat = manifest?.pages?.home?.category || "workspace"
      const storageKey = `dynamic_page_layout_${cat}_${locale}`
      const exists = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      if (!exists) {
        const cardsDefault: string[] = (manifest?.pages?.home?.cardsDefault && manifest.pages.home.cardsDefault.length > 0)
          ? manifest.pages.home.cardsDefault
          : []
        const payload = { cards: cardsDefault.map((t) => ({ type: t })), themes: {}, updatedAt: Date.now() }
        localStorage.setItem(storageKey, JSON.stringify(payload))
        // 触发重新挂载以让动态页读取到最新布局
        setRenderKey((k) => k + 1)
      } else {
        // 清理历史缓存中残留的移动导航卡片（mobile-navigation）
        try {
          const parsed = JSON.parse(exists)
          const before = Array.isArray(parsed?.cards) ? parsed.cards.length : 0
          if (before > 0) {
            const cleaned = parsed.cards.filter((c: any) => (c?.type || c) !== 'mobile-navigation')
            if (cleaned.length !== before) {
              const payload = { ...parsed, cards: cleaned, updatedAt: Date.now() }
              localStorage.setItem(storageKey, JSON.stringify(payload))
              setRenderKey((k) => k + 1)
            }
          }
        } catch { }
      }
      // 同步底部导航到全局以便 profile 页面也显示一致
      try {
        const list = manifest?.app?.bottomNav || []
        const navItems = Array.isArray(list) ? list.map((i: any) => {
          let href = i.route || "/"
          if (href === "/me") href = "/profile"
          return { href, label: i.label || i.key, iconName: i.icon }
        }) : []
        localStorage.setItem('CURRENT_APP_NAV_ITEMS', JSON.stringify(navItems))
      } catch { }
    } catch { }
  }, [manifest, locale])

  const pageCategory = useMemo(() => {
    const cat = manifest?.pages?.home?.category || "workspace"
    return typeof cat === "string" ? cat : "workspace"
  }, [manifest])

  // 底部导航改由 BottomNavigation 组件内部根据 APP_GLOBAL_CONFIG 或 CURRENT_APP_NAV_ITEMS 自行决定

  if (loading) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center text-muted-foreground">
        Loading...
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-3">
        <div className="text-sm text-red-600">{error}</div>
        <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-transparent">
      <DynamicPageComponent key={renderKey} category={pageCategory} locale={locale} layout="mobile" />
      <BottomNavigation />
    </main>
  )
}
