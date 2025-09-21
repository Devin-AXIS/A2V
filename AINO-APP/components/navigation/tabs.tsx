"use client"

import { cn } from "@/lib/utils"
import { PillNavigation } from "./pill-navigation"

interface TabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("w-full overflow-x-auto hide-scrollbar", className)}>
      <PillNavigation tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
