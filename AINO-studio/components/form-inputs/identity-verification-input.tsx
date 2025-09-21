"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface IdentityVerificationData {
  name?: string
  idNumber?: string
  frontPhoto?: string
  backPhoto?: string
}

interface IdentityVerificationInputProps {
  value?: IdentityVerificationData
  onChange?: (value: IdentityVerificationData) => void
  config?: {
    requireName?: boolean
    requireIdNumber?: boolean
    requireFrontPhoto?: boolean
    requireBackPhoto?: boolean
  }
  disabled?: boolean
}

export function IdentityVerificationInput({
  value = {},
  onChange,
  config = {
    requireName: true,
    requireIdNumber: true,
    requireFrontPhoto: true,
    requireBackPhoto: true,
  },
  disabled = false,
}: IdentityVerificationInputProps) {
  const { locale } = useLocale()
  const [data, setData] = useState<IdentityVerificationData>(value)

  const updateData = (key: keyof IdentityVerificationData, val: string) => {
    const newData = { ...data, [key]: val }
    setData(newData)
    onChange?.(newData)
  }

  const handlePhotoUpload = (type: "frontPhoto" | "backPhoto") => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          updateData(type, result)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const removePhoto = (type: "frontPhoto" | "backPhoto") => {
    updateData(type, "")
  }

  return (
    <div className="space-y-4">
      {/* 姓名 */}
      {config.requireName && (
        <div>
          <Label className="text-sm font-medium">
            {locale === "zh" ? "姓名" : "Name"}
            {config.requireName && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            value={data.name || ""}
            onChange={(e) => updateData("name", e.target.value)}
            placeholder={locale === "zh" ? "请输入真实姓名" : "Enter your real name"}
            disabled={disabled}
            className="mt-1"
          />
        </div>
      )}

      {/* 身份证号 */}
      {config.requireIdNumber && (
        <div>
          <Label className="text-sm font-medium">
            {locale === "zh" ? "身份证号" : "ID Number"}
            {config.requireIdNumber && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            value={data.idNumber || ""}
            onChange={(e) => updateData("idNumber", e.target.value)}
            placeholder={locale === "zh" ? "请输入18位身份证号" : "Enter 18-digit ID number"}
            disabled={disabled}
            className="mt-1"
            maxLength={18}
          />
        </div>
      )}

      {/* 身份证照片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 正面照片 */}
        {config.requireFrontPhoto && (
          <div>
            <Label className="text-sm font-medium">
              {locale === "zh" ? "身份证正面照片" : "ID Card Front Photo"}
              {config.requireFrontPhoto && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Card className="mt-1">
              <CardContent className="p-4">
                {data.frontPhoto ? (
                  <div className="relative">
                    <img
                      src={data.frontPhoto}
                      alt={locale === "zh" ? "身份证正面" : "ID Card Front"}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removePhoto("frontPhoto")}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded">
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePhotoUpload("frontPhoto")}
                      disabled={disabled}
                      className="gap-1"
                    >
                      <Upload className="h-4 w-4" />
                      {locale === "zh" ? "上传正面照片" : "Upload Front Photo"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 反面照片 */}
        {config.requireBackPhoto && (
          <div>
            <Label className="text-sm font-medium">
              {locale === "zh" ? "身份证反面照片" : "ID Card Back Photo"}
              {config.requireBackPhoto && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Card className="mt-1">
              <CardContent className="p-4">
                {data.backPhoto ? (
                  <div className="relative">
                    <img
                      src={data.backPhoto}
                      alt={locale === "zh" ? "身份证反面" : "ID Card Back"}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removePhoto("backPhoto")}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded">
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePhotoUpload("backPhoto")}
                      disabled={disabled}
                      className="gap-1"
                    >
                      <Upload className="h-4 w-4" />
                      {locale === "zh" ? "上传反面照片" : "Upload Back Photo"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <div className="font-medium mb-1">
          {locale === "zh" ? "注意事项：" : "Important Notes:"}
        </div>
        <ul className="space-y-1">
          <li>• {locale === "zh" ? "请确保身份证照片清晰可见" : "Ensure ID card photos are clear and visible"}</li>
          <li>• {locale === "zh" ? "照片信息将被安全存储" : "Photo information will be stored securely"}</li>
          <li>• {locale === "zh" ? "仅用于身份验证目的" : "For identity verification purposes only"}</li>
        </ul>
      </div>
    </div>
  )
}