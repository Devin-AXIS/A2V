/**
 * 组件变体配置系统
 * 定义所有组件的variant和size选项，确保符合设计约束
 */

import type { ComponentVariants, ComponentSizes, ComponentShapes } from "@/types"

// 按钮组件变体配置
export const buttonVariants: ComponentVariants = {
  variant: {
    primary: {
      background: "hsl(var(--primary-500))",
      color: "hsl(var(--primary-foreground))",
      border: "hsl(var(--primary-500))",
      hover: {
        background: "hsl(var(--primary-600))",
        color: "hsl(var(--primary-foreground))",
        border: "hsl(var(--primary-600))"
      },
      active: {
        background: "hsl(var(--primary-700))",
        color: "hsl(var(--primary-foreground))",
        border: "hsl(var(--primary-700))"
      },
      disabled: {
        background: "hsl(var(--muted))",
        color: "hsl(var(--muted-foreground))",
        border: "hsl(var(--muted))"
      }
    },
    secondary: {
      background: "hsl(var(--secondary-500))",
      color: "hsl(var(--secondary-foreground))",
      border: "hsl(var(--secondary-500))",
      hover: {
        background: "hsl(var(--secondary-600))",
        color: "hsl(var(--secondary-foreground))",
        border: "hsl(var(--secondary-600))"
      },
      active: {
        background: "hsl(var(--secondary-700))",
        color: "hsl(var(--secondary-foreground))",
        border: "hsl(var(--secondary-700))"
      },
      disabled: {
        background: "hsl(var(--muted))",
        color: "hsl(var(--muted-foreground))",
        border: "hsl(var(--muted))"
      }
    },
    outline: {
      background: "transparent",
      color: "hsl(var(--primary-500))",
      border: "hsl(var(--primary-500))",
      hover: {
        background: "hsl(var(--primary-50))",
        color: "hsl(var(--primary-600))",
        border: "hsl(var(--primary-600))"
      },
      active: {
        background: "hsl(var(--primary-100))",
        color: "hsl(var(--primary-700))",
        border: "hsl(var(--primary-700))"
      },
      disabled: {
        background: "transparent",
        color: "hsl(var(--muted-foreground))",
        border: "hsl(var(--muted))"
      }
    },
    ghost: {
      background: "transparent",
      color: "hsl(var(--foreground))",
      border: "transparent",
      hover: {
        background: "hsl(var(--muted))",
        color: "hsl(var(--foreground))",
        border: "transparent"
      },
      active: {
        background: "hsl(var(--muted-foreground))",
        color: "hsl(var(--background))",
        border: "transparent"
      },
      disabled: {
        background: "transparent",
        color: "hsl(var(--muted-foreground))",
        border: "transparent"
      }
    },
    destructive: {
      background: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
      border: "hsl(var(--destructive))",
      hover: {
        background: "hsl(var(--destructive-600))",
        color: "hsl(var(--destructive-foreground))",
        border: "hsl(var(--destructive-600))"
      },
      active: {
        background: "hsl(var(--destructive-700))",
        color: "hsl(var(--destructive-foreground))",
        border: "hsl(var(--destructive-700))"
      },
      disabled: {
        background: "hsl(var(--muted))",
        color: "hsl(var(--muted-foreground))",
        border: "hsl(var(--muted))"
      }
    }
  },
  
  size: {
    sm: {
      height: "2rem",
      padding: {
        horizontal: "0.75rem",
        vertical: "0.25rem"
      },
      fontSize: "var(--font-size-sm)",
      borderRadius: "var(--radius-sm)"
    },
    md: {
      height: "2.5rem",
      padding: {
        horizontal: "1rem",
        vertical: "0.5rem"
      },
      fontSize: "var(--font-size-base)",
      borderRadius: "var(--radius-md)"
    },
    lg: {
      height: "3rem",
      padding: {
        horizontal: "1.5rem",
        vertical: "0.75rem"
      },
      fontSize: "var(--font-size-lg)",
      borderRadius: "var(--radius-lg)"
    },
    xl: {
      height: "3.5rem",
      padding: {
        horizontal: "2rem",
        vertical: "1rem"
      },
      fontSize: "var(--font-size-xl)",
      borderRadius: "var(--radius-lg)"
    }
  },
  
  shape: {
    rounded: "var(--radius-md)",
    square: "0",
    pill: "9999px"
  }
}

// 输入框组件变体配置
export const inputVariants: ComponentVariants = {
  variant: {
    default: {
      background: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      border: "hsl(var(--border))",
      focus: {
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        border: "hsl(var(--ring))",
        ring: "hsl(var(--ring))"
      },
      error: {
        background: "hsl(var(--background))",
        color: "hsl(var(--destructive))",
        border: "hsl(var(--destructive))",
        ring: "hsl(var(--destructive))"
      },
      disabled: {
        background: "hsl(var(--muted))",
        color: "hsl(var(--muted-foreground))",
        border: "hsl(var(--muted))"
      }
    },
    filled: {
      background: "hsl(var(--muted))",
      color: "hsl(var(--foreground))",
      border: "transparent",
      focus: {
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        border: "hsl(var(--ring))",
        ring: "hsl(var(--ring))"
      },
      error: {
        background: "hsl(var(--destructive-50))",
        color: "hsl(var(--destructive))",
        border: "hsl(var(--destructive))",
        ring: "hsl(var(--destructive))"
      },
      disabled: {
        background: "hsl(var(--muted))",
        color: "hsl(var(--muted-foreground))",
        border: "transparent"
      }
    }
  },
  
  size: {
    sm: {
      height: "2rem",
      padding: {
        horizontal: "0.75rem",
        vertical: "0.25rem"
      },
      fontSize: "var(--font-size-sm)",
      borderRadius: "var(--radius-sm)"
    },
    md: {
      height: "2.5rem",
      padding: {
        horizontal: "1rem",
        vertical: "0.5rem"
      },
      fontSize: "var(--font-size-base)",
      borderRadius: "var(--radius-md)"
    },
    lg: {
      height: "3rem",
      padding: {
        horizontal: "1.25rem",
        vertical: "0.75rem"
      },
      fontSize: "var(--font-size-lg)",
      borderRadius: "var(--radius-lg)"
    }
  }
}

// 卡片组件变体配置
export const cardVariants: ComponentVariants = {
  variant: {
    default: {
      background: "hsl(var(--card))",
      color: "hsl(var(--card-foreground))",
      border: "hsl(var(--border))",
      shadow: "var(--shadow-sm)"
    },
    elevated: {
      background: "hsl(var(--card))",
      color: "hsl(var(--card-foreground))",
      border: "transparent",
      shadow: "var(--shadow-lg)"
    },
    outlined: {
      background: "transparent",
      color: "hsl(var(--foreground))",
      border: "hsl(var(--border))",
      shadow: "none"
    },
    filled: {
      background: "hsl(var(--muted))",
      color: "hsl(var(--foreground))",
      border: "transparent",
      shadow: "none"
    }
  },
  
  size: {
    sm: {
      padding: "var(--spacing-sm)",
      borderRadius: "var(--radius-sm)"
    },
    md: {
      padding: "var(--spacing-md)",
      borderRadius: "var(--radius-md)"
    },
    lg: {
      padding: "var(--spacing-lg)",
      borderRadius: "var(--radius-lg)"
    }
  }
}

// 导航组件变体配置
export const navigationVariants: ComponentVariants = {
  variant: {
    horizontal: {
      direction: "row",
      spacing: "var(--spacing-md)",
      alignment: "center"
    },
    vertical: {
      direction: "column",
      spacing: "var(--spacing-sm)",
      alignment: "start"
    },
    tabs: {
      direction: "row",
      spacing: "0",
      alignment: "start",
      border: "bottom"
    }
  },
  
  size: {
    sm: {
      padding: "var(--spacing-sm)",
      fontSize: "var(--font-size-sm)"
    },
    md: {
      padding: "var(--spacing-md)",
      fontSize: "var(--font-size-base)"
    },
    lg: {
      padding: "var(--spacing-lg)",
      fontSize: "var(--font-size-lg)"
    }
  }
}

// 导出所有组件变体配置
export const componentVariants = {
  button: buttonVariants,
  input: inputVariants,
  card: cardVariants,
  navigation: navigationVariants
}

// 获取组件变体配置
export function getComponentVariants(componentName: keyof typeof componentVariants) {
  return componentVariants[componentName]
}

// 验证组件变体配置
export function validateComponentVariants(componentName: string, variant: string, size?: string) {
  const variants = componentVariants[componentName as keyof typeof componentVariants]
  if (!variants) {
    return { isValid: false, error: `Component ${componentName} not found` }
  }
  
  if (!variants.variant[variant]) {
    return { isValid: false, error: `Variant ${variant} not found for ${componentName}` }
  }
  
  if (size && !variants.size[size]) {
    return { isValid: false, error: `Size ${size} not found for ${componentName}` }
  }
  
  return { isValid: true, error: null }
}
