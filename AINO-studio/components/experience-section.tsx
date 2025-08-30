"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ExperienceCard } from "./experience-card"
import { InlineExperienceEditor } from "./inline-experience-editor"
import type { ExperienceItem, ExperienceType } from "@/lib/data/experience-data"
import { EXPERIENCE_TYPES, createEmptyExperience } from "@/lib/data/experience-data"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"

interface ExperienceSectionProps {
  title: string
  type: ExperienceType
  experiences: ExperienceItem[]
  onChange: (experiences: ExperienceItem[]) => void
  className?: string
  pageSize?: number
  field?: any // 添加字段配置参数
}

export function ExperienceSection({
  title,
  type,
  experiences,
  onChange,
  className,
  pageSize = 5,
  field,
}: ExperienceSectionProps) {
  const { locale } = useLocale()
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const sectionExperiences = experiences.filter((exp) => exp.type === type)

  const totalPages = Math.ceil(sectionExperiences.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedExperiences = useMemo(
    () => sectionExperiences.slice(startIndex, endIndex),
    [sectionExperiences, startIndex, endIndex],
  )

  const handleAdd = () => {
    setEditingExperience(null) // null表示新建
  }

  const handleEdit = (experience: ExperienceItem) => {
    setEditingExperience(experience)
  }

  const handleSave = (experience: ExperienceItem) => {
    if (experiences.find((exp) => exp.id === experience.id)) {
      // 更新现有经历
      onChange(experiences.map((exp) => (exp.id === experience.id ? experience : exp)))
    } else {
      // 添加新经历
      onChange([...experiences, experience])
    }
    setEditingExperience(null)
  }

  const handleDelete = (experienceId: string) => {
    onChange(experiences.filter((exp) => exp.id !== experienceId))
    setEditingExperience(null)
    const newTotal = sectionExperiences.length - 1
    const newTotalPages = Math.ceil(newTotal / pageSize)
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages)
    }
  }

  const handleCancel = () => {
    setEditingExperience(null)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const renderPaginationItems = () => {
    const items = []
    const showEllipsis = totalPages > 7

    if (showEllipsis) {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => goToPage(1)} isActive={currentPage === 1} className="cursor-pointer">
            1
          </PaginationLink>
        </PaginationItem>,
      )

      // Show ellipsis if current page is far from start
      if (currentPage > 4) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => goToPage(i)} isActive={currentPage === i} className="cursor-pointer">
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 3) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => goToPage(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    } else {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => goToPage(i)} isActive={currentPage === i} className="cursor-pointer">
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    }

    return items
  }

  return (
    <div className={className}>
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {sectionExperiences.length > 0 && (
            <span className="text-sm text-gray-500">({sectionExperiences.length} {locale === "zh" ? "条记录" : "records"})</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
        >
          <Plus className="h-4 w-4 mr-1" />
          {locale === "zh" ? "添加经历" : "Add Experience"}
        </Button>
      </div>

      {sectionExperiences.length > pageSize && (
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div>
            {locale === "zh" ? `显示第 ${startIndex + 1}-${Math.min(endIndex, sectionExperiences.length)} 条，共 ${sectionExperiences.length} 条记录` : `Showing ${startIndex + 1}-${Math.min(endIndex, sectionExperiences.length)} of ${sectionExperiences.length} records`}
          </div>
          <div>
            {locale === "zh" ? `第 ${currentPage} 页，共 ${totalPages} 页` : `Page ${currentPage} of ${totalPages}`}
          </div>
        </div>
      )}

      {/* 经历卡片列表 */}
      <div className="space-y-3">
        {paginatedExperiences.map((experience) => (
          <ExperienceCard key={experience.id} experience={experience} onClick={() => handleEdit(experience)} field={field} />
        ))}

        {/* 内联编辑器 */}
        {editingExperience !== undefined && (
          <InlineExperienceEditor
            experience={editingExperience}
            type={type}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={editingExperience?.id ? () => handleDelete(editingExperience.id) : undefined}
            field={field}
          />
        )}

        {sectionExperiences.length === 0 && editingExperience === undefined && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">{EXPERIENCE_TYPES[type].icon}</div>
            <p>{locale === "zh" ? `暂无${title}` : `No ${title}`}</p>
            <p className="text-sm">{locale === "zh" ? "点击\"添加经历\"开始添加" : "Click \"Add Experience\" to start"}</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}


    </div>
  )
}
