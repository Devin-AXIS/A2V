"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, getDay, setDate, isSameDay, isAfter, isBefore, isWithinInterval } from "date-fns"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"

interface DateRangePickerProps {
    placeholder: string
    value?: { start: Date | null; end: Date | null }
    onChange?: (value: { start: Date | null; end: Date | null }) => void
}

function getContrastColor(hexColor: string): string {
    if (!hexColor.startsWith("#")) return "#000000"
    const r = Number.parseInt(hexColor.slice(1, 3), 16)
    const g = Number.parseInt(hexColor.slice(3, 5), 16)
    const b = Number.parseInt(hexColor.slice(5, 7), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 128 ? "#000000" : "#ffffff"
}

export function DateRangePicker({ placeholder, value, onChange }: DateRangePickerProps) {
    const { palette } = useChartTheme()
    const primaryColor = palette[0] || "#3b82f6"
    const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedStart, setSelectedStart] = useState<Date | null>(value?.start || null)
    const [selectedEnd, setSelectedEnd] = useState<Date | null>(value?.end || null)
    const [isSelectingEnd, setIsSelectingEnd] = useState(false)

    const daysInMonth = useMemo(() => {
        const monthStart = startOfMonth(currentMonth)
        const days = getDaysInMonth(currentMonth)
        const firstDayOfWeek = getDay(monthStart)
        return { monthStart, days, firstDayOfWeek }
    }, [currentMonth])

    const handleDateSelect = (day: number) => {
        const newDate = setDate(currentMonth, day)

        if (!selectedStart || (selectedStart && selectedEnd)) {
            // Start new selection
            setSelectedStart(newDate)
            setSelectedEnd(null)
            setIsSelectingEnd(true)
        } else if (selectedStart && !selectedEnd) {
            // Complete the selection
            if (isAfter(newDate, selectedStart)) {
                setSelectedEnd(newDate)
                setIsSelectingEnd(false)
                onChange?.({ start: selectedStart, end: newDate })
                setIsOpen(false)
            } else {
                // If selected date is before start, make it the new start
                setSelectedStart(newDate)
                setSelectedEnd(null)
            }
        }
    }

    const isDateInRange = (day: number) => {
        if (!selectedStart) return false
        const dayDate = setDate(currentMonth, day)

        if (selectedStart && selectedEnd) {
            return isWithinInterval(dayDate, { start: selectedStart, end: selectedEnd })
        }

        if (selectedStart && !selectedEnd && isSelectingEnd) {
            return isSameDay(dayDate, selectedStart)
        }

        return false
    }

    const isDateSelected = (day: number) => {
        const dayDate = setDate(currentMonth, day)
        return (selectedStart && isSameDay(dayDate, selectedStart)) ||
            (selectedEnd && isSameDay(dayDate, selectedEnd))
    }

    const calendarDays = () => {
        const blanks = Array(daysInMonth.firstDayOfWeek).fill(null)
        const days = Array.from({ length: daysInMonth.days }, (_, i) => i + 1)
        return [...blanks, ...days]
    }

    const getDisplayText = () => {
        if (selectedStart && selectedEnd) {
            return `${format(selectedStart, "MM/dd")} - ${format(selectedEnd, "MM/dd")}`
        } else if (selectedStart) {
            return `${format(selectedStart, "MM/dd")} - 选择结束日期`
        }
        return placeholder
    }

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 transition-all duration-300 text-sm",
                    isOpen && "ring-2 shadow-lg",
                )}
                style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
            >
                <span className={selectedStart ? "text-gray-900" : "text-gray-400"}>
                    {getDisplayText()}
                </span>
                <CalendarIcon className="w-4 h-4 text-gray-400" />
            </button>

            <BottomDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="选择日期区间">
                <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-full hover:bg-gray-500/10">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-gray-800 text-sm">{format(currentMonth, "MMMM yyyy")}</span>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-full hover:bg-gray-500/10">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <div key={day} className="font-medium text-gray-500">
                                {day}
                            </div>
                        ))}
                        {calendarDays().map((day, index) => (
                            <div key={index} className="py-0.5">
                                {day && (
                                    <button
                                        onClick={() => handleDateSelect(day)}
                                        className={cn(
                                            "w-8 h-8 rounded-full transition-colors relative",
                                            "hover:bg-gray-500/10",
                                            !isDateSelected(day) && !isDateInRange(day) && "text-gray-700",
                                        )}
                                        style={
                                            isDateSelected(day)
                                                ? { backgroundColor: primaryColor, color: textColorForPrimary }
                                                : isDateInRange(day)
                                                    ? { backgroundColor: `${primaryColor}20`, color: primaryColor }
                                                    : {}
                                        }
                                    >
                                        {day}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {selectedStart && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                                {selectedEnd
                                    ? `已选择: ${format(selectedStart, "yyyy-MM-dd")} 至 ${format(selectedEnd, "yyyy-MM-dd")}`
                                    : `开始日期: ${format(selectedStart, "yyyy-MM-dd")}，请选择结束日期`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </BottomDrawer>
        </div>
    )
}
