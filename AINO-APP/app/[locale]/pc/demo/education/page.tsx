"use client"
import { use, Suspense } from "react"
import { DynamicPageComponent, PAGE_CATEGORIES } from "@/components/dynamic-page/dynamic-page-component"
import type { Locale } from "@/lib/dictionaries"

function PCEducationDemoContent({ locale }: { locale: Locale }) {
  return (
    <DynamicPageComponent
      category={PAGE_CATEGORIES["pc-education"]}
      locale={locale}
      title="在线教育平台"
      backUrl={`/${locale}/pc`}
      mobileUrl={`/${locale}/demo/education`}
    />
  )
}

export default function PCEducationDemoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params)
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <PCEducationDemoContent locale={locale} />
    </Suspense>
  )
}
