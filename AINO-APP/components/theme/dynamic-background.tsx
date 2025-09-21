"use client"

import { useTheme } from "@/components/providers/theme-provider"

export function DynamicBackground() {
  const { gradientStyle, getGlowColor } = useTheme()

  return (
    <>
      <div className="absolute inset-0 -z-20 transition-all duration-1000" style={gradientStyle} />
      <div
        className="absolute top-32 left-8 w-80 h-80 rounded-full opacity-15 blur-3xl -z-10 transition-all duration-1000"
        style={{ backgroundColor: getGlowColor(1) }}
      />
      <div
        className="absolute bottom-60 right-12 w-96 h-96 rounded-full opacity-10 blur-3xl -z-10 transition-all duration-1000"
        style={{ backgroundColor: getGlowColor(2) }}
      />
      <div
        className="absolute top-2/3 left-1/3 w-72 h-72 rounded-full opacity-12 blur-3xl -z-10 transition-all duration-1000"
        style={{ backgroundColor: getGlowColor(1) }}
      />
    </>
  )
}
