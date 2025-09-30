"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface ImageInputProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  multiple?: boolean
  defaultImage?: string
  disabled?: boolean
}

export function ImageInput({
  value = "",
  onChange,
  multiple = false,
  defaultImage = "",
  disabled = false,
}: ImageInputProps) {
  const { locale } = useLocale()

  // 处理值的统一格式
  const images = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (Array.isArray(value) ? (value[0] || "") : value || "")

  const hasImages = multiple ? (images as string[]).length > 0 : Boolean(images)
  const canUploadMore = multiple || !hasImages

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = multiple
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const uploadOne = async (file: File) => {
          const form = new FormData()
          form.append("file", file)
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/upload`, {
            method: "POST",
            body: form,
          })
          const data = await res.json()
          if (!res.ok || !data?.success || !data?.url) {
            throw new Error(data?.message || "上传失败")
          }
          return data.url as string
        }

        try {
          const urls = [] as string[]
          for (const file of Array.from(files)) {
            const url = await uploadOne(file)
            urls.push(url)
          }

          if (multiple) {
            // 多图模式：追加到现有图片
            const currentImages = (images as string[]) || []
            onChange?.([...currentImages, ...urls])
          } else {
            // 单图模式：替换现有图片
            onChange?.(urls[0])
          }
        } catch (err) {
          console.error("图片上传失败", err)
          // 可以在此处集成全局 toast
        }
      }
    }
    input.click()
  }

  const removeImage = (imageIndex: number) => {
    if (multiple) {
      const currentImages = images as string[]
      const newImages = currentImages.filter((_, index) => index !== imageIndex)
      onChange?.(newImages)
    } else {
      onChange?.("")
    }
  }

  // 如果没有图片且有默认图片，显示默认图片
  const showDefaultImage = !hasImages && defaultImage
  const displayImages = showDefaultImage
    ? [defaultImage]
    : (multiple ? images as string[] : [images as string])

  return (
    <div className="space-y-2">
      {/* 已上传的图片或默认图片 */}
      {(hasImages || showDefaultImage) && (
        <div className={`grid gap-3 ${multiple ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 max-w-xs"}`}>
          {displayImages.filter(Boolean).map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`${locale === "zh" ? "图片" : "Image"} ${index + 1}`}
                className="w-full h-24 object-cover rounded border"
              />
              {/* 只有非默认图片才显示删除按钮 */}
              {!showDefaultImage && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {/* 默认图片标识 */}
              {showDefaultImage && (
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                  {locale === "zh" ? "默认" : "Default"}
                </div>
              )}
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
            onClick={handleImageUpload}
            disabled={disabled}
            className="gap-1"
          >
            <Upload className="h-4 w-4" />
            {locale === "zh"
              ? `上传图片${multiple && hasImages ? "（追加）" : ""}`
              : `Upload Image${multiple && hasImages ? " (Add)" : ""}`
            }
          </Button>
        </div>
      )}

      {/* 提示信息 */}
      {multiple && (
        <div className="text-xs text-gray-500">
          {locale === "zh"
            ? "支持选择多个图片文件进行批量上传"
            : "Select multiple image files for batch upload"
          }
        </div>
      )}
    </div>
  )
}