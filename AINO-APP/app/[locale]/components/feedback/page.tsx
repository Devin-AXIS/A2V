import { getDictionary, type Locale } from "@/lib/dictionaries"
import { AppHeader } from "@/components/navigation/app-header"
import { FeedbackClientView } from "./client-view"

export default async function FeedbackPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.feedbackComponentsPage

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={pageDict.title} showBackButton />
      <main className="pt-20">
        <FeedbackClientView />
      </main>
    </div>
  )
}
