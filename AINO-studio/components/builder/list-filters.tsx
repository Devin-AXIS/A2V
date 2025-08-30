"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CascaderSelect, type CatNode } from "@/components/cascader-select"

export type Option = { label: string; value: string; level?: 1 | 2 | 3 }

const deriveLevel = (opt: Option): 1 | 2 | 3 => {
  if (opt.level) return opt.level
  const parts = (opt.label || "").split(" / ").filter(Boolean)
  const lv = Math.min(3, Math.max(1, parts.length))
  return lv as 1 | 2 | 3
}

export function ListFilters({
  kw,
  onKw,
  category,
  onCategory,
  categories = [],
  categoriesTree = [],
  status,
  onStatus,
  statuses = [],
  addText = "新增记录",
  onAdd,
  searchPlaceholder = "搜索...",
  catLabel = "按分类筛选",
  statusLabel = "按状态筛选",
}: {
  kw: string
  onKw: (v: string) => void
  category: string
  onCategory: (v: string) => void
  categories?: Option[] // fallback (flat)
  categoriesTree?: CatNode[] // preferred: tree for cascader
  status: string
  onStatus: (v: string) => void
  statuses?: Option[]
  addText?: string
  onAdd?: () => void
  searchPlaceholder?: string
  catLabel?: string
  statusLabel?: string
}) {
  const cascadedMode = Array.isArray(categoriesTree) && categoriesTree.length > 0

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          className="w-[220px] bg-white/60"
          value={kw}
          onChange={(e) => onKw(e.target.value)}
        />

        {cascadedMode ? (
          <CascaderSelect
            tree={categoriesTree}
            value={category || "all"}
            onChange={onCategory}
            placeholder={catLabel}
            clearText="全部"
            l1Label="第 1 级"
            l2Label="第 2 级"
            l3Label="第 3 级"
          />
        ) : (
          <Select value={category} onValueChange={onCategory}>
            <SelectTrigger className="w-[220px] bg-white/60" title={catLabel}>
              <SelectValue placeholder={catLabel} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => {
                const level = deriveLevel(c)
                const pad = level === 1 ? "" : level === 2 ? "pl-4" : "pl-8"
                const badge = `L${level}`
                return (
                  <SelectItem key={c.value + "::" + c.label} value={c.value}>
                    <div className={`flex items-center ${pad}`}>
                      <span className="mr-2 text-[10px] leading-none rounded border border-white/60 bg-white/70 px-1 py-0.5 text-slate-600">
                        {badge}
                      </span>
                      <span className="truncate">{c.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )}

        <Select value={status} onValueChange={onStatus}>
          <SelectTrigger className="w-[140px] bg-white/60">
            <SelectValue placeholder={statusLabel} />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => onAdd?.()}>
          <Plus className="mr-1 size-4" />
          {addText}
        </Button>
      </div>
      <div />
    </div>
  )
}
