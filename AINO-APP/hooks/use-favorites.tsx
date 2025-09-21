"use client"

import React, { useState, useEffect, createContext, useContext, ReactNode } from "react"

interface FavoriteItem {
  id: string
  title: string
  url: string
  timestamp: number
  type: 'like' | 'favorite'
}

interface FavoritesContextType {
  likedItems: FavoriteItem[]
  favoritedItems: FavoriteItem[]
  isLiked: (url: string) => boolean
  isFavorited: (url: string) => boolean
  toggleLike: (item: Omit<FavoriteItem, 'type' | 'timestamp'>) => void
  toggleFavorite: (item: Omit<FavoriteItem, 'type' | 'timestamp'>) => void
  getLikedCount: () => number
  getFavoritedCount: () => number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [likedItems, setLikedItems] = useState<FavoriteItem[]>([])
  const [favoritedItems, setFavoritedItems] = useState<FavoriteItem[]>([])
  const [isClient, setIsClient] = useState(false)

  // 确保在客户端才加载localStorage数据
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const savedLikes = localStorage.getItem('aino-likes')
      const savedFavorites = localStorage.getItem('aino-favorites')
      
      if (savedLikes) {
        try {
          setLikedItems(JSON.parse(savedLikes))
        } catch (error) {
          console.error('Failed to parse saved likes:', error)
        }
      }
      
      if (savedFavorites) {
        try {
          setFavoritedItems(JSON.parse(savedFavorites))
        } catch (error) {
          console.error('Failed to parse saved favorites:', error)
        }
      }
    }
  }, [])

  // 保存到localStorage
  const saveLikes = (items: FavoriteItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aino-likes', JSON.stringify(items))
    }
  }

  const saveFavorites = (items: FavoriteItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aino-favorites', JSON.stringify(items))
    }
  }

  const isLiked = (url: string) => {
    return likedItems.some(item => item.url === url)
  }

  const isFavorited = (url: string) => {
    return favoritedItems.some(item => item.url === url)
  }

  const toggleLike = (item: Omit<FavoriteItem, 'type' | 'timestamp'>) => {
    const newItem: FavoriteItem = {
      ...item,
      type: 'like',
      timestamp: Date.now()
    }

    setLikedItems(prev => {
      const exists = prev.find(i => i.url === item.url)
      let newItems: FavoriteItem[]
      
      if (exists) {
        // 移除点赞
        newItems = prev.filter(i => i.url !== item.url)
      } else {
        // 添加点赞
        newItems = [newItem, ...prev]
      }
      
      saveLikes(newItems)
      return newItems
    })
  }

  const toggleFavorite = (item: Omit<FavoriteItem, 'type' | 'timestamp'>) => {
    const newItem: FavoriteItem = {
      ...item,
      type: 'favorite',
      timestamp: Date.now()
    }

    setFavoritedItems(prev => {
      const exists = prev.find(i => i.url === item.url)
      let newItems: FavoriteItem[]
      
      if (exists) {
        // 移除收藏
        newItems = prev.filter(i => i.url !== item.url)
      } else {
        // 添加收藏
        newItems = [newItem, ...prev]
      }
      
      saveFavorites(newItems)
      return newItems
    })
  }

  const getLikedCount = () => likedItems.length
  const getFavoritedCount = () => favoritedItems.length

  const contextValue: FavoritesContextType = {
    likedItems,
    favoritedItems,
    isLiked,
    isFavorited,
    toggleLike,
    toggleFavorite,
    getLikedCount,
    getFavoritedCount
  }

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}