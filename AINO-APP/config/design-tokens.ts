import type { DesignTokens } from "@/types"

// 默认设计令牌配置
export const defaultDesignTokens: DesignTokens = {
  colors: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a"
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a"
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717"
    },
    semantic: {
      success: {
        50: "#f0fdf4",
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d"
      },
      warning: {
        50: "#fffbeb",
        100: "#fef3c7",
        200: "#fde68a",
        300: "#fcd34d",
        400: "#fbbf24",
        500: "#f59e0b",
        600: "#d97706",
        700: "#b45309",
        800: "#92400e",
        900: "#78350f"
      },
      error: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d"
      },
      info: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a"
      }
    },
    background: {
      primary: "#ffffff",
      secondary: "#f8fafc",
      tertiary: "#f1f5f9"
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      tertiary: "#64748b",
      inverse: "#ffffff"
    }
  },
  typography: {
    fontFamily: {
      primary: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "Georgia, serif",
      mono: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace"
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem"
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  radius: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px"
  },
  // 全局边角配置 - 统一管理所有组件的边角样式
  globalRadius: {
    // 当前激活的边角预设
    active: "default", // 默认使用默认预设
    // 边角预设配置 - 精简为4个预设
    presets: {
      default: {
        name: "默认",
        description: "页面刷新后的真实初始状态",
        values: {
          card: "full",
          button: "full", 
          input: "full",
          modal: "full"
        }
      },
      subtle: {
        name: "微妙",
        description: "轻微圆角，柔和自然",
        values: {
          card: "sm",
          button: "sm",
          input: "sm",
          modal: "sm"
        }
      },
      rounded: {
        name: "圆角",
        description: "明显圆角，友好亲和",
        values: {
          card: "lg",
          button: "lg",
          input: "lg",
          modal: "lg"
        }
      },
      soft: {
        name: "柔和",
        description: "大圆角，柔和舒适",
        values: {
          card: "xl",
          button: "xl",
          input: "xl",
          modal: "xl"
        }
      }
    }
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)"
  },
  borders: {
    width: {
      thin: "1px",
      medium: "2px",
      thick: "4px"
    },
    style: {
      solid: "solid",
      dashed: "dashed",
      dotted: "dotted"
    }
  },
  fontSizeConfig: {
    preset: "normal",
    scale: 1.0,
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem"
    }
  }
}

// 设计令牌预设
export const designTokenPresets = {
  light: defaultDesignTokens,
  dark: {
    ...defaultDesignTokens,
    colors: {
      ...defaultDesignTokens.colors,
      background: {
        primary: "#0f172a",
        secondary: "#1e293b",
        tertiary: "#334155"
      },
      text: {
        primary: "#f8fafc",
        secondary: "#cbd5e1",
        tertiary: "#94a3b8",
        inverse: "#0f172a"
      }
    }
  },
  minimal: {
    ...defaultDesignTokens,
    colors: {
      ...defaultDesignTokens.colors,
      primary: {
        50: "#fafafa",
        100: "#f5f5f5",
        200: "#e5e5e5",
        300: "#d4d4d4",
        400: "#a3a3a3",
        500: "#737373",
        600: "#525252",
        700: "#404040",
        800: "#262626",
        900: "#171717"
      }
    },
    shadows: {
      sm: "none",
      md: "none",
      lg: "none",
      xl: "none",
      inner: "none"
    }
  }
}
