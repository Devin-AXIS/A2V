"use client"

import { useState } from "react"
import { FrostPanel } from "@/components/frost"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

export function GeneralSettings() {
  const { locale } = useLocale()
  const [language, setLanguage] = useState("zh")
  const [timezone, setTimezone] = useState("Asia/Shanghai")

  return (
    <FrostPanel>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-900">{locale === "zh" ? "通用设置" : "General Settings"}</h1>
        <p className="text-sm text-slate-600 mt-1">{locale === "zh" ? "管理应用的基本设置和偏好" : "Manage basic application settings and preferences"}</p>
      </div>

      <Card className="bg-white/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Globe className="size-4" />
            {locale === "zh" ? "界面设置" : "Interface Settings"}
          </CardTitle>
          <CardDescription className="text-xs">{locale === "zh" ? "自定义您的界面体验" : "Customize your interface experience"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === "zh" ? "语言" : "Language"}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">简体中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === "zh" ? "时区" : "Timezone"}</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Shanghai">{locale === "zh" ? "北京时间 (UTC+8)" : "Beijing Time (UTC+8)"}</SelectItem>
                  <SelectItem value="America/New_York">{locale === "zh" ? "纽约时间 (UTC-5)" : "New York Time (UTC-5)"}</SelectItem>
                  <SelectItem value="Europe/London">{locale === "zh" ? "伦敦时间 (UTC+0)" : "London Time (UTC+0)"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </CardContent>
      </Card>
    </FrostPanel>
  )
}
