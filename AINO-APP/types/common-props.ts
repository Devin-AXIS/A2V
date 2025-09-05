/**
 * 通用Props接口定义
 * 统一项目中常用的Props接口，减少重复定义
 * @deprecated 请使用 types/unified-types.ts 中的类型定义
 */

// 重新导出统一类型，保持向后兼容
export type {
  BaseProps,
  WithId,
  WithLocale,
  WithDict,
  WithAction,
  WithEditingMode,
  WithThemeControl,
  ComponentProps,
  CardProps,
  NavigationProps,
  FormProps,
  StyleVariant,
  StyleSize,
  LayoutType,
  LayoutBreakpoint
} from './unified-types'

// 保持向后兼容的别名
export type ExtendedProps = BaseProps & WithId
export type ThemeProps = BaseProps & { theme?: string; variant?: string; color?: string }
export type LayoutProps = BaseProps & { 
  layout?: 'grid' | 'flex' | 'absolute'
  columns?: number
  gap?: number
  padding?: number
  margin?: number
}
export type AnimationProps = BaseProps & {
  animation?: 'fade' | 'slide' | 'scale' | 'none'
  duration?: number
  delay?: number
}
export type ResponsiveProps = BaseProps & {
  breakpoint?: LayoutBreakpoint
  hideOn?: LayoutBreakpoint
  showOn?: LayoutBreakpoint
}
