"use client"

import { useState } from "react"
import { SettingsSidebar } from "../settings-sidebar"
import { SettingsContent } from "../settings-content"

type SettingsSection = "personal" | "team" | "api-keys" | "notifications" | "settings"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("personal")

  return (
    <div className="flex gap-8 p-6">
      <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1">
        <SettingsContent activeSection={activeSection} />
      </div>
    </div>
  )
}
