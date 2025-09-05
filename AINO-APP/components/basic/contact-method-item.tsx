"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { PillButton } from "@/components/basic/pill-button"
import { MessageSquare, Phone, Mail } from "lucide-react"
import { useMemo } from "react"
import { useCardTheme } from "@/components/providers/card-theme-provider"

function isColorDark(hexColor: string): boolean {
  if (!hexColor.startsWith("#")) return false
  const color = hexColor.substring(1)
  const rgb = Number.parseInt(color, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luma < 128
}

interface ContactMethodItemProps {
  icon: "chat" | "phone" | "mail"
  title: string
  description: string
  buttonText: string
  href: string
}

export function ContactMethodItem({ icon, title, description, buttonText, href }: ContactMethodItemProps) {
  const { theme } = useCardTheme()
  const isDark = useMemo(() => isColorDark(theme.background), [theme.background])
  const iconContainerColor = isDark ? "bg-gray-700/80" : "bg-gray-100/80"

  const iconMap: { [key: string]: React.ReactNode } = {
    chat: <MessageSquare className="w-6 h-6" style={{ color: "var(--card-text-color)" }} />,
    phone: <Phone className="w-6 h-6" style={{ color: "var(--card-text-color)" }} />,
    mail: <Mail className="w-6 h-6" style={{ color: "var(--card-text-color)" }} />,
  }

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", iconContainerColor)}>
          {iconMap[icon]}
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: "var(--card-title-color)" }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: "var(--card-text-color)" }}>
            {description}
          </p>
        </div>
      </div>
      <PillButton variant="default" onClick={() => (window.location.href = href)} className="font-semibold text-sm">
        {buttonText}
      </PillButton>
    </div>
  )
}
