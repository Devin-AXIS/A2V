"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/hooks/use-locale"

interface CertificateSelectProps {
  value?: string
  onChange?: (value: string) => void
  certificateNames?: string[]
  allowCustom?: boolean
  placeholder?: string
  disabled?: boolean
}

export function CertificateSelect({
  value = "",
  onChange,
  certificateNames = [],
  allowCustom = false,
  placeholder,
  disabled = false,
}: CertificateSelectProps) {
  const { locale } = useLocale()
  const [isCustom, setIsCustom] = useState(() => {
    // 如果当前值不在预设选项中，则认为是自定义
    return allowCustom && value && !certificateNames.includes(value)
  })

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "__custom__") {
      setIsCustom(true)
      onChange?.("")
    } else {
      setIsCustom(false)
      onChange?.(selectedValue)
    }
  }

  const handleCustomInputChange = (customValue: string) => {
    onChange?.(customValue)
  }

  // 如果允许自定义且当前是自定义状态，显示输入框
  if (allowCustom && isCustom) {
    return (
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          placeholder={placeholder || (locale === "zh" ? "请输入证书名称" : "Enter certificate name")}
          disabled={disabled}
          className="bg-white"
        />
        {certificateNames.length > 0 && (
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setIsCustom(false)}
          >
            {locale === "zh" ? "从预设选项中选择" : "Choose from preset options"}
          </button>
        )}
      </div>
    )
  }

  // 显示下拉选择
  return (
    <Select 
      value={value || ""} 
      onValueChange={handleSelectChange}
      disabled={disabled}
    >
      <SelectTrigger className="bg-white">
        <SelectValue placeholder={placeholder || (locale === "zh" ? "请选择证书" : "Select certificate")} />
      </SelectTrigger>
      <SelectContent>
        {certificateNames.map((name, index) => (
          <SelectItem key={index} value={name}>
            {name}
          </SelectItem>
        ))}
        {allowCustom && (
          <SelectItem value="__custom__">
            {locale === "zh" ? "自定义..." : "Custom..."}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
