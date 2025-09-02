"use client"

import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelationChooserDialog } from "@/components/dialogs/relation-chooser-dialog"
import type { AppModel, FieldModel, RecordRow } from "@/lib/store"
import { findDirByIdAcrossModules, getRecordName } from "@/lib/store"
import { api } from "@/lib/api"
import { useLocale } from "@/hooks/use-locale"

export function RelationOneTab({
  app,
  field,
  rec,
  onChange,
}: {
  app: AppModel
  field: FieldModel
  rec: RecordRow
  onChange: (newId: string | null) => void
}) {
  const { locale } = useLocale()
  const targetDirId = field.relation?.targetDirId
  const targetDir = findDirByIdAcrossModules(app, targetDirId)
  const selectedId = (rec as any)[field.key] || null
  const [fetchedSelectedId, setFetchedSelectedId] = useState<string | null>(null)
  // 优先在已加载的目标目录记录中查找选中项，其次回退到静态的 targetDir.records
  const [targetDirRecords, setTargetDirRecords] = useState<RecordRow[]>([])
  const effectiveSelectedId = selectedId || fetchedSelectedId
  const selectedRecord = effectiveSelectedId
    ? (targetDirRecords.find((r) => r.id === effectiveSelectedId) || (targetDir ? targetDir.records.find((r) => r.id === effectiveSelectedId) : null))
    : null

  // Debug logging
  console.log("RelationOneTab Debug:", {
    fieldKey: field.key,
    fieldType: field.type,
    targetDirId,
    targetDir: targetDir ? { id: targetDir.id, name: targetDir.name, recordsCount: targetDir.records?.length } : null,
    app: app ? { id: app.id, modulesCount: app.modules?.length } : null
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [recordsLoading, setRecordsLoading] = useState(false)

  // Load target directory records
  const loadTargetDirRecords = async () => {
    // API调用前检查必要参数的有效性
    if (!targetDirId || recordsLoading) {
      console.log("RelationOneTab: Skipping record load", { targetDirId, recordsLoading })
      return
    }

    console.log("RelationOneTab: Loading records for targetDirId:", targetDirId)
    setRecordsLoading(true)
    try {
      const response = await api.records.listRecords(targetDirId, {
        page: 1,
        pageSize: 100
      })

      console.log("RelationOneTab: API response:", response)

      if (response.success && response.data) {
        // 后端返回的data直接是记录数组，不是{records: [...]}
        const records = Array.isArray(response.data) ? response.data : []
        setTargetDirRecords(records)
        console.log("RelationOneTab: Loaded records:", records.length)
      } else {
        console.error("Failed to load target directory records:", response.error || "Unknown error")
        setTargetDirRecords([])
      }
    } catch (error) {
      console.error("Error loading target directory records:", error)
      setTargetDirRecords([])
    } finally {
      setRecordsLoading(false)
    }
  }

  // Load records when target directory changes
  useEffect(() => {
    if (targetDirId) {
      loadTargetDirRecords()
    }
  }, [targetDirId])

  // 当选中的正式值变化时，清空临时填充的 fetched 值，避免覆盖新选择
  useEffect(() => {
    setFetchedSelectedId(null)
  }, [selectedId])

  // 如果记录中未存储选中值，则从关联表查询补充（详情模式下常见）
  useEffect(() => {
    const currentDirId = (() => {
      for (const mod of app.modules) {
        for (const d of mod.directories) {
          if (d.fields.some((f) => f.id === field.id)) return d.id
        }
      }
      return null
    })()
    if (!selectedId && app.id && currentDirId && rec.id) {
      ; (async () => {
        try {
          const res = await fetch(`/api/relation-records/records/${app.id}/${currentDirId}/${rec.id}/${field.key}`)
          if (res.ok) {
            const data = await res.json()
            const records = data?.data?.records || []
            if (Array.isArray(records) && records.length > 0) {
              setFetchedSelectedId(records[0].id)
            }
          }
        } catch { }
      })()
    }
  }, [app.id, rec.id, field.id, field.key, selectedId, app.modules])

  const handleSaveFromDialog = (newIdSet: Set<string>) => {
    setFetchedSelectedId(null)
    onChange(Array.from(newIdSet)[0] || null)
    setDialogOpen(false)
  }

  // Create target directory with loaded records
  const targetDirWithRecords = targetDir ? {
    ...targetDir,
    records: targetDirRecords
  } : null

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {selectedRecord ? (
          <div
            key={selectedRecord.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          >
            <span className="font-medium">
              {field.relation?.displayFieldKey
                ? String((selectedRecord as any)[field.relation.displayFieldKey] ?? getRecordName(targetDir!, selectedRecord))
                : getRecordName(targetDir!, selectedRecord)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                setFetchedSelectedId(null)
                onChange(null)
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-10 border border-dashed rounded-xl">
            暂无关联记录
          </div>
        )}
      </div>
      <Button
        variant="outline"
        className="w-full bg-white"
        onClick={() => {
          console.log("🔍 RelationOneTab: Select button clicked", {
            fieldKey: field.key,
            targetDirId,
            targetDir: targetDir ? { id: targetDir.id, name: targetDir.name } : null,
            targetDirRecords: targetDirRecords.length,
            targetDirWithRecords: targetDirWithRecords ? {
              id: targetDirWithRecords.id,
              name: targetDirWithRecords.name,
              recordsCount: targetDirWithRecords.records?.length
            } : null,
            dialogOpen,
            recordsLoading
          })
          setDialogOpen(true)
        }}
      >
        <Plus className="mr-2 size-4" />
        {selectedRecord ? "更换" : "选择"}表
      </Button>
      {targetDirWithRecords ? (
        <RelationChooserDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          targetDir={targetDirWithRecords}
          isMulti={false}
          selectedIds={effectiveSelectedId ? new Set([effectiveSelectedId]) : new Set()}
          onSave={handleSaveFromDialog}
        />
      ) : (
        <div className="text-center text-sm text-red-500 py-2">
          {locale === "zh" ? "无法加载目标目录数据" : "Cannot load target directory data"}
          <br />
          <span className="text-xs">
            targetDirId: {targetDirId || "null"},
            targetDir: {targetDir ? "exists" : "null"},
            records: {targetDirRecords.length}
          </span>
        </div>
      )}
    </div>
  )
}
