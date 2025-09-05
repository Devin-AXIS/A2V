"use client"
import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react"
// 使用默认调色板配置，已整合到统一主题系统
const chartPalettes = [
  {
    name: "默认",
    colors: ["#6366f1", "#8b5cf6", "#f59e0b", "#22c55e", "#ef4444", "#64748b"]
  }
]

const dataChartPalettes = [
  {
    name: "默认",
    colors: ["#6366f1", "#8b5cf6", "#f59e0b", "#22c55e", "#ef4444", "#64748b"]
  }
]

interface UnifiedChartThemeContextType {
  // 图表调色板
  chartPalette: string[]
  activeChartPaletteName: string
  applyChartPalette: (paletteName: string) => void
  
  // 数据图表调色板
  dataChartPalette: string[]
  activeDataChartPaletteName: string
  applyDataChartPalette: (paletteName: string) => void
}

const UnifiedChartThemeContext = createContext<UnifiedChartThemeContextType | undefined>(undefined)

export function UnifiedChartThemeProvider({ children }: { children: ReactNode }) {
  // 图表调色板状态
  const [activeChartPaletteName, setActiveChartPaletteName] = useState<string>(chartPalettes[0].name)
  
  // 数据图表调色板状态
  const [activeDataChartPaletteName, setActiveDataChartPaletteName] = useState<string>(dataChartPalettes[0].name)

  // 统一主题的颜色状态
  const [unifiedChartColors, setUnifiedChartColors] = useState<string[]>([])
  const [unifiedComponentColors, setUnifiedComponentColors] = useState<{primary: string, secondary: string, danger: string} | null>(null)

  // 监听统一主题的颜色更新事件
  useEffect(() => {
    const handleChartColorsUpdate = (event: CustomEvent) => {
      setUnifiedChartColors(event.detail)
    }

    const handleComponentColorsUpdate = (event: CustomEvent) => {
      setUnifiedComponentColors(event.detail)
    }

    window.addEventListener('unified-theme-chart-colors-updated', handleChartColorsUpdate as EventListener)
    window.addEventListener('unified-theme-component-colors-updated', handleComponentColorsUpdate as EventListener)

    return () => {
      window.removeEventListener('unified-theme-chart-colors-updated', handleChartColorsUpdate as EventListener)
      window.removeEventListener('unified-theme-component-colors-updated', handleComponentColorsUpdate as EventListener)
    }
  }, [])

  // 图表调色板方法
  const applyChartPalette = (paletteName: string) => {
    setActiveChartPaletteName(paletteName)
  }

  // 数据图表调色板方法
  const applyDataChartPalette = (paletteName: string) => {
    const newPalette = dataChartPalettes.find((p) => p.name === paletteName)
    if (newPalette) {
      setActiveDataChartPaletteName(paletteName)
    }
  }

  // 图表调色板计算
  const chartPalette = useMemo(() => {
    // 优先使用统一主题的组件颜色
    if (unifiedComponentColors) {
      return [
        unifiedComponentColors.primary,
        unifiedComponentColors.secondary,
        unifiedComponentColors.danger,
        ...chartPalettes[0].colors.slice(3) // 保留其他颜色
      ]
    }
    
    const activePalette = chartPalettes.find((p) => p.name === activeChartPaletteName)
    return activePalette ? activePalette.colors : chartPalettes[0].colors
  }, [activeChartPaletteName, unifiedComponentColors])

  // 数据图表调色板计算
  const dataChartPalette = useMemo(() => {
    // 优先使用统一主题的图表颜色
    if (unifiedChartColors.length > 0) {
      return unifiedChartColors
    }
    
    const activePalette = dataChartPalettes.find((p) => p.name === activeDataChartPaletteName)
    return activePalette ? activePalette.colors : dataChartPalettes[0].colors
  }, [activeDataChartPaletteName, unifiedChartColors])

  const value = useMemo(
    () => ({
      chartPalette,
      activeChartPaletteName,
      applyChartPalette,
      dataChartPalette,
      activeDataChartPaletteName,
      applyDataChartPalette,
    }),
    [chartPalette, activeChartPaletteName, dataChartPalette, activeDataChartPaletteName],
  )

  return <UnifiedChartThemeContext.Provider value={value}>{children}</UnifiedChartThemeContext.Provider>
}

// 兼容性Hook - 保持原有API
export function useChartTheme() {
  const context = useContext(UnifiedChartThemeContext)
  if (context === undefined) {
    throw new Error("useChartTheme must be used within a UnifiedChartThemeProvider")
  }
  return {
    palette: context.chartPalette,
    activePaletteName: context.activeChartPaletteName,
    applyPalette: context.applyChartPalette,
  }
}

export function useDataChartTheme() {
  const context = useContext(UnifiedChartThemeContext)
  if (context === undefined) {
    throw new Error("useDataChartTheme must be used within a UnifiedChartThemeProvider")
  }
  return {
    palette: context.dataChartPalette,
    activePaletteName: context.activeDataChartPaletteName,
    applyPalette: context.applyDataChartPalette,
  }
}

// 兼容性Provider - 保持原有API
// 注意：这些Provider只是别名，实际使用的是UnifiedChartThemeProvider
// 在布局中应该只使用UnifiedChartThemeProvider，这些是为了向后兼容
export function ChartThemeProvider({ children }: { children: ReactNode }) {
  // 直接渲染children，因为UnifiedChartThemeProvider已经在布局中
  return <>{children}</>
}

export function DataChartThemeProvider({ children }: { children: ReactNode }) {
  // 直接渲染children，因为UnifiedChartThemeProvider已经在布局中
  return <>{children}</>
}

// 新的统一Hook
export function useUnifiedChartTheme() {
  const context = useContext(UnifiedChartThemeContext)
  if (context === undefined) {
    throw new Error("useUnifiedChartTheme must be used within a UnifiedChartThemeProvider")
  }
  return context
}
