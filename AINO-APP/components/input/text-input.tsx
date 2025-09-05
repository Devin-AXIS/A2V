"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  id: string
}

export function TextInput({ label, id, className, ...props }: TextInputProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"

  return (
    <div className="w-full max-w-sm">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <div
        className={cn(
          "group bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 transition-all duration-300",
          "focus-within:ring-2 focus-within:shadow-lg",
        )}
        style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
      >
        <input
          id={id}
          className={cn(
            "w-full px-3.5 py-2.5 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  )
}
