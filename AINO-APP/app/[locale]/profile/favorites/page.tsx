"use client"

import { AppHeader } from "@/components/navigation/app-header"
import { AppCard } from "@/components/layout/app-card"
import { useFavorites } from "@/hooks/use-favorites"
import { Bookmark, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import { DynamicBackground } from "@/components/theme/dynamic-background"

export default function FavoritesPage() {
  const { favoritedItems, toggleFavorite } = useFavorites()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <DynamicBackground />
      <AppHeader title="我的收藏" showBackButton={true} />
      
      <div className="min-h-screen pt-16 pb-6">
        <div className="p-4 space-y-4">
          {/* 统计信息 */}
          <AppCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
                  我的收藏
                </h2>
                <p className="text-sm" style={{ color: "var(--card-text-color)" }}>
                  共 {favoritedItems.length} 个页面
                </p>
              </div>
            </div>
          </AppCard>

          {/* 收藏列表 */}
          {favoritedItems.length === 0 ? (
            <AppCard className="p-8 text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">还没有收藏的内容</h3>
              <p className="text-sm text-gray-400">
                在浏览页面时点击 📖 按钮来收藏您感兴趣的内容
              </p>
            </AppCard>
          ) : (
            <div className="space-y-3">
              {favoritedItems.map((item) => (
                <AppCard key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Bookmark className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <h3 
                          className="font-medium truncate"
                          style={{ color: "var(--card-title-color)" }}
                        >
                          {item.title}
                        </h3>
                      </div>
                      
                      <p 
                        className="text-sm truncate mb-2"
                        style={{ color: "var(--card-text-color)" }}
                      >
                        {item.url}
                      </p>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={item.url}>
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </button>
                      </Link>
                      
                      <button 
                        onClick={() => toggleFavorite(item)}
                        className="p-2 rounded-full hover:bg-yellow-50 transition-colors group"
                      >
                        <Bookmark className="w-4 h-4 text-yellow-600 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </AppCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
