"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"
import { useCardTheme } from "@/components/providers/card-theme-provider"

export interface DropdownFilterOption {
  label: string
  value: string
}

export interface DropdownFilterItem {
  category: string
  options: DropdownFilterOption[]
  defaultValue?: string
}

interface DropdownFilterTabsProps {
  items: DropdownFilterItem[]
  values: Record<string, string>
  onValueChange: (category: string, value: string) => void
  className?: string
}

export function DropdownFilterTabs({ items, values, onValueChange, className }: DropdownFilterTabsProps) {
  const { theme } = useCardTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const handleOpenFilter = (category: string) => {
    setActiveCategory(category)
    setIsOpen(true)
  }

  const handleSelectOption = (category: string, value: string) => {
    onValueChange(category, value)
    setIsOpen(false)
    setActiveCategory(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    setActiveCategory(null)
  }

  return (
    <>
      {/* 重新设计的筛选标签 */}
      <div className={cn("flex flex-nowrap overflow-x-auto gap-3 pb-2 scrollbar-hide", className)}>
        {items.map((item) => {
          const currentValue = values[item.category] || item.defaultValue || item.options[0]?.value || ""
          const currentLabel = item.options.find((opt) => opt.value === currentValue)?.label || ""

          return (
            <button
              key={item.category}
              onClick={() => handleOpenFilter(item.category)}
              className={cn(
                "group flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex-shrink-0",
                "bg-white/60 backdrop-blur-md border border-gray-200/40",
                "hover:bg-white/80 hover:border-gray-300/60 hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-gray-500/20",
                "shadow-sm hover:shadow-lg",
              )}
              style={{
                color: theme.textColor,
                fontFamily: theme.fontFamily,
              }}
            >
              <span style={{ color: theme.textColor, opacity: 0.7 }} className="group-hover:opacity-90">{item.category}</span>
              <span style={{ color: theme.textColor }} className="font-semibold group-hover:opacity-90">{currentLabel}</span>
              <ChevronDown style={{ color: theme.textColor, opacity: 0.6 }} className="w-4 h-4 group-hover:opacity-80 transition-transform group-hover:rotate-180" />
            </button>
          )
        })}
      </div>

      {/* 使用底部抽屉组件 */}
      <BottomDrawer 
        isOpen={isOpen} 
        onClose={handleClose} 
        title={activeCategory ? `选择${activeCategory}` : "选择筛选条件"}
      >
        <div className="space-y-2">
          {activeCategory &&
            items
              .find((item) => item.category === activeCategory)
              ?.options.map((option) => {
                const currentValue =
                  values[activeCategory] ||
                  items.find((item) => item.category === activeCategory)?.defaultValue ||
                  ""
                const isSelected = currentValue === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelectOption(activeCategory, option.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-4 text-left text-sm transition-all duration-200 rounded-xl",
                      "hover:bg-gray-50 active:scale-98",
                      isSelected
                        ? "bg-gray-100 font-semibold border border-gray-300"
                        : "",
                    )}
                    style={{
                      color: isSelected ? theme.textColor : theme.textColor,
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check style={{ color: theme.textColor }} className="w-5 h-5" />}
                  </button>
                )
              })}
        </div>
      </BottomDrawer>
    </>
  )
}
