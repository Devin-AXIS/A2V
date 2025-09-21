/**
 * 设备类型工具函数
 * 用于设备类型检测、过滤和验证
 */

import type { DeviceType } from '@/types/unified-types'

// 设备类型常量
export const DEVICE_TYPES = {
  UNIVERSAL: 'universal' as const,
  MOBILE: 'mobile' as const,
  PC: 'pc' as const,
} as const

// 设备类型标签映射
export const DEVICE_TYPE_LABELS = {
  universal: '通用',
  mobile: '移动端',
  pc: 'PC端',
} as const

// 设备类型图标映射
export const DEVICE_TYPE_ICONS = {
  universal: '🌐',
  mobile: '📱',
  pc: '💻',
} as const

/**
 * 检查组件是否适用于当前设备
 * @param componentDeviceType 组件的设备类型
 * @param currentDeviceType 当前设备类型
 * @returns 是否适用
 */
export function isDeviceCompatible(
  componentDeviceType: DeviceType = 'universal',
  currentDeviceType: DeviceType = 'universal'
): boolean {
  // 通用组件适用于所有设备
  if (componentDeviceType === 'universal') {
    return true
  }
  
  // 特定设备类型的组件只适用于对应设备
  return componentDeviceType === currentDeviceType
}

/**
 * 根据设备类型过滤组件列表
 * @param components 组件列表
 * @param deviceType 目标设备类型
 * @returns 过滤后的组件列表
 */
export function filterComponentsByDevice<T extends { deviceType?: DeviceType }>(
  components: T[],
  deviceType: DeviceType
): T[] {
  return components.filter(component => 
    isDeviceCompatible(component.deviceType, deviceType)
  )
}

/**
 * 获取设备类型标签
 * @param deviceType 设备类型
 * @returns 设备类型标签
 */
export function getDeviceTypeLabel(deviceType: DeviceType): string {
  return DEVICE_TYPE_LABELS[deviceType]
}

/**
 * 获取设备类型图标
 * @param deviceType 设备类型
 * @returns 设备类型图标
 */
export function getDeviceTypeIcon(deviceType: DeviceType): string {
  return DEVICE_TYPE_ICONS[deviceType]
}

/**
 * 检测当前设备类型（基于用户代理或窗口大小）
 * @returns 当前设备类型
 */
export function detectCurrentDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return 'universal'
  }

  // 基于窗口宽度判断
  const width = window.innerWidth
  if (width < 768) {
    return 'mobile'
  } else if (width >= 1024) {
    return 'pc'
  }
  
  // 默认返回通用
  return 'universal'
}

/**
 * 验证设备类型
 * @param deviceType 设备类型
 * @returns 是否为有效的设备类型
 */
export function isValidDeviceType(deviceType: string): deviceType is DeviceType {
  return Object.values(DEVICE_TYPES).includes(deviceType as DeviceType)
}

/**
 * 获取设备类型的CSS类名
 * @param deviceType 设备类型
 * @returns CSS类名
 */
export function getDeviceTypeClassName(deviceType: DeviceType): string {
  switch (deviceType) {
    case 'mobile':
      return 'device-mobile'
    case 'pc':
      return 'device-pc'
    case 'universal':
    default:
      return 'device-universal'
  }
}

/**
 * 创建设备类型徽章数据
 * @param deviceType 设备类型
 * @returns 徽章数据
 */
export function createDeviceTypeBadge(deviceType: DeviceType) {
  return {
    label: getDeviceTypeLabel(deviceType),
    icon: getDeviceTypeIcon(deviceType),
    className: getDeviceTypeClassName(deviceType),
    variant: deviceType === 'universal' ? 'default' : 'secondary' as const,
  }
}
