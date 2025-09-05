import { FontSizeConfigDemo } from "@/components/theme/font-size-config-demo"
import { getDictionary } from "@/lib/dictionaries"
import { Locale } from "@/lib/dictionaries"

interface FontSizeConfigPageProps {
  params: {
    locale: Locale
  }
}

export default async function FontSizeConfigPage({ params }: FontSizeConfigPageProps) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        {locale === "en" ? "Font Size Configuration" : "字体大小配置"}
      </h1>
      <FontSizeConfigDemo />
    </div>
  )
}
