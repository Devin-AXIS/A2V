"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLocale } from "@/hooks/use-locale"

interface ModuleConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: {
    id: string
    name: string
    version: string
    settings: {
      enabled: boolean
      apiKey: string
      webhookUrl: string
      database: string
      cacheEnabled: boolean
      logLevel: string
      maxConnections: number
      timeout: number
    }
  } | null
  onSave: (config: any) => void
}

export function ModuleConfigDialog({
  open,
  onOpenChange,
  module,
  onSave
}: ModuleConfigDialogProps) {
  const { locale } = useLocale()
  const [config, setConfig] = useState(module?.settings || {
    enabled: true,
    apiKey: "",
    webhookUrl: "",
    database: "mysql",
    cacheEnabled: true,
    logLevel: "info",
    maxConnections: 10,
    timeout: 30,
  })

  useEffect(() => {
    if (module) {
      setConfig(module.settings)
    }
  }, [module])

  const handleSave = () => {
    onSave(config)
    onOpenChange(false)
  }

  const handleReset = () => {
    if (module) {
      setConfig(module.settings)
    }
  }

  if (!module) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {locale === "zh" ? "配置模块" : "Configure Module"}: {module.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{locale === "zh" ? "启用模块" : "Enable Module"}</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
                />
                <span className="text-sm text-gray-600">
                  {config.enabled ? (locale === "zh" ? "已启用" : "Enabled") : (locale === "zh" ? "已禁用" : "Disabled")}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{locale === "zh" ? "缓存" : "Cache"}</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.cacheEnabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, cacheEnabled: checked }))}
                />
                <span className="text-sm text-gray-600">
                  {config.cacheEnabled ? (locale === "zh" ? "已启用" : "Enabled") : (locale === "zh" ? "已禁用" : "Disabled")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{locale === "zh" ? "API 密钥" : "API Key"}</Label>
            <Input
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder={locale === "zh" ? "请输入 API 密钥" : "Enter API key"}
            />
          </div>

          <div className="space-y-2">
            <Label>{locale === "zh" ? "Webhook URL" : "Webhook URL"}</Label>
            <Input
              value={config.webhookUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
              placeholder={locale === "zh" ? "请输入 Webhook URL" : "Enter webhook URL"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{locale === "zh" ? "数据库" : "Database"}</Label>
              <Select value={config.database} onValueChange={(value) => setConfig(prev => ({ ...prev, database: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{locale === "zh" ? "日志级别" : "Log Level"}</Label>
              <Select value={config.logLevel} onValueChange={(value) => setConfig(prev => ({ ...prev, logLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warn</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{locale === "zh" ? "最大连接数" : "Max Connections"}</Label>
              <Input
                type="number"
                value={config.maxConnections}
                onChange={(e) => setConfig(prev => ({ ...prev, maxConnections: parseInt(e.target.value) || 10 }))}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label>{locale === "zh" ? "超时时间（秒）" : "Timeout (seconds)"}</Label>
              <Input
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30 }))}
                min="1"
                max="300"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleReset}>
            {locale === "zh" ? "重置" : "Reset"}
          </Button>
          <Button onClick={handleSave}>
            {locale === "zh" ? "保存" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
