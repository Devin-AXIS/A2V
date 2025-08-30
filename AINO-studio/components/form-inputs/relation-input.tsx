"use client"

import { useState } from "react"
import { X } from "lucide-react"
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
}: {
  app: AppModel
  field: FieldModel
  value: any
  onChange: (v: any) => void
}) {
  const targetDirId = field.relation?.targetDirId
  const targetDir = findDirByIdAcrossModules(app, targetDirId)
  const isMulti = field.type === "relation_many"
  const selectedIds = new Set(isMulti ? (Array.isArray(value) ? value : []) : value ? [value] : [])

  const handleUnselect = (id: string) => {
    const newSelected = new Set(selectedIds)
    newSelected.delete(id)
    onChange(isMulti ? Array.from(newSelected) : Array.from(newSelected)[0] || "")
  }

  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="w-full p-2 border rounded-md bg-white flex flex-wrap items-center gap-2 min-h-10">
        {Array.from(selectedIds).map((id) => {
          const record = targetDir?.records.find((r) => r.id === id)
          return record ? (
            <Badge key={id} variant="secondary">
              {getRecordName(targetDir!, record)}
              <button onClick={() => handleUnselect(id)} className="ml-1 rounded-full outline-none">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null
        })}
        <Button variant="outline" size="sm" className="h-7 bg-white" onClick={() => setDialogOpen(true)}>
          选择...
        </Button>
      </div>
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
    </>
  )
}
