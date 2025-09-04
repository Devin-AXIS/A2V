import { AppHeader } from "@/components/navigation/app-header"
import { InputClientView } from "./client-view"
import { getDictionary, type Locale } from "@/lib/dictionaries"

export default async function InputComponentsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.inputComponentsPage

  return (
    <div className="min-h-screen">
      <AppHeader title={pageDict.title} showBackButton />
      <main className="px-4 pt-16">
        <InputClientView pageDict={pageDict} />
      </main>
    </div>
  )
}
