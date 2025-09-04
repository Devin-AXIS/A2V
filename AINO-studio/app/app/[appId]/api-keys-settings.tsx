"use client"

import { useState } from "react"
import { FrostPanel } from "@/components/frost"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Copy, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"

export function ApiKeysSettings() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const [showKey, setShowKey] = useState<string | null>(null)

  const keys = [
    {
      id: "1",
      name: locale === "zh" ? "生产环境密钥" : "Production Key",
      key: "sk-1234567890abcdef",
      permissions: ["read", "write"],
      lastUsed: "2024-01-15",
      requests: 1234,
      created: "2024-01-01",
    },
    {
      id: "2",
      name: locale === "zh" ? "测试环境密钥" : "Test Key",
      key: "sk-abcdef1234567890",
      permissions: ["read"],
      lastUsed: "2024-01-14",
      requests: 567,
      created: "2024-01-10",
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ description: locale === "zh" ? "已复制到剪贴板" : "Copied to clipboard" })
  }

  return (
    <FrostPanel>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{locale === "zh" ? "API 密钥" : "API Keys"}</h1>
          <p className="text-sm text-slate-600 mt-1">{locale === "zh" ? "管理您的 API 访问密钥" : "Manage your API access keys"}</p>
        </div>
        <Button size="sm">
          <Plus className="size-4 mr-2" />
          {locale === "zh" ? "创建新密钥" : "Create New Key"}
        </Button>
      </div>

      <div className="space-y-3">
        {keys.map((apiKey) => (
          <Card key={apiKey.id} className="bg-white/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm">{apiKey.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span>{locale === "zh" ? "创建于" : "Created"} {apiKey.created}</span>
                    <span>{locale === "zh" ? "最后使用" : "Last used"} {apiKey.lastUsed}</span>
                    <span>{apiKey.requests} {locale === "zh" ? "次请求" : "requests"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 bg-transparent"
                    onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                  >
                    {showKey === apiKey.id ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 bg-transparent"
                    onClick={() => copyToClipboard(apiKey.key)}
                  >
                    <Copy className="size-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-600 bg-transparent">
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{locale === "zh" ? "密钥:" : "Key:"}</span>
                  <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                    {showKey === apiKey.id ? apiKey.key : "sk-" + "•".repeat(16)}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{locale === "zh" ? "权限:" : "Permissions:"}</span>
                  <div className="flex gap-1">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs px-2 py-0.5">
                        {permission === "read" ? (locale === "zh" ? "读取" : "Read") : 
                         permission === "write" ? (locale === "zh" ? "写入" : "Write") : permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </FrostPanel>
  )
}
