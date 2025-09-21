import { getDictionary, type Locale } from "@/lib/dictionaries"
import { AppHeader } from "@/components/navigation/app-header"
import { HelpCenterClientView } from "./client-view"

export default async function HelpCenterPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.helpCenterPage

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={pageDict.title} showBackButton />
      <div className="pt-16">
        <HelpCenterClientView dict={pageDict} />
      </div>
    </div>
  )
}
