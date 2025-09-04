"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Menu, Search, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderTabNavigationProps {
  className?: string
  onSearch?: (query: string) => void
  onMenuClick?: () => void
  onMessageClick?: () => void
  tabs?: string[]
  searchPlaceholder?: string
}

export function HeaderTabNavigation({
  className,
  onSearch,
  onMenuClick,
  onMessageClick,
  tabs = ["电影", "电视", "读书", "连载", "音乐", "同城"],
  searchPlaceholder = "同声汇划",
}: HeaderTabNavigationProps) {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <div className={cn("w-full bg-white", className)}>
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-gray-600 hover:text-gray-900">
          <Menu className="w-6 h-6" />
        </Button>

        <form onSubmit={handleSearch} className="flex-1 mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </form>

        <Button variant="ghost" size="icon" onClick={onMessageClick} className="text-green-600 hover:text-green-700">
          <Mail className="w-6 h-6" />
        </Button>
      </div>

      <div className="px-4 pb-2 bg-gray-100/50">
        <div className="flex items-center space-x-6 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative py-3 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab ? "text-gray-900" : "text-gray-600 hover:text-gray-900",
              )}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
