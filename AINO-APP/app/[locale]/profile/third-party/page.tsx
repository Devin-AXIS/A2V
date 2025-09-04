"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppHeader } from "@/components/navigation/app-header"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"

// Third-party platform icons (using emoji for now, can be replaced with actual icons)
const platforms = [
  {
    id: "wechat",
    name: "微信账号",
    icon: "💬",
    color: "bg-green-500",
    connected: false,
  },
  {
    id: "qq",
    name: "QQ账号",
    icon: "🐧",
    color: "bg-blue-500",
    connected: false,
  },
  {
    id: "alipay",
    name: "支付宝账号",
    icon: "💰",
    color: "bg-blue-600",
    connected: false,
  },
  {
    id: "taobao",
    name: "淘宝账号",
    icon: "🛒",
    color: "bg-orange-500",
    connected: true,
  },
  {
    id: "weibo",
    name: "微博账号",
    icon: "📱",
    color: "bg-red-500",
    connected: false,
  },
  {
    id: "apple",
    name: "苹果账号",
    icon: "🍎",
    color: "bg-gray-800",
    connected: false,
  },
  {
    id: "dingtalk",
    name: "钉钉账号",
    icon: "📋",
    color: "bg-blue-600",
    connected: false,
  },
]

export default function ThirdPartyAccountsPage() {
  const router = useRouter()
  const { locale } = useParams()
  const [accounts, setAccounts] = useState(platforms)

  const handleToggleConnection = (platformId: string) => {
    setAccounts((prev) =>
      prev.map((account) => (account.id === platformId ? { ...account, connected: !account.connected } : account)),
    )
  }

  return (
    <div className="min-h-screen">
      <DynamicBackground />
      <AppHeader title="第三方账号绑定" showBackButton />

      <div className="px-4 py-6 space-y-3 pt-20 pb-24">
        {accounts.map((platform) => (
          <AppCard key={platform.id}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${platform.color} rounded-full flex items-center justify-center text-white text-lg`}
                >
                  {platform.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{platform.name}</p>
                  {platform.connected && <p className="text-xs text-muted-foreground">已绑定</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {platform.connected && (
                  <>
                    <span className="text-xs text-muted-foreground">已绑定</span>
                    <span className="text-xs text-muted-foreground">流过了</span>
                  </>
                )}
                <PillButton
                  size="sm"
                  variant={platform.connected ? "outline" : "default"}
                  onClick={() => handleToggleConnection(platform.id)}
                >
                  {platform.connected ? "解绑" : "去绑定"}
                </PillButton>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  )
}
