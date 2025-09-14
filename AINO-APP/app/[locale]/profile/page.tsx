import { getDictionary, type Locale } from "@/lib/dictionaries"
import { AppHeader } from "@/components/navigation/app-header"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { usePathname } from "next/navigation"
import { ProfileClientView } from "./client-view"
import { Suspense } from "react"

export default async function ProfilePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.profilePage

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={pageDict.title} showBackButton={false} />
      <div className="pt-16">
        <Suspense fallback={<div className="p-4 text-center">加载中...</div>}>
          <ProfileClientView dict={pageDict} />
        </Suspense>
      </div>
      <BottomNavigation />
    </div>
  )
}
