/**
 * 动画配置系统
 * 定义所有动画的时长、缓动函数和关键帧，确保符合设计约束
 */

import type { AnimationConfig, AnimationPreset, AnimationTiming } from "@/types"

// 动画时长配置
export const animationDurations: Record<string, string> = {
  instant: "0ms",
  fast: "100ms",
  normal: "200ms",
  slow: "300ms",
  slower: "500ms",
  slowest: "700ms"
}

// 动画缓动函数配置
export const animationEasings: Record<string, string> = {
  linear: "linear",
  ease: "ease",
  "ease-in": "ease-in",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  "ease-out-cubic": "cubic-bezier(0.33, 1, 0.68, 1)",
  "ease-in-cubic": "cubic-bezier(0.32, 0, 0.67, 0)",
  "ease-in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
  "ease-out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
  "ease-in-quart": "cubic-bezier(0.5, 0, 0.75, 0)",
  "ease-in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
  "ease-out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
  "ease-in-quint": "cubic-bezier(0.64, 0, 0.78, 0)",
  "ease-in-out-quint": "cubic-bezier(0.83, 0, 0.17, 1)",
  "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
  "ease-in-expo": "cubic-bezier(0.7, 0, 0.84, 0)",
  "ease-in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
  "ease-out-circ": "cubic-bezier(0, 0.55, 0.45, 1)",
  "ease-in-circ": "cubic-bezier(0.55, 0, 1, 0.45)",
  "ease-in-out-circ": "cubic-bezier(0.85, 0, 0.15, 1)",
  "ease-out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "ease-in-back": "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
  "ease-in-out-back": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
}

// 动画预设配置
export const animationPresets: Record<string, AnimationPreset> = {
  // 淡入淡出
  fade: {
    in: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: "normal",
      easing: "ease-out"
    },
    out: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: "fast",
      easing: "ease-in"
    }
  },
  
  // 滑入滑出
  slide: {
    in: {
      from: { transform: "translateY(100%)" },
      to: { transform: "translateY(0%)" },
      duration: "normal",
      easing: "ease-out-cubic"
    },
    out: {
      from: { transform: "translateY(0%)" },
      to: { transform: "translateY(100%)" },
      duration: "fast",
      easing: "ease-in-cubic"
    }
  },
  
  // 缩放
  scale: {
    in: {
      from: { transform: "scale(0.8)", opacity: 0 },
      to: { transform: "scale(1)", opacity: 1 },
      duration: "normal",
      easing: "ease-out-back"
    },
    out: {
      from: { transform: "scale(1)", opacity: 1 },
      to: { transform: "scale(0.8)", opacity: 0 },
      duration: "fast",
      easing: "ease-in-back"
    }
  },
  
  // 旋转
  rotate: {
    in: {
      from: { transform: "rotate(-180deg)", opacity: 0 },
      to: { transform: "rotate(0deg)", opacity: 1 },
      duration: "normal",
      easing: "ease-out-cubic"
    },
    out: {
      from: { transform: "rotate(0deg)", opacity: 1 },
      to: { transform: "rotate(180deg)", opacity: 0 },
      duration: "fast",
      easing: "ease-in-cubic"
    }
  },
  
  // 弹跳
  bounce: {
    in: {
      from: { transform: "scale(0.3)", opacity: 0 },
      to: { transform: "scale(1)", opacity: 1 },
      duration: "slow",
      easing: "ease-out-back"
    },
    out: {
      from: { transform: "scale(1)", opacity: 1 },
      to: { transform: "scale(0.3)", opacity: 0 },
      duration: "fast",
      easing: "ease-in-back"
    }
  },
  
  // 闪烁
  flash: {
    in: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: "instant",
      easing: "linear"
    },
    out: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: "instant",
      easing: "linear"
    }
  },
  
  // 脉冲
  pulse: {
    in: {
      from: { transform: "scale(1)" },
      to: { transform: "scale(1.05)" },
      duration: "normal",
      easing: "ease-in-out"
    },
    out: {
      from: { transform: "scale(1.05)" },
      to: { transform: "scale(1)" },
      duration: "normal",
      easing: "ease-in-out"
    }
  },
  
  // 摇摆
  wiggle: {
    in: {
      from: { transform: "rotate(-3deg)" },
      to: { transform: "rotate(3deg)" },
      duration: "slow",
      easing: "ease-in-out"
    },
    out: {
      from: { transform: "rotate(3deg)" },
      to: { transform: "rotate(-3deg)" },
      duration: "slow",
      easing: "ease-in-out"
    }
  }
}

// 组件特定动画配置
export const componentAnimations: Record<string, Record<string, AnimationPreset>> = {
  // 按钮动画
  button: {
    press: {
      in: {
        from: { transform: "scale(1)" },
        to: { transform: "scale(0.95)" },
        duration: "fast",
        easing: "ease-out"
      },
      out: {
        from: { transform: "scale(0.95)" },
        to: { transform: "scale(1)" },
        duration: "fast",
        easing: "ease-out"
      }
    },
    hover: {
      in: {
        from: { transform: "translateY(0px)" },
        to: { transform: "translateY(-2px)" },
        duration: "fast",
        easing: "ease-out"
      },
      out: {
        from: { transform: "translateY(-2px)" },
        to: { transform: "translateY(0px)" },
        duration: "fast",
        easing: "ease-out"
      }
    }
  },
  
  // 卡片动画
  card: {
    hover: {
      in: {
        from: { transform: "translateY(0px)", boxShadow: "var(--shadow-sm)" },
        to: { transform: "translateY(-4px)", boxShadow: "var(--shadow-lg)" },
        duration: "normal",
        easing: "ease-out-cubic"
      },
      out: {
        from: { transform: "translateY(-4px)", boxShadow: "var(--shadow-lg)" },
        to: { transform: "translateY(0px)", boxShadow: "var(--shadow-sm)" },
        duration: "normal",
        easing: "ease-in-cubic"
      }
    },
    focus: {
      in: {
        from: { transform: "scale(1)" },
        to: { transform: "scale(1.02)" },
        duration: "fast",
        easing: "ease-out"
      },
      out: {
        from: { transform: "scale(1.02)" },
        to: { transform: "scale(1)" },
        duration: "fast",
        easing: "ease-out"
      }
    }
  },
  
  // 输入框动画
  input: {
    focus: {
      in: {
        from: { borderColor: "hsl(var(--border))", boxShadow: "none" },
        to: { borderColor: "hsl(var(--ring))", boxShadow: "0 0 0 3px hsl(var(--ring) / 0.1)" },
        duration: "fast",
        easing: "ease-out"
      },
      out: {
        from: { borderColor: "hsl(var(--ring))", boxShadow: "0 0 0 3px hsl(var(--ring) / 0.1)" },
        to: { borderColor: "hsl(var(--border))", boxShadow: "none" },
        duration: "fast",
        easing: "ease-out"
      }
    }
  },
  
  // 导航动画
  navigation: {
    active: {
      in: {
        from: { transform: "scale(0.9)", opacity: 0.7 },
        to: { transform: "scale(1)", opacity: 1 },
        duration: "fast",
        easing: "ease-out-back"
      },
      out: {
        from: { transform: "scale(1)", opacity: 1 },
        to: { transform: "scale(0.9)", opacity: 0.7 },
        duration: "fast",
        easing: "ease-in-back"
      }
    }
  }
}

// 页面转场动画
export const pageTransitions: Record<string, AnimationPreset> = {
  // 页面进入
  pageEnter: {
    in: {
      from: { opacity: 0, transform: "translateY(20px)" },
      to: { opacity: 1, transform: "translateY(0px)" },
      duration: "normal",
      easing: "ease-out-cubic"
    }
  },
  
  // 页面退出
  pageExit: {
    out: {
      from: { opacity: 1, transform: "translateY(0px)" },
      to: { opacity: 0, transform: "translateY(-20px)" },
      duration: "fast",
      easing: "ease-in-cubic"
    }
  },
  
  // 模态框进入
  modalEnter: {
    in: {
      from: { opacity: 0, transform: "scale(0.9) translateY(-20px)" },
      to: { opacity: 1, transform: "scale(1) translateY(0px)" },
      duration: "normal",
      easing: "ease-out-back"
    }
  },
  
  // 模态框退出
  modalExit: {
    out: {
      from: { opacity: 1, transform: "scale(1) translateY(0px)" },
      to: { opacity: 0, transform: "scale(0.9) translateY(-20px)" },
      duration: "fast",
      easing: "ease-in-back"
    }
  }
}

// 获取动画配置
export function getAnimationConfig(
  componentName: string,
  animationType: string,
  direction: 'in' | 'out' = 'in'
): AnimationTiming | null {
  // 先查找组件特定动画
  if (componentAnimations[componentName]?.[animationType]) {
    return componentAnimations[componentName][animationType][direction]
  }
  
  // 再查找通用动画预设
  if (animationPresets[animationType]) {
    return animationPresets[animationType][direction]
  }
  
  return null
}

// 生成CSS动画
export function generateCSSAnimation(
  componentName: string,
  animationType: string,
  direction: 'in' | 'out' = 'in'
): string {
  const config = getAnimationConfig(componentName, animationType, direction)
  if (!config) return ''
  
  const duration = animationDurations[config.duration] || config.duration
  const easing = animationEasings[config.easing] || config.easing
  
  return `
    animation: ${animationType}-${direction} ${duration} ${easing} forwards;
  `.trim()
}

// 验证动画配置
export function validateAnimationConfig(
  componentName: string,
  animationType: string
): { isValid: boolean; error?: string } {
  const hasComponentAnimation = !!componentAnimations[componentName]?.[animationType]
  const hasPresetAnimation = !!animationPresets[animationType]
  
  if (!hasComponentAnimation && !hasPresetAnimation) {
    return {
      isValid: false,
      error: `Animation ${animationType} not found for component ${componentName}`
    }
  }
  
  return { isValid: true }
}
