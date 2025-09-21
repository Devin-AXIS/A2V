"use client"

import { useTheme } from "@/hooks/use-theme"

export function useDataChartTheme() {
  const { theme } = useTheme()

  const createGradientColor = (baseColor: string, opacity = 0.8) => {
    // 如果是CSS变量，返回带透明度的颜色
    if (baseColor.startsWith("var(")) {
      return `color-mix(in srgb, ${baseColor} ${opacity * 100}%, transparent)`
    }
    // 如果是十六进制颜色，添加透明度
    if (baseColor.startsWith("#")) {
      const alpha = Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")
      return baseColor + alpha
    }
    return baseColor
  }

  // 数据图表颜色预设
  const chartColors = {
    primary: theme.primaryColor, // 使用用户配置的主色
    secondary: theme.secondaryColor, // 使用用户配置的次色
    accent: "#f59e0b", // amber-500
    success: "#22c55e", // green-500
    warning: "#f97316", // orange-500
    error: "#ef4444", // red-500
    info: "#06b6d4", // cyan-500
    purple: "#8b5cf6", // violet-500
    pink: "#ec4899", // pink-500
    teal: "#14b8a6", // teal-500
  }

  const gradientColors = {
    primary: [theme.primaryColor, createGradientColor(theme.primaryColor)], // 主色渐变
    secondary: [theme.secondaryColor, createGradientColor(theme.secondaryColor)], // 次色渐变
    accent: ["#f59e0b", "#d97706"],
    success: ["#22c55e", "#16a34a"],
    warning: ["#f97316", "#ea580c"],
    error: ["#ef4444", "#dc2626"],
    info: ["#06b6d4", "#0891b2"],
    purple: ["#8b5cf6", "#7c3aed"],
    pink: ["#ec4899", "#db2777"],
    teal: ["#14b8a6", "#0d9488"],
  }

  const multiColorPalette = [
    theme.primaryColor, // 用户主色
    theme.secondaryColor, // 用户次色
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#f97316", // orange
    "#ec4899", // pink
    "#22c55e", // green
    "#14b8a6", // teal
  ]

  return {
    primaryColor: theme.primaryColor, // 返回用户配置的主色
    secondaryColor: theme.secondaryColor, // 返回用户配置的次色
    accentColor: chartColors.accent,
    chartColors,
    gradientColors,
    multiColorPalette,
    // 根据主题返回适合的文本颜色
    textColor: theme.isDark ? "#f1f5f9" : "#1e293b",
    mutedTextColor: theme.isDark ? "#94a3b8" : "#64748b",
    // 网格线颜色
    gridColor: theme.isDark ? "#334155" : "#e2e8f0",
    // 背景颜色
    backgroundColor: theme.isDark ? "#1e293b" : "#f8fafc",
  }
}
