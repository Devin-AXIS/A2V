/**
 * 统一懒加载卡片组件
 * 提供所有业务卡片的懒加载功能，确保功能完全一致
 */

"use client"

import { lazy, Suspense } from "react"
import { cn } from "@/lib/utils"

// 懒加载各种卡片组件
const LazyAICourseCard = lazy(() => 
  import("@/components/card/ai-course-card").then(module => ({
    default: module.AICourseCard
  }))
)

const LazyAIInstructorCard = lazy(() => 
  import("@/components/card/ai-instructor-card").then(module => ({
    default: module.AIInstructorCard
  }))
)

const LazyAIJobCard = lazy(() => 
  import("@/components/card/ai-job-card").then(module => ({
    default: module.AIJobCard
  }))
)

const LazyAIProductCard = lazy(() => 
  import("@/components/card/ai-product-card").then(module => ({
    default: module.AIProductCard
  }))
)

const LazyAIServiceCard = lazy(() => 
  import("@/components/card/ai-service-card").then(module => ({
    default: module.AIServiceCard
  }))
)

const LazyBasicCard = lazy(() => 
  import("@/components/card/basic-card").then(module => ({
    default: module.BasicCard
  }))
)

const LazyBusinessCard = lazy(() => 
  import("@/components/card/business-card").then(module => ({
    default: module.BusinessCard
  }))
)

const LazyCourseCard = lazy(() => 
  import("@/components/card/course-card").then(module => ({
    default: module.CourseCard
  }))
)

const LazyEducationCard = lazy(() => 
  import("@/components/card/education-card").then(module => ({
    default: module.EducationCard
  }))
)

const LazyFeatureCard = lazy(() => 
  import("@/components/card/feature-card").then(module => ({
    default: module.FeatureCard
  }))
)

const LazyInstructorCard = lazy(() => 
  import("@/components/card/instructor-card").then(module => ({
    default: module.InstructorCard
  }))
)

const LazyJobCard = lazy(() => 
  import("@/components/card/job-card").then(module => ({
    default: module.JobCard
  }))
)

const LazyNewsCard = lazy(() => 
  import("@/components/card/news-card").then(module => ({
    default: module.NewsCard
  }))
)

const LazyOrderCard = lazy(() => 
  import("@/components/card/order-card").then(module => ({
    default: module.OrderCard
  }))
)

const LazyProductCard = lazy(() => 
  import("@/components/card/product-card").then(module => ({
    default: module.ProductCard
  }))
)

const LazyProfileCard = lazy(() => 
  import("@/components/card/profile-card").then(module => ({
    default: module.ProfileCard
  }))
)

const LazyProjectCard = lazy(() => 
  import("@/components/card/project-card").then(module => ({
    default: module.ProjectCard
  }))
)

const LazyReviewCard = lazy(() => 
  import("@/components/card/review-card").then(module => ({
    default: module.ReviewCard
  }))
)

const LazyServiceCard = lazy(() => 
  import("@/components/card/service-card").then(module => ({
    default: module.ServiceCard
  }))
)

const LazyStatCard = lazy(() => 
  import("@/components/card/stat-card").then(module => ({
    default: module.StatCard
  }))
)

const LazyTeamCard = lazy(() => 
  import("@/components/card/team-card").then(module => ({
    default: module.TeamCard
  }))
)

const LazyTestimonialCard = lazy(() => 
  import("@/components/card/testimonial-card").then(module => ({
    default: module.TestimonialCard
  }))
)

const LazyUserCard = lazy(() => 
  import("@/components/card/user-card").then(module => ({
    default: module.UserCard
  }))
)

// 加载中组件
function LoadingFallback({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center min-h-[200px]", className)}>
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        <p className="text-sm text-gray-500">加载中...</p>
      </div>
    </div>
  )
}

// 懒加载卡片组件包装器
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

// 导出所有懒加载卡片组件，确保功能完全一致
export const LazyAICourseCardComponent = withLazyLoading(LazyAICourseCard)
export const LazyAIInstructorCardComponent = withLazyLoading(LazyAIInstructorCard)
export const LazyAIJobCardComponent = withLazyLoading(LazyAIJobCard)
export const LazyAIProductCardComponent = withLazyLoading(LazyAIProductCard)
export const LazyAIServiceCardComponent = withLazyLoading(LazyAIServiceCard)
export const LazyBasicCardComponent = withLazyLoading(LazyBasicCard)
export const LazyBusinessCardComponent = withLazyLoading(LazyBusinessCard)
export const LazyCourseCardComponent = withLazyLoading(LazyCourseCard)
export const LazyEducationCardComponent = withLazyLoading(LazyEducationCard)
export const LazyFeatureCardComponent = withLazyLoading(LazyFeatureCard)
export const LazyInstructorCardComponent = withLazyLoading(LazyInstructorCard)
export const LazyJobCardComponent = withLazyLoading(LazyJobCard)
export const LazyNewsCardComponent = withLazyLoading(LazyNewsCard)
export const LazyOrderCardComponent = withLazyLoading(LazyOrderCard)
export const LazyProductCardComponent = withLazyLoading(LazyProductCard)
export const LazyProfileCardComponent = withLazyLoading(LazyProfileCard)
export const LazyProjectCardComponent = withLazyLoading(LazyProjectCard)
export const LazyReviewCardComponent = withLazyLoading(LazyReviewCard)
export const LazyServiceCardComponent = withLazyLoading(LazyServiceCard)
export const LazyStatCardComponent = withLazyLoading(LazyStatCard)
export const LazyTeamCardComponent = withLazyLoading(LazyTeamCard)
export const LazyTestimonialCardComponent = withLazyLoading(LazyTestimonialCard)
export const LazyUserCardComponent = withLazyLoading(LazyUserCard)

// 导出懒加载卡片注册表，方便统一管理
export const lazyCardRegistry = {
  'ai-course': LazyAICourseCardComponent,
  'ai-instructor': LazyAIInstructorCardComponent,
  'ai-job': LazyAIJobCardComponent,
  'ai-product': LazyAIProductCardComponent,
  'ai-service': LazyAIServiceCardComponent,
  'basic': LazyBasicCardComponent,
  'business': LazyBusinessCardComponent,
  'course': LazyCourseCardComponent,
  'education': LazyEducationCardComponent,
  'feature': LazyFeatureCardComponent,
  'instructor': LazyInstructorCardComponent,
  'job': LazyJobCardComponent,
  'news': LazyNewsCardComponent,
  'order': LazyOrderCardComponent,
  'product': LazyProductCardComponent,
  'profile': LazyProfileCardComponent,
  'project': LazyProjectCardComponent,
  'review': LazyReviewCardComponent,
  'service': LazyServiceCardComponent,
  'stat': LazyStatCardComponent,
  'team': LazyTeamCardComponent,
  'testimonial': LazyTestimonialCardComponent,
  'user': LazyUserCardComponent,
} as const

// 获取懒加载卡片组件
export function getLazyCardComponent(type: keyof typeof lazyCardRegistry) {
  return lazyCardRegistry[type]
}