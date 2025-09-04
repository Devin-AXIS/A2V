/**
 * 统一的类型定义
 * 整合所有类型定义，减少重复，提高类型一致性
 */

import type React from "react"

// 设备类型定义
export type DeviceType = 'universal' | 'mobile' | 'pc'

// 基础类型
export type BaseProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  // 设备类型属性
  deviceType?: DeviceType
}

export type WithId = {
  id: string
}

export type WithLocale = {
  locale?: string
}

export type WithDict = {
  dict?: any
}

export type WithAction = {
  onAction?: (action: string, data?: any) => void
}

export type WithEditingMode = {
  isEditing?: boolean
}

export type WithThemeControl = {
  disableLocalTheme?: boolean
}

// 设备类型相关类型
export type WithDeviceType = {
  deviceType?: DeviceType
}

// 组件基础类型
export type ComponentProps = BaseProps & WithId & WithLocale & WithAction & WithThemeControl & WithDeviceType

// 样式相关类型
export type StyleVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type StyleSize = 'sm' | 'md' | 'lg' | 'xl'
export type StyleRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type StyleSpacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type StyleShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type StyleAnimation = 'none' | 'fast' | 'normal' | 'slow'

// 主题相关类型
export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemePreset = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red'

// 布局相关类型
export type LayoutType = 'mobile' | 'pc' | 'tablet'
export type LayoutDirection = 'ltr' | 'rtl'
export type LayoutBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 导航相关类型
export type NavigationItem = {
  label: string
  icon?: React.ReactNode
  href: string
  active?: boolean
  disabled?: boolean
  children?: NavigationItem[]
}

export type NavigationProps = BaseProps & WithDict & {
  items?: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: StyleVariant
}

// 表单相关类型
export type FormField = {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export type FormProps = BaseProps & {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  loading?: boolean
  disabled?: boolean
}

// 数据展示相关类型
export type TableColumn = {
  key: string
  title: string
  dataIndex: string
  width?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: any, index: number) => React.ReactNode
}

export type TableProps = BaseProps & {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  rowKey?: string
  onRowClick?: (record: any, index: number) => void
}

// 图表相关类型
export type ChartData = {
  name: string
  value: number
  color?: string
  [key: string]: any
}

export type ChartProps = BaseProps & {
  data: ChartData[]
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  width?: number
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
  showGrid?: boolean
  onDataClick?: (data: ChartData) => void
}

// 卡片相关类型
export type CardProps = BaseProps & WithId & WithAction & {
  title?: string
  subtitle?: string
  description?: string
  image?: string
  elevated?: boolean
  loading?: boolean
  actions?: Array<{
    label: string
    action: string
    variant?: StyleVariant
  }>
}

// 模态框相关类型
export type ModalProps = BaseProps & {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  maskClosable?: boolean
  footer?: React.ReactNode
}

// 通知相关类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationProps = {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  closable?: boolean
  onClose?: () => void
}

// 加载相关类型
export type LoadingProps = BaseProps & {
  size?: StyleSize
  text?: string
  overlay?: boolean
}

// 错误相关类型
export type ErrorProps = BaseProps & {
  title?: string
  message?: string
  code?: string
  onRetry?: () => void
  showDebugInfo?: boolean
}

// 国际化相关类型
export type Locale = 'en' | 'zh'
export type Dictionary = Record<string, any>

// 配置相关类型
export type ConfigValue = string | number | boolean | object | null
export type ConfigSchema = {
  [key: string]: ConfigValue | ConfigSchema
}

// 验证相关类型
export type ValidationResult = {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export type ValidationRule = {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean
  message?: string
}

// 事件相关类型
export type EventHandler<T = any> = (event: T) => void
export type ActionHandler = (action: string, data?: any) => void
export type ValueChangeHandler<T = any> = (value: T) => void

// 工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 组件工厂相关类型
export type ComponentFactoryConfig = {
  baseStyles: string
  variants?: Record<string, string>
  sizes?: Record<string, string>
  defaultVariant?: string
  defaultSize?: string
}

export type ComponentFactory<T extends BaseProps> = React.ForwardRefExoticComponent<
  T & React.RefAttributes<HTMLElement>
>

// 导出所有类型
export type {
  // 重新导出 React 类型
  ReactNode,
  CSSProperties,
  ForwardRefExoticComponent,
  RefAttributes
} from 'react'
