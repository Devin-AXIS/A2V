"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, GripVertical } from "lucide-react"
import type { FieldModel, FieldType } from "@/lib/store"
import { useLocale } from "@/hooks/use-locale"
import type { FieldCategoryModel } from "@/lib/field-categories"
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog"

type FieldRowProps = {
  field: FieldModel
  idx: number
  total: number
  typeNames: Record<FieldType, string>
  category?: FieldCategoryModel
  onToggleEnabled: (v: boolean) => void
  onToggleRequired: (v: boolean) => void
  onToggleList: (v: boolean) => void
  onEdit: () => void
  onRemove: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

export function FieldRow({
  field,
  idx,
  total,
  typeNames,
  category,
  onToggleEnabled,
  onToggleRequired,
  onToggleList,
  onEdit,
  onRemove,
  onDragStart,
  onDragEnd,
}: FieldRowProps) {
  const { t, locale } = useLocale()
  const f = field
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML)

    // Create a more visible drag image
    if (dragRef.current) {
      const dragImage = dragRef.current.cloneNode(true) as HTMLElement
      dragImage.style.transform = "rotate(3deg)"
      dragImage.style.opacity = "0.8"
      dragImage.style.border = "2px solid #3b82f6"
      dragImage.style.borderRadius = "12px"
      dragImage.style.backgroundColor = "#dbeafe"
      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, 0, 0)
      setTimeout(() => document.body.removeChild(dragImage), 0)
    }

    onDragStart?.(e)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    setIsDragOver(false)
    onDragEnd?.(e)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set dragOver to false if we're leaving the component entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false)
    }
  }

  return (
    <Card
      ref={dragRef}
      className={`
        p-3 transition-all duration-200 ease-in-out cursor-pointer
        ${isDragging ? 'opacity-50 scale-105 rotate-1 bg-blue-50/80 border-blue-200 shadow-lg' : 'bg-white/60 backdrop-blur border-white/60'}
        ${isDragOver ? 'ring-2 ring-blue-400 ring-opacity-50 scale-[1.02] bg-blue-50/40' : ''}
        hover:shadow-md hover:bg-white/80
      `}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Drag Handle - Make it more prominent */}
          <div 
            className={`
              flex-shrink-0 p-1 rounded-md transition-all duration-200
              ${isDragging ? 'bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'}
              cursor-grab active:cursor-grabbing
            `}
            title={t("dragToSort")}
            aria-label={t("dragToSort")}
          >
            <GripVertical className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-medium truncate">{f.label}</div>
            <Badge variant="outline" className="text-xs">
              {typeNames[f.type]}
            </Badge>
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
            {f.required && (
              <Badge variant="destructive" className="text-xs">
                {locale === "zh" ? "必填" : "Required"}
              </Badge>
            )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {locale === "zh" ? "Key：" : "Key: "}{f.key}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {locale === "zh" ? "启用" : "Enabled"}
            </span>
            <Switch checked={f.enabled !== false} onCheckedChange={onToggleEnabled} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {locale === "zh" ? "必填" : "Required"}
            </span>
            <Switch checked={!!f.required} onCheckedChange={onToggleRequired} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {locale === "zh" ? "列表显示" : "Show in List"}
            </span>
            <Switch checked={f.showInList !== false} onCheckedChange={onToggleList} />
          </div>

          <div className="flex items-center gap-2">

            <Button size="sm" onClick={onEdit} className="rounded-xl" title={t("editField")}>
              <Edit className="mr-1 size-4" />
              {locale === "zh" ? "编辑" : "Edit"}
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="rounded-xl"
              title={t("deleteField")}
            >
              <Trash2 className="mr-1 size-4" />
              {locale === "zh" ? "删除" : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={f.label}
        itemType="field"
        onConfirm={onRemove}
      />
    </Card>
  )
}
