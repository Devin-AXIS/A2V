"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Menu, Search, Mail } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface CategoryTabNavigationProps {
  className?: string
  onMenuClick?: () => void
  onSearchChange?: (value: string) => void
  onTabChange?: (tab: string) => void
  onMessageClick?: () => void
}

function getContrastColor(hexColor: string): string {
  if (!hexColor.startsWith("#")) return "hsl(var(--foreground))"
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "hsl(var(--foreground))" : "hsl(var(--background))"
}

export function CategoryTabNavigation({
  className = "",
  onMenuClick,
  onSearchChange,
  onTabChange,
  onMessageClick,
}: CategoryTabNavigationProps) {
  const [activeTab, setActiveTab] = useState("电影")
  const [searchValue, setSearchValue] = useState("")

  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "hsl(var(--success))" // Default to success color
  const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

  const tabs = [
    { id: "电影", label: "电影" },
    { id: "电视", label: "电视" },
    { id: "读书", label: "读书" },
    { id: "连载", label: "连载" },
    { id: "音乐", label: "音乐" },
    { id: "同城", label: "同城" },
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearchChange?.(value)
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
          <Menu className="h-5 w-5" style={{ color: primaryColor }} />
        </Button>

        <div className="flex-1 mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="同声汇划"
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
            />
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={onMessageClick} className="p-2">
          <Mail className="h-5 w-5" style={{ color: primaryColor }} />
        </Button>
      </div>

      <div className="px-4 pb-2 bg-gray-50">
        <div className="flex items-center space-x-6 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-shrink-0 py-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? "" : "text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === tab.id ? { color: primaryColor } : {}}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
