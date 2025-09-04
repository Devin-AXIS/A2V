"use client"
import { useState } from "react"
import type { DateRange } from "date-fns"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import type { FieldModel } from "@/lib/store"

export function ModernDateInput({
  field,
  value,
  onChange,
}: { field: FieldModel; value: any; onChange: (v: any) => void }) {
  const [open, setOpen] = useState(false)
  const mode = field.dateMode || "single"

  if (mode === "range") {
    const date: DateRange | undefined =
      Array.isArray(value) && (value[0] || value[1])
        ? {
            from: value[0] ? new Date(value[0]) : undefined,
            to: value[1] ? new Date(value[1]) : undefined,
          }
        : undefined

    return (
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-white",
                !date?.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "yyyy-MM-dd")} - {format(date.to, "yyyy-MM-dd")}
                  </>
                ) : (
                  format(date.from, "yyyy-MM-dd")
                )
              ) : (
                <span>选择日期范围</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="text-sm font-medium mb-2">选择日期范围</div>
              <div className="text-xs text-gray-500">
                先选择开始日期，再选择结束日期
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(range) => {
                if (range) {
                  onChange([
                    range.from ? range.from.toISOString().split("T")[0] : null,
                    range.to ? range.to.toISOString().split("T")[0] : null,
                  ])
                } else {
                  onChange([null, null])
                }
                if (range?.from && range?.to) {
                  setOpen(false)
                }
              }}
              numberOfMonths={2}
            />
            <div className="p-3 border-t flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange([null, null])
                  setOpen(false)
                }}
              >
                清除
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                disabled={!date?.from}
              >
                确定
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* 显示日期范围信息 */}
        {date?.from && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">开始:</span>
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                {format(date.from, "yyyy-MM-dd")}
              </span>
            </div>
            {date.to && (
              <>
                <span>→</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">结束:</span>
                  <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                    {format(date.to, "yyyy-MM-dd")}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ({Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))} 天)
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  if (mode === "multiple") {
    const dates: Date[] = Array.isArray(value) ? value.filter(Boolean).map((d) => new Date(d)) : []

    return (
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-white",
                !dates.length && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dates.length > 0 ? <span>{dates.length} 个日期已选择</span> : <span>选择多个日期</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="text-sm font-medium mb-2">选择多个日期</div>
              <div className="text-xs text-gray-500">
                点击日期进行选择/取消选择，支持连续选择
              </div>
            </div>
            <Calendar
              mode="multiple"
              selected={dates}
              onSelect={(selectedDates) => {
                if (selectedDates) {
                  onChange(selectedDates.map((date) => date.toISOString().split("T")[0]))
                } else {
                  onChange([])
                }
              }}
            />
            <div className="p-3 border-t flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange([])
                  setOpen(false)
                }}
              >
                清除所有
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
              >
                确定
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* 显示已选择的日期 */}
        {dates.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dates.map((date, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
              >
                <span>{format(date, "MM-dd")}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newDates = dates.filter((_, i) => i !== index)
                    onChange(newDates.map((d) => d.toISOString().split("T")[0]))
                  }}
                  className="hover:bg-blue-100 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const date = typeof value === "string" && value ? new Date(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal bg-white", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy-MM-dd") : <span>选择日期</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              onChange(selectedDate.toISOString().split("T")[0])
            } else {
              onChange(null)
            }
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
