"use client"

import { useState, use } from "react"
import { SecondaryPillBottomNav, type SecondaryPillBottomNavAction } from "@/components/navigation/secondary-pill-bottom-nav"
import { Bot, Heart, Bookmark, Share } from "lucide-react"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppHeader } from "@/components/navigation/app-header"
import { AppCard } from "@/components/layout/app-card"
import type { Locale } from "@/lib/dictionaries"

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>
}) {
  const { locale, id } = use(params)

  // 交互状态
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  // 辅助功能胶囊型底部导航配置
  const secondaryPillActions: SecondaryPillBottomNavAction[] = [
    {
      label: "测试匹配度",
      onClick: () => {
        setIsTesting(true)
        setTimeout(() => {
          setIsTesting(false)
          alert("AI匹配度分析完成！匹配度：85%")
        }, 2000)
      },
      icon: <Bot className="w-4 h-4" />,
      variant: "primary",
      loading: isTesting
    },
    {
      label: "",
      onClick: () => setIsLiked(!isLiked),
      icon: <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500' : ''}`} />,
      iconOnly: true
    },
    {
      label: "",
      onClick: () => setIsFavorited(!isFavorited),
      icon: <Bookmark className={`w-4 h-4 transition-colors ${isFavorited ? 'text-yellow-500' : ''}`} />,
      iconOnly: true
    },
    {
      label: "",
      onClick: () => alert("分享功能"),
      icon: <Share className="w-4 h-4" />,
      iconOnly: true
    }
  ]

  return (
    <div className="min-h-screen pb-24">
      <DynamicBackground />
      <AppHeader title="职位详情" showBackButton={true} />
      <div className="pt-16 p-4 space-y-6">
        <AppCard className="p-6">
          <h1 className="text-xl font-bold mb-4">人工智能训练师</h1>
          <p className="text-gray-600 mb-4">
            人工智能训练师是一种非常重要的职位，主要负责指导和帮助用户以及其他相关人员更好地掌握人工智能相关技术和技能。
          </p>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-500">平均月薪</div>
              <div className="text-2xl font-bold text-blue-600">¥15,900</div>
            </div>
          </div>
        </AppCard>
      </div>

      {/* 辅助功能胶囊型底部导航 */}
      <SecondaryPillBottomNav
        actions={secondaryPillActions}
        position="center"
      />
    </div>
  )
}
