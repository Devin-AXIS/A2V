"use client"

import { useMemo } from "react"
import type { AppModel, DirectoryModel, FieldModel, FieldType } from "@/lib/store"
import { AddFieldDialog, type FieldDraft } from "@/components/dialogs/add-field-dialog"

function toDraft(app: AppModel, dir: DirectoryModel, f: FieldModel): FieldDraft {
  const d: FieldDraft = {
    label: f.label,
    key: f.key,
    type: f.type,
    required: !!f.required,
    unique: !!f.unique,
    showInList: f.showInList !== false,
    categoryId: (f as any).categoryId || undefined,
    options: Array.isArray(f.options) ? [...f.options] : undefined,
    defaultRaw: "",
    relationTargetId: f.relation?.targetDirId || null,
    relationModuleId: null,
    relationDisplayFieldKey: f.relation?.displayFieldKey || null,
    relationBidirectional: (f as any).relationBidirectional || false,
    relationAllowDuplicate: (f as any).relationAllowDuplicate || false,
    dateMode: f.dateMode || undefined,
    cascaderOptions: f.cascaderOptions ? (JSON.parse(JSON.stringify(f.cascaderOptions)) as any) : undefined,
    preset: (f as any).preset || undefined,
    skillsConfig: (f as any).skillsConfig || undefined,
    otherVerificationConfig: (f as any).otherVerificationConfig || undefined,
  }

  if (f.type === "select") d.defaultRaw = typeof f.default === "string" ? (f.default as string) : ""
  if (f.type === "multiselect") d.defaultRaw = Array.isArray(f.default) ? (f.default as string[]).join(",") : ""
  if (f.type === "boolean" || f.type === "checkbox")
    d.defaultRaw = typeof f.default === "boolean" ? (f.default ? "true" : "false") : ""

  // 反推 moduleId（用于 RelationConfig 初始模块）
  if (f.relation?.targetDirId) {
    for (const m of app.modules) {
      if (m.directories.some((x) => x.id === f.relation!.targetDirId)) {
        d.relationModuleId = m.id
        break
      }
    }
  }

  return d
}

function applyDraftToFieldModel(
  dir: DirectoryModel,
  fieldId: string,
  draft: FieldDraft,
  confirmTypeChange: (msg: string) => boolean,
) {
  const f = dir.fields.find((x) => x.id === fieldId)
  if (!f) return
  const beforeType = f.type
  const beforeKey = f.key

  // 基础映射
  f.label = draft.label.trim() || f.label
  f.key = draft.key.trim() || f.key
  f.type = draft.type
  f.required = !!draft.required
  f.unique = !!draft.unique
  f.showInList = !!draft.showInList
  ;(f as any).categoryId = draft.categoryId || undefined

  // 清理类型不适用属性
  delete (f as any).options
  delete (f as any).relation
  delete (f as any).cascaderOptions
  delete (f as any).dateMode
  delete (f as any).default
  delete (f as any).preset
  delete (f as any).skillsConfig

  // 类型附加
  if (draft.type === "select" || draft.type === "multiselect") {
    const safe = (draft.options || []).filter(Boolean)
    ;(f as any).options = Array.from(new Set(safe))
    if (draft.type === "select") {
      ;(f as any).default = draft.defaultRaw || (safe[0] ?? "")
    } else {
      ;(f as any).default = draft.defaultRaw
        ? draft.defaultRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    }
  } else if (draft.type === "boolean" || draft.type === "checkbox") {
    ;(f as any).default =
      draft.defaultRaw === "true" ? true : draft.defaultRaw === "false" ? false : ((f as any).default ?? undefined)
  } else if (draft.type === "date") {
    ;(f as any).dateMode = draft.dateMode || "single"
  } else if (draft.type === "cascader") {
    ;(f as any).cascaderOptions = draft.cascaderOptions ? JSON.parse(JSON.stringify(draft.cascaderOptions)) : []
  } else if (draft.type === "relation_one" || draft.type === "relation_many") {
    ;(f as any).relation = {
      targetDirId: draft.relationTargetId || null,
      mode: draft.type === "relation_one" ? "one" : "many",
      ...(draft.relationDisplayFieldKey ? { displayFieldKey: draft.relationDisplayFieldKey } : {}),
    }
    ;(f as any).relationBidirectional = !!draft.relationBidirectional
    ;(f as any).relationAllowDuplicate = !!draft.relationAllowDuplicate
  }

  // Apply preset configuration
  if (draft.preset) {
    ;(f as any).preset = draft.preset
    if (draft.preset === "skills" && draft.skillsConfig) {
      ;(f as any).skillsConfig = draft.skillsConfig
    }
    if (draft.preset === "other_verification" && draft.otherVerificationConfig) {
      ;(f as any).otherVerificationConfig = draft.otherVerificationConfig
    }
  }

  // 类型变更时尝试转换（简化版本，与旧 FieldManager 一致）
  if (beforeType !== draft.type) {
    const ok = confirmTypeChange(
      "更改字段类型会尝试转换已有数据，可能造成数据丢失，是否继续？"
    )
    if (!ok) {
      f.type = beforeType
    } else {
      convertValuesOnTypeChange(dir.records, beforeKey, beforeType, f)
    }
  }

  // Key 迁移
  if (draft.key.trim() && draft.key !== beforeKey) {
    migrateKey(dir.records, beforeKey, draft.key)
  }
}

function migrateKey(records: any[], oldKey: string, newKey: string) {
  records.forEach((r) => {
    if (Object.prototype.hasOwnProperty.call(r, oldKey)) {
      ;(r as any)[newKey] = (r as any)[oldKey]
      delete (r as any)[oldKey]
    }
  })
}

function convertValuesOnTypeChange(records: any[], oldKey: string, from: FieldType, f: FieldModel) {
  const newKey = f.key
  const to = f.type
  if (from === to) return
  records.forEach((r) => {
    const v = (r as any)[oldKey]
    // 写入到新 key（若 key 被修改）
    const assign = (val: any) => {
      delete (r as any)[oldKey]
      ;(r as any)[newKey] = val
    }

    if (to === "select" && Array.isArray(v)) return assign(v[0] ?? "")
    if (to === "multiselect" && typeof v === "string") return assign(v ? [v] : [])
    if (to === "number" && typeof v !== "number") {
      const n = Number(v)
      return assign(Number.isFinite(n) ? n : 0)
    }
    if ((to === "text" || to === "textarea" || to === "richtext") && typeof v !== "string")
      return assign(v == null ? "" : String(v))
    if (to === "tags" && !Array.isArray(v)) {
      const arr = v
        ? String(v)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
      return assign(arr)
    }
    // 其他：直接搬运到新 key 或保持
    return assign(v)
  })
}

export function FieldEditor({
  open,
  onOpenChange,
  app,
  dir,
  field,
  typeNames,
  i18n,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  app: AppModel
  dir: DirectoryModel
  field: FieldModel
  typeNames: Record<FieldType, string>
  i18n: any
  onSubmit: (nextDir: DirectoryModel) => void
}) {
  const initialDraft = useMemo(() => toDraft(app, dir, field), [app, dir, field])

  return (
    <AddFieldDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      app={app}
      currentDir={dir}
      canEdit={true}
      existingKeys={dir.fields.filter((f) => f.id !== field.id).map((f) => f.key)}
      initialDraft={initialDraft}
      i18n={{ ...i18n, submit: i18n.saveField || "保存字段" }}
      typeNames={typeNames}
      submitText={i18n.saveField || "保存字段"}
      onSubmit={(draft) => {
        const next = structuredClone(dir)
        applyDraftToFieldModel(next, field.id, draft, (msg) => window.confirm(msg))
        // 从更新后的目录中提取字段数据
        const updatedField = next.fields.find(f => f.id === field.id)
        if (updatedField) {
          onSubmit(updatedField)
        }
        onOpenChange(false)
      }}
    />
  )
}
