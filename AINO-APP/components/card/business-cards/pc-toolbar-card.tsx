"use client"

import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Save, 
  Undo, 
  Redo, 
  Copy, 
  Paste, 
  Cut, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Settings,
  Maximize2,
  Minimize2
} from "lucide-react"
import type { BusinessCardProps } from "@/types"

interface ToolbarItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  isActive?: boolean
  isDisabled?: boolean
  group?: string
}

interface PCToolbarCardProps extends BusinessCardProps {
  data: {
    title: string
    items: ToolbarItem[]
    showShortcuts?: boolean
    isCollapsed?: boolean
  }
  deviceType?: 'pc' // 明确标注为PC端专用
}

export function PCToolbarCard({ data, onAction, deviceType = 'pc' }: PCToolbarCardProps) {
  const handleItemClick = (item: ToolbarItem) => {
    if (item.isDisabled) return
    onAction?.("toolbarAction", { itemId: item.id, label: item.label })
  }

  const handleToggleCollapse = () => {
    onAction?.("toggleCollapse", { isCollapsed: !data.isCollapsed })
  }

  // 按组分类工具项
  const groupedItems = data.items.reduce((acc, item) => {
    const group = item.group || 'default'
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {} as Record<string, ToolbarItem[]>)

  return (
    <AppCard className="p-4">
      <div className="space-y-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{data.title}</h3>
            <Badge variant="secondary" className="text-xs">
              💻 PC端
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              className="h-6 w-6 p-0"
            >
              {data.isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {!data.isCollapsed && (
          <>
            {/* 工具组 */}
            {Object.entries(groupedItems).map(([groupName, items], groupIndex) => (
              <div key={groupName} className="space-y-2">
                {groupIndex > 0 && <Separator />}
                
                <div className="flex flex-wrap gap-1">
                  {items.map((item) => (
                    <Button
                      key={item.id}
                      variant={item.isActive ? "default" : "ghost"}
                      size="sm"
                      className="h-8 px-2 relative group"
                      onClick={() => handleItemClick(item)}
                      disabled={item.isDisabled}
                    >
                      <div className="flex items-center gap-1">
                        {item.icon}
                        <span className="text-xs">{item.label}</span>
                      </div>
                      
                      {/* 快捷键提示 */}
                      {data.showShortcuts && item.shortcut && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {item.shortcut}
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {/* 状态栏 */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>PC端工具栏 - 支持键盘快捷键</span>
                <div className="flex items-center gap-2">
                  <span>Ctrl+S 保存</span>
                  <span>Ctrl+Z 撤销</span>
                  <span>Ctrl+Y 重做</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppCard>
  )
}
