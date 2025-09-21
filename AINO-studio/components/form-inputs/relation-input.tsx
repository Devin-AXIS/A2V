"use client"

import { useState, useEffect } from "react"
import { X, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RelationChooserDialog } from "@/components/dialogs/relation-chooser-dialog"
import type { AppModel, FieldModel } from "@/lib/store"
import { findDirByIdAcrossModules, getRecordName } from "@/lib/store"

export function RelationInput({
  app,
  field,
  value,
  onChange,
  currentRecordId,
}: {
  app: AppModel
  field: FieldModel
  value: any
  onChange: (v: any) => void
  currentRecordId?: string
}) {
  const targetDirId = field.relation?.targetDirId
  const targetDir = findDirByIdAcrossModules(app, targetDirId)
  const isMulti = field.type === "relation_many"
  const selectedIds = new Set(isMulti ? (Array.isArray(value) ? value : []) : value ? [value] : [])
  const isBidirectional = field.relation?.bidirectional

  // 计算当前记录所在目录ID（用于反向关联查询）
  const currentDirId = ((): string | undefined => {
    for (const mod of app.modules) {
      for (const dir of mod.directories) {
        if (dir.fields.some((f) => f.id === field.id)) {
          return dir.id
        }
      }
    }
    return undefined
  })()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [reverseRelations, setReverseRelations] = useState<any[]>([])
  const [loadingReverse, setLoadingReverse] = useState(false)

  // 获取反向关联记录
  useEffect(() => {
    if (isBidirectional && currentRecordId && field.relation?.reverseFieldKey && currentDirId) {
      setLoadingReverse(true)

      // 调用API获取反向关联记录
      const fetchReverseRelations = async () => {
        try {
          // 获取应用ID
          const applicationId = app.id
          if (!applicationId) {
            console.error('应用ID不存在')
            setReverseRelations([])
            return
          }

          // 调用关联记录API获取反向关联记录
          const response = await fetch(`/api/relation-records/records/${applicationId}/${currentDirId}/${currentRecordId}/${field.relation.reverseFieldKey}`)
          if (response.ok) {
            const data = await response.json()
            setReverseRelations(data.data?.records || [])
          } else {
            console.error('获取反向关联记录失败:', response.status, response.statusText)
            setReverseRelations([])
          }
        } catch (error) {
          console.error('获取反向关联记录失败:', error)
          setReverseRelations([])
        } finally {
          setLoadingReverse(false)
        }
      }

      fetchReverseRelations()
    }
  }, [isBidirectional, currentRecordId, field.relation?.reverseFieldKey, currentDirId])

  const handleUnselect = (id: string) => {
    const newSelected = new Set(selectedIds)
    newSelected.delete(id)
    onChange(isMulti ? Array.from(newSelected) : Array.from(newSelected)[0] || "")
  }

  return (
    <div className="space-y-3">
      {/* 正向关联 */}
      <div>
        <div className="text-sm font-medium mb-2">关联记录</div>
        <div className="w-full p-2 border rounded-md bg-white flex flex-wrap items-center gap-2 min-h-10">
          {Array.from(selectedIds).map((id) => {
            const record = targetDir?.records.find((r) => r.id === id)
            const label = record
              ? (
                field.relation?.displayFieldKey
                  ? String((record as any)[field.relation.displayFieldKey] ?? getRecordName(targetDir!, record))
                  : getRecordName(targetDir!, record)
              )
              : id
            return (
              <Badge key={id} variant="secondary">
                {label}
                <button onClick={() => handleUnselect(id)} className="ml-1 rounded-full outline-none">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          <Button variant="outline" size="sm" className="h-7 bg-white" onClick={() => setDialogOpen(true)}>
            选择...
          </Button>
        </div>
      </div>

      {/* 反向关联 */}
      {isBidirectional && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            反向关联记录
            {field.relation?.reverseFieldKey && (
              <span className="text-xs text-muted-foreground">
                (通过 {field.relation.reverseFieldKey} 字段)
              </span>
            )}
          </div>
          <div className="w-full p-2 border rounded-md bg-gray-50 flex flex-wrap items-center gap-2 min-h-10">
            {loadingReverse ? (
              <div className="text-sm text-muted-foreground">加载中...</div>
            ) : reverseRelations.length > 0 ? (
              reverseRelations.map((relation) => (
                <Badge key={relation.id} variant="outline">
                  {relation.name || relation.id}
                </Badge>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">暂无反向关联记录</div>
            )}
          </div>
        </div>
      )}

      {targetDir && (
        <RelationChooserDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          targetDir={targetDir}
          isMulti={isMulti}
          selectedIds={selectedIds}
          onSave={(newIds) => {
            onChange(isMulti ? Array.from(newIds) : Array.from(newIds)[0] || "")
            setDialogOpen(false)
          }}
        />
      )}
    </div>
  )
}
