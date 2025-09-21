import type { CardThemePreset } from "@/types"

// 工具函数：根据字体颜色自动计算标题颜色（深一点）


export const cardThemePresets: CardThemePreset[] = [
  {
    name: "默认",
    config: {
      background: "#ffffff",
      backgroundStyle: "frosted",
      fontColor: "#4b5563",
      fontFamily: "system-ui, sans-serif",
    },
  },
  {
    name: "深色",
    config: {
      background: "#111827",
      backgroundStyle: "frosted",
      fontColor: "#d1d5db",
      fontFamily: "system-ui, sans-serif",
    },
  },
  {
    name: "经典",
    config: {
      background: "#f5f5f4",
      backgroundStyle: "solid",
      fontColor: "#57534e",
      fontFamily: "Georgia, serif",
    },
  },
  {
    name: "透明",
    config: {
      background: "#ffffff",
      backgroundStyle: "none",
      fontColor: "#4b5563",
      fontFamily: "system-ui, sans-serif",
    },
  },
]
