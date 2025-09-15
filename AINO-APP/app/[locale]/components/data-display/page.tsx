import { getDictionary, type Locale } from "@/lib/dictionaries"
import { AppHeader } from "@/components/navigation/app-header"
import { DataDisplayClientView } from "./client-view"
import { Suspense } from "react"

export default async function DataDisplayPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.dataDisplayComponentsPage

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={pageDict.title} showBackButton />
      <main className="px-4 pt-16">
        <Suspense fallback={<div className="p-4 text-center">加载中...</div>}>
          <DataDisplayClientView pageDict={pageDict} locale={locale} />
        </Suspense>
      </main>
    </div>
  )
}
