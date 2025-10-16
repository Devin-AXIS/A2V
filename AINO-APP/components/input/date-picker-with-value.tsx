"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, getDay, setDate, isSameDay, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"

interface DatePickerWithValueProps {
    placeholder: string
    value?: string
    onChange?: (value: string) => void
}

function getContrastColor(hexColor: string): string {
    if (!hexColor.startsWith("#")) return "#000000"
    const r = Number.parseInt(hexColor.slice(1, 3), 16)
    const g = Number.parseInt(hexColor.slice(3, 5), 16)
    const b = Number.parseInt(hexColor.slice(5, 7), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 128 ? "#000000" : "#ffffff"
}

export function DatePickerWithValue({ placeholder, value, onChange }: DatePickerWithValueProps) {
    const { palette } = useChartTheme()
    const primaryColor = palette[0] || "#000000"
    const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(() => {
        // Initialize current month based on value or current date
        if (value) {
            try {
                return parseISO(value)
            } catch {
                return new Date()
            }
        }
        return new Date()
    })

    // Parse the value to get selected date
    const selectedDate = useMemo(() => {
        if (!value) return null
        try {
            return parseISO(value)
        } catch {
            return null
        }
    }, [value])

    const daysInMonth = useMemo(() => {
        const monthStart = startOfMonth(currentMonth)
        const days = getDaysInMonth(currentMonth)
        const firstDayOfWeek = getDay(monthStart)
        return { monthStart, days, firstDayOfWeek }
    }, [currentMonth])

    const handleDateSelect = (day: number) => {
        const newDate = setDate(currentMonth, day)
        const dateString = format(newDate, "yyyy-MM-dd")
        onChange?.(dateString)
        setIsOpen(false)
    }

    const calendarDays = () => {
        const blanks = Array(daysInMonth.firstDayOfWeek).fill(null)
        const days = Array.from({ length: daysInMonth.days }, (_, i) => i + 1)
        return [...blanks, ...days]
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
                <span className={selectedDate ? "text-gray-900" : "text-gray-400"}>
                    {selectedDate ? format(selectedDate, "yyyy-MM-dd") : placeholder}
                </span>
                <CalendarIcon className="w-4 h-4 text-gray-400" />
            </button>

            <BottomDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="选择日期">
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
                                            "w-8 h-8 rounded-full transition-colors",
                                            "hover:bg-gray-500/10",
                                            !(selectedDate && isSameDay(setDate(currentMonth, day), selectedDate)) && "text-gray-700",
                                        )}
                                        style={
                                            selectedDate && isSameDay(setDate(currentMonth, day), selectedDate)
                                                ? { backgroundColor: primaryColor, color: textColorForPrimary }
                                                : {}
                                        }
                                    >
                                        {day}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </BottomDrawer>
        </div>
    )
}
