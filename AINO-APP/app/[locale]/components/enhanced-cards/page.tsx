import { BrowserHeader } from "@/components/layout/browser-header"
import { CardShowcase } from "@/components/card/card-showcase"
import { getDictionary } from "@/lib/dictionaries"
import type { Locale } from "@/lib/dictionaries"

export default async function EnhancedCardsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <div className="min-h-screen pb-32">
      <BrowserHeader title={dict.enhancedCardsPage.title} />

      <div className="px-4 pt-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{dict.enhancedCardsPage.title}</h1>
          <p className="text-gray-600 mb-6">{dict.enhancedCardsPage.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 rounded-lg p-3">
              <h3 className="font-semibold text-blue-700 mb-1">
                {dict.enhancedCardsPage.features.developerFriendly.title}
              </h3>
              <p className="text-gray-600">{dict.enhancedCardsPage.features.developerFriendly.description}</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <h3 className="font-semibold text-blue-700 mb-1">{dict.enhancedCardsPage.features.themeUnified.title}</h3>
              <p className="text-gray-600">{dict.enhancedCardsPage.features.themeUnified.description}</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <h3 className="font-semibold text-blue-700 mb-1">{dict.enhancedCardsPage.features.businessFlow.title}</h3>
              <p className="text-gray-600">{dict.enhancedCardsPage.features.businessFlow.description}</p>
            </div>
          </div>
        </div>

        <CardShowcase />
      </div>
    </div>
  )
}
