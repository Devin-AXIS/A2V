"use client"

import type React from "react"
import { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from "react"
import type { CardThemeConfig } from "@/types"
import { cardThemePresets } from "@/config/card-theme"

interface CardThemeContextType {
  theme: CardThemeConfig
  setTheme: React.Dispatch<React.SetStateAction<CardThemeConfig>>
  applyPreset: (preset: CardThemeConfig) => void
}

const CardThemeContext = createContext<CardThemeContextType | undefined>(undefined)

export function CardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(cardThemePresets[0].config)

  // 在客户端初始化时尝试从 localStorage 读取全局卡片主题
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("card_theme_global")
        if (raw) {
          setTheme(JSON.parse(raw))
        }
      }
    } catch { }
  }, [])

  // 主题变更时持久化到 localStorage，确保全局统一配置可跨页面保留
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("card_theme_global", JSON.stringify(theme))
      }
    } catch { }
  }, [theme])

  const applyPreset = useCallback((presetConfig: CardThemeConfig) => {
    setTheme(presetConfig)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      applyPreset,
    }),
    [theme, applyPreset],
  )

  return <CardThemeContext.Provider value={value}>{children}</CardThemeContext.Provider>
}

export function useCardTheme() {
  const context = useContext(CardThemeContext)
  if (context === undefined) {
    throw new Error("useCardTheme must be used within a CardThemeProvider")
  }
  return context
}
