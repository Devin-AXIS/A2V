"use client"

import { useState, useRef, useEffect } from "react"
import { X, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { FieldModel } from "@/lib/store"

export function MultiSelectInput({
  field,
  value,
  onChange,
}: {
  field: FieldModel
  value: any
  onChange: (v: any) => void
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedValues = new Set(Array.isArray(value) ? value : [])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (optionValue: string) => {
    const newSelected = new Set(selectedValues)
    if (newSelected.has(optionValue)) {
      newSelected.delete(optionValue)
    } else {
      newSelected.add(optionValue)
    }
    onChange(Array.from(newSelected))
  }

  const handleUnselect = (optionValue: string) => {
    const newSelected = new Set(selectedValues)
    newSelected.delete(optionValue)
    onChange(Array.from(newSelected))
  }

  const toggleOpen = () => {
    setOpen(!open)
    if (!open) {
      setSearchTerm("")
    }
  }

  // 过滤选项
  const filteredOptions = (field.options || []).filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between h-auto min-h-10 bg-white"
        onClick={toggleOpen}
      >
        <div className="flex gap-1 flex-wrap">
          {selectedValues.size > 0 ? (
            Array.from(selectedValues).map((val) => (
              <Badge
                variant="secondary"
                key={val}
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnselect(val)
                }}
                className="cursor-pointer"
              >
                {val}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">选择选项...</span>
          )}
        </div>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <Input 
              placeholder="搜索选项..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div 
                  key={option} 
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(option)}
                >
                  <Check className={`mr-2 h-4 w-4 ${selectedValues.has(option) ? 'opacity-100' : 'opacity-0'}`} />
                  <span className="flex-1">{option}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                没有找到匹配的选项
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
