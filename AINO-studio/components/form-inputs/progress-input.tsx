"use client"

import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProgressInputProps {
  value?: number
  onChange: (value: number) => void
  maxValue?: number
  showProgressBar?: boolean
  showPercentage?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ProgressInput({
  value = 0,
  onChange,
  maxValue = 100,
  showProgressBar = true,
  showPercentage = true,
  placeholder,
  className,
  disabled = false,
}: ProgressInputProps) {
  const percentage = Math.round((value / maxValue) * 100)
  const displayValue = Math.min(Math.max(value, 0), maxValue)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === "") {
      onChange(0)
      return
    }
    
    const numValue = Number(inputValue)
    if (!isNaN(numValue)) {
      // 限制在有效范围内
      const clampedValue = Math.min(Math.max(numValue, 0), maxValue)
      onChange(clampedValue)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* 数字输入框 */}
      <Input
        type="number"
        min={0}
        max={maxValue}
        value={value === 0 ? "" : value}
        onChange={handleInputChange}
        placeholder={placeholder || `0-${maxValue}`}
        className="bg-white"
        disabled={disabled}
      />
      
      {/* 进度条和百分比显示 */}
      {showProgressBar && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Progress 
              value={percentage} 
              className="h-2"
            />
          </div>
          {showPercentage && (
            <span className="text-xs text-gray-600 w-12 text-right">
              {percentage}%
            </span>
          )}
        </div>
      )}
      
      {/* 数值显示 */}
      <div className="text-xs text-gray-500">
        {showPercentage ? `${displayValue}/${maxValue}` : `${percentage}%`}
      </div>
    </div>
  )
}

