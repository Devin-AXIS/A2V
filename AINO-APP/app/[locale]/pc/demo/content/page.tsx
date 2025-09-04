"use client"
import { DynamicPageComponent, PAGE_CATEGORIES } from "@/components/dynamic-page/dynamic-page-component"
import type { Locale } from "@/lib/dictionaries"

export default async function PCContentDemoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return (
    <DynamicPageComponent
      category={PAGE_CATEGORIES["pc-content"]}
      locale={locale}
      title="内容管理平台"
      backUrl={`/${locale}/pc`}
      mobileUrl={`/${locale}/demo/content`}
    />
  )
}
