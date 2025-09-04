"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { PillButton } from "@/components/basic/pill-button"

export interface FilterTabItem {
  label: string
  icon: React.ReactNode
}

interface FilterTabsProps {
  items: FilterTabItem[]
  activeItem: string
  onItemChange: (label: string) => void
  className?: string
}

export function FilterTabs({ items, activeItem, onItemChange, className }: FilterTabsProps) {
  return (
    <div className={cn("flex justify-center flex-wrap gap-3", className)}>
      {items.map((item) => (
        <PillButton
          key={item.label}
          variant={activeItem === item.label ? "primary" : "default"}
          onClick={() => onItemChange(item.label)}
          className="flex items-center"
        >
          {item.icon}
          {item.label}
        </PillButton>
      ))}
    </div>
  )
}
