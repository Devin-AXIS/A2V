"use client"
import { DynamicPageComponent, PAGE_CATEGORIES } from "@/components/dynamic-page/dynamic-page-component"
import type { Locale } from "@/lib/dictionaries"

export default async function ContentDemoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return (
    <DynamicPageComponent
      category={PAGE_CATEGORIES.workspace}
      locale={locale}
      title="内容应用Demo"
      backUrl={`/${locale}`}
      pcUrl={`/${locale}/pc/demo/content`}
    />
  )
}
