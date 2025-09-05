/**
 * 智能对比度计算工具
 * 用于自动计算按钮文字的最佳对比度颜色
 * 确保按钮文字在任何背景色下都有良好的可读性
 */

/**
 * 将十六进制颜色转换为RGB值
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // 移除 # 符号
  const cleanHex = hex.replace('#', '')
  
  // 处理3位和6位十六进制
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map(char => char + char).join('')
    : cleanHex
  
  if (fullHex.length !== 6) return null
  
  const r = parseInt(fullHex.substring(0, 2), 16)
  const g = parseInt(fullHex.substring(2, 4), 16)
  const b = parseInt(fullHex.substring(4, 6), 16)
  
  return { r, g, b }
}

/**
 * 将HSL颜色转换为RGB值
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  
  let r = 0, g = 0, b = 0
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

/**
 * 解析CSS颜色值（支持hex、rgb、hsl等格式）
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // 移除空格
  const cleanColor = color.replace(/\s/g, '')
  
  // 处理十六进制颜色
  if (cleanColor.startsWith('#')) {
    return hexToRgb(cleanColor)
  }
  
  // 处理rgb/rgba颜色
  const rgbMatch = cleanColor.match(/rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10)
    }
  }
  
  // 处理hsl/hsla颜色
  const hslMatch = cleanColor.match(/hsla?\((\d+),(\d+)%,(\d+)%(?:,([\d.]+))?\)/)
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10)
    const s = parseInt(hslMatch[2], 10) / 100
    const l = parseInt(hslMatch[3], 10) / 100
    return hslToRgb(h, s, l)
  }
  
  // 处理CSS变量（如 hsl(var(--primary))）
  if (cleanColor.includes('var(')) {
    // 对于CSS变量，我们返回一个默认值，实际应用中需要从DOM获取
    console.warn('CSS变量颜色需要从DOM获取实际值:', cleanColor)
    return null
  }
  
  return null
}

/**
 * 计算颜色的相对亮度（根据WCAG标准）
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  // 将RGB值转换为线性RGB
  const toLinear = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.03928 
      ? normalized / 12.92 
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  }
  
  const rLinear = toLinear(r)
  const gLinear = toLinear(g)
  const bLinear = toLinear(b)
  
  // 计算相对亮度
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * 计算两种颜色之间的对比度
 */
function getContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
  const lum1 = getRelativeLuminance(color1.r, color1.g, color1.b)
  const lum2 = getRelativeLuminance(color2.r, color2.g, color2.b)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 获取CSS变量的实际值
 */
function getCSSVariableValue(variableName: string): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim()
    
    return value || null
  } catch (error) {
    console.warn('Failed to get CSS variable value:', variableName, error)
    return null
  }
}

/**
 * 解析CSS变量颜色
 */
function parseCSSVariableColor(color: string): { r: number; g: number; b: number } | null {
  const varMatch = color.match(/var\(([^)]+)\)/)
  if (!varMatch) return null
  
  const variableName = varMatch[1]
  const actualValue = getCSSVariableValue(variableName)
  
  if (!actualValue) return null
  
  return parseColor(actualValue)
}

/**
 * 智能获取按钮文字的最佳对比度颜色
 * @param backgroundColor 背景颜色（支持hex、rgb、hsl、CSS变量等格式）
 * @param variant 按钮变体类型
 * @returns 最佳的文字颜色
 */
export function getOptimalTextColor(
  backgroundColor: string, 
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'default' = 'default'
): string {
  // 类型检查：确保backgroundColor是字符串
  if (typeof backgroundColor !== 'string') {
    console.warn('getOptimalTextColor: backgroundColor must be a string, got:', typeof backgroundColor, backgroundColor)
    return variant === 'primary' ? '#FFFFFF' : '#000000'
  }
  
  // 特殊变体的固定颜色规则
  if (variant === 'primary') {
    return '#FFFFFF' // 主按钮固定使用白色文字
  }
  
  if (variant === 'outline' || variant === 'ghost') {
    return 'currentColor' // 轮廓和幽灵按钮跟随当前颜色
  }
  
  // 解析背景颜色
  let bgRgb: { r: number; g: number; b: number } | null = null
  
  // 尝试解析CSS变量
  if (backgroundColor.includes('var(')) {
    bgRgb = parseCSSVariableColor(backgroundColor)
  }
  
  // 如果CSS变量解析失败，尝试直接解析
  if (!bgRgb) {
    bgRgb = parseColor(backgroundColor)
  }
  
  // 如果无法解析背景颜色，返回默认值
  if (!bgRgb) {
    console.warn('无法解析背景颜色，使用默认文字颜色:', backgroundColor)
    return variant === 'secondary' ? '#000000' : '#FFFFFF'
  }
  
  // 计算背景色的相对亮度
  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b)
  
  // 根据亮度选择最佳文字颜色
  const whiteColor = { r: 255, g: 255, b: 255 }
  const blackColor = { r: 0, g: 0, b: 0 }
  
  const whiteContrast = getContrastRatio(bgRgb, whiteColor)
  const blackContrast = getContrastRatio(bgRgb, blackColor)
  
  // 选择对比度更高的颜色
  if (whiteContrast > blackContrast) {
    return '#FFFFFF'
  } else {
    return '#000000'
  }
}

/**
 * 检查颜色对比度是否满足WCAG标准
 * @param backgroundColor 背景颜色
 * @param textColor 文字颜色
 * @param level WCAG级别 ('AA' | 'AAA')
 * @returns 是否满足标准
 */
export function checkWCAGContrast(
  backgroundColor: string,
  textColor: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const bgRgb = parseColor(backgroundColor)
  const textRgb = parseColor(textColor)
  
  if (!bgRgb || !textRgb) return false
  
  const contrastRatio = getContrastRatio(bgRgb, textRgb)
  
  // WCAG标准：AA级别需要4.5:1，AAA级别需要7:1
  const requiredRatio = level === 'AA' ? 4.5 : 7.0
  
  return contrastRatio >= requiredRatio
}

/**
 * 获取按钮变体的智能文字颜色
 * @param variant 按钮变体
 * @param backgroundColor 背景颜色
 * @param customTextColor 自定义文字颜色（可选）
 * @returns 智能选择的文字颜色
 */
export function getButtonTextColor(
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'default',
  backgroundColor?: string,
  customTextColor?: string
): string {
  // 如果有自定义文字颜色，优先使用
  if (customTextColor) {
    return customTextColor
  }
  
  // 如果没有背景颜色，使用默认规则
  if (!backgroundColor) {
    switch (variant) {
      case 'primary':
        return '#FFFFFF'
      case 'secondary':
        return '#000000'
      case 'outline':
      case 'ghost':
        return 'currentColor'
      default:
        return '#FFFFFF'
    }
  }
  
  // 使用智能对比度计算
  return getOptimalTextColor(backgroundColor, variant)
}

/**
 * 创建按钮样式对象，包含智能文字颜色
 * @param variant 按钮变体
 * @param backgroundColor 背景颜色
 * @param customTextColor 自定义文字颜色（可选）
 * @returns 包含样式的对象
 */
export function createButtonStyles(
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'default',
  backgroundColor?: string,
  customTextColor?: string
): { backgroundColor?: string; color: string } {
  return {
    backgroundColor,
    color: getButtonTextColor(variant, backgroundColor, customTextColor)
  }
}
