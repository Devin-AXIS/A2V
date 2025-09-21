"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function TimeInput({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [timeValue, setTimeValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // 初始化时间值
  useEffect(() => {
    if (value) {
      // 如果value是字符串，直接使用
      if (typeof value === "string") {
        setTimeValue(value)
      } else if (typeof value === "number") {
        // 如果是数字（时间戳），转换为HH:MM格式
        const date = new Date(value)
        const hours = date.getHours().toString().padStart(2, "0")
        const minutes = date.getMinutes().toString().padStart(2, "0")
        setTimeValue(`${hours}:${minutes}`)
      }
    } else {
      setTimeValue("")
    }
  }, [value])

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    onChange(newTime)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setTimeValue(inputValue)
    
    // 验证时间格式 (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (timeRegex.test(inputValue) || inputValue === "") {
      onChange(inputValue)
    }
  }

  const handlePresetTime = (hours: number, minutes: number = 0) => {
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    handleTimeChange(timeString)
    setIsOpen(false)
  }

  const formatDisplayValue = (time: string) => {
    if (!time) return "选择时间..."
    
    // 尝试解析时间并格式化显示
    const [hours, minutes] = time.split(":")
    if (hours && minutes) {
      const hour = parseInt(hours)
      const minute = parseInt(minutes)
      const period = hour >= 12 ? "PM" : "AM"
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour}:${minutes} ${period}`
    }
    
    return time
  }

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal bg-white"
          >
            <Clock className="mr-2 h-4 w-4" />
            {formatDisplayValue(timeValue)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            {/* 时间输入框 */}
            <div>
              <label className="text-sm font-medium mb-2 block">选择时间</label>
              <Input
                type="time"
                value={timeValue}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            
            {/* 快速选择 */}
            <div>
              <label className="text-sm font-medium mb-2 block">快速选择</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "9:00", hours: 9 },
                  { label: "12:00", hours: 12 },
                  { label: "14:00", hours: 14 },
                  { label: "18:00", hours: 18 },
                  { label: "20:00", hours: 20 },
                  { label: "22:00", hours: 22 },
                ].map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetTime(preset.hours)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleTimeChange("")
                  setIsOpen(false)
                }}
              >
                清除
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                确定
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
