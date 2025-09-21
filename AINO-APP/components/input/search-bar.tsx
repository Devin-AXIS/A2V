"use client"

import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import type React from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SearchBar({ className, ...props }: SearchBarProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"

  return (
    <div
      className={cn(
        "flex items-center w-full max-w-md px-4 py-1 bg-white/60 backdrop-blur-lg rounded-full shadow-sm border border-white/80",
        "focus-within:ring-2 focus-within:shadow-lg transition-all",
        className,
      )}
      style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
    >
      <Search className="h-5 w-5 text-gray-400" />
      <input
        type="search"
        className="w-full p-2 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
        {...props}
      />
    </div>
  )
}
