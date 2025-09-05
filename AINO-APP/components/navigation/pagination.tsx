"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  prevText?: string
  nextText?: string
}

// Helper to get a readable text color (black or white) based on a background hex color
function getContrastColor(hexColor: string): string {
  if (!hexColor.startsWith("#")) return "hsl(var(--foreground))"
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "hsl(var(--foreground))" : "hsl(var(--background))"
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  prevText = "Previous",
  nextText = "Next",
}: PaginationProps) {
  const { palette } = useChartTheme()

  const primaryColor = palette[0] || "hsl(var(--primary))" // Default to primary color if palette is empty
  const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage, "...", totalPages)
      }
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center space-x-2 p-1 rounded-full bg-gray-100/80 shadow-inner",
        className,
      )}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-xs font-medium rounded-full bg-white text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {prevText}
      </button>

      <div className="flex items-center space-x-2">
        {pages.map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={cn(
                "w-8 h-8 flex items-center justify-center text-xs font-medium rounded-full transition-colors",
                currentPage === page ? "shadow-sm" : "text-gray-500 hover:bg-black/5",
              )}
              style={
                currentPage === page
                  ? {
                      backgroundColor: primaryColor,
                      color: textColorForPrimary,
                    }
                  : {}
              }
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-2 text-xs text-gray-400">
              {page}
            </span>
          ),
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-xs font-medium rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{
          backgroundColor: primaryColor,
          color: textColorForPrimary,
        }}
      >
        {nextText}
      </button>
    </div>
  )
}

