"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, User } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"
import { api } from "@/lib/api"

interface AvatarInputProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  multiple?: boolean
  defaultImage?: string
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export function AvatarInput({
  value = "",
  onChange,
  multiple = false,
  defaultImage = "",
  disabled = false,
  size = "md",
}: AvatarInputProps) {
  const { locale } = useLocale()

  // 处理值的统一格式
  const images = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (Array.isArray(value) ? (value[0] || "") : value || "")

  const hasImages = multiple ? (images as string[]).length > 0 : Boolean(images)
  const canUploadMore = multiple || !hasImages
  const showDefaultImage = !hasImages && defaultImage
  const displayImages = showDefaultImage
    ? [defaultImage]
    : (multiple ? images as string[] : [images as string])

  // Size classes
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  }

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  const [uploading, setUploading] = useState(false)

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = multiple
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        setUploading(true)
        try {
          const uploadOne = async (file: File) => {
            const form = new FormData()
            form.append("file", file)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://47.94.52.142::3001'}/api/upload`, {
              method: "POST",
              headers: {
                // 让浏览器自动设置 multipart 边界
              },
              body: form,
            })
            const data = await res.json()
            if (!res.ok || !data?.success || !data?.url) {
              throw new Error(data?.message || "上传失败")
            }
            return data.url as string
          }

          const urls = [] as string[]
          for (const file of Array.from(files)) {
            const url = await uploadOne(file)
            urls.push(url)
          }

          if (multiple) {
            const currentImages = (images as string[]) || []
            onChange?.([...currentImages, ...urls])
          } else {
            onChange?.(urls[0])
          }
        } catch (err) {
          console.error("头像上传失败", err)
          // 可以在此处集成全局 toast
        } finally {
          setUploading(false)
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

  return (
    <div className="space-y-3">
      {/* Avatar Display */}
      {(hasImages || showDefaultImage) && (
        <div className={`grid gap-3 ${multiple ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 max-w-xs"}`}>
          {displayImages.filter(Boolean).map((image, index) => (
            <div key={index} className="relative">
              <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200`}>
                <img
                  src={image}
                  alt={locale === "zh" ? "标识" : "Profile"}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 只有非默认图片才显示删除按钮 */}
              {!showDefaultImage && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {/* 默认图片标识 */}
              {showDefaultImage && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {locale === "zh" ? "默认" : "Default"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button - 单图模式下有图片时不显示，多图模式下始终显示 */}
      {canUploadMore && (
        <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded">
          <User className="h-8 w-8 text-gray-400 mb-2" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImageUpload}
            disabled={disabled || uploading}
            className="gap-1"
          >
            <Upload className="h-4 w-4" />
            {uploading
              ? (locale === "zh" ? "正在上传..." : "Uploading...")
              : (locale === "zh"
                ? `上传标识${multiple && hasImages ? "（追加）" : ""}`
                : `Upload Profile${multiple && hasImages ? " (Add)" : ""}`)
            }
          </Button>
        </div>
      )}

      {/* Hint text */}
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
