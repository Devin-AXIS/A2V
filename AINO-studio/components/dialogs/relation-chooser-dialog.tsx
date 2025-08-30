"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DirectoryModel, RecordRow } from "@/lib/store"
import { findNameField, getRecordName } from "@/lib/store"
import { useLocale } from "@/hooks/use-locale"

function RecordPreviewRow({ dir, record }: { dir: DirectoryModel; record: RecordRow }) {
  const previewFields = useMemo(() => {
    const nameField = findNameField(dir)
    return dir.fields.filter((f) => f.enabled && f.showInList !== false && f.id !== nameField?.id).slice(0, 3) // Show up to 3 extra fields
  }, [dir])

  return (
    <div className="flex-1 text-left">
      <div className="font-medium">{getRecordName(dir, record)}</div>
      <div className="text-xs text-muted-foreground flex items-center gap-x-3 gap-y-1 flex-wrap mt-1">
        {previewFields.map((f) => (
          <div key={f.id}>
            <span className="text-slate-500">{f.label}:</span>{" "}
            <span className="font-mono text-slate-700">{String((record as any)[f.key] ?? "–")}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RelationChooserDialog({
  open,
  onOpenChange,
  targetDir,
  isMulti,
  selectedIds,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  targetDir: DirectoryModel
  isMulti: boolean
  selectedIds: Set<string>
  onSave: (ids: Set<string>) => void
}) {
  const { locale } = useLocale()
  const [currentSelection, setCurrentSelection] = useState(new Set(selectedIds))
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (open) {
      setCurrentSelection(new Set(selectedIds))
    }
  }, [open, selectedIds])

  const filteredRecords = targetDir.records.filter((r) =>
    getRecordName(targetDir, r).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = (id: string) => {
    if (isMulti) {
      const newSelection = new Set(currentSelection)
      if (newSelection.has(id)) {
        newSelection.delete(id)
      } else {
        newSelection.add(id)
      }
      setCurrentSelection(newSelection)
    } else {
      setCurrentSelection(new Set([id]))
      onSave(new Set([id])) // auto-save and close for single select
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/80 backdrop-blur" aria-describedby="relation-chooser-description">
        <DialogHeader>
          <DialogTitle>{locale === "zh" ? `选择 ${targetDir.name}` : `Select ${targetDir.name}`}</DialogTitle>
        </DialogHeader>
        <div id="relation-chooser-description" className="sr-only">
          {locale === "zh" ? `从 ${targetDir.name} 中选择一个或多个记录来创建关联` : `Select one or more records from ${targetDir.name} to create relationships`}
        </div>
        <Input
          placeholder={locale === "zh" ? "搜索..." : "Search..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="my-2 bg-white/70"
        />
        <ScrollArea className="h-[400px] border rounded-md bg-white/60">
          <div className="p-2">
            {isMulti ? (
              <div className="space-y-1">
                {filteredRecords.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/90 cursor-pointer"
                    onClick={() => handleSelect(r.id)}
                  >
                    <Checkbox
                      id={`rel-${r.id}`}
                      checked={currentSelection.has(r.id)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(r.id)
                      }}
                      onCheckedChange={() => handleSelect(r.id)}
                    />
                    <RecordPreviewRow dir={targetDir} record={r} />
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup value={Array.from(currentSelection)[0] || ""} onValueChange={handleSelect}>
                {filteredRecords.map((r) => (
                  <label
                    key={r.id}
                    htmlFor={`rel-${r.id}`}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/90 cursor-pointer"
                  >
                    <RadioGroupItem value={r.id} id={`rel-${r.id}`} />
                    <RecordPreviewRow dir={targetDir} record={r} />
                  </label>
                ))}
              </RadioGroup>
            )}
            {filteredRecords.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">{locale === "zh" ? "无匹配记录" : "No matching records"}</div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button onClick={() => onSave(currentSelection)}>{locale === "zh" ? "保存" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
