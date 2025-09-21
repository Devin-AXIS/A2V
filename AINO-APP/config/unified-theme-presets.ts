import type { UnifiedThemePreset } from "@/types"

/**
 * 统一主题预设配置
 * 每个主题包含字体、组件、数据图的完整配置
 */
export const unifiedThemePresets: UnifiedThemePreset[] = [
  {
    name: "现代",
    description: "现代简约风格，适合年轻用户",
    category: "modern",
    config: {
      // 字体颜色配置
      fontColors: {
        heading: "#1f2937",    // 标题颜色
        body: "#4b5563"        // 正文颜色
      },
      // 组件颜色配置
      componentColors: {
        primary: "#6366f1",    // 主要按钮
        secondary: "#8b5cf6",  // 次要按钮
        danger: "#f59e0b"      // 危险按钮
      },
      // 数据图配色（6个颜色）
      chartColors: {
        colors: ["#6366f1", "#8b5cf6", "#f59e0b", "#22c55e", "#ef4444", "#64748b"]
      }
    }
  },
  {
    name: "极简",
    description: "极简主义风格，适合追求简洁的用户",
    category: "minimal",
    config: {
      fontColors: {
        heading: "#000000",
        body: "#374151"
      },
      componentColors: {
        primary: "#171717",
        secondary: "#525252", 
        danger: "#dc2626"
      },
      chartColors: {
        colors: ["#171717", "#525252", "#9ca3af", "#6b7280", "#d1d5db", "#e5e7eb"]
      }
    }
  },
  {
    name: "经典",
    description: "经典商务风格，适合企业应用",
    category: "classic",
    config: {
      fontColors: {
        heading: "#1e40af",
        body: "#374151"
      },
      componentColors: {
        primary: "#3b82f6",
        secondary: "#64748b",
        danger: "#ef4444"
      },
      chartColors: {
        colors: ["#3b82f6", "#64748b", "#ef4444", "#22c55e", "#f59e0b", "#9ca3af"]
      }
    }
  },
  {
    name: "自然",
    description: "自然生态风格，适合环保主题",
    category: "nature",
    config: {
      fontColors: {
        heading: "#166534",
        body: "#374151"
      },
      componentColors: {
        primary: "#22c55e",
        secondary: "#16a34a",
        danger: "#dc2626"
      },
      chartColors: {
        colors: ["#22c55e", "#16a34a", "#4d7c0f", "#f59e0b", "#ef4444", "#6b7280"]
      }
    }
  }
]

// 获取主题预设
export function getThemePreset(name: string): UnifiedThemePreset | undefined {
  return unifiedThemePresets.find(preset => preset.name === name)
}
// 获取所有主题预设
export function getAllThemePresets(): UnifiedThemePreset[] {
  return unifiedThemePresets
}

// 获取主题分类
export function getThemeCategories(): string[] {
  return [...new Set(unifiedThemePresets.map(preset => preset.category))]
}

