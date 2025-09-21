"use client"

import { AppHeader } from "@/components/navigation/app-header"
import { AppCard } from "@/components/layout/app-card"
import { useFavorites } from "@/hooks/use-favorites"
import { Bookmark, Clock, ExternalLink, Briefcase, MapPin, Trash2 } from "lucide-react"
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

  // 渲染收藏页面的列表卡片形式
  const renderFavoriteCard = (item: any) => {
    if (item.url.includes('/jobs/')) {
      // 职位页面 -> 显示职位列表卡片形式
      return (
        <AppCard key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: "var(--card-title-color)" }}>
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--card-text-color)" }}>
                    <MapPin className="w-4 h-4" />
                    <span>职位详情</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href={item.url}>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors group">
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                  </button>
                </Link>
                <button 
                  onClick={() => toggleFavorite(item)}
                  className="p-2 rounded-full hover:bg-red-50 transition-colors group"
                  title="取消收藏"
                >
                  <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-500">收藏于 {formatDate(item.timestamp)}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">¥15,900</div>
                <div className="text-xs text-gray-500">平均月薪</div>
              </div>
            </div>
          </div>
        </AppCard>
      )
    }
    
    // 其他类型页面的通用列表卡片形式
    return (
      <AppCard key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium" style={{ color: "var(--card-title-color)" }}>
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Bookmark className="w-3 h-3 text-yellow-600" />
                  <span>收藏于 {formatDate(item.timestamp)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link href={item.url}>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </button>
              </Link>
              <button 
                onClick={() => toggleFavorite(item)}
                className="p-2 rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </AppCard>
    )
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
            <div className="space-y-4">
              {favoritedItems.map((item) => (
                <div key={item.id}>
                  {renderFavoriteCard(item)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
