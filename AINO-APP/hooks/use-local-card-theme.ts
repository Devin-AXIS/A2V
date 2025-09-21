"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCardTheme } from "@/components/providers/card-theme-provider"
import type { CardThemeConfig } from "@/types"

export function useLocalCardTheme(storageKey?: string, initialThemeOverride?: CardThemeConfig) {
  const { theme: globalTheme } = useCardTheme()
  // 修改(原L11-L14): 初始化时同步读取 localStorage，避免与后续 useEffect(同步全局主题)竞态覆盖
  const readInitialFromStorage = (): { theme: CardThemeConfig; customized: boolean } => {
    if (typeof window === "undefined" || !storageKey) {
      const base = initialThemeOverride || globalTheme
      return { theme: { ...base, frostedOpacity: base.frostedOpacity || "normal" }, customized: false }
    }
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const persisted = JSON.parse(raw) as CardThemeConfig
        const merged = { ...persisted, frostedOpacity: persisted.frostedOpacity || "normal" }
        return { theme: merged, customized: true }
      }
      // 新增迁移逻辑(插入于原判断之后): 如果旧版匿名键存在，则迁移到当前 storageKey 并删除旧键
      const legacy = localStorage.getItem("card_theme_anonymous")
      if (legacy) {
        const persisted = JSON.parse(legacy) as CardThemeConfig
        const merged = { ...persisted, frostedOpacity: persisted.frostedOpacity || "normal" }
        localStorage.setItem(storageKey, JSON.stringify(merged))
        localStorage.removeItem("card_theme_anonymous")
        return { theme: merged, customized: true }
      }
    } catch {}
    const base = initialThemeOverride || globalTheme
    return { theme: { ...base, frostedOpacity: base.frostedOpacity || "normal" }, customized: false }
  }

  const initial = readInitialFromStorage()
  const [localTheme, setLocalTheme] = useState<CardThemeConfig>(initial.theme)
  const [isCustomized, setIsCustomized] = useState<boolean>(initial.customized)

  // 新增(插入于原L17之后): 处理 SSR -> CSR 场景，storageKey 在客户端可用时再尝试读取一次持久化主题
  const [hasHydrationLoaded, setHasHydrationLoaded] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !storageKey || hasHydrationLoaded) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const persisted = JSON.parse(raw) as CardThemeConfig
        setLocalTheme({ ...persisted, frostedOpacity: persisted.frostedOpacity || "normal" })
        setIsCustomized(true)
      }
    } catch {}
    setHasHydrationLoaded(true)
  }, [storageKey, hasHydrationLoaded])

  // 修改(原L17-L24): 当全局主题变化且当前未自定义时，同步全局主题；否则不覆盖用户自定义
  useEffect(() => {
    if (!isCustomized) {
      setLocalTheme({
        ...globalTheme,
        frostedOpacity: globalTheme.frostedOpacity || "normal",
      })
    }
  }, [globalTheme, isCustomized])

  // 修改(原L26-L29): 更新本地主题时，如果提供了 storageKey，则同时写入 localStorage
  const updateLocalTheme = (updater: React.SetStateAction<CardThemeConfig>) => {
    if (!isCustomized) setIsCustomized(true)
    setLocalTheme((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater
      try {
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(next))
        }
      } catch {}
      return next
    })
  }

  // 修改(原L31-L37): 重置到全局主题时，清除本地持久化
  const resetToGlobal = () => {
    setIsCustomized(false)
    setLocalTheme({
      ...globalTheme,
      frostedOpacity: globalTheme.frostedOpacity || "normal",
    })
    try {
      if (storageKey) localStorage.removeItem(storageKey)
    } catch {}
  }

  return { localTheme, updateLocalTheme, resetToGlobal }
}
