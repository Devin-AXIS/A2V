"use client"

import { useEffect } from 'react'
import { initIframeConfigBridge, cleanupIframeConfigBridge } from '@/lib/iframe-config-bridge'

interface IframeConfigBridgeProviderProps {
    children: React.ReactNode
}

export function IframeConfigBridgeProvider({ children }: IframeConfigBridgeProviderProps) {
    useEffect(() => {
        // 初始化iframe配置桥接
        initIframeConfigBridge()

        // 清理函数
        return () => {
            cleanupIframeConfigBridge()
        }
    }, [])

    return <>{children}</>
}
