"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

export type TemplateOption = {
  key: string
  label: string
  desc?: string
  icon?: string
}

export type Mode = "app" | "module" | "directory"

interface EntityCreatorProps {
  mode: Mode
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
  onCancel: () => void
}

export function EntityCreator({
  mode,
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
  iconLabel,
  onSubmit,
  onCancel,
}: EntityCreatorProps) {
  const { locale } = useLocale()
  const defaultIconLabel = locale === "zh" ? "模块图标" : "Module Icon"
  const [name, setName] = useState(initialName || "")
  const [desc, setDesc] = useState("")
  const [tpl, setTpl] = useState<string>(defaultOptionKey || options[0]?.key || "")
  const [icon, setIcon] = useState<string>("")
  const [iconPreview, setIconPreview] = useState<string>("")

  useEffect(() => {
    setName(initialName || "")
    setDesc("")
    setTpl(defaultOptionKey || options[0]?.key || "")
    setIcon("")
    setIconPreview("")
  }, [defaultOptionKey, options, initialName])

  const canSubmit = !!name.trim() && !!tpl

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit({ name: name.trim(), desc: desc.trim(), templateKey: tpl, icon: icon || undefined })
    }
  }

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setIcon(result)
        setIconPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeIcon = () => {
    setIcon("")
    setIconPreview("")
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">{nameLabel}</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={namePlaceholder}
          autoFocus
          className="bg-white/80"
        />
      </div>

      {showDesc && (
        <div className="grid gap-1">
          <label className="text-sm text-slate-700">{descLabel}</label>
          <Textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={descPlaceholder}
            rows={3}
            className="bg-white/80"
          />
        </div>
      )}

      {showIconUpload && (
        <div className="grid gap-2">
                          <label className="text-sm text-slate-700">{iconLabel || defaultIconLabel}</label>
          <div className="flex items-center gap-3">
            {iconPreview ? (
              <div className="relative">
                <img 
                  src={iconPreview} 
                  alt={locale === "zh" ? "模块图标" : "Module Icon"} 
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeIcon}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <ImageIcon className="size-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="hidden"
                id="icon-upload"
              />
              <label
                htmlFor="icon-upload"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer transition"
              >
                <Upload className="size-4" />
                {iconPreview 
                  ? (locale === "zh" ? "更换图标" : "Change Icon")
                  : (locale === "zh" ? "上传图标" : "Upload Icon")
                }
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {locale === "zh" 
                  ? "支持 PNG、JPG、SVG 格式，建议尺寸 64x64"
                  : "Supports PNG, JPG, SVG formats, recommended size 64x64"
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <div className="text-sm text-slate-700">{templateLabel}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setTpl(o.key)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left bg-white/70 hover:bg-white/90 transition",
                tpl === o.key ? "outline outline-2 outline-blue-200 border-blue-200" : "border-white/60",
              )}
            >
              <div className="flex items-center gap-2">
                {o.icon && (
                  <img 
                    src={o.icon} 
                    alt={o.label} 
                    className="w-5 h-5 rounded object-cover"
                  />
                )}
                <div className="font-medium">{o.label}</div>
              </div>
              {o.desc && <div className="text-xs text-muted-foreground mt-1">{o.desc}</div>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button disabled={!canSubmit} onClick={handleSubmit}>
          {submitText}
        </Button>
      </div>
    </div>
  )
}
