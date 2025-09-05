import { getDictionary, type Locale } from "@/lib/dictionaries"
import { AppHeader } from "@/components/navigation/app-header"
import { CustomerServiceView } from "./client-view"

export default async function CustomerServicePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.customerServicePage

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={pageDict.title} showBackButton />
      <div className="pt-16">
        <CustomerServiceView dict={pageDict} />
      </div>
    </div>
  )
}
