"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, GripVertical } from "lucide-react"
import type { FieldModel, FieldType } from "@/lib/store"
import { useLocale } from "@/hooks/use-locale"
import type { FieldCategoryModel } from "@/lib/field-categories"

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
  onDragStart?: () => void
  onDragEnd?: () => void
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
  
  return (
    <Card className="p-3 bg-white/60 backdrop-blur border-white/60">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0">
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
            <button
              type="button"
              className="h-8 w-8 inline-flex items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing rounded-md border border-white/60 bg-white/70"
              title={t("dragToSort")}
              aria-label={t("dragToSort")}
              draggable
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <Button size="sm" onClick={onEdit} className="rounded-xl" title={t("editField")}>
              <Edit className="mr-1 size-4" />
              {locale === "zh" ? "编辑" : "Edit"}
            </Button>

            <Button 
              size="sm" 
              variant="destructive" 
              onClick={onRemove} 
              className="rounded-xl" 
              title={t("deleteField")}
            >
              <Trash2 className="mr-1 size-4" />
              {locale === "zh" ? "删除" : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
