import type React from "react"
export interface ColorConfig {
  id: number
  name: string
  value: string
  enabled: boolean
}

export interface PresetConfig {
  name: string
  colors: [string, string, string]
}

export interface ChartPaletteConfig {
  name: string
  colors: string[]
}

export interface CardThemeConfig {
  background: string
  backgroundStyle: "solid" | "frosted" | "none"
  frostedOpacity?: "normal" | "high"
  fontColor: string
  fontFamily: string
}



export interface CardThemePreset {
  name: string
  config: CardThemeConfig
}

export interface CardAction {
  type: "navigate" | "modal" | "custom"
  target?: string
  data?: any
}

export type CardType =
  | "list" // 列表卡片 - 展示多条数据的列表形式
  | "single" // 单独卡片 - 展示单条数据的详细信息
  | "navigation" // 导航卡片 - 带有导航功能的卡片
  | "summary" // 摘要卡片 - 数据汇总和概览
  | "detail" // 详情卡片 - 完整的详细信息展示
  | "widget" // 小组件卡片 - 功能性小组件
  | "form" // 表单卡片 - 数据输入和编辑
  | "chart" // 图表卡片 - 数据可视化展示

export interface CardConfig {
  name: string
  displayName: string // 添加显示名称字段
  category: string
  type: CardType // 添加卡片类型字段
  width?: "half" | "full"
  component: React.ComponentType<any>
  businessFlow:
  | string
  | {
    description: string
    hasDetailPage?: boolean
    hasModal?: boolean
    actions?: string[]
    dataSource?: "static" | "api" | "user-input"
  }
  // 开发者信息
  developer: {
    name: string
    version: string
    description: string
  }
}

export interface BusinessCardProps {
  data?: any
  onAction?: (action: string, data: any) => void
  [key: string]: any
}

// ===== 设计令牌系统类型定义 =====

// 颜色刻度
export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

// 语义化颜色
export interface SemanticColors {
  success: ColorScale
  warning: ColorScale
  error: ColorScale
  info: ColorScale
}

// 背景颜色
export interface BackgroundColors {
  primary: string
  secondary: string
  tertiary: string
}

// 文字颜色
export interface TextColors {
  primary: string
  secondary: string
  tertiary: string
  inverse: string
}

// 颜色令牌
export interface ColorTokens {
  primary: ColorScale
  secondary: ColorScale
  neutral: ColorScale
  semantic: SemanticColors
  background: BackgroundColors
  text: TextColors
}

// 字体族
export interface FontFamily {
  primary: string
  secondary: string
  mono: string
}

// 字体大小
export interface FontSize {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
}

// 字体大小预设
export type FontSizePreset = 'small' | 'normal' | 'large'

// 字体大小配置
export interface FontSizeConfig {
  preset: FontSizePreset
  scale: number // 缩放比例：0.8 (小), 1.0 (正常), 1.2 (大)
  sizes: FontSize
}

// 字体粗细
export interface FontWeight {
  light: number
  normal: number
  medium: number
  semibold: number
  bold: number
}

// 行高
export interface LineHeight {
  tight: number
  normal: number
  relaxed: number
}

// 字体令牌
export interface TypographyTokens {
  fontFamily: FontFamily
  fontSize: FontSize
  fontWeight: FontWeight
  lineHeight: LineHeight
}

// 间距令牌
export interface SpacingTokens {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
}

// 圆角令牌
export interface RadiusTokens {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

// 阴影令牌
export interface ShadowTokens {
  sm: string
  md: string
  lg: string
  xl: string
  inner: string
}

// 边框宽度
export interface BorderWidth {
  thin: string
  medium: string
  thick: string
}

// 边框样式
export interface BorderStyle {
  solid: string
  dashed: string
  dotted: string
}

// 边框令牌
export interface BorderTokens {
  width: BorderWidth
  style: BorderStyle
}

// 全局边角配置令牌
export interface GlobalRadiusTokens {
  active: string
  presets: {
    [key: string]: {
      name: string
      description: string
      values: {
        card: string
        button: string
        input: string
        modal: string
      }
    }
  }
}

// 完整设计令牌
export interface DesignTokens {
  colors: ColorTokens
  typography: TypographyTokens
  spacing: SpacingTokens
  radius: RadiusTokens
  shadows: ShadowTokens
  borders: BorderTokens
  globalRadius: GlobalRadiusTokens
  fontSizeConfig?: FontSizeConfig
}

// 设计令牌上下文类型
export interface DesignTokensContextType {
  tokens: DesignTokens
  updateTokens: (updates: Partial<DesignTokens>) => void
  getToken: (path: string) => any
  setToken: (path: string, value: any) => void
  generateCSSVariables: () => string
  export: (format: 'json' | 'css' | 'scss') => string
}

// ===== 布局配置系统类型定义 =====

// 侧边栏配置
export interface SidebarConfig {
  width: number
  collapsedWidth: number
  position: 'left' | 'right'
  behavior: 'fixed' | 'sticky' | 'static'
}

// 头部配置
export interface HeaderConfig {
  height: number
  sticky: boolean
  transparent: boolean
}

// 底部配置
export interface FooterConfig {
  height: number
  sticky: boolean
  visible: boolean
}

// 内容配置
export interface ContentConfig {
  maxWidth: number
  padding: number
  margin: 'auto' | 'none'
}

// 页面布局配置
export interface PageLayoutConfig {
  type: 'sidebar' | 'topbar' | 'fullscreen' | 'split'
  sidebar: SidebarConfig
  header: HeaderConfig
  footer: FooterConfig
  content: ContentConfig
}

// 断点配置
export interface BreakpointsConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

// 网格系统配置
export interface GridSystemConfig {
  columns: number
  gutter: number
  margin: number
  breakpoints: BreakpointsConfig
}

// 容器配置
export interface ContainersConfig {
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  fluid: boolean
}

// 间距系统配置
export interface SpacingSystemConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
}

// 完整布局配置
export interface LayoutConfig {
  pageLayout: PageLayoutConfig
  gridSystem: GridSystemConfig
  containers: ContainersConfig
  spacing: SpacingSystemConfig
}

// 布局配置上下文类型
export interface LayoutConfigContextType {
  config: LayoutConfig
  updateConfig: (updates: Partial<LayoutConfig>) => void
  getConfig: (path: string) => any
  setConfig: (path: string, value: any) => void
  applyPreset: (presetName: string) => void
  generateCSSVariables: () => string
  export: (format: 'json' | 'css') => string
}

// ===== 组件样式配置系统类型定义 =====

// 按钮样式配置
export interface ButtonStyleConfig {
  // 基础样式
  base: {
    padding: string
    borderRadius: string
    fontSize: string
    fontWeight: string
    transition: string
    cursor: string
    border: string
    outline: string
  }
  // 变体样式
  variants: {
    primary: {
      backgroundColor: string
      color: string
      borderColor: string
      hover: {
        backgroundColor: string
        color: string
        borderColor: string
      }
      active: {
        backgroundColor: string
        color: string
        borderColor: string
      }
      disabled: {
        backgroundColor: string
        color: string
        borderColor: string
        cursor: string
      }
    }
    secondary: {
      backgroundColor: string
      color: string
      borderColor: string
      hover: {
        backgroundColor: string
        color: string
        borderColor: string
      }
      active: {
        backgroundColor: string
        color: string
        borderColor: string
      }
      disabled: {
        backgroundColor: string
        color: string
        borderColor: string
        cursor: string
      }
    }
    outline: {
      backgroundColor: string
      color: string
      borderColor: string
      hover: {
        backgroundColor: string
        color: string
        borderColor: string
      }
      active: {
        backgroundColor: string
        color: string
        borderColor: string
      }
      disabled: {
        backgroundColor: string
        color: string
        borderColor: string
        cursor: string
      }
    }
    ghost: {
      backgroundColor: string
      color: string
      borderColor: string
      hover: {
        backgroundColor: string
        color: string
        borderColor: string
      }
      active: {
        backgroundColor: string
        color: string
        borderColor: string
      }
      disabled: {
        backgroundColor: string
        color: string
        borderColor: string
        cursor: string
      }
    }
  }
  // 尺寸样式
  sizes: {
    sm: {
      padding: string
      fontSize: string
      borderRadius: string
    }
    md: {
      padding: string
      fontSize: string
      borderRadius: string
    }
    lg: {
      padding: string
      fontSize: string
      borderRadius: string
    }
  }
}

// 输入框样式配置
export interface InputStyleConfig {
  // 基础样式
  base: {
    padding: string
    borderRadius: string
    fontSize: string
    border: string
    outline: string
    transition: string
    backgroundColor: string
    color: string
  }
  // 状态样式
  states: {
    focus: {
      borderColor: string
      boxShadow: string
    }
    error: {
      borderColor: string
      backgroundColor: string
    }
    disabled: {
      backgroundColor: string
      color: string
      cursor: string
    }
  }
  // 尺寸样式
  sizes: {
    sm: {
      padding: string
      fontSize: string
      borderRadius: string
    }
    md: {
      padding: string
      fontSize: string
      borderRadius: string
    }
    lg: {
      padding: string
      fontSize: string
      borderRadius: string
    }
  }
}

// 卡片样式配置
export interface CardStyleConfig {
  // 基础样式
  base: {
    backgroundColor: string
    borderRadius: string
    border: string
    boxShadow: string
    padding: string
    transition: string
  }
  // 变体样式
  variants: {
    default: {
      backgroundColor: string
      borderColor: string
      boxShadow: string
    }
    elevated: {
      backgroundColor: string
      borderColor: string
      boxShadow: string
    }
    outlined: {
      backgroundColor: string
      borderColor: string
      boxShadow: string
    }
    ghost: {
      backgroundColor: string
      borderColor: string
      boxShadow: string
    }
  }
  // 尺寸样式
  sizes: {
    sm: {
      padding: string
      borderRadius: string
    }
    md: {
      padding: string
      borderRadius: string
    }
    lg: {
      padding: string
      borderRadius: string
    }
  }
}

// 导航样式配置
export interface NavigationStyleConfig {
  // 基础样式
  base: {
    backgroundColor: string
    borderBottom: string
    padding: string
    transition: string
  }
  // 导航项样式
  item: {
    base: {
      padding: string
      color: string
      textDecoration: string
      transition: string
      borderRadius: string
    }
    states: {
      hover: {
        backgroundColor: string
        color: string
      }
      active: {
        backgroundColor: string
        color: string
        fontWeight: string
      }
      disabled: {
        color: string
        cursor: string
      }
    }
  }
  // 下拉菜单样式
  dropdown: {
    backgroundColor: string
    border: string
    borderRadius: string
    boxShadow: string
    padding: string
  }
}

// 标签样式配置
export interface TagStyleConfig {
  // 基础样式
  base: {
    padding: string
    borderRadius: string
    fontSize: string
    fontWeight: string
    border: string
    transition: string
  }
  // 变体样式
  variants: {
    default: {
      backgroundColor: string
      color: string
      borderColor: string
    }
    primary: {
      backgroundColor: string
      color: string
      borderColor: string
    }
    success: {
      backgroundColor: string
      color: string
      borderColor: string
    }
    warning: {
      backgroundColor: string
      color: string
      borderColor: string
    }
    error: {
      backgroundColor: string
      color: string
      borderColor: string
    }
  }
  // 尺寸样式
  sizes: {
    sm: {
      padding: string
      fontSize: string
      borderRadius: string
    }
    md: {
      padding: string
      fontSize: string
      borderRadius: string
    }
    lg: {
      padding: string
      fontSize: string
      borderRadius: string
    }
  }
}

// 完整组件样式配置
export interface ComponentStyleConfig {
  button: ButtonStyleConfig
  input: InputStyleConfig
  card: CardStyleConfig
  navigation: NavigationStyleConfig
  tag: TagStyleConfig
}

// 组件样式配置上下文类型
export interface ComponentStyleConfigContextType {
  config: ComponentStyleConfig
  updateConfig: (updates: Partial<ComponentStyleConfig>) => void
  getConfig: (path: string) => any
  setConfig: (path: string, value: any) => void
  applyPreset: (presetName: string) => void
  generateCSSVariables: () => string
  export: (format: 'json' | 'css') => string
}

// ===== 组件变体系统类型定义 =====

// 组件变体配置
export interface ComponentVariant extends ComponentVariantState, ComponentVariantInteraction {}

// 组件尺寸配置
export interface ComponentSize {
  height?: string
  padding: {
    horizontal: string
    vertical: string
  }
  fontSize: string
  borderRadius: string
}

// 组件形状配置
export interface ComponentShape {
  [key: string]: string
}

// 组件变体系统
export interface ComponentVariants {
  variant: Record<string, ComponentVariant>
  size: Record<string, ComponentSize>
  shape?: Record<string, string>
}

// 组件变体上下文
export interface ComponentVariantsContextType {
  variants: ComponentVariants
  currentVariant: string
  currentSize: string
  setVariant: (variant: string) => void
  setSize: (size: string) => void
  getVariantStyles: (variant: string, size?: string) => ComponentVariantState
  validateVariant: (variant: string, size?: string) => { isValid: boolean; error?: string }
}

// ===== 动画系统类型定义 =====

// 动画关键帧
export interface AnimationKeyframe {
  opacity?: number
  transform?: string
  boxShadow?: string
  borderColor?: string
  [key: string]: any
}

// 动画时序配置
export interface AnimationTiming {
  from: AnimationKeyframe
  to: AnimationKeyframe
  duration: string
  easing: string
}

// 动画预设
export interface AnimationPreset {
  in: AnimationTiming
  out: AnimationTiming
}

// 动画配置
export interface AnimationConfig {
  duration: string
  easing: string
  delay?: string
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  iterationCount?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
}

// 动画状态
export interface AnimationState {
  isAnimating: boolean
  currentAnimation: string | null
  animationDirection: 'in' | 'out'
}

// 动画上下文
export interface AnimationContextType {
  state: AnimationState
  playAnimation: (animationType: string, direction?: 'in' | 'out') => void
  stopAnimation: () => void
  getAnimationConfig: (componentName: string, animationType: string, direction?: 'in' | 'out') => AnimationTiming | null
  validateAnimation: (componentName: string, animationType: string) => { isValid: boolean; error?: string }
}

// ===== 语义令牌系统类型定义 =====

// 语义令牌值
export interface SemanticTokenValue {
  background?: string
  color?: string
  border?: string
  shadow?: string
  ring?: string
  backdrop?: string
  fallback: string[]
}

// 令牌映射
export interface TokenMapping {
  [semanticPath: string]: SemanticTokenValue
}

// 语义上下文
export interface SemanticContext {
  name: string
  description: string
  overrides?: Partial<TokenMapping>
}

// 语义令牌
export interface SemanticTokens {
  mapping: TokenMapping
  contexts: SemanticContext[]
  currentContext: string
}

// 语义令牌上下文
export interface SemanticTokensContextType {
  tokens: SemanticTokens
  currentContext: string
  setContext: (contextName: string) => void
  getToken: (semanticPath: string) => SemanticTokenValue | undefined
  validateToken: (semanticPath: string) => { isValid: boolean; error?: string }
  getFallback: (semanticPath: string) => string[]
  generateCSS: () => string
}

// ===== 可访问性系统类型定义 =====

// 对比度要求
export interface ContrastRatio {
  ratio: number
  description: string
}

// 焦点管理约束
export interface FocusManagement {
  focusVisible: {
    required: boolean
    style: string
    fallback: string
  }
  focusOrder: {
    logical: boolean
    tabIndex: string
    skipLinks: boolean
  }
  focusTrap: {
    modal: boolean
    dialog: boolean
    menu: boolean
    combobox: boolean
  }
  focusRestore: {
    modal: boolean
    navigation: boolean
    dynamic: boolean
  }
}

// 键盘导航约束
export interface KeyboardNavigation {
  basic: Record<string, string>
  components: Record<string, Record<string, string>>
}

// 可访问性约束
export interface AccessibilityConstraints {
  contrast: ContrastRatio
  focus: FocusManagement
  keyboard: KeyboardNavigation
  screenReader: Record<string, any>
  motion: Record<string, any>
}

// ===== 配置验证系统类型定义 =====

// 验证结果
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  summary: {
    total: number
    violations: number
    warnings: number
  }
}

// 配置策略
export interface ConfigPolicy {
  name: string
  description: string
  rules: string[]
  severity: 'error' | 'warning' | 'info'
}

// 配置验证器
export interface ConfigValidator {
  validate: (config: any) => ValidationResult
  addPolicy: (policy: ConfigPolicy) => void
  removePolicy: (policyName: string) => void
}

// ===== 主题切换系统类型定义 =====

// 主题维度
export interface ThemeDimension {
  name: string
  values: string[]
  current: string
  description: string
}

// 主题配置
export interface ThemeConfig {
  dimensions: ThemeDimension[]
  current: Record<string, string>
  presets: Record<string, Record<string, string>>
}

// 主题上下文
export interface ThemeContextType {
  config: ThemeConfig
  currentTheme: Record<string, string>
  setDimension: (dimension: string, value: string) => void
  applyPreset: (presetName: string) => void
  resetTheme: () => void
  exportTheme: () => string
  importTheme: (themeData: string) => void
}

// ===== 配置管理UI类型定义 =====

// 配置面板项
export interface ConfigPanelItem {
  id: string
  label: string
  description: string
  type: 'color' | 'slider' | 'select' | 'toggle' | 'input'
  value: any
  options?: any[]
  onChange: (value: any) => void
  validation?: (value: any) => { isValid: boolean; error?: string }
}

// 配置面板
export interface ConfigPanel {
  id: string
  title: string
  description: string
  items: ConfigPanelItem[]
  collapsible?: boolean
  defaultCollapsed?: boolean
}

// 配置管理UI上下文
export interface ConfigManagementContextType {
  panels: ConfigPanel[]
  addPanel: (panel: ConfigPanel) => void
  removePanel: (panelId: string) => void
  updatePanelItem: (panelId: string, itemId: string, value: any) => void
  resetPanel: (panelId: string) => void
  exportConfig: () => string
  importConfig: (configData: string) => void
}

// ===== 统一主题系统类型定义 =====

// 字体颜色配置
export interface FontColorConfig {
  heading: string    // 标题颜色
  body: string       // 正文颜色
}

// 组件颜色配置
export interface ComponentColorConfig {
  primary: string    // 主要按钮颜色
  secondary: string  // 次要按钮颜色
  danger: string     // 危险按钮颜色
}

// 数据图配色配置
export interface ChartColorConfig {
  colors: string[]    // 6个图表颜色
}

// 统一主题配置
export interface UnifiedThemeConfig {
  fontColors: FontColorConfig      // 字体颜色配置
  componentColors: ComponentColorConfig  // 组件颜色配置
  chartColors: ChartColorConfig    // 数据图配色配置
}

// 统一主题预设
export interface UnifiedThemePreset {
  name: string
  description: string
  category: string
  config: UnifiedThemeConfig
}

// 统一主题上下文类型
export interface UnifiedThemeContextType {
  currentTheme: UnifiedThemePreset
  availableThemes: UnifiedThemePreset[]
  applyTheme: (themeName: string) => void
  updateFontColors: (fontColors: Partial<FontColorConfig>) => void
  updateComponentColors: (colors: Partial<ComponentColorConfig>) => void
  updateChartColors: (colors: Partial<ChartColorConfig>) => void
  resetToTheme: (themeName: string) => void
  isHydrated: boolean
}
