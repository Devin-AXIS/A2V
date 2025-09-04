import type React from "react"
import { getDictionary } from "@/lib/dictionaries"
import type { Locale } from "@/lib/dictionaries"
import { DeviceTypeDemoClientView } from "./client-view"

export default async function DeviceTypeDemoPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return <DeviceTypeDemoClientView dict={dict} locale={locale} />
}
