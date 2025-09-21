/**
 * 可访问性约束系统
 * 实现对比度校验、键盘导航、焦点管理等约束，确保符合WCAG标准
 * 参考架构师方案的"可访问性优先"理念
 */

import type { AccessibilityConstraints, ContrastRatio, FocusManagement, KeyboardNavigation } from "@/types"

// WCAG 2.1 对比度要求
export const contrastRequirements: Record<string, ContrastRatio> = {
  'AA-large': { ratio: 3.0, description: 'WCAG AA 大文本 (18pt+ 或 14pt+ bold)' },
  'AA-normal': { ratio: 4.5, description: 'WCAG AA 正常文本' },
  'AAA-large': { ratio: 4.5, description: 'WCAG AAA 大文本' },
  'AAA-normal': { ratio: 7.0, description: 'WCAG AAA 正常文本' },
  'UI-component': { ratio: 3.0, description: 'UI组件和图标' },
  'UI-border': { ratio: 3.0, description: 'UI边框和分隔线' }
}

// 焦点管理约束
export const focusManagementConstraints: FocusManagement = {
  // 焦点可见性
  focusVisible: {
    required: true,
    style: 'outline: 2px solid hsl(var(--ring)); outline-offset: 2px;',
    fallback: 'outline: 2px solid hsl(var(--primary-500)); outline-offset: 2px;'
  },
  
  // 焦点顺序
  focusOrder: {
    logical: true,
    tabIndex: 'natural',
    skipLinks: true
  },
  
  // 焦点陷阱
  focusTrap: {
    modal: true,
    dialog: true,
    menu: true,
    combobox: true
  },
  
  // 焦点恢复
  focusRestore: {
    modal: true,
    navigation: true,
    dynamic: true
  }
}

// 键盘导航约束
export const keyboardNavigationConstraints: KeyboardNavigation = {
  // 基本导航键
  basic: {
    Tab: 'next-focusable',
    'Shift+Tab': 'previous-focusable',
    Enter: 'activate',
    Space: 'activate',
    Escape: 'close/cancel',
    ArrowKeys: 'navigate'
  },
  
  // 组件特定导航
  components: {
    button: {
      Enter: 'activate',
      Space: 'activate'
    },
    link: {
      Enter: 'activate'
    },
    checkbox: {
      Space: 'toggle'
    },
    radio: {
      ArrowKeys: 'select',
      Space: 'select'
    },
    select: {
      Enter: 'open',
      Space: 'open',
      ArrowKeys: 'navigate',
      Escape: 'close'
    },
    combobox: {
      Enter: 'select',
      Escape: 'close',
      ArrowKeys: 'navigate',
      'Ctrl+A': 'select-all'
    },
    menu: {
      ArrowKeys: 'navigate',
      Enter: 'activate',
      Escape: 'close',
      Home: 'first-item',
      End: 'last-item'
    },
    dialog: {
      Escape: 'close',
      Tab: 'trap-focus',
      'Shift+Tab': 'trap-focus'
    }
  }
}

// 屏幕阅读器支持约束
export const screenReaderConstraints = {
  // ARIA标签
  ariaLabels: {
    required: true,
    descriptive: true,
    unique: true
  },
  
  // 语义化HTML
  semanticHTML: {
    required: true,
    landmarks: true,
    headings: true,
    lists: true,
    tables: true
  },
  
  // 动态内容更新
  liveRegions: {
    status: 'polite',
    alerts: 'assertive',
    logs: 'polite'
  }
}

// 运动偏好约束
export const motionPreferences = {
  // 减少运动
  reduced: {
    animations: 'minimal',
    transitions: 'instant',
    transforms: 'none',
    duration: '0ms'
  },
  
  // 偏好运动
  preferred: {
    animations: 'smooth',
    transitions: 'ease-out',
    transforms: 'enabled',
    duration: '200ms'
  }
}

// 对比度计算函数
export function calculateContrastRatio(color1: string, color2: string): number {
  // 将颜色转换为相对亮度
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      if (c <= 0.03928) return c / 12.92
      return Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// 验证对比度
export function validateContrastRatio(
  foreground: string,
  background: string,
  requirement: keyof typeof contrastRequirements = 'AA-normal'
): { isValid: boolean; ratio: number; required: number; error?: string } {
  const ratio = calculateContrastRatio(foreground, background)
  const required = contrastRequirements[requirement].ratio
  
  return {
    isValid: ratio >= required,
    ratio,
    required,
    error: ratio < required 
      ? `Contrast ratio ${ratio.toFixed(2)}:1 is below required ${required}:1 for ${requirement}` 
      : undefined
  }
}

// 验证焦点管理
export function validateFocusManagement(
  component: string,
  constraints: Partial<FocusManagement>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const required = focusManagementConstraints
  
  // 检查焦点可见性
  if (constraints.focusVisible?.required && !constraints.focusVisible?.style) {
    errors.push(`${component}: Focus visible style is required`)
  }
  
  // 检查焦点陷阱
  if (constraints.focusTrap?.modal && !constraints.focusTrap?.dialog) {
    errors.push(`${component}: Modal focus trap requires dialog focus trap`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 验证键盘导航
export function validateKeyboardNavigation(
  component: string,
  supportedKeys: string[]
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const required = keyboardNavigationConstraints.components[component as keyof typeof keyboardNavigationConstraints.components]
  
  if (!required) {
    warnings.push(`${component}: No specific keyboard navigation requirements defined`)
    return { isValid: true, errors, warnings }
  }
  
  // 检查必需键
  Object.entries(required).forEach(([key, action]) => {
    if (!supportedKeys.includes(key)) {
      errors.push(`${component}: Missing required key '${key}' for action '${action}'`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// 生成可访问性CSS
export function generateAccessibilityCSS(): string {
  return `
/* Accessibility CSS Variables */
:root {
  /* Focus Management */
  --focus-visible: 2px solid hsl(var(--ring));
  --focus-visible-offset: 2px;
  --focus-trap: hsl(var(--ring) / 0.2);
  
  /* Motion Preferences */
  --motion-reduced: 0ms;
  --motion-preferred: 200ms;
  --motion-easing: ease-out;
  
  /* High Contrast Support */
  --high-contrast-border: 2px solid;
  --high-contrast-shadow: 0 0 0 2px;
}

/* Focus Visible Styles */
.focus-visible {
  outline: var(--focus-visible);
  outline-offset: var(--focus-visible-offset);
}

/* Motion Reduction */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: var(--motion-reduced) !important;
    animation-iteration-count: 1 !important;
    transition-duration: var(--motion-reduced) !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .border {
    border-width: var(--high-contrast-border);
  }
  
  .shadow {
    box-shadow: var(--high-contrast-shadow);
  }
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
  `.trim()
}

// 可访问性约束检查器
export class AccessibilityChecker {
  private violations: string[] = []
  private warnings: string[] = []
  
  // 检查组件对比度
  checkContrast(component: string, foreground: string, background: string, requirement: keyof typeof contrastRequirements = 'AA-normal') {
    const result = validateContrastRatio(foreground, background, requirement)
    if (!result.isValid) {
      this.violations.push(`${component}: ${result.error}`)
    }
    return result
  }
  
  // 检查焦点管理
  checkFocusManagement(component: string, constraints: Partial<FocusManagement>) {
    const result = validateFocusManagement(component, constraints)
    if (!result.isValid) {
      this.violations.push(...result.errors)
    }
    return result
  }
  
  // 检查键盘导航
  checkKeyboardNavigation(component: string, supportedKeys: string[]) {
    const result = validateKeyboardNavigation(component, supportedKeys)
    if (!result.isValid) {
      this.violations.push(...result.errors)
    }
    if (result.warnings.length > 0) {
      this.warnings.push(...result.warnings)
    }
    return result
  }
  
  // 获取检查结果
  getResults() {
    return {
      isValid: this.violations.length === 0,
      violations: this.violations,
      warnings: this.warnings,
      summary: {
        total: this.violations.length + this.warnings.length,
        violations: this.violations.length,
        warnings: this.warnings.length
      }
    }
  }
  
  // 清除结果
  clear() {
    this.violations = []
    this.warnings = []
  }
}
