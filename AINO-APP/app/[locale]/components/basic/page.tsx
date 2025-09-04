import { getDictionary, type Locale } from "@/lib/dictionaries"
import { BasicComponentsClientView } from "./client-view"
import { AppHeader } from "@/components/navigation/app-header"

export default async function BasicComponentsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.basicComponentsPage

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={pageDict.title} showBackButton />
      <div className="pt-16">
        <BasicComponentsClientView dict={pageDict} />
      </div>
    </div>
  )
}
