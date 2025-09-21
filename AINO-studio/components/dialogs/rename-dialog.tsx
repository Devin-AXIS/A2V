"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/hooks/use-locale"

export function RenameDialog({
  open,
  onOpenChange,
  title = "重命名",
  label = "名称",
  placeholder,
  initialValue = "",
  canEdit = true,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title?: string
  label?: string
  placeholder?: string
  initialValue?: string
  canEdit?: boolean
  onSave: (val: string) => void
}) {
  const { locale } = useLocale()
  const [val, setVal] = useState(initialValue)
  useEffect(() => {
    if (open) setVal(initialValue)
  }, [open, initialValue])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] bg-white/70 backdrop-blur border-white/60"
        aria-describedby="rename-description"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div id="rename-description" className="sr-only">
          Enter a new name for this item
        </div>
        <div className="space-y-1">
          <Label htmlFor="rename-input">{label}</Label>
          <Input
            id="rename-input"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button onClick={() => {
            console.log('=== RenameDialog save clicked ===', { val: val.trim(), canEdit })
            onSave(val.trim())
          }} disabled={!val.trim() || !canEdit}>
            {locale === "zh" ? "保存" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
