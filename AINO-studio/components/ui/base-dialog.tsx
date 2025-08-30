"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  onSubmit?: () => void
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  submitDisabled?: boolean
  maxWidth?: string
}

export function BaseDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  onSubmit,
  onCancel,
  submitText = "确定",
  cancelText = "取消",
  submitDisabled = false,
  maxWidth = "max-w-lg",
}: BaseDialogProps) {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    onSubmit?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth} aria-describedby={description ? "dialog-description" : undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          {description && <DialogDescription id="dialog-description">{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          {onSubmit && (
            <Button onClick={handleSubmit} disabled={submitDisabled}>
              {submitText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
