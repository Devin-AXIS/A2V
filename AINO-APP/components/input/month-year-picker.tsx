"use client"

import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"
import { cn } from "@/lib/utils"

interface MonthYearPickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function MonthYearPicker({ value, onChange, placeholder = "选择年月", className }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(
    value ? Number.parseInt(value.split("-")[0]) : new Date().getFullYear(),
  )
  const [selectedMonth, setSelectedMonth] = useState<number>(
    value ? Number.parseInt(value.split("-")[1]) : new Date().getMonth() + 1,
  )

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleConfirm = () => {
    const formattedValue = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`
    onChange?.(formattedValue)
    setIsOpen(false)
  }

  const displayValue = value ? `${value.split("-")[0]}年${Number.parseInt(value.split("-")[1])}月` : ""

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <span className={cn("flex items-center gap-2", !displayValue && "text-muted-foreground")}>
          <Calendar className="w-4 h-4" />
          {displayValue || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      <BottomDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">开始时间</h3>
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
            >
              确定
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Year Column */}
            <div className="flex-1 border-r">
              <div className="h-full overflow-y-auto">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-base transition-colors",
                      selectedYear === year ? "bg-gray-100 text-black font-medium" : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Column */}
            <div className="flex-1">
              <div className="h-full overflow-y-auto">
                {months.map((month) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-base transition-colors",
                      selectedMonth === month ? "bg-gray-100 text-black font-medium" : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </BottomDrawer>
    </>
  )
}
