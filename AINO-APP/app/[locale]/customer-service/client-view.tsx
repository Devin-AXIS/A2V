"use client"

import Image from "next/image"
import { ContactMethodItem } from "@/components/basic/contact-method-item"
import { AppCard } from "@/components/layout/app-card"

interface CustomerServiceViewProps {
  dict: {
    title: string
    contactMethods: {
      icon: "chat" | "phone" | "mail"
      title: string
      description: string
      buttonText: string
      href: string
    }[]
    qrCodeTitle: string
  }
}

export function CustomerServiceView({ dict }: CustomerServiceViewProps) {
  return (
    <main className="p-4 space-y-6">
      <AppCard className="p-4 space-y-2">
        {dict.contactMethods.map((method) => (
          <ContactMethodItem key={method.title} {...method} />
        ))}
      </AppCard>

      <AppCard className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--card-title-color)" }}>
          {dict.qrCodeTitle}
        </h3>
        <div className="flex justify-center">
          <Image src="/qr-code.png" alt="QR Code" width={160} height={160} className="rounded-lg" />
        </div>
      </AppCard>
    </main>
  )
}
