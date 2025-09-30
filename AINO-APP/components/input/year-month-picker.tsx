"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfYear, getYear, setYear, setMonth, isSameMonth } from "date-fns"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"

interface YearMonthPickerProps {
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

export function YearMonthPicker({ placeholder, value, onChange }: YearMonthPickerProps) {
    const { palette } = useChartTheme()
    const primaryColor = palette[0] || "#3b82f6"
    const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

    const [isOpen, setIsOpen] = useState(false)
    const [currentYear, setCurrentYear] = useState(() => {
        if (value) {
            try {
                const [year] = value.split('-')
                return Number.parseInt(year, 10)
            } catch {
                return new Date().getFullYear()
            }
        }
        return new Date().getFullYear()
    })

    // Parse the value to get selected year and month
    const selectedDate = useMemo(() => {
        if (!value) return null
        try {
            const [year, month] = value.split('-')
            return new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1)
        } catch {
            return null
        }
    }, [value])

    const months = [
        "一月", "二月", "三月", "四月", "五月", "六月",
        "七月", "八月", "九月", "十月", "十一月", "十二月"
    ]

    const handleMonthSelect = (monthIndex: number) => {
        const yearMonthString = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`
        onChange?.(yearMonthString)
        setIsOpen(false)
    }

    const handleYearChange = (delta: number) => {
        setCurrentYear(prev => prev + delta)
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
                    {selectedDate ? format(selectedDate, "yyyy年MM月") : placeholder}
                </span>
                <CalendarIcon className="w-4 h-4 text-gray-400" />
            </button>

            <BottomDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="选择年月">
                <div className="p-3">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => handleYearChange(-1)} className="p-1.5 rounded-full hover:bg-gray-500/10">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-gray-800 text-lg">{currentYear}年</span>
                        <button onClick={() => handleYearChange(1)} className="p-1.5 rounded-full hover:bg-gray-500/10">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {months.map((month, index) => {
                            const monthDate = new Date(currentYear, index)
                            const isSelected = selectedDate && isSameMonth(monthDate, selectedDate)

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleMonthSelect(index)}
                                    className={cn(
                                        "p-3 rounded-lg transition-colors text-sm font-medium",
                                        "hover:bg-gray-500/10",
                                        !isSelected && "text-gray-700",
                                    )}
                                    style={
                                        isSelected
                                            ? { backgroundColor: primaryColor, color: textColorForPrimary }
                                            : {}
                                    }
                                >
                                    {month}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </BottomDrawer>
        </div>
    )
}
