/**
 * 环境检测和错误处理工具
 * 用于检测用户环境中的兼容性问题并提供回退方案
 */

export interface EnvironmentInfo {
  hasLocalStorage: boolean
  hasSessionStorage: boolean
  supportsBackdropBlur: boolean
  supportsCSSVariables: boolean
  isPrivateMode: boolean
  userAgent: string
  browser: string
  version: string
}

/**
 * 检测浏览器环境信息
 */
export function detectEnvironment(): EnvironmentInfo {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  
  // 检测浏览器类型和版本
  const browserInfo = detectBrowser(userAgent)
  
  // 检测 localStorage 支持
  const hasLocalStorage = testLocalStorage()
  
  // 检测 sessionStorage 支持
  const hasSessionStorage = testSessionStorage()
  
  // 检测是否处于隐私模式
  const isPrivateMode = detectPrivateMode()
  
  // 检测 CSS 特性支持
  const supportsBackdropBlur = testBackdropBlur()
  const supportsCSSVariables = testCSSVariables()
  
  return {
    hasLocalStorage,
    hasSessionStorage,
    supportsBackdropBlur,
    supportsCSSVariables,
    isPrivateMode,
    userAgent,
    browser: browserInfo.name,
    version: browserInfo.version
  }
}

/**
 * 检测浏览器类型和版本
 */
function detectBrowser(userAgent: string): { name: string; version: string } {
  if (userAgent.includes('Chrome')) {
    const match = userAgent.match(/Chrome\/(\d+)/)
    return { name: 'Chrome', version: match ? match[1] : 'unknown' }
  }
  if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/)
    return { name: 'Firefox', version: match ? match[1] : 'unknown' }
  }
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/)
    return { name: 'Safari', version: match ? match[1] : 'unknown' }
  }
  if (userAgent.includes('Edge')) {
    const match = userAgent.match(/Edge\/(\d+)/)
    return { name: 'Edge', version: match ? match[1] : 'unknown' }
  }
  return { name: 'Unknown', version: 'unknown' }
}

/**
 * 测试 localStorage 是否可用
 */
function testLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * 测试 sessionStorage 是否可用
 */
function testSessionStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const test = '__sessionStorage_test__'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * 检测是否处于隐私模式
 */
function detectPrivateMode(): boolean {
  try {
    if (typeof window === 'undefined') return false
    
    // 检测 Safari 隐私模式
    if (window.navigator.userAgent.includes('Safari') && !window.navigator.userAgent.includes('Chrome')) {
      try {
        localStorage.setItem('__test__', 'test')
        localStorage.removeItem('__test__')
        return false
      } catch {
        return true
      }
    }
    
    // 检测 Chrome 隐私模式
    if (window.navigator.userAgent.includes('Chrome')) {
      const isPrivate = !window.indexedDB
      return isPrivate
    }
    
    return false
  } catch {
    return true
  }
}

/**
 * 测试 backdrop-blur 支持
 */
function testBackdropBlur(): boolean {
  try {
    if (typeof window === 'undefined') return false
    return CSS.supports('backdrop-filter', 'blur(10px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
  } catch {
    return false
  }
}

/**
 * 测试 CSS 变量支持
 */
function testCSSVariables(): boolean {
  try {
    if (typeof window === 'undefined') return false
    return CSS.supports('color', 'var(--test)')
  } catch {
    return false
  }
}

/**
 * 获取环境兼容性警告信息
 */
export function getCompatibilityWarnings(env: EnvironmentInfo): string[] {
  const warnings: string[] = []
  
  if (!env.hasLocalStorage) {
    warnings.push('localStorage 不可用，主题设置无法保存')
  }
  
  if (env.isPrivateMode) {
    warnings.push('检测到隐私模式，某些功能可能受限')
  }
  
  if (!env.supportsBackdropBlur) {
    warnings.push('浏览器不支持 backdrop-blur，某些视觉效果可能不显示')
  }
  
  if (!env.supportsCSSVariables) {
    warnings.push('浏览器不支持 CSS 变量，主题切换功能可能受限')
  }
  
  // 检查浏览器版本兼容性
  if (env.browser === 'Chrome' && parseInt(env.version) < 80) {
    warnings.push('Chrome 版本过低，建议升级到最新版本')
  }
  
  if (env.browser === 'Firefox' && parseInt(env.version) < 75) {
    warnings.push('Firefox 版本过低，建议升级到最新版本')
  }
  
  if (env.browser === 'Safari' && parseInt(env.version) < 13) {
    warnings.push('Safari 版本过低，建议升级到最新版本')
  }
  
  return warnings
}

/**
 * 提供回退方案
 */
export function getFallbackOptions(env: EnvironmentInfo) {
  return {
    useLocalStorage: env.hasLocalStorage,
    useSessionStorage: env.hasSessionStorage && !env.hasLocalStorage,
    useMemoryStorage: !env.hasLocalStorage && !env.hasSessionStorage,
    useCSSVariables: env.supportsCSSVariables,
    useInlineStyles: !env.supportsCSSVariables,
    useBackdropBlur: env.supportsBackdropBlur,
    useSolidBackground: !env.supportsBackdropBlur
  }
}
