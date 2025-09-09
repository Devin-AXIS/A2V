"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { DynamicPageComponent } from "@/components/dynamic-page/dynamic-page-component"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { PageDataProvider } from "@/components/providers/page-data-context"
import { AppContextProvider } from "@/components/providers/app-context"

export default function AppRuntimePage() {
    const params = useParams<{ locale: string; appKey: string }>()
    const sp = useSearchParams()

    const [manifest, setManifest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const locale = params.locale || "zh"
    const appKey = params.appKey

    useEffect(() => {
        let canceled = false
        async function run() {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`http://localhost:3001/api/apps/${encodeURIComponent(String(appKey))}/manifest?state=published`)
                const data = await res.json()
                if (!res.ok || !data?.success) throw new Error(data?.message || "failed")
                if (!canceled) setManifest(data.data?.manifest || data.data)
            } catch (e: any) {
                if (!canceled) setError(e?.message || "error")
            } finally {
                if (!canceled) setLoading(false)
            }
        }
        if (appKey) run()
        return () => { canceled = true }
    }, [appKey])

    const currentPageKey = useMemo(() => {
        const routeParamRaw = sp.get('route') || ''
        const normalizedRoute = routeParamRaw === '/me' ? '/profile' : routeParamRaw
        const routeParam = normalizedRoute || (manifest?.pages?.home?.route || '/home')
        try {
            const pages = (manifest && manifest.pages) ? manifest.pages : {}
            const found = Object.entries(pages as any).find(([, cfg]: any) => (cfg?.route || '') === routeParam)
            if (found && found[0]) return found[0]
            const derivedKey = (routeParam || '').replace(/^\//, '') || 'home'
            return derivedKey
        } catch { return 'home' }
    }, [manifest, sp])

    // 无效路由自动回退到 /home（生产态）
    useEffect(() => {
        try {
            const routeParamRaw = sp.get('route') || ''
            const normalizedRoute = routeParamRaw === '/me' ? '/profile' : routeParamRaw
            const routeParam = normalizedRoute || (manifest?.pages?.home?.route || '/home')
            const pages = (manifest && (manifest as any).pages) ? (manifest as any).pages : {}
            const found = Object.entries(pages as any).find(([, cfg]: any) => (cfg?.route || '') === routeParam)
            const derivedKey = (routeParam || '').replace(/^\//, '') || 'home'
            const valid = Boolean(found) || Boolean(derivedKey)
            if (!valid) {
                const u = new URL(window.location.href)
                u.searchParams.set('route', '/home')
                window.history.replaceState(null, '', u.toString())
            }
        } catch { }
    }, [manifest, sp])

    const pageCategory = useMemo(() => {
        try {
            const pageCfg = (manifest?.pages && currentPageKey) ? manifest.pages[currentPageKey] : undefined
            const cat = pageCfg?.category || "workspace"
            return typeof cat === "string" ? cat : "workspace"
        } catch { return "workspace" }
    }, [manifest, currentPageKey])

    // 底部导航改由 BottomNavigation 组件内部根据 APP_GLOBAL_CONFIG 或 CURRENT_APP_NAV_ITEMS 自行决定

    if (loading) {
        return <main className="min-h-[100dvh] flex items-center justify-center text-muted-foreground">Loading...</main>
    }
    if (error) {
        return <main className="min-h-[100dvh] flex items-center justify-center text-red-600 text-sm">{error}</main>
    }

    return (
        <main className="min-h-[100dvh] bg-transparent">
            <AppContextProvider appKey={String(appKey)} locale={String(locale)} device={"mobile"}>
                <PageDataProvider manifest={manifest} pageKey={currentPageKey} baseUrl="http://localhost:3001">
                    <DynamicPageComponent category={pageCategory} locale={locale} layout="mobile" pageKey={currentPageKey} />
                </PageDataProvider>
                <BottomNavigation />
            </AppContextProvider>
        </main>
    )
}


