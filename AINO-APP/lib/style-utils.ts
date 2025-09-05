/**
 * 统一样式工具函数
 * 提供标准化的样式处理，确保样式使用一致性
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 统一的类名合并函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 样式变体类型
export type StyleVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type StyleSize = 'sm' | 'md' | 'lg' | 'xl'

// 统一的样式变体配置
export const styleVariants = {
  default: "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
} as const

// 统一的尺寸配置
export const styleSizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 py-2",
  lg: "h-11 px-8",
  xl: "h-12 px-10 text-lg"
} as const

// 统一的圆角配置
export const styleRadius = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full"
} as const

// 统一的间距配置
export const styleSpacing = {
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8"
} as const

// 统一的阴影配置
export const styleShadows = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl"
} as const

// 统一的动画配置
export const styleAnimations = {
  none: "transition-none",
  fast: "transition-all duration-150",
  normal: "transition-all duration-200",
  slow: "transition-all duration-300"
} as const

// 生成样式变体
export function getVariantStyles(variant: StyleVariant): string {
  return styleVariants[variant]
}

// 生成尺寸样式
export function getSizeStyles(size: StyleSize): string {
  return styleSizes[size]
}

// 生成圆角样式
export function getRadiusStyles(radius: keyof typeof styleRadius): string {
  return styleRadius[radius]
}

// 生成间距样式
export function getSpacingStyles(spacing: keyof typeof styleSpacing): string {
  return styleSpacing[spacing]
}

// 生成阴影样式
export function getShadowStyles(shadow: keyof typeof styleShadows): string {
  return styleShadows[shadow]
}

// 生成动画样式
export function getAnimationStyles(animation: keyof typeof styleAnimations): string {
  return styleAnimations[animation]
}

// 组合样式
export function combineStyles(...styles: (string | undefined | null)[]): string {
  return cn(...styles.filter(Boolean))
}

// 条件样式
export function conditionalStyles(
  condition: boolean,
  trueStyles: string,
  falseStyles?: string
): string {
  return condition ? trueStyles : (falseStyles || "")
}

// 响应式样式
export function responsiveStyles(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string {
  return cn(
    base,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`
  )
}

// 状态样式
export function getStateStyles(
  base: string,
  hover?: string,
  focus?: string,
  active?: string,
  disabled?: string
): string {
  return cn(
    base,
    hover && `hover:${hover}`,
    focus && `focus:${focus}`,
    active && `active:${active}`,
    disabled && `disabled:${disabled}`
  )
}

// 主题样式
export function getThemeStyles(
  light: string,
  dark: string
): string {
  return cn(`light:${light}`, `dark:${dark}`)
}

// 组件基础样式
export const componentBaseStyles = {
  button: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  input: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  card: "rounded-lg border bg-card text-card-foreground shadow-sm",
  badge: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
} as const

// 获取组件基础样式
export function getComponentBaseStyles(component: keyof typeof componentBaseStyles): string {
  return componentBaseStyles[component]
}
