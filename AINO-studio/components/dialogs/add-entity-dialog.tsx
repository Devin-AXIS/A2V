"use client"

import type { TemplateOption, Mode } from "@/components/entity-creator"
import { AddAppDialog } from "./add-app-dialog"
import { AddDirectoryDialog } from "./add-directory-dialog"
import { AddModuleDialog } from "./add-module-dialog"

export function AddEntityDialog({
  open,
  onOpenChange,
  mode,
  title,
  nameLabel = "名称",
  namePlaceholder = "输入名称",
  showDesc = false,
  descLabel = "描述（可选）",
  descPlaceholder = "可填写用途简述",
  submitText = "创建",
  cancelText = "取消",
  templateLabel = "选择模板",
  options = [],
  defaultOptionKey,
  initialName = "",
  showIconUpload = false,
  iconLabel = "Module Icon",
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  mode: Mode
  title: string
  nameLabel?: string
  namePlaceholder?: string
  showDesc?: boolean
  descLabel?: string
  descPlaceholder?: string
  submitText?: string
  cancelText?: string
  templateLabel?: string
  options: TemplateOption[]
  defaultOptionKey?: string
  initialName?: string
  showIconUpload?: boolean
  iconLabel?: string
  onSubmit: (payload: { name: string; desc?: string; templateKey: string; icon?: string }) => void
}) {
  if (mode === "app") {
    return (
      <AddAppDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        nameLabel={nameLabel}
        namePlaceholder={namePlaceholder}
        showDesc={showDesc}
        descLabel={descLabel}
        descPlaceholder={descPlaceholder}
        submitText={submitText}
        cancelText={cancelText}
        templateLabel={templateLabel}
        options={options}
        defaultOptionKey={defaultOptionKey}
        initialName={initialName}
        onSubmit={onSubmit}
      />
    )
  }

  if (mode === "directory") {
    return (
      <AddDirectoryDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        nameLabel={nameLabel}
        namePlaceholder={namePlaceholder}
        showDesc={showDesc}
        descLabel={descLabel}
        descPlaceholder={descPlaceholder}
        submitText={submitText}
        cancelText={cancelText}
        templateLabel={templateLabel}
        options={options}
        defaultOptionKey={defaultOptionKey}
        initialName={initialName}
        onSubmit={onSubmit}
      />
    )
  }

  if (mode === "module") {
    return (
      <AddModuleDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        nameLabel={nameLabel}
        namePlaceholder={namePlaceholder}
        showDesc={showDesc}
        descLabel={descLabel}
        descPlaceholder={descPlaceholder}
        submitText={submitText}
        cancelText={cancelText}
        templateLabel={templateLabel}
        options={options}
        defaultOptionKey={defaultOptionKey}
        initialName={initialName}
        showIconUpload={showIconUpload}
        iconLabel={iconLabel}
        onSubmit={onSubmit}
      />
    )
  }

  return null
}

// Re-export types for convenience
export type { TemplateOption, Mode } from "@/components/entity-creator"
