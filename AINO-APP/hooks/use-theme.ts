"use client"

import { useState, useEffect } from "react"

interface ThemeConfig {
  isDark: boolean
  backgroundStyle: string
  primaryColor: string
  secondaryColor: string
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>({
    isDark: false,
    backgroundStyle: "gradient",
    primaryColor: "#3b82f6",
    secondaryColor: "#10b981",
  })

  useEffect(() => {
    // 检查系统主题偏好
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const updateTheme = (e: MediaQueryListEvent) => {
      setTheme((prev) => ({
        ...prev,
        isDark: e.matches,
      }))
    }

    // 初始设置
    setTheme((prev) => ({
      ...prev,
      isDark: mediaQuery.matches,
    }))

    // 监听主题变化
    mediaQuery.addEventListener("change", updateTheme)

    return () => {
      mediaQuery.removeEventListener("change", updateTheme)
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => ({
      ...prev,
      isDark: !prev.isDark,
    }))
  }

  const updateThemeConfig = (config: Partial<ThemeConfig>) => {
    setTheme((prev) => ({
      ...prev,
      ...config,
    }))
  }

  return {
    theme,
    toggleTheme,
    updateThemeConfig,
  }
}
