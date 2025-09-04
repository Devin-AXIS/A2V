import { getDictionary, type Locale } from "@/lib/dictionaries"
import { AppHeader } from "@/components/navigation/app-header"
import { ProfileClientView } from "./client-view"

export default async function ProfilePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.profilePage

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={pageDict.title} showBackButton={false} />
      <div className="pt-16">
        <ProfileClientView dict={pageDict} />
      </div>
    </div>
  )
}
