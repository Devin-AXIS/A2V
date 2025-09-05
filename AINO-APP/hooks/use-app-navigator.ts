"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function useAppNavigator() {
    const pathname = usePathname()
    const sp = useSearchParams()
    const router = useRouter()

    function navigate(toRoute: string) {
        const normalized = toRoute === "/me" ? "/profile" : toRoute
        const parts = pathname.split("/")
        const locale = parts[1] || "zh"
        const isPreview = pathname.includes("/preview/")
        const isApp = pathname.includes("/app/")
        if (isPreview) {
            const previewId = parts[3]
            router.push(`/${locale}/preview/${previewId}?route=${encodeURIComponent(normalized)}`)
            return
        }
        if (isApp) {
            const appKey = parts[3]
            router.push(`/${locale}/app/${appKey}?route=${encodeURIComponent(normalized)}`)
            return
        }
        // fallback: normal page routing under locale
        router.push(`/${locale}${normalized === "/" ? "" : normalized}`)
    }

    return { navigate }
}


