"use client"

import { LanguageSwitcher } from "@/components/theme/language-switcher"

interface BrowserHeaderProps {
  title: string
}

export function BrowserHeader({ title }: BrowserHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 h-16">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center space-x-2">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
