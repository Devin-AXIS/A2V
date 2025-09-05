"use client"
import { DynamicPageComponent, PAGE_CATEGORIES } from "@/components/dynamic-page/dynamic-page-component"
import type { Locale } from "@/lib/dictionaries"

export default async function EducationProgressPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return <DynamicPageComponent category={PAGE_CATEGORIES.education} locale={locale} title="学习进度" />
}
