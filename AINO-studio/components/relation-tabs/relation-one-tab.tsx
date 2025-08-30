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
  const selectedRecord = selectedId && targetDir ? targetDir.records.find((r) => r.id === selectedId) : null

  const [dialogOpen, setDialogOpen] = useState(false)
  const [targetDirRecords, setTargetDirRecords] = useState<RecordRow[]>([])
  const [recordsLoading, setRecordsLoading] = useState(false)

  // Load target directory records
  const loadTargetDirRecords = async () => {
    if (!targetDirId || recordsLoading) return
    
    setRecordsLoading(true)
    try {
      const response = await api.records.listRecords(targetDirId, {
        page: 1,
        pageSize: 100
      })
      
      if (response.success && response.data?.records) {
        setTargetDirRecords(response.data.records)
      } else {
        console.error("Failed to load target directory records:", response.error)
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

  const handleSaveFromDialog = (newIdSet: Set<string>) => {
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
            <span className="font-medium">{getRecordName(targetDir!, selectedRecord)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onChange(null)}
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
          selectedIds={selectedId ? new Set([selectedId]) : new Set()}
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
