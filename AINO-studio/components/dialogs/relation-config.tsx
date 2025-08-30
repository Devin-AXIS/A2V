"use client"

import { useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { AppModel, FieldModel } from "@/lib/store"

export type RelationConfigValue = {
  moduleId?: string | null
  targetDirId?: string | null
  displayFieldKey?: string | null
  allowMultiple?: boolean
  bidirectional?: boolean
  allowDuplicate?: boolean
  // optional future: filter expression and hidden fields
  filterExpr?: string
  hiddenFieldKeys?: string[]
}

export function RelationConfig({
  app,
  value,
  onChange,
  onToggleMultiple,
}: {
  app: AppModel
  value: RelationConfigValue
  onChange: (patch: Partial<RelationConfigValue>) => void
  onToggleMultiple?: (allow: boolean) => void
}) {
  const modules = app.modules
  const moduleId = value.moduleId || modules[0]?.id || ""
  const selectedModule = useMemo(() => modules.find((m) => m.id === moduleId) || null, [modules, moduleId])
  const tables = (selectedModule?.directories || []).filter((d) => d.type === "table")
  const targetDirId = value.targetDirId || tables[0]?.id || ""
  const targetDir = useMemo(() => tables.find((d) => d.id === targetDirId) || null, [tables, targetDirId])

  const displayCandidates: FieldModel[] = useMemo(() => {
    if (!targetDir) return []
    // Prefer text-like fields as display candidates
    return targetDir.fields.filter((f) =>
      ["text", "textarea", "select", "number", "date", "time", "tags"].includes(f.type),
    )
  }, [targetDir])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="grid gap-1">
          <Label>选择模块</Label>
          <Select
            value={moduleId || "none"}
            onValueChange={(v) => {
              const mid = v === "none" ? "" : v
              onChange({ moduleId: mid, targetDirId: "", displayFieldKey: "" })
            }}
          >
            <SelectTrigger className="bg-white/80">
              <SelectValue placeholder="选择模块" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label>选择表</Label>
          <Select
            value={targetDirId || "none"}
            onValueChange={(v) => {
              const did = v === "none" ? "" : v
              onChange({ targetDirId: did, displayFieldKey: "" })
            }}
          >
            <SelectTrigger className="bg-white/80">
              <SelectValue placeholder="选择表" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="grid gap-1">
          <Label>选择展示的列</Label>
          <Select
            value={value.displayFieldKey || "none"}
            onValueChange={(v) => onChange({ displayFieldKey: v === "none" ? "" : v })}
            disabled={!targetDir}
          >
            <SelectTrigger className="bg-white/80">
              <SelectValue placeholder="请选择..." />
            </SelectTrigger>
            <SelectContent>
              {displayCandidates.length === 0 && <SelectItem value="none">无可选字段</SelectItem>}
              {displayCandidates.map((f) => (
                <SelectItem key={f.id} value={f.key}>
                  {f.label}（{f.key}）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label>从视图筛选记录（示意）</Label>
          <Select value={"all"} onValueChange={() => {}} disabled>
            <SelectTrigger className="bg-white/80">
              <SelectValue placeholder="请选择..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部记录</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1">
        <Label>筛选记录（示意：可用表达式）</Label>
        <Textarea
          className="bg-white/80"
          placeholder="例如：status == '启用' && amount > 0"
          value={value.filterExpr || ""}
          onChange={(e) => onChange({ filterExpr: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
          <div className="space-y-0.5">
            <div className="text-sm">双向关联</div>
            <div className="text-xs text-muted-foreground">在对方表中自动生成反向字段（示意）</div>
          </div>
          <Switch checked={!!value.bidirectional} onCheckedChange={(v) => onChange({ bidirectional: v })} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
          <div className="space-y-0.5">
            <div className="text-sm">允许多选</div>
            <div className="text-xs text-muted-foreground">关系类型切换为多对多</div>
          </div>
          <Switch
            checked={!!value.allowMultiple}
            onCheckedChange={(v) => {
              onChange({ allowMultiple: v })
              onToggleMultiple?.(v)
            }}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
          <div className="space-y-0.5">
            <div className="text-sm">允许重复值</div>
            <div className="text-xs text-muted-foreground">同一记录可重复关联（示意）</div>
          </div>
          <Switch checked={!!value.allowDuplicate} onCheckedChange={(v) => onChange({ allowDuplicate: v })} />
        </div>
      </div>

      {/* Hidden fields (示意：输入逗号分隔) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="grid gap-1">
          <Label>隐藏字段（逗号分隔，示意）</Label>
          <Input
            className="bg-white/80"
            placeholder="如：internal_note, secret_flag"
            value={(value.hiddenFieldKeys || []).join(",")}
            onChange={(e) =>
              onChange({
                hiddenFieldKeys: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
