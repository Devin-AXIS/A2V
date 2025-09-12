"use client"

import { useEffect, type ReactNode } from "react"
import { useGlobalRadius } from "@/hooks/use-global-radius"

interface GlobalRadiusProviderProps {
    children: ReactNode
}

export function GlobalRadiusProvider({ children }: GlobalRadiusProviderProps) {
    const radius = useGlobalRadius()

    // 应用启动时与半秒后再应用一次，确保初始渲染后的 DOM 也被覆盖
    useEffect(() => {
        try {
            radius.applyRadiusToDOM()
            const t = setTimeout(() => {
                try { radius.applyRadiusToDOM() } catch { }
            }, 500)
            return () => clearTimeout(t)
        } catch { }
    }, [radius])

    // 监听全局事件，统一重新应用（供其他配置面板触发）
    useEffect(() => {
        const handle = () => {
            try { radius.applyRadiusToDOM() } catch { }
        }
        window.addEventListener('radiusUpdated', handle)
        window.addEventListener('forceRadiusUpdate', handle)
        return () => {
            window.removeEventListener('radiusUpdated', handle)
            window.removeEventListener('forceRadiusUpdate', handle)
        }
    }, [radius])

    return <>{children}</>
}


