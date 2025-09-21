"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EntityCreator, type TemplateOption } from "@/components/entity-creator"

interface AddAppDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
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
  onSubmit: (payload: { name: string; desc?: string; templateKey: string }) => void
}

export function AddAppDialog({
  open,
  onOpenChange,
  title,
  nameLabel = "名称",
  namePlaceholder = "输入应用名称",
  showDesc = false,
  descLabel = "描述（可选）",
  descPlaceholder = "可填写应用用途简述",
  submitText = "创建",
  cancelText = "取消",
  templateLabel = "选择模板",
  options = [],
  defaultOptionKey,
  initialName = "",
  onSubmit,
}: AddAppDialogProps) {
  const handleSubmit = (payload: { name: string; desc?: string; templateKey: string }) => {
    onSubmit(payload)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[720px] bg-white/70 backdrop-blur border-white/60"
        aria-describedby="add-app-description"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div id="add-app-description" className="sr-only">
          Create a new application by providing a name and selecting a template
        </div>

        <EntityCreator
          mode="app"
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
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
