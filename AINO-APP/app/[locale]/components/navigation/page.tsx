import { getDictionary, type Locale } from "@/lib/dictionaries"
import { NavigationComponentsClientView } from "./client-view"
import { AppHeader } from "@/components/navigation/app-header"

export default async function NavigationComponentsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.navigationComponentsPage

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={pageDict.title} showBackButton />
      <NavigationComponentsClientView dict={pageDict} />
    </div>
  )
}
