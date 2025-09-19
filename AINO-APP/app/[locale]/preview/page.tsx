"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { DynamicPageComponent } from "@/components/dynamic-page/dynamic-page-component"
import { PCDynamicPageComponent } from "@/components/dynamic-page/pc-dynamic-page-component"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { setDatas } from "@/components/card/set-datas"
import { getIframeBridge, startAutoHeightReporting } from "@/lib/iframe-bridge"

function PreviewContent() {
  const params = useParams<{ locale: string; id: string }>()
  const sp = useSearchParams()
  const router = useRouter()
  const [mergedOnce, setMergedOnce] = useState(false)

  // Merge QUERY_STRING from localStorage into current URL once on mount
  useEffect(() => {
    if (mergedOnce) return
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('QUERY_STRING') : null
      if (!stored) {
        setMergedOnce(true)
        return
      }
      const sanitized = stored.startsWith('?') ? stored.slice(1) : stored
      const storedParams = new URLSearchParams(sanitized)
      if ([...storedParams.keys()].length === 0) {
        setMergedOnce(true)
        return
      }
      const currentParams = new URLSearchParams(sp.toString())
      let changed = false
      storedParams.forEach((value, key) => {
        const currentValue = currentParams.get(key)
        if (currentValue !== value) {
          currentParams.set(key, value)
          changed = true
        }
      })
      if (changed) {
        const locale = params.locale || 'zh'
        const query = currentParams.toString()
        const target = `/${locale}/preview${stored}`
        router.replace(target)
      }
    } catch { }
    setMergedOnce(true)
  }, [sp, params, router, mergedOnce])

  // 安全地获取URL参数，避免SSR错误
  const qs = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams()
    return new URLSearchParams(window.location.search)
  }, [])

  const applicationId = qs.get('appId')
  const parentOrigin = qs.get('origin') || qs.get('parentOrigin') || '*'
  const dataParam = qs.get('data')

  // 安全地设置localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('APP_ID', applicationId || '')
      if (dataParam) {
        try {
          const parsed = JSON.parse(dataParam)
          window.localStorage.setItem('PREVIEW_SELECTED_DATA', JSON.stringify(parsed))
        } catch {
          window.localStorage.setItem('PREVIEW_SELECTED_DATA_RAW', dataParam)
        }
      }
    }
  }, [applicationId, dataParam])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [manifest, setManifest] = useState<any>(null)
  const bridge = useMemo(() => getIframeBridge({ targetOrigin: parentOrigin, channel: applicationId || undefined }), [parentOrigin, applicationId])

  // 从URL参数获取设备类型，默认为mobile
  const device = qs.get('device') || "mobile"
  const locale = params.locale || "zh"
  const id = qs.get('previewId')// || params.id
  const cfgId = qs.get('cfgId') // 页面配置ID


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
        let mf = {}

        if (cfgId) {
          // 如果有 cfgId，从页面配置 API 获取配置
          const res = await fetch(`http://localhost:3007/api/page-configs/${encodeURIComponent(cfgId)}`)
          const data = await res.json()
          if (!res.ok || !data?.success) throw new Error(data?.message || "failed to load page config")

          // 将页面配置转换为 manifest 格式
          const pageConfig = data.data || data
          mf = {
            app: {
              appKey: applicationId || "default",
              defaultLanguage: locale,
              locale: locale,
              theme: "default",
              bottomNav: [
                { key: "home", label: locale === "zh" ? "首页" : "Home", route: "/preview" },
                { key: "me", label: locale === "zh" ? "我的" : "Me", route: "/profile" },
              ]
            },
            pages: {
              home: {
                category: "workspace",
                ...pageConfig
              }
            }
          }
        } else if (id) {
          // 如果有 previewId，从预览 manifest API 获取
          const res = await fetch(`http://localhost:3007/api/preview-manifests/${id}`)
          const data = await res.json()
          if (!res.ok || !data?.success) throw new Error(data?.message || "failed")
          mf = data.data?.manifest || {}
        } else {
          throw new Error("No previewId or cfgId provided")
        }

        if (!canceled) {
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
  }, [id, cfgId, applicationId, locale])

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

  // 根据设备类型选择不同的布局
  if (device === "pc") {
    return (
      <main className="min-h-screen bg-transparent">
        <PCDynamicPageComponent key={renderKey} category={pageCategory} locale={locale} layout="pc" />
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

export default function PreviewPage() {
  return (
    <Suspense fallback={<main className="min-h-[100dvh] flex items-center justify-center text-muted-foreground">Loading...</main>}>
      <PreviewContent />
    </Suspense>
  )
}
