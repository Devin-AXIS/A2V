/**
 * 颜色变量映射工具
 * 将设计令牌中的颜色值映射到CSS变量
 */

// 设计令牌到CSS变量的映射
export const colorVariableMap: Record<string, string> = {
  // 主色调
  'colors.primary.50': '--primary-50',
  'colors.primary.100': '--primary-100',
  'colors.primary.200': '--primary-200',
  'colors.primary.300': '--primary-300',
  'colors.primary.400': '--primary-400',
  'colors.primary.500': '--primary-500',
  'colors.primary.600': '--primary-600',
  'colors.primary.700': '--primary-700',
  'colors.primary.800': '--primary-800',
  'colors.primary.900': '--primary-900',
  
  // 辅色调
  'colors.secondary.50': '--secondary-50',
  'colors.secondary.100': '--secondary-100',
  'colors.secondary.200': '--secondary-200',
  'colors.secondary.300': '--secondary-300',
  'colors.secondary.400': '--secondary-400',
  'colors.secondary.500': '--secondary-500',
  'colors.secondary.600': '--secondary-600',
  'colors.secondary.700': '--secondary-700',
  'colors.secondary.800': '--secondary-800',
  'colors.secondary.900': '--secondary-900',
  
  // 中性色
  'colors.neutral.50': '--neutral-50',
  'colors.neutral.100': '--neutral-100',
  'colors.neutral.200': '--neutral-200',
  'colors.neutral.300': '--neutral-300',
  'colors.neutral.400': '--neutral-400',
  'colors.neutral.500': '--neutral-500',
  'colors.neutral.600': '--neutral-600',
  'colors.neutral.700': '--neutral-700',
  'colors.neutral.800': '--neutral-800',
  'colors.neutral.900': '--neutral-900',
  
  // 语义色
  'colors.semantic.success.50': '--success-50',
  'colors.semantic.success.100': '--success-100',
  'colors.semantic.success.200': '--success-200',
  'colors.semantic.success.300': '--success-300',
  'colors.semantic.success.400': '--success-400',
  'colors.semantic.success.500': '--success-500',
  'colors.semantic.success.600': '--success-600',
  'colors.semantic.success.700': '--success-700',
  'colors.semantic.success.800': '--success-800',
  'colors.semantic.success.900': '--success-900',
  
  'colors.semantic.warning.50': '--warning-50',
  'colors.semantic.warning.100': '--warning-100',
  'colors.semantic.warning.200': '--warning-200',
  'colors.semantic.warning.300': '--warning-300',
  'colors.semantic.warning.400': '--warning-400',
  'colors.semantic.warning.500': '--warning-500',
  'colors.semantic.warning.600': '--warning-600',
  'colors.semantic.warning.700': '--warning-700',
  'colors.semantic.warning.800': '--warning-800',
  'colors.semantic.warning.900': '--warning-900',
  
  'colors.semantic.error.50': '--error-50',
  'colors.semantic.error.100': '--error-100',
  'colors.semantic.error.200': '--error-200',
  'colors.semantic.error.300': '--error-300',
  'colors.semantic.error.400': '--error-400',
  'colors.semantic.error.500': '--error-500',
  'colors.semantic.error.600': '--error-600',
  'colors.semantic.error.700': '--error-700',
  'colors.semantic.error.800': '--error-800',
  'colors.semantic.error.900': '--error-900',
  
  'colors.semantic.info.50': '--info-50',
  'colors.semantic.info.100': '--info-100',
  'colors.semantic.info.200': '--info-200',
  'colors.semantic.info.300': '--info-300',
  'colors.semantic.info.400': '--info-400',
  'colors.semantic.info.500': '--info-500',
  'colors.semantic.info.600': '--info-600',
  'colors.semantic.info.700': '--info-700',
  'colors.semantic.info.800': '--info-800',
  'colors.semantic.info.900': '--info-900',
  
  // 功能颜色
  'colors.background.primary': '--background',
  'colors.background.secondary': '--background-secondary',
  'colors.background.tertiary': '--background-tertiary',
  
  'colors.text.primary': '--foreground',
  'colors.text.secondary': '--foreground-secondary',
  'colors.text.tertiary': '--foreground-tertiary',
  'colors.text.inverse': '--foreground-inverse',
}

/**
 * 将设计令牌路径转换为CSS变量名
 */
export function getCSSVariableName(tokenPath: string): string | null {
  return colorVariableMap[tokenPath] || null
}

/**
 * 将设计令牌值转换为CSS变量值
 */
export function convertTokenValueToCSSValue(value: string): string {
  // 如果已经是CSS变量格式，直接返回
  if (value.startsWith('var(--') || value.startsWith('hsl(')) {
    return value
  }
  
  // 如果是十六进制颜色，转换为HSL格式
  if (value.startsWith('#')) {
    return hexToHSL(value)
  }
  
  // 其他情况直接返回
  return value
}

/**
 * 将十六进制颜色转换为HSL格式
 */
function hexToHSL(hex: string): string {
  // 移除#号
  hex = hex.replace('#', '')
  
  // 解析RGB值
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  let l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  
  // 转换为度数
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)
  
  return `${h} ${s}% ${l}%`
}

/**
 * 更新CSS变量
 */
export function updateCSSVariable(variableName: string, value: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty(variableName, value)
  }
}

/**
 * 批量更新CSS变量
 */
export function updateCSSVariables(updates: Record<string, string>): void {
  Object.entries(updates).forEach(([variableName, value]) => {
    updateCSSVariable(variableName, value)
  })
}

/**
 * 从设计令牌更新CSS变量
 */
export function updateCSSVariablesFromTokens(tokens: any, tokenPaths: string[]): void {
  const updates: Record<string, string> = {}
  
  tokenPaths.forEach(path => {
    const cssVariableName = getCSSVariableName(path)
    if (cssVariableName) {
      const tokenValue = getNestedValue(tokens, path)
      if (tokenValue) {
        const cssValue = convertTokenValueToCSSValue(tokenValue)
        updates[cssVariableName] = cssValue
      }
    }
  })
  
  updateCSSVariables(updates)
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}
