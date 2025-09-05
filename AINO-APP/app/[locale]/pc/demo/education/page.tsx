"use client"
import { use } from "react"
import { DynamicPageComponent, PAGE_CATEGORIES } from "@/components/dynamic-page/dynamic-page-component"
import type { Locale } from "@/lib/dictionaries"

export default function PCEducationDemoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params)
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
