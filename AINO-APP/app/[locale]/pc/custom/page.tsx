import { PCDynamicPageComponent } from "@/components/dynamic-page/pc-dynamic-page-component"
import { getDictionary } from "@/lib/dictionaries"
import type { Locale } from "@/lib/dictionaries"

export default async function PCCustomPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <div className="min-h-screen">
      <PCDynamicPageComponent category="workspace" locale={locale} />
    </div>
  )
}
