"use client"

import { useState, useMemo, useEffect } from "react"

interface UsePaginationProps<T> {
  data: T[]
  pageSize: number
  dependencies?: any[]
}

export function usePagination<T>({ data, pageSize, dependencies = [] }: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex)
  }, [data, startIndex, endIndex])

  // Reset to page 1 when dependencies change
  useEffect(() => {
    setCurrentPage(1)
  }, dependencies)

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const paginationInfo = {
    currentPage,
    totalPages,
    totalItems: data.length,
    startIndex: data.length > 0 ? startIndex + 1 : 0,
    endIndex: Math.min(endIndex, data.length),
    hasNextPage: currentPage < totalPages && data.length > 0,
    hasPreviousPage: currentPage > 1,
  }

  return {
    paginatedData,
    paginationInfo,
    goToPage,
    setCurrentPage,
  }
}
