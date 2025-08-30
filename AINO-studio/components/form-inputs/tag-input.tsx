"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function TagInput({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [inputValue, setInputValue] = useState("")
  const tags = Array.isArray(value) ? value : []

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // 如果输入框为空且按了Backspace，删除最后一个标签
      e.preventDefault()
      onChange(tags.slice(0, -1))
    }
  }

  const addTag = () => {
    const newTag = inputValue.trim()
    if (newTag && !tags.includes(newTag) && newTag.length <= 50) {
      onChange([...tags, newTag])
      setInputValue("")
    } else if (newTag && tags.includes(newTag)) {
      // 如果标签已存在，清空输入框但不添加
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="w-full min-h-10 p-2 border rounded-md bg-white flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
          <span className="max-w-32 truncate" title={tag}>
            {tag}
          </span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-gray-200 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? "添加标签，按回车或逗号确认..." : "添加更多标签..."}
        className="flex-grow bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-6 min-w-32"
        maxLength={50}
      />
    </div>
  )
}
