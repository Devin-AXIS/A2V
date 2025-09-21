import { getDictionary, type Locale } from "@/lib/dictionaries"
import { AppHeader } from "@/components/navigation/app-header"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { EducationProfileClientView } from "./client-view"
import { EducationBottomNavigation } from "@/components/navigation/education-bottom-navigation"

export default async function EducationProfilePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.profilePage

  return (
    <>
      <DynamicBackground />
      <div className="min-h-screen pb-32">
        <AppHeader title={pageDict.title} showBackButton={false} />
        <div className="pt-16">
          <EducationProfileClientView dict={pageDict} />
        </div>
      </div>
      <EducationBottomNavigation />
    </>
  )
}
