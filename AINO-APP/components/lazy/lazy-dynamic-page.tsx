"use client"

import { lazy, Suspense } from "react"
import { cn } from "@/lib/utils"

// 懒加载统一动态页面组件
const UnifiedDynamicPage = lazy(() => 
  import("@/components/dynamic-page/unified-dynamic-page").then(module => ({
    default: module.UnifiedDynamicPage
  }))
)

// 加载中组件
function LoadingFallback({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}

// 统一懒加载动态页面组件
export function LazyUnifiedDynamicPage(props: any) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnifiedDynamicPage {...props} />
    </Suspense>
  )
}

// 移动端懒加载动态页面（兼容性）
export function LazyDynamicPageComponent(props: any) {
  return <LazyUnifiedDynamicPage {...props} layout="mobile" />
}

// PC端懒加载动态页面（兼容性）
export function LazyPCDynamicPageComponent(props: any) {
  return <LazyUnifiedDynamicPage {...props} layout="pc" />
}
