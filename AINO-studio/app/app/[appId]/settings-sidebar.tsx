"use client"
import { FrostPanel } from "@/components/frost"
import { Button } from "@/components/ui/button"
import { User, Users, Key, Bell, Settings } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface SettingsSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  const { locale } = useLocale()
  
  return (
    <FrostPanel className="w-64 h-fit">
      <div className="space-y-2">
        {[
          {
            id: "personal" as const,
            label: locale === "zh" ? "个人信息" : "Personal Info",
            icon: User,
          },
          {
            id: "team" as const,
            label: locale === "zh" ? "团队管理" : "Team Management",
            icon: Users,
          },
          {
            id: "api-keys" as const,
            label: locale === "zh" ? "API 密钥" : "API Keys",
            icon: Key,
          },
          {
            id: "notifications" as const,
            label: locale === "zh" ? "通知" : "Notifications",
            icon: Bell,
          },
          {
            id: "settings" as const,
            label: locale === "zh" ? "通用设置" : "General Settings",
            icon: Settings,
          },
        ].map((section) => {
          const Icon = section.icon
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              className={`w-full justify-start h-9 ${
                activeSection === section.id
                  ? "bg-white/80 text-slate-900 shadow-sm"
                  : "text-slate-700 hover:bg-white/50"
              }`}
              onClick={() => onSectionChange(section.id)}
            >
              <Icon className="size-4 mr-3" />
              {section.label}
            </Button>
          )
        })}
      </div>
    </FrostPanel>
  )
}
