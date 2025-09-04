"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface PillNavigationProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
  maxTabs?: number
}

function getContrastColor(hexColor: string): string {
  if (!hexColor.startsWith("#")) return "#000000"
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "#000000" : "#ffffff"
}

export function PillNavigation({ tabs, activeTab, onTabChange, className, maxTabs = 5 }: PillNavigationProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#1f2937"
  const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

  // Limit tabs to maxTabs
  const displayTabs = tabs.slice(0, maxTabs)

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="w-full overflow-x-auto hide-scrollbar bg-gray-100" style={{ borderRadius: 1000 }}>
        <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5 w-full">
          {displayTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap",
                activeTab === tab
                  ? primaryColor === "#1f2937"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50",
              )}
              style={
                activeTab === tab && primaryColor !== "#1f2937"
                  ? { backgroundColor: primaryColor, color: textColorForPrimary }
                  : undefined
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
