import { useCallback, useMemo, useState, useEffect } from "react"
import { useDesignTokens } from "@/components/providers/design-tokens-provider"
import type { FontSizePreset, FontSizeConfig, FontSize } from "@/types"

// 字体大小预设配置
const FONT_SIZE_PRESETS: Record<FontSizePreset, { scale: number; name: string }> = {
  small: { scale: 0.8, name: "小" },
  normal: { scale: 1.0, name: "正常" },
  large: { scale: 1.2, name: "大" }
}

// 基础字体大小（正常档位）
const BASE_FONT_SIZES = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem"
}

// 字体大小配置 Hook
export function useFontSizeConfig() {
  const { getToken, setToken } = useDesignTokens()
  
  // 使用本地状态来管理字体大小配置
  const [localFontSizeConfig, setLocalFontSizeConfig] = useState<FontSizeConfig>(() => {
    const config = getToken("fontSizeConfig") as FontSizeConfig | undefined
    return config || {
      preset: "normal" as FontSizePreset,
      scale: 1.0,
      sizes: BASE_FONT_SIZES
    }
  })

  // 计算缩放后的字体大小
  const scaledFontSizes = useMemo(() => {
    const { scale } = localFontSizeConfig
    const sizes: Record<string, string> = {}
    
    Object.entries(BASE_FONT_SIZES).forEach(([key, value]) => {
      const numericValue = parseFloat(value)
      const unit = value.replace(/[\d.]/g, "")
      const scaledValue = numericValue * scale
      sizes[key] = `${scaledValue}${unit}`
    })
    
    return sizes
  }, [localFontSizeConfig])

  // 应用字体大小到DOM的CSS变量
  const applyFontSizesToDOM = useCallback((fontSizes: Record<string, string>) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement
      
      // 应用字体大小CSS变量
      Object.entries(fontSizes).forEach(([key, value]) => {
        root.style.setProperty(`--font-size-${key}`, value)
      })
      
      console.log("Applied font sizes to DOM:", fontSizes)
    }
  }, [])

  // 设置字体大小预设
  const setFontSizePreset = useCallback((preset: FontSizePreset) => {
    console.log("Setting font size preset:", preset)
    
    const scale = FONT_SIZE_PRESETS[preset].scale
    
    // 直接计算新的字体大小
    const newSizes: Record<string, string> = {}
    Object.entries(BASE_FONT_SIZES).forEach(([key, value]) => {
      const numericValue = parseFloat(value)
      const unit = value.replace(/[\d.]/g, "")
      const scaledValue = numericValue * scale
      newSizes[key] = `${scaledValue}${unit}`
    })
    
    const config: FontSizeConfig = {
      preset,
      scale,
      sizes: newSizes as unknown as FontSize
    }
    
    // 更新本地状态
    setLocalFontSizeConfig(config)
    
    // 同时更新设计令牌
    setToken("fontSizeConfig", config)
    setToken("typography.fontSize", config.sizes)
    
    // 应用CSS变量到DOM
    applyFontSizesToDOM(newSizes)
    
    console.log("Font size preset changed:", { preset, scale, newSizes })
  }, [setToken, applyFontSizesToDOM])

  // 获取特定大小的字体值
  const getFontSize = useCallback((size: keyof typeof BASE_FONT_SIZES) => {
    // 直接从当前配置计算字体大小，而不是依赖scaledFontSizes
    const { scale } = localFontSizeConfig
    const baseSize = BASE_FONT_SIZES[size]
    if (!baseSize) return BASE_FONT_SIZES.base
    
    const numericValue = parseFloat(baseSize)
    const unit = baseSize.replace(/[\d.]/g, "")
    const scaledValue = numericValue * scale
    
    return `${scaledValue}${unit}`
  }, [localFontSizeConfig])

  // 获取当前预设信息
  const getCurrentPreset = useCallback(() => {
    const preset = localFontSizeConfig.preset
    return {
      ...FONT_SIZE_PRESETS[preset],
      current: preset
    }
  }, [localFontSizeConfig.preset])

  // 获取所有预设选项
  const getPresetOptions = useCallback(() => {
    return Object.entries(FONT_SIZE_PRESETS).map(([key, value]) => ({
      key: key as FontSizePreset,
      ...value
    }))
  }, [])

  // 初始化时应用字体大小到DOM - 只在组件挂载时执行一次
  useEffect(() => {
    applyFontSizesToDOM(scaledFontSizes)
  }, []) // 空依赖数组，只在挂载时执行

  return {
    fontSizeConfig: localFontSizeConfig,
    currentPreset: getCurrentPreset(),
    presetOptions: getPresetOptions(),
    fontSizes: scaledFontSizes,
    getFontSize,
    setFontSizePreset,
    presets: FONT_SIZE_PRESETS
  }
}

// 便捷的字体大小 Hook
export function useFontSize(size: keyof typeof BASE_FONT_SIZES) {
  const { getFontSize } = useFontSizeConfig()
  return getFontSize(size)
}

// 便捷的字体大小预设 Hook
export function useFontSizePreset() {
  const { setFontSizePreset, currentPreset, presetOptions } = useFontSizeConfig()
  return {
    setPreset: setFontSizePreset,
    current: currentPreset,
    options: presetOptions
  }
}
