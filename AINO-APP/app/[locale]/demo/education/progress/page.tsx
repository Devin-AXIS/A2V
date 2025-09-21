"use client"
import { DynamicPageComponent, PAGE_CATEGORIES } from "@/components/dynamic-page/dynamic-page-component"
import type { Locale } from "@/lib/dictionaries"
import { Suspense } from "react"

function EducationProgressContent({ locale }: { locale: Locale }) {
  return <DynamicPageComponent category={PAGE_CATEGORIES.education} locale={locale} title="学习进度" />
}

export default async function EducationProgressPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <EducationProgressContent locale={locale} />
    </Suspense>
  )
}
