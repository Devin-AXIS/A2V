"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useFavorites } from "@/hooks/use-favorites"
import { Heart, Bookmark, Share } from "lucide-react"
import type { SecondaryPillBottomNavAction } from "@/components/navigation/secondary-pill-bottom-nav"

interface PageInfo {
  title: string
  customActions?: SecondaryPillBottomNavAction[]
}

export function usePageActions(pageInfo: PageInfo) {
  const pathname = usePathname()
  const { isLiked, isFavorited, toggleLike, toggleFavorite } = useFavorites()

  // 当前页面信息
  const currentPageInfo = {
    id: `page-${pathname.replace(/\//g, '-')}`,
    title: pageInfo.title,
    url: pathname
  }

  // 基础的点赞、收藏、分享操作
  const baseActions: SecondaryPillBottomNavAction[] = [
    {
      label: "",
      onClick: () => toggleLike(currentPageInfo),
      icon: <Heart className={`w-4 h-4 transition-colors ${isLiked(pathname) ? 'text-red-500' : ''}`} />,
      iconOnly: true
    },
    {
      label: "",
      onClick: () => toggleFavorite(currentPageInfo),
      icon: <Bookmark className={`w-4 h-4 transition-colors ${isFavorited(pathname) ? 'text-yellow-500' : ''}`} />,
      iconOnly: true
    },
    {
      label: "",
      onClick: () => alert("分享功能"),
      icon: <Share className="w-4 h-4" />,
      iconOnly: true
    }
  ]

  // 合并自定义操作和基础操作
  const allActions = pageInfo.customActions 
    ? [...pageInfo.customActions, ...baseActions]
    : baseActions

  return {
    actions: allActions,
    isLiked: isLiked(pathname),
    isFavorited: isFavorited(pathname),
    currentPageInfo
  }
}
