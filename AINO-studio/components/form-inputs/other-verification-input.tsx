"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface OtherVerificationData {
  [key: string]: string | string[] // 文字字段为string，图片字段为string[]
}

interface OtherVerificationInputProps {
  value?: OtherVerificationData
  onChange?: (value: OtherVerificationData) => void
  config?: {
    textFields?: { id: string; name: string; required: boolean }[]
    imageFields?: { id: string; name: string; required: boolean; multiple: boolean }[]
  }
  disabled?: boolean
}

export function OtherVerificationInput({
  value = {},
  onChange,
  config = {
    textFields: [],
    imageFields: [],
  },
  disabled = false,
}: OtherVerificationInputProps) {
  const { locale } = useLocale()
  const [data, setData] = useState<OtherVerificationData>(value)

  const updateData = (key: string, val: string | string[]) => {
    const newData = { ...data, [key]: val }
    setData(newData)
    onChange?.(newData)
  }

  const handleImageUpload = (fieldId: string, multiple: boolean) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = multiple
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const newImages: string[] = []
        
        Array.from(files).forEach((file) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            newImages.push(result)
            
            // 当所有图片都读取完成时更新数据
            if (newImages.length === files.length) {
              if (multiple) {
                // 多图模式：追加到现有图片
                const currentImages = (data[fieldId] as string[]) || []
                updateData(fieldId, [...currentImages, ...newImages])
              } else {
                // 单图模式：替换现有图片
                updateData(fieldId, newImages)
              }
            }
          }
          reader.readAsDataURL(file)
        })
      }
    }
    input.click()
  }

  const removeImage = (fieldId: string, imageIndex: number) => {
    const currentImages = (data[fieldId] as string[]) || []
    const newImages = currentImages.filter((_, index) => index !== imageIndex)
    updateData(fieldId, newImages)
  }

  return (
    <div className="space-y-6">
      {/* 文字字段 */}
      {config.textFields && config.textFields.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">{locale === "zh" ? "文字信息" : "Text Information"}</h3>
          {config.textFields.map((field) => (
            <div key={field.id}>
              <Label className="text-sm font-medium">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                value={(data[field.id] as string) || ""}
                onChange={(e) => updateData(field.id, e.target.value)}
                placeholder={locale === "zh" ? `请输入${field.name}` : `Enter ${field.name}`}
                disabled={disabled}
                className="mt-1"
              />
            </div>
          ))}
        </div>
      )}

      {/* 图片字段 */}
      {config.imageFields && config.imageFields.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">{locale === "zh" ? "图片信息" : "Image Information"}</h3>
          {config.imageFields.map((field) => {
            const images = (data[field.id] as string[]) || []
            const isMultiple = field.multiple
            const hasImages = images.length > 0
            const canUploadMore = isMultiple || !hasImages
            
            return (
              <div key={field.id} className="space-y-2">
                <Label className="text-sm font-medium">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  <span className="text-xs text-gray-500 ml-2">
                    ({isMultiple ? (locale === "zh" ? "多图" : "Multiple") : (locale === "zh" ? "单图" : "Single")})
                  </span>
                </Label>
                
                {/* 已上传的图片 */}
                {hasImages && (
                  <div className={`grid gap-3 ${isMultiple ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 max-w-xs"}`}>
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`${field.name} ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(field.id, index)}
                          disabled={disabled}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 上传按钮 - 单图模式下有图片时不显示，多图模式下始终显示 */}
                {canUploadMore && (
                  <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded">
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageUpload(field.id, isMultiple)}
                      disabled={disabled}
                      className="gap-1"
                    >
                      <Upload className="h-4 w-4" />
                      {locale === "zh" 
                        ? `上传${field.name}${isMultiple && hasImages ? "（追加）" : ""}`
                        : `Upload ${field.name}${isMultiple && hasImages ? " (Add)" : ""}`
                      }
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <div className="font-medium mb-1">
          {locale === "zh" ? "注意事项：" : "Important Notes:"}
        </div>
        <ul className="space-y-1">
          <li>• {locale === "zh" ? "请确保所有必填字段都已填写" : "Please ensure all required fields are filled"}</li>
          <li>• {locale === "zh" ? "图片信息将被安全存储" : "Image information will be stored securely"}</li>
          <li>• {locale === "zh" ? "支持多张图片上传" : "Multiple image uploads are supported"}</li>
        </ul>
      </div>
    </div>
  )
}