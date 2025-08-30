"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DirectoryModel } from "@/lib/store"
import { Folder, Tag, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { FrostAside } from "@/components/frost"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLocale } from "@/hooks/use-locale"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function DirectoryList({
  title = "目录（表）",
  directories = [],
  selectedId = "",
  onSelect,
  onRename,
  onAdd,
  onDelete,
  addText = "添加目录",
  typeLabel = (d) => (d.type === "category" ? "分类" : "表"),
  canEdit = true,
  pageSize = 8,
}: {
  title?: string
  directories?: DirectoryModel[]
  selectedId?: string
  onSelect?: (id: string) => void
  onRename?: (dir: DirectoryModel) => void
  onAdd?: () => void
  onDelete?: (dir: DirectoryModel) => void
  addText?: string
  typeLabel?: (d: DirectoryModel) => string
  canEdit?: boolean
  pageSize?: number
}) {
  const { t, locale } = useLocale()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(directories.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedDirectories = useMemo(
    () => directories.slice(startIndex, endIndex),
    [directories, startIndex, endIndex],
  )

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center mt-3">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(currentPage - 1)}
                className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => goToPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(currentPage + 1)}
                className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  return (
    <div className="hidden md:block">
      <FrostAside className="h-full p-3 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-700">{title}</div>
            {directories.length > 0 && <span className="text-xs text-slate-500">({directories.length})</span>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onAdd?.()} disabled={!canEdit} className="rounded-xl">
              {addText}
            </Button>
          </div>
        </div>

        {directories.length > pageSize && (
          <div className="text-xs text-slate-500 mt-2 text-center">
            {locale === "zh" ? `显示第 ${startIndex + 1}-${Math.min(endIndex, directories.length)} 条，共 ${directories.length} 条` : `Showing ${startIndex + 1}-${Math.min(endIndex, directories.length)} of ${directories.length} items`}
          </div>
        )}

        <div className="mt-3 space-y-2">
          {paginatedDirectories.map((d) => (
            <div
              key={d.id}
              className={cn(
                "w-full flex items-center justify-between gap-2 rounded-2xl px-3 py-2",
                "bg-white/60 hover:bg-white/80 border border-white/60 text-left",
                "shadow-[0_4px_12px_rgba(31,38,135,0.12)]",
                d.id === selectedId &&
                  "bg-gradient-to-br from-sky-100/70 to-blue-50/70 border-sky-200 ring-1 ring-sky-200",
              )}
            >
              <button
                type="button"
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
                onClick={() => onSelect?.(d.id)}
              >
                {d.type === "category" ? (
                  <Tag className="size-4 text-amber-500 flex-shrink-0" />
                ) : (
                  <Folder className="size-4 text-blue-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{typeLabel(d)}</div>
                </div>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={!canEdit} className="flex-shrink-0">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRename?.(d)}>
                    <Edit className="size-4 mr-2" />
                    {locale === "zh" ? "重命名" : "Rename"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    console.log('=== Delete button clicked ===', d.name)
                    console.log('onDelete function exists:', !!onDelete)
                    console.log('canEdit:', canEdit)
                    onDelete?.(d)
                  }} className="text-red-600 focus:text-red-600">
                    <Trash2 className="size-4 mr-2" />
                    {locale === "zh" ? "删除" : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {directories.length === 0 && <div className="text-xs text-muted-foreground">{locale === "zh" ? "暂无目录" : "No directories"}</div>}
        </div>

        {renderPagination()}
      </FrostAside>
    </div>
  )
}
