"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ManifestLike } from "@/lib/data-sources"
import { loadPageData } from "@/lib/data-sources"

type PageDataContextValue = {
    manifest?: ManifestLike
    pageKey?: string
    pageConfig?: any
    data: Record<string, any>
    loading: boolean
    error?: string | null
}

const PageDataContext = createContext<PageDataContextValue>({ data: {}, loading: false })

export function usePageData() {
    return useContext(PageDataContext)
}

export function PageDataProvider({
    manifest,
    pageKey,
    children,
    baseUrl,
}: {
    manifest?: ManifestLike
    pageKey?: string
    children: React.ReactNode
    baseUrl?: string
}) {
    const pageConfig = useMemo(() => (pageKey && (manifest as any)?.pages ? (manifest as any).pages[pageKey] : undefined), [manifest, pageKey])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<Record<string, any>>({})

    useEffect(() => {
        let canceled = false
        async function run() {
            if (!manifest || !pageConfig) return
            setLoading(true)
            setError(null)
            try {
                const result = await loadPageData(manifest, pageConfig, baseUrl)
                if (!canceled) setData(result)
            } catch (e: any) {
                if (!canceled) setError(e?.message || "load error")
            } finally {
                if (!canceled) setLoading(false)
            }
        }
        run()
        return () => { canceled = true }
    }, [manifest, pageConfig, baseUrl])

    const value = useMemo<PageDataContextValue>(() => ({ manifest, pageKey, pageConfig, data, loading, error }), [manifest, pageKey, pageConfig, data, loading, error])

    return <PageDataContext.Provider value={value}>{children}</PageDataContext.Provider>
}


