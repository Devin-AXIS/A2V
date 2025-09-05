"use client"
import { use } from "react"
import { DynamicPageComponent, PAGE_CATEGORIES } from "@/components/dynamic-page/dynamic-page-component"
import { EducationBottomNavigation } from "@/components/navigation/education-bottom-navigation"
import type { Locale } from "@/lib/dictionaries"

export default function EducationDemoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params)
  return (
    <>
      <DynamicPageComponent category={PAGE_CATEGORIES.education} locale={locale} title="教育应用Demo" />
      <EducationBottomNavigation locale={locale} />
    </>
  )
}
