import type React from "react"
import type { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import type { Locale } from "@/lib/dictionaries"
import { i18n } from "@/lib/dictionaries"
import { LayoutClient } from "./layout.client.tsx"
import "../globals.css"

export const metadata: Metadata = {
  title: "iPollo Application Base",
  description: "Unified application base for iPollo projects.",
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}>) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <LayoutClient dict={dict} locale={locale}>
      {children}
    </LayoutClient>
  )
}
