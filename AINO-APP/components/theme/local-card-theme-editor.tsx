"use client"

import type React from "react"

import { MoreHorizontal, RotateCcw } from "lucide-react"
import type { CardThemeConfig } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface LocalCardThemeEditorProps {
  theme: CardThemeConfig
  setTheme: (updater: React.SetStateAction<CardThemeConfig>) => void
  resetToGlobal: () => void
}

export function LocalCardThemeEditor({ theme, setTheme, resetToGlobal }: LocalCardThemeEditorProps) {
  const handleValueChange = (key: keyof CardThemeConfig, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  const handleStyleChange = (style: "solid" | "frosted" | "none") => {
    setTheme((prev) => ({ ...prev, backgroundStyle: style }))
  }

  const handleOpacityChange = (opacity: "normal" | "high") => {
    setTheme((prev) => ({ ...prev, frostedOpacity: opacity }))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full text-gray-500 hover:bg-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          onClick={(e) => e.stopPropagation()} // Prevent card click events
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Edit Card Style</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-white/80 backdrop-blur-lg border-gray-200/60 rounded-xl p-4 space-y-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when interacting with inputs
      >
        <DropdownMenuLabel className="text-base">单独配置</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">背景效果</Label>
            <div className="flex items-center p-0.5 bg-gray-100/80 rounded-full">
              <button
                onClick={() => handleStyleChange("solid")}
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full transition-all",
                  theme.backgroundStyle === "solid" ? "bg-white shadow" : "text-gray-500",
                )}
              >
                纯色
              </button>
              <button
                onClick={() => handleStyleChange("frosted")}
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full transition-all",
                  theme.backgroundStyle === "frosted" ? "bg-white shadow" : "text-gray-500",
                )}
              >
                毛玻璃
              </button>
              <button
                onClick={() => handleStyleChange("none")}
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full transition-all",
                  theme.backgroundStyle === "none" ? "bg-white shadow" : "text-gray-500",
                )}
              >
                无
              </button>
            </div>
          </div>

          {theme.backgroundStyle === "frosted" && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">透明度</Label>
              <div className="flex items-center p-0.5 bg-gray-100/80 rounded-full">
                <button
                  onClick={() => handleOpacityChange("normal")}
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-full transition-all",
                    theme.frostedOpacity === "normal" || !theme.frostedOpacity ? "bg-white shadow" : "text-gray-500",
                  )}
                >
                  正常
                </button>
                <button
                  onClick={() => handleOpacityChange("high")}
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-full transition-all",
                    theme.frostedOpacity === "high" ? "bg-white shadow" : "text-gray-500",
                  )}
                >
                  高
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm">背景颜色</Label>
            <input
              type="color"
              value={theme.background}
              onChange={(e) => handleValueChange("background", e.target.value)}
              className="w-7 h-7 p-0 border-none rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm">字体颜色</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.fontColor}
              onChange={(e) => handleValueChange("fontColor", e.target.value)}
              className="w-7 h-7 p-0 border-none rounded cursor-pointer bg-transparent"
            />
            <span className="text-xs text-gray-500">标题自动变深</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm">字体</Label>
          <Select value={theme.fontFamily} onValueChange={(v) => handleValueChange("fontFamily", v)}>
            <SelectTrigger className="w-[120px] h-7 text-xs">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system-ui, sans-serif">System</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="Courier New, monospace">Courier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={resetToGlobal} className="cursor-pointer">
          <RotateCcw className="mr-2 h-4 w-4" />
          <span>重置为全局配置</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
