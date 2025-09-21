"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type React from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { getOptimalTextColor } from "@/lib/contrast-utils"

interface SegmentedControlOption {
  id: string
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

// 移除自定义对比度函数，使用统一的智能对比度工具

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  // 根据value找到对应的索引
  const activeIndex = options.findIndex(option => option.id === value)
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#000000"
  const textColorForPrimary = useMemo(() => getOptimalTextColor(primaryColor, 'primary'), [primaryColor])
  const textColorForInactive = useMemo(() => getOptimalTextColor('#e5e7eb', 'secondary'), [])

  // 处理点击事件
  const handleClick = (optionId: string) => {
    onChange(optionId)
  }

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={cn("flex items-center space-x-1 p-1.5 bg-gray-200/80 rounded-full shadow-lg", className)}
    >
      {options.map((option, index) => (
        <button
          key={option.id}
          onClick={() => handleClick(option.id)}
          className={cn(
            "relative flex items-center justify-center px-4 py-2 rounded-full transition-colors duration-300 focus:outline-none",
            activeIndex === index ? "" : "hover:bg-black/5",
          )}
          style={
            activeIndex === index
              ? {
                  color: textColorForPrimary,
                }
              : {
                  color: textColorForInactive,
                }
          }
        >
          {activeIndex === index && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: primaryColor }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            />
          )}
          <div className="relative z-10 flex items-center space-x-2">
            {option.icon && option.icon}
            <AnimatePresence>
              {activeIndex === index && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto", transition: { delay: 0.1 } }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-semibold overflow-hidden whitespace-nowrap"
                >
                  {option.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </button>
      ))}
    </motion.div>
  )
}
