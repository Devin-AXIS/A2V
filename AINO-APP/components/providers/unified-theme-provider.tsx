"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { UnifiedThemeContextType, UnifiedThemePreset, FontColorConfig, ComponentColorConfig, ChartColorConfig } from "@/types"
import { convertTokenValueToCSSValue, updateCSSVariable } from "@/lib/color-variable-mapper"
import { unifiedThemePresets, getThemePreset } from "@/config/unified-theme-presets"
import { http } from "@/lib/request"

const UnifiedThemeContext = createContext<UnifiedThemeContextType | undefined>(undefined)

export function UnifiedThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<UnifiedThemePreset>(getThemePreset("极简") || unifiedThemePresets[0])
  const [isHydrated, setIsHydrated] = useState(false)
  const API_BASE = (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_API_BASE) || "http://localhost:3007"

  const getAppId = useCallback((): string | null => {
    try {
      if (typeof window === "undefined") return null
      return (
        localStorage.getItem("CURRENT_APP_ID") ||
        localStorage.getItem("APP_ID") ||
        null
      )
    } catch {
      return null
    }
  }, [])

  // 检查 localStorage 是否可用
  const isLocalStorageAvailable = useCallback(() => {
    try {
      if (typeof window === "undefined") return false
      const test = "__localStorage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }, [])

  // 优先尝试从服务端读取主题；失败则回退到 localStorage
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const appId = getAppId()
        if (appId) {
          const key = `unified-theme-${appId}`
          const url = `/api/page-configs/key/${encodeURIComponent(key)}`
          const response = await http.get(url)
          const body = response
          const data = body?.data ?? body
          const themeName: string | undefined = data?.themeName || data?.name || (typeof data === "string" ? data : undefined)
          if (themeName) {
            const serverTheme = getThemePreset(themeName)
            if (!cancelled && serverTheme) {
              setCurrentTheme(serverTheme)
              setIsHydrated(true)
              return
            }
          }
        }
      } catch (e) {
        // ignore and fallback to localStorage
      }

      // fallback: localStorage
      try {
        if (typeof window !== "undefined" && isLocalStorageAvailable()) {
          const savedThemeName = localStorage.getItem("aino_unified_theme")
          if (savedThemeName) {
            const savedTheme = getThemePreset(savedThemeName)
            if (savedTheme) {
              setCurrentTheme(savedTheme)
            }
          }
        }
      } catch (error) {
        console.warn("Failed to load unified theme from localStorage:", error)
        setCurrentTheme(getThemePreset("极简") || unifiedThemePresets[0])
      } finally {
        if (!cancelled) setIsHydrated(true)
      }
    }
    init()
    return () => { cancelled = true }
  }, [API_BASE, getAppId, isLocalStorageAvailable])

  // 主题变更时保存到 localStorage
  useEffect(() => {
    if (!isHydrated) return // 避免在初始水合前保存

    try {
      if (typeof window !== "undefined" && isLocalStorageAvailable()) {
        localStorage.setItem("aino_unified_theme", currentTheme.name)
      }
    } catch (error) {
      console.warn("Failed to save unified theme to localStorage:", error)
    }
  }, [currentTheme, isHydrated, isLocalStorageAvailable])

  // 主题变更时保存到服务端（与 localStorage 并行，供多用户共享）
  useEffect(() => {
    if (!isHydrated) return
    let aborted = false
    const save = async () => {
      try {
        const appId = getAppId()
        if (!appId) return
        const key = `unified-theme-${appId}`
        const url = `/api/page-configs/key/${encodeURIComponent(key)}`
        await http.put(url, { themeName: currentTheme.name, updatedAt: Date.now() }).catch(() => { })
      } catch (e) {
        // ignore server save error; localStorage 已作为回退
      }
    }
    save()
    return () => { aborted = true }
  }, [API_BASE, getAppId, currentTheme.name, isHydrated])

  // 应用主题
  const applyTheme = useCallback((themeName: string) => {
    const theme = getThemePreset(themeName)
    if (theme) {
      setCurrentTheme(theme)

      // 应用字体颜色配置
      applyFontColors(theme.config.fontColors)

      // 应用组件颜色配置
      applyComponentColors(theme.config.componentColors)

      // 应用数据图配色配置
      applyChartColors(theme.config.chartColors)
    }
  }, [])

  // 创建字体颜色样式元素
  const createFontColorStyleElement = useCallback(() => {
    const styleElement = document.createElement('style')
    styleElement.id = 'unified-font-color-style'
    document.head.appendChild(styleElement)
    return styleElement
  }, [])

  // 应用字体颜色配置
  const applyFontColors = useCallback((fontColors: FontColorConfig) => {
    // 更新CSS变量
    document.documentElement.style.setProperty('--font-color-heading', fontColors.heading)
    document.documentElement.style.setProperty('--font-color-body', fontColors.body)

    // 更新全局字体颜色样式 - 智能处理按钮文字颜色
    const styleElement = document.getElementById('unified-font-color-style') || createFontColorStyleElement()
    styleElement.textContent = `
      h1, h2, h3, h4, h5, h6, .font-heading { color: ${fontColors.heading} !important; }
      body, p, span, div, input, textarea, .font-body { color: ${fontColors.body} !important; }
      /* 按钮文字颜色由智能对比度系统处理，不强制使用正文颜色 */
    `
  }, [])

  // 应用组件颜色配置
  const applyComponentColors = useCallback((colors: ComponentColorConfig) => {
    // 更新CSS变量
    document.documentElement.style.setProperty('--component-primary', colors.primary)
    document.documentElement.style.setProperty('--component-secondary', colors.secondary)
    document.documentElement.style.setProperty('--component-danger', colors.danger)

    // 智能计算按钮文字颜色
    const getOptimalTextColor = (bgColor: string) => {
      // 简单的亮度计算
      const hex = bgColor.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      return brightness > 128 ? '#000000' : '#FFFFFF'
    }

    const primaryTextColor = getOptimalTextColor(colors.primary)
    const secondaryTextColor = getOptimalTextColor(colors.secondary)
    const dangerTextColor = getOptimalTextColor(colors.danger)

    // 将统一主题色同步到 Tailwind 使用的CSS变量，确保通用 Button 等能读取到
    try {
      // 主色：同步到 --primary-500 与前景 --primary-foreground
      updateCSSVariable('--primary-500', convertTokenValueToCSSValue(colors.primary))
      updateCSSVariable('--primary-foreground', convertTokenValueToCSSValue(primaryTextColor))

      // 次色：同步到 --secondary-500 与前景 --secondary-foreground
      updateCSSVariable('--secondary-500', convertTokenValueToCSSValue(colors.secondary))
      updateCSSVariable('--secondary-foreground', convertTokenValueToCSSValue(secondaryTextColor))

      // 危险态：同步到 --destructive 与前景 --destructive-foreground
      updateCSSVariable('--destructive', convertTokenValueToCSSValue(colors.danger))
      updateCSSVariable('--destructive-foreground', convertTokenValueToCSSValue(dangerTextColor))
    } catch (err) {
      console.warn('Failed to sync unified colors to CSS variables:', err)
    }

    // 更新组件样式 - 包含智能文字颜色
    const styleElement = document.getElementById('unified-component-style') || createComponentStyleElement()
    styleElement.textContent = `
      .btn-primary { 
        background-color: ${colors.primary} !important; 
        color: ${primaryTextColor} !important; 
      }
      .btn-secondary { 
        background-color: ${colors.secondary} !important; 
        color: ${secondaryTextColor} !important; 
      }
      .btn-danger { 
        background-color: ${colors.danger} !important; 
        color: ${dangerTextColor} !important; 
      }
      /* 智能按钮文字颜色 */
      [data-smart-button="primary"] { 
        background-color: ${colors.primary} !important; 
        color: ${primaryTextColor} !important; 
      }
      [data-smart-button="secondary"] { 
        background-color: ${colors.secondary} !important; 
        color: ${secondaryTextColor} !important; 
      }
      [data-smart-button="danger"] { 
        background-color: ${colors.danger} !important; 
        color: ${dangerTextColor} !important; 
      }
    `

    // 通知其他Provider更新组件颜色
    const componentColorUpdateEvent = new CustomEvent('unified-theme-component-colors-updated', {
      detail: {
        ...colors,
        textColors: {
          primary: primaryTextColor,
          secondary: secondaryTextColor,
          danger: dangerTextColor
        }
      }
    })
    window.dispatchEvent(componentColorUpdateEvent)
  }, [])

  // 应用数据图配色配置
  const applyChartColors = useCallback((colors: ChartColorConfig) => {
    // 更新CSS变量 - 使用 colors 数组
    colors.colors.forEach((color, index) => {
      document.documentElement.style.setProperty(`--chart-${index + 1}`, color)
    })

    // 同时更新图表调色板，确保基础组件（如PillButton、FloatingButton）也能使用新颜色
    const chartColorUpdateEvent = new CustomEvent('unified-theme-chart-colors-updated', {
      detail: colors.colors
    })
    window.dispatchEvent(chartColorUpdateEvent)
  }, [])

  // 更新字体颜色配置
  const updateFontColors = useCallback((fontColors: Partial<FontColorConfig>) => {
    const newFontColors = { ...currentTheme.config.fontColors, ...fontColors }
    const newTheme = {
      ...currentTheme,
      config: {
        ...currentTheme.config,
        fontColors: newFontColors
      }
    }
    setCurrentTheme(newTheme)
    applyFontColors(newFontColors)
  }, [currentTheme, applyFontColors])

  // 更新组件颜色配置
  const updateComponentColors = useCallback((colors: Partial<ComponentColorConfig>) => {
    const newColors = { ...currentTheme.config.componentColors, ...colors }
    const newTheme = {
      ...currentTheme,
      config: {
        ...currentTheme.config,
        componentColors: newColors
      }
    }
    setCurrentTheme(newTheme)
    applyComponentColors(newColors)
  }, [currentTheme, applyComponentColors])

  // 更新数据图配色配置
  const updateChartColors = useCallback((colors: Partial<ChartColorConfig>) => {
    const newColors = { ...currentTheme.config.chartColors, ...colors }
    const newTheme = {
      ...currentTheme,
      config: {
        ...currentTheme.config,
        chartColors: newColors
      }
    }
    setCurrentTheme(newTheme)
    applyChartColors(newColors)
  }, [currentTheme, applyChartColors])

  // 重置到主题默认值
  const resetToTheme = useCallback((themeName: string) => {
    const theme = getThemePreset(themeName)
    if (theme) {
      setCurrentTheme(theme)
      applyTheme(themeName)
    }
  }, [applyTheme])

  // 创建字体样式元素
  const createFontStyleElement = () => {
    const styleElement = document.createElement('style')
    styleElement.id = 'unified-font-style'
    document.head.appendChild(styleElement)
    return styleElement
  }

  // 创建组件样式元素
  const createComponentStyleElement = () => {
    const styleElement = document.createElement('style')
    styleElement.id = 'unified-component-style'
    document.head.appendChild(styleElement)
    return styleElement
  }

  // 在初始水合后，立即根据当前主题应用颜色变量，确保默认主题真正生效
  useEffect(() => {
    if (!isHydrated) return
    try {
      applyFontColors(currentTheme.config.fontColors)
      applyComponentColors(currentTheme.config.componentColors)
      applyChartColors(currentTheme.config.chartColors)
    } catch (error) {
      console.warn('Failed to apply unified theme on hydrate:', error)
    }
  }, [isHydrated, currentTheme, applyFontColors, applyComponentColors, applyChartColors])

  const value: UnifiedThemeContextType = {
    currentTheme,
    availableThemes: unifiedThemePresets,
    applyTheme,
    updateFontColors,
    updateComponentColors,
    updateChartColors,
    resetToTheme,
    isHydrated
  }

  return (
    <UnifiedThemeContext.Provider value={value}>
      {children}
    </UnifiedThemeContext.Provider>
  )
}

export function useUnifiedTheme() {
  const context = useContext(UnifiedThemeContext)
  if (context === undefined) {
    throw new Error("useUnifiedTheme must be used within a UnifiedThemeProvider")
  }
  return context
}
