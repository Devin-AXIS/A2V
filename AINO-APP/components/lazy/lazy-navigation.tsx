/**
 * 统一懒加载导航组件
 * 提供所有导航组件的懒加载功能，确保功能完全一致
 */

"use client"

import { lazy, Suspense } from "react"
import { cn } from "@/lib/utils"

// 懒加载各种导航组件
const LazyBottomNavigation = lazy(() => 
  import("@/components/navigation/bottom-navigation").then(module => ({
    default: module.BottomNavigation
  }))
)

const LazyBreadcrumb = lazy(() => 
  import("@/components/navigation/breadcrumb").then(module => ({
    default: module.Breadcrumb
  }))
)

const LazyDemoAwareBottomNavigation = lazy(() => 
  import("@/components/navigation/demo-aware-bottom-navigation").then(module => ({
    default: module.DemoAwareBottomNavigation
  }))
)

const LazyMobileUnifiedConfig = lazy(() => 
  import("@/components/navigation/mobile-unified-config").then(module => ({
    default: module.MobileUnifiedConfig
  }))
)

const LazyPCLeftSidebar = lazy(() => 
  import("@/components/navigation/pc-left-sidebar").then(module => ({
    default: module.PCLeftSidebar
  }))
)

const LazyPCTopHeader = lazy(() => 
  import("@/components/navigation/pc-top-header").then(module => ({
    default: module.PCTopHeader
  }))
)

const LazyPagination = lazy(() => 
  import("@/components/navigation/pagination").then(module => ({
    default: module.Pagination
  }))
)

const LazySidebar = lazy(() => 
  import("@/components/navigation/sidebar").then(module => ({
    default: module.Sidebar
  }))
)

const LazyTabNavigation = lazy(() => 
  import("@/components/navigation/tab-navigation").then(module => ({
    default: module.TabNavigation
  }))
)

const LazyTopNavigation = lazy(() => 
  import("@/components/navigation/top-navigation").then(module => ({
    default: module.TopNavigation
  }))
)

// 加载中组件
function LoadingFallback({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center min-h-[60px]", className)}>
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
        <p className="text-xs text-gray-500">加载中...</p>
      </div>
    </div>
  )
}

// 懒加载导航组件包装器
function withLazyLoading<T extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<T>>
) {
  return function LazyWrapper(props: T & { className?: string }) {
    const { className, ...restProps } = props
    return (
      <Suspense fallback={<LoadingFallback className={className} />}>
        <LazyComponent {...(restProps as T)} />
      </Suspense>
    )
  }
}

// 导出所有懒加载导航组件，确保功能完全一致
export const LazyBottomNavigationComponent = withLazyLoading(LazyBottomNavigation)
export const LazyBreadcrumbComponent = withLazyLoading(LazyBreadcrumb)
export const LazyDemoAwareBottomNavigationComponent = withLazyLoading(LazyDemoAwareBottomNavigation)
export const LazyMobileUnifiedConfigComponent = withLazyLoading(LazyMobileUnifiedConfig)
export const LazyPCLeftSidebarComponent = withLazyLoading(LazyPCLeftSidebar)
export const LazyPCTopHeaderComponent = withLazyLoading(LazyPCTopHeader)
export const LazyPaginationComponent = withLazyLoading(LazyPagination)
export const LazySidebarComponent = withLazyLoading(LazySidebar)
export const LazyTabNavigationComponent = withLazyLoading(LazyTabNavigation)
export const LazyTopNavigationComponent = withLazyLoading(LazyTopNavigation)

// 导出懒加载导航注册表，方便统一管理
export const lazyNavigationRegistry = {
  'bottom-navigation': LazyBottomNavigationComponent,
  'breadcrumb': LazyBreadcrumbComponent,
  'demo-aware-bottom-navigation': LazyDemoAwareBottomNavigationComponent,
  'mobile-unified-config': LazyMobileUnifiedConfigComponent,
  'pc-left-sidebar': LazyPCLeftSidebarComponent,
  'pc-top-header': LazyPCTopHeaderComponent,
  'pagination': LazyPaginationComponent,
  'sidebar': LazySidebarComponent,
  'tab-navigation': LazyTabNavigationComponent,
  'top-navigation': LazyTopNavigationComponent,
} as const

// 获取懒加载导航组件
export function getLazyNavigationComponent(type: keyof typeof lazyNavigationRegistry) {
  return lazyNavigationRegistry[type]
}

// 兼容性导出，确保现有代码不受影响
export const BottomNavigation = LazyBottomNavigationComponent
export const Breadcrumb = LazyBreadcrumbComponent
export const DemoAwareBottomNavigation = LazyDemoAwareBottomNavigationComponent
export const MobileUnifiedConfig = LazyMobileUnifiedConfigComponent
export const PCLeftSidebar = LazyPCLeftSidebarComponent
export const PCTopHeader = LazyPCTopHeaderComponent
export const Pagination = LazyPaginationComponent
export const Sidebar = LazySidebarComponent
export const TabNavigation = LazyTabNavigationComponent
export const TopNavigation = LazyTopNavigationComponent