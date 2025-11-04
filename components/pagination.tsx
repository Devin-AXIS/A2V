"use client"

import { useState, useEffect } from "react"
import { getTotalApps } from "@/components/app-grid"

type App = {
  id: number
  name: string
  category: string
  description: string
  icon: string
  installs: string
  rating: number
  trending: boolean
  verified: boolean
  tags: string[]
  valueChange: string
  chartData: number[]
}

interface PaginationProps {
  currentPage: number
  setCurrentPage: (page: number) => void
  appsPerPage: number
  selectedCategory: string
  searchTerm: string
  apps: App[]
}

export function Pagination({
  currentPage,
  setCurrentPage,
  appsPerPage,
  selectedCategory,
  searchTerm,
  apps,
}: PaginationProps) {
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage)

  const totalPages = Math.ceil(getTotalApps(apps, selectedCategory, searchTerm) / appsPerPage)

  useEffect(() => {
    setLocalCurrentPage(currentPage)
  }, [currentPage])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [localCurrentPage])

  const handlePageChange = (newPage: number) => {
    setLocalCurrentPage(newPage)
    setCurrentPage(newPage)
  }

  const getPageNumbers = () => {
    const pages = []

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (localCurrentPage > 3) {
        pages.push("...")
      }

      // Show pages around current page
      const start = Math.max(2, localCurrentPage - 1)
      const end = Math.min(totalPages - 1, localCurrentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (localCurrentPage < totalPages - 2) {
        pages.push("...")
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(Math.max(1, localCurrentPage - 1))}
          disabled={localCurrentPage === 1}
          className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all duration-200"
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500 text-xs">
                  ...
                </span>
              )
            }

            const isActive = localCurrentPage === page

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`relative min-w-[32px] h-8 px-3 rounded-full text-xs font-medium transition-all duration-300 ${isActive
                  ? "text-black bg-primary shadow-md shadow-primary/30 scale-105"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, localCurrentPage + 1))}
          disabled={localCurrentPage === totalPages}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${localCurrentPage === totalPages
            ? "text-gray-400 opacity-30 cursor-not-allowed"
            : "text-white bg-primary/90 hover:bg-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}
