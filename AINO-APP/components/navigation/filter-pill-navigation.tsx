"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface FilterPillNavigationProps {
  className?: string
  onSearchChange?: (value: string) => void
  onFilterChange?: (filter: string) => void
}

function getContrastColor(hexColor: string): string {
  if (!hexColor.startsWith("#")) return "hsl(var(--foreground))"
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "hsl(var(--foreground))" : "hsl(var(--background))"
}

export function FilterPillNavigation({ className = "", onSearchChange, onFilterChange }: FilterPillNavigationProps) {
  const [activeFilter, setActiveFilter] = useState("今日推荐")
  const [searchValue, setSearchValue] = useState("")

  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "hsl(var(--primary))" // Default to primary color
  const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

  const filters = [
    { id: "关注", label: "关注" },
    { id: "今日推荐", label: "今日推荐" },
    { id: "每周餐单", label: "每周餐单" },
    { id: "会员专属", label: "会员专属" },
    { id: "排行", label: "排行" },
  ]

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId)
    onFilterChange?.(filterId)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearchChange?.(value)
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索食材、菜谱"
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={
              {
                "--tw-ring-color": primaryColor,
                "--tw-ring-opacity": "0.5",
              } as React.CSSProperties
            }
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-4 pb-3">
        <div className="flex items-center space-x-3 overflow-x-auto hide-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.id ? "shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm"
              }`}
              style={
                activeFilter === filter.id
                  ? {
                      backgroundColor: primaryColor,
                      color: textColorForPrimary,
                      boxShadow: `0 2px 4px ${primaryColor}20`,
                    }
                  : {}
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
