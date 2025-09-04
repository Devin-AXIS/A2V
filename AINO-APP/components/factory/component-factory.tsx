/**
 * 统一组件工厂
 * 提供标准化的组件创建模式，确保组件结构一致性
 */

import React from "react"
import { cn, getVariantStyles, getSizeStyles, getComponentBaseStyles } from "@/lib/style-utils"
import type { BaseProps, ComponentProps } from "@/types/unified-types"
import { isDeviceCompatible, detectCurrentDeviceType } from "@/lib/device-utils"

// 组件工厂配置
export interface ComponentFactoryConfig {
  baseStyles: string
  variants?: Record<string, string>
  sizes?: Record<string, string>
  defaultVariant?: string
  defaultSize?: string
}

// 创建组件工厂
export function createComponentFactory<T extends BaseProps>(
  config: ComponentFactoryConfig
) {
  return React.forwardRef<HTMLElement, T>((props, ref) => {
    const {
      className,
      variant = config.defaultVariant,
      size = config.defaultSize,
      deviceType = 'universal',
      ...restProps
    } = props as T & { variant?: string; size?: string; deviceType?: string }

    // 检查设备兼容性
    const currentDeviceType = detectCurrentDeviceType()
    if (!isDeviceCompatible(deviceType as any, currentDeviceType)) {
      return null // 不兼容的设备类型不渲染
    }

    // 构建样式类名
    const styles = cn(
      config.baseStyles,
      variant && config.variants?.[variant],
      size && config.sizes?.[size],
      className
    )

    return {
      styles,
      props: restProps,
      ref
    }
  })
}

// 按钮组件工厂
export const createButtonFactory = () => {
  return createComponentFactory<ComponentProps>({
    baseStyles: getComponentBaseStyles('button'),
    variants: {
      default: getVariantStyles('default'),
      primary: getVariantStyles('primary'),
      secondary: getVariantStyles('secondary'),
      outline: getVariantStyles('outline'),
      ghost: getVariantStyles('ghost'),
      destructive: getVariantStyles('destructive')
    },
    sizes: {
      sm: getSizeStyles('sm'),
      md: getSizeStyles('md'),
      lg: getSizeStyles('lg'),
      xl: getSizeStyles('xl')
    },
    defaultVariant: 'default',
    defaultSize: 'md'
  })
}

// 输入框组件工厂
export const createInputFactory = () => {
  return createComponentFactory<ComponentProps>({
    baseStyles: getComponentBaseStyles('input'),
    sizes: {
      sm: "h-8 px-2 text-xs",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base"
    },
    defaultSize: 'md'
  })
}

// 卡片组件工厂
export const createCardFactory = () => {
  return createComponentFactory<ComponentProps>({
    baseStyles: getComponentBaseStyles('card'),
    variants: {
      default: "border-border",
      elevated: "shadow-lg border-0",
      outlined: "border-2 bg-transparent",
      ghost: "border-0 shadow-none bg-transparent"
    },
    defaultVariant: 'default'
  })
}

// 徽章组件工厂
export const createBadgeFactory = () => {
  return createComponentFactory<ComponentProps>({
    baseStyles: getComponentBaseStyles('badge'),
    variants: {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground"
    },
    defaultVariant: 'default'
  })
}

// 通用组件工厂
export const createGenericFactory = (baseStyles: string) => {
  return createComponentFactory<BaseProps>({
    baseStyles
  })
}

// 组件工厂注册表
export const componentFactories = {
  button: createButtonFactory(),
  input: createInputFactory(),
  card: createCardFactory(),
  badge: createBadgeFactory()
} as const

// 获取组件工厂
export function getComponentFactory<T extends keyof typeof componentFactories>(
  type: T
): typeof componentFactories[T] {
  return componentFactories[type]
}

// 创建组件实例
export function createComponent<T extends keyof typeof componentFactories>(
  type: T,
  props: any
) {
  const factory = getComponentFactory(type)
  return factory(props)
}
