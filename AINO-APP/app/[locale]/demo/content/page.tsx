"use client"
import { DynamicPageComponent, PAGE_CATEGORIES } from "@/components/dynamic-page/dynamic-page-component"
import type { Locale } from "@/lib/dictionaries"
import { Suspense } from "react"

function ContentDemoContent({ locale }: { locale: Locale }) {
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

export default async function ContentDemoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <ContentDemoContent locale={locale} />
    </Suspense>
  )
}
