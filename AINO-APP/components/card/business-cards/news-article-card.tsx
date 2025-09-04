"use client"

import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, MessageCircle, Share2 } from "lucide-react"
import { CardRegistry } from "../registry"
import type { BusinessCardProps } from "@/types"

interface ArticleData {
  id: string
  title: string
  summary: string
  author: string
  publishTime: string
  category: string
  image: string
  readTime: string
  comments: number
}

interface NewsArticleCardProps extends BusinessCardProps {
  data: ArticleData
}

export function NewsArticleCard({ data, onAction, ...props }: NewsArticleCardProps) {
  const handleReadMore = () => {
    onAction?.("openDetail", { id: data.id })
  }

  const handleShare = () => {
    onAction?.("share", { articleId: data.id, title: data.title })
  }

  const handleComment = () => {
    onAction?.("openModal", {
      title: "评论",
      content: (
        <div className="p-4">
          <h4 className="font-bold mb-4" style={{ color: "var(--card-title-color)" }}>
            {data.title}
          </h4>
          <p className="text-sm mb-4" style={{ color: "var(--card-text-color)" }}>
            {data.summary}
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">这里是评论区域...</p>
            </div>
          </div>
        </div>
      ),
    })
  }

  return (
    <AppCard className="overflow-hidden hover:shadow-lg transition-shadow" {...props}>
      <div className="relative">
        <img src={data.image || "/placeholder.svg"} alt={data.title} className="w-full h-48 object-cover" />
        <Badge className="absolute top-2 left-2 bg-blue-500">{data.category}</Badge>
      </div>

      <div className="p-4">
        <h3 className="font-bold mb-2 line-clamp-2" style={{ color: "var(--card-title-color)" }}>
          {data.title}
        </h3>

        <p className="text-sm mb-4 line-clamp-3" style={{ color: "var(--card-text-color)" }}>
          {data.summary}
        </p>

        <div className="flex items-center justify-between text-xs mb-4" style={{ color: "var(--card-text-color)" }}>
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>{data.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{data.readTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--card-text-color)" }}>
            <span>{data.publishTime}</span>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{data.comments}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={handleReadMore}>
              阅读更多
            </Button>
          </div>
        </div>
      </div>
    </AppCard>
  )
}

// 注册新闻文章卡片
CardRegistry.register({
  name: "news-article",
  category: "content",
  component: NewsArticleCard,
  businessFlow: {
    hasDetailPage: true,
    hasModal: true,
    actions: ["share", "comment", "bookmark"],
  },
  developer: {
    name: "Content Team",
    version: "1.0.0",
    description: "新闻文章展示卡片，支持阅读、评论、分享功能",
  },
})

// 注册动作处理器
CardRegistry.registerActionHandler("news-article", (action) => {
  switch (action.target) {
    case "share":
      console.log("分享文章:", action.data)
      break
    case "comment":
      console.log("评论文章:", action.data)
      break
    case "bookmark":
      console.log("收藏文章:", action.data)
      break
  }
})
