"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface PillTabNavigationProps {
  className?: string
  onSearch?: (query: string) => void
  tabs?: string[]
  searchPlaceholder?: string
}

export function PillTabNavigation({
  className,
  onSearch,
  tabs = ["关注", "今日推荐", "每周餐单", "会员专属", "排行"],
  searchPlaceholder = "搜索食材、菜谱",
}: PillTabNavigationProps) {
  const [activeTab, setActiveTab] = useState(tabs[1]) // 默认选中"今日推荐"
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <div className={cn("w-full bg-white", className)}>
      <div className="p-4">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </form>

        <div className="flex items-center space-x-3 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeTab === tab ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
