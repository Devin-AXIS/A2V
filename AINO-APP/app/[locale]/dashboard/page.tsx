import { getDictionary, type Locale } from "@/lib/dictionaries"
import { AppHeader } from "@/components/navigation/app-header"
import dynamic from "next/dynamic"

const DashboardClientView = dynamic(() => import("./client-view"), {
  loading: () => (
    <div className="flex justify-center items-center pt-32">
      <p className="text-gray-500">Loading Dashboard...</p>
    </div>
  ),
})

export default async function DashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const pageDict = dict.dashboardPage

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={pageDict.title} showBackButton={false} />
      <div className="pt-16">
        <DashboardClientView dict={pageDict} />
      </div>
    </div>
  )
}
