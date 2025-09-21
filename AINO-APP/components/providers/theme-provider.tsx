"use client"

import type React from "react"
import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react"
import type { ColorConfig, PresetConfig } from "@/types"
// 使用默认颜色配置，已整合到统一主题系统
const initialColors = [
  { id: 1, name: "主色", value: "#ffffff", enabled: true },
  { id: 2, name: "次色", value: "#f8fafc", enabled: true },
  { id: 3, name: "强调色", value: "#f1f5f9", enabled: true }
]

interface ThemeContextType {
  colors: ColorConfig[]
  updateColor: (id: number, newValue: string) => void
  toggleColor: (id: number) => void
  applyPreset: (preset: PresetConfig["colors"]) => void
  gradientStyle: React.CSSProperties
  getGlowColor: (index: number) => string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ColorConfig[]>(initialColors)

  const updateColor = useCallback((id: number, newValue: string) => {
    setColors((prevColors) => prevColors.map((color) => (color.id === id ? { ...color, value: newValue } : color)))
  }, [])

  const toggleColor = useCallback((id: number) => {
    setColors((prevColors) =>
      prevColors.map((color) => (color.id === id ? { ...color, enabled: !color.enabled } : color)),
    )
  }, [])

  const applyPreset = useCallback((preset: PresetConfig["colors"]) => {
    setColors([
      { id: 1, name: "主色", value: preset[0], enabled: true },
      { id: 2, name: "辅色", value: preset[1], enabled: true },
      { id: 3, name: "点缀色", value: preset[2], enabled: true },
    ])
  }, [])

  const primaryColor = useMemo(() => {
    const color = colors.find((c) => c.id === 1 && c.enabled)
    return color ? color.value : initialColors[0].value
  }, [colors])

  const secondaryColor = useMemo(() => {
    const color = colors.find((c) => c.id === 2 && c.enabled)
    return color ? color.value : initialColors[1].value
  }, [colors])

  const accentColor = useMemo(() => {
    const color = colors.find((c) => c.id === 3 && c.enabled)
    return color ? color.value : initialColors[2].value
  }, [colors])

  const gradientStyle = useMemo(() => {
    const enabledColors = colors.filter((c) => c.enabled)
    if (enabledColors.length === 0) return { backgroundColor: "#ffffff" }
    if (enabledColors.length === 1) return { backgroundColor: enabledColors[0].value }

    if (enabledColors.length === 2) {
      // Give more space to the primary color. The gradient will start at 40% of the way.
      return {
        background: `linear-gradient(135deg, ${enabledColors[0].value} 40%, ${enabledColors[1].value} 100%)`,
      }
    }

    if (enabledColors.length === 3) {
      // Give primary color more space, then transition to secondary, then to tertiary
      return {
        background: `linear-gradient(135deg, ${enabledColors[0].value} 25%, ${enabledColors[1].value} 65%, ${enabledColors[2].value} 100%)`,
      }
    }

    // Fallback for more than 3 colors, though the UI doesn't support it yet.
    const colorStops = enabledColors.map((c, i) => `${c.value} ${i * (100 / (enabledColors.length - 1))}%`).join(", ")
    return { background: `linear-gradient(135deg, ${colorStops})` }
  }, [colors])

  const getGlowColor = useCallback(
    (index: number) => {
      return colors[index]?.enabled ? colors[index].value : "#dbeafe"
    },
    [colors],
  )

  const value = useMemo(
    () => ({
      colors,
      updateColor,
      toggleColor,
      applyPreset,
      gradientStyle,
      getGlowColor,
      primaryColor,
      secondaryColor,
      accentColor,
    }),
    [
      colors,
      updateColor,
      toggleColor,
      applyPreset,
      gradientStyle,
      getGlowColor,
      primaryColor,
      secondaryColor,
      accentColor,
    ],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
