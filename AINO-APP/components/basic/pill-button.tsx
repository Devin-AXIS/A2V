"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type React from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"
import { getOptimalTextColor } from "@/lib/contrast-utils"

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary"
}

export function PillButton({ className, variant = "default", ...props }: PillButtonProps) {
  const { palette } = useChartTheme()
  const { isFrosted } = useFrostedEffect()
  const primaryColor = palette[0] || "hsl(var(--primary))"
  const textColorForPrimary = useMemo(() => getOptimalTextColor(primaryColor, 'primary'), [primaryColor])

  const baseStyles =
    "px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const frostedBaseStyles = isFrosted ? "backdrop-blur-sm border border-white/40 shadow-lg" : "shadow-md"

  if (variant === "primary") {
    return (
      <button
        className={cn(baseStyles, frostedBaseStyles, "focus:ring-2", className)}
        style={
          {
            backgroundColor: isFrosted ? `${primaryColor}B3` : primaryColor, // 70% opacity
            color: textColorForPrimary,
            "--tw-ring-color": primaryColor,
          } as React.CSSProperties
        }
        {...props}
      />
    )
  }

  return (
    <button
      className={cn(
        baseStyles,
        frostedBaseStyles,
        isFrosted ? "bg-white/60 text-gray-900" : "bg-white text-black hover:bg-gray-50",
        "focus:ring-gray-400",
        className,
      )}
      {...props}
    />
  )
}
