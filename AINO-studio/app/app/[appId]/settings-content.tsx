"use client"

import { TeamManagement } from "./team-management"
import { PersonalSettings } from "./personal-settings"
import { ApiKeysSettings } from "./api-keys-settings"
import { NotificationsSettings } from "./notifications-settings"
import { GeneralSettings } from "./general-settings"
import { AuthIntegrationsSettings } from "./auth-integrations-settings"

type SettingsSection = "personal" | "team" | "auth" | "api-keys" | "notifications" | "settings"

interface SettingsContentProps {
  activeSection: SettingsSection
}

export function SettingsContent({ activeSection }: SettingsContentProps) {
  switch (activeSection) {
    case "personal":
      return <PersonalSettings />
    case "team":
      return <TeamManagement />
    case "auth":
      return <AuthIntegrationsSettings />
    case "api-keys":
      return <ApiKeysSettings />
    case "notifications":
      return <NotificationsSettings />
    case "settings":
      return <GeneralSettings />
    default:
      return <PersonalSettings />
  }
}
