"use client"
import { use, Suspense } from "react"
import { DynamicPageComponent, PAGE_CATEGORIES } from "@/components/dynamic-page/dynamic-page-component"
import { EducationBottomNavigation } from "@/components/navigation/education-bottom-navigation"
import type { Locale } from "@/lib/dictionaries"

function EducationDemoContent({ locale }: { locale: Locale }) {
  return (
    <>
      <DynamicPageComponent category={PAGE_CATEGORIES.education} locale={locale} title="教育应用Demo" />
      <EducationBottomNavigation locale={locale} />
    </>
  )
}

export default function EducationDemoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params)
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <EducationDemoContent locale={locale} />
    </Suspense>
  )
}
