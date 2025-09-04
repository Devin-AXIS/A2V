/**
 * 统一动态页面组件
 * 整合移动端和PC端的动态页面功能，确保功能完全一致
 */

"use client"

import React from "react"
import { useMobile } from "@/hooks/use-mobile"
import { DynamicPageComponent } from "./dynamic-page-component"
import { PCDynamicPageComponent } from "./pc-dynamic-page-component"

export interface UnifiedDynamicPageProps {
  layout?: 'mobile' | 'pc' | 'auto'
  [key: string]: any
}

/**
 * 统一动态页面组件
 * 根据layout参数或设备类型自动选择合适的布局
 */
export function UnifiedDynamicPage({ 
  layout = 'auto', 
  ...props 
}: UnifiedDynamicPageProps) {
  const isMobile = useMobile()
  
  // 确定最终使用的布局
  const finalLayout = layout === 'auto' ? (isMobile ? 'mobile' : 'pc') : layout
  
  // 根据布局渲染对应的组件，确保功能完全一致
  if (finalLayout === 'mobile') {
    return <DynamicPageComponent {...props} />
  } else {
    return <PCDynamicPageComponent {...props} />
  }
}

// 导出兼容性别名，确保现有代码不受影响
export const LazyDynamicPageComponent = UnifiedDynamicPage
export const LazyPCDynamicPageComponent = UnifiedDynamicPage