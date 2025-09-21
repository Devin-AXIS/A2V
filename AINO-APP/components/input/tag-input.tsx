"use client"

import type React from "react"
import { useState, useRef, KeyboardEvent, useMemo } from "react"
import { X, Plus, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tag } from "@/components/basic/tag"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface TagInputProps {
  value?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  readonly?: boolean
  className?: string
  mode?: 'view' | 'edit'
  onModeChange?: (mode: 'view' | 'edit') => void
  emptyText?: string
}

function getContrastColor(hexColor: string): string {
  if (!hexColor.startsWith("#")) return "#000000"
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "#000000" : "#ffffff"
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "输入标签后按回车添加",
  maxTags,
  readonly = false,
  className,
  mode = 'view',
  onModeChange,
  emptyText = "暂无标签"
}: TagInputProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"
  const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

  const [inputValue, setInputValue] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const addTag = (tag: string) => {
    if (!tag || value.includes(tag)) return
    if (maxTags && value.length >= maxTags) return
    
    const newTags = [...value, tag]
    onChange?.(newTags)
    setInputValue("")
  }

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index)
    onChange?.(newTags)
  }

  const handleModeToggle = () => {
    const newMode = mode === 'view' ? 'edit' : 'view'
    onModeChange?.(newMode)
    
    if (newMode === 'edit') {
      setIsEditing(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setIsEditing(false)
      setInputValue("")
    }
  }

  const handleAddClick = () => {
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // 查看模式
  if (mode === 'view') {
    return (
      <div className={cn("w-full", className)}>
        {value.length === 0 ? (
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
            <span className="text-sm text-gray-400">{emptyText}</span>
            {!readonly && (
              <button
                onClick={handleModeToggle}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors"
                style={{ 
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor 
                }}
              >
                <Plus className="w-3 h-3" />
                添加标签
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/70 backdrop-blur-lg border border-white/80 shadow-sm">
            {value.map((tag, index) => (
              <Tag
                key={index}
                variant="white"
                size="sm"
                className="transition-all duration-200 hover:shadow-md"
                style={{ 
                  borderColor: `${primaryColor}30`,
                  backgroundColor: "white"
                }}
              >
                {tag}
              </Tag>
            ))}
            {!readonly && (
              <button
                onClick={handleModeToggle}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Edit className="w-3 h-3" />
                编辑
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // 编辑模式
  return (
    <div className={cn("w-full", className)}>
      <div className="min-h-[44px] p-3 rounded-xl bg-white/70 backdrop-blur-lg border border-white/80 shadow-sm focus-within:ring-2 transition-all duration-300"
           style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}>
        <div className="flex flex-wrap gap-2 items-center">
          {value.map((tag, index) => (
            <Tag
              key={index}
              variant="white"
              size="sm"
              className="transition-all duration-200 hover:shadow-md group"
              style={{ 
                borderColor: `${primaryColor}30`,
                backgroundColor: `${primaryColor}10`
              }}
            >
              <span style={{ color: "var(--card-text-color)" }}>{tag}</span>
              {!readonly && (
                <button
                  onClick={() => removeTag(index)}
                  className="ml-1 p-0.5 rounded-full hover:bg-red-100 transition-colors group-hover:opacity-100 opacity-70"
                >
                  <X className="w-3 h-3 text-red-500" />
                </button>
              )}
            </Tag>
          ))}
          
          {!readonly && (!maxTags || value.length < maxTags) && (
            <>
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  onBlur={() => {
                    if (!inputValue.trim()) {
                      setIsEditing(false)
                    }
                  }}
                  placeholder={placeholder}
                  className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm"
                  style={{ color: "var(--card-text-color)" }}
                />
              ) : (
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-dashed transition-colors"
                  style={{ 
                    borderColor: `${primaryColor}50`,
                    color: primaryColor
                  }}
                >
                  <Plus className="w-3 h-3" />
                  添加更多标签...
                </button>
              )}
            </>
          )}
        </div>
        
        {maxTags && (
          <div className="mt-2 text-xs text-gray-400">
            {value.length}/{maxTags} 个标签
          </div>
        )}
      </div>
      
      {mode === 'edit' && onModeChange && (
        <div className="flex justify-end mt-2">
          <button
            onClick={() => onModeChange('view')}
            className="px-3 py-1 text-xs rounded-lg transition-colors"
            style={{ 
              backgroundColor: `${primaryColor}15`,
              color: primaryColor 
            }}
          >
            完成编辑
          </button>
        </div>
      )}
    </div>
  )
}
