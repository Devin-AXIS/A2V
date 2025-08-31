"use client"

import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Blocks, Plus, List, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { FrostPanel } from "@/components/frost"
import { useLocale } from "@/hooks/use-locale"

export function DirectoryShell({
  breadcrumb = "",
  onOpenCategories,
  onOpenAddField,
  onOpenFieldSettings,
  canEdit = true,
  tab = "list",
  onTabChange,
  filtersSlot,
  bulkToolbarSlot,
  listSlot,
  fieldsSlot,
  actionsExtra,
  className,
}: {
  breadcrumb?: string
  onOpenCategories?: () => void
  onOpenAddField?: () => void
  onOpenFieldSettings?: () => void
  canEdit?: boolean
  tab?: "list" | "fields"
  onTabChange?: (v: "list" | "fields") => void
  filtersSlot?: React.ReactNode
  bulkToolbarSlot?: React.ReactNode
  listSlot?: React.ReactNode
  fieldsSlot?: React.ReactNode
  actionsExtra?: React.ReactNode
  className?: string
}) {
  const { t, locale } = useLocale()

  return (
    <FrostPanel className={cn("p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-700">{breadcrumb}</div>
        {/* <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenCategories}
            disabled={!canEdit}
            className="rounded-xl"
            title={!canEdit ? (locale === "zh" ? "当前角色无权编辑分类" : "Current role cannot edit categories") : (locale === "zh" ? "设置三级分类" : "Configure 3-level categories")}
          >
            <Blocks className="mr-1 size-4" />
            {locale === "zh" ? "分类" : "Categories"}
          </Button>
          <Button size="sm" onClick={onOpenAddField} disabled={!canEdit} className="rounded-xl">
            <Plus className="mr-1 size-4" />
            {locale === "zh" ? "字段增加" : "Add Field"}
          </Button>
          {actionsExtra}
        </div> */}
      </div>

      {filtersSlot}

      {bulkToolbarSlot}

      <Tabs value={tab} onValueChange={(v) => onTabChange?.(v as any)} className="mt-4">
        <TabsList className="bg-white/60 backdrop-blur rounded-2xl p-1">
          <TabsTrigger value="list" className="rounded-xl data-[state=active]:bg-sky-100">
            <List className="mr-2 size-4" />
            {t("tabList")}
          </TabsTrigger>
          <TabsTrigger value="fields" disabled={!canEdit} className="rounded-xl data-[state=active]:bg-sky-100">
            <Wrench className="mr-2 size-4" />
            {t("tabFields")}
          </TabsTrigger>

        </TabsList>
        <TabsContent value="list" className="mt-4">
          {listSlot}
        </TabsContent>
        <TabsContent value="fields" className="mt-4">
          {fieldsSlot}
        </TabsContent>

      </Tabs>
    </FrostPanel>
  )
}
