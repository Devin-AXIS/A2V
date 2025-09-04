"use client"

import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Home, Search, User, Settings } from "lucide-react"
import type { BusinessCardProps } from "@/types"

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  badge?: string
  isActive?: boolean
}

interface MobileNavigationCardProps extends BusinessCardProps {
  data: {
    title: string
    items: NavigationItem[]
    showQuickActions?: boolean
  }
  deviceType?: 'mobile' // 明确标注为移动端专用
}

export function MobileNavigationCard({ data, onAction, deviceType = 'mobile' }: MobileNavigationCardProps) {
  const handleItemClick = (item: NavigationItem) => {
    onAction?.("navigate", { itemId: item.id, href: item.href })
  }

  const handleQuickAction = (action: string) => {
    onAction?.(action, { source: 'quickActions' })
  }

  // 提供默认数据，防止 data 为 undefined
  const safeData = data || {
    title: '移动端导航',
    items: [
      { id: 'home', label: '首页', icon: <Home className="w-4 h-4" />, href: '/', isActive: true },
      { id: 'courses', label: '课程', icon: <GraduationCap className="w-4 h-4" />, href: '/courses' },
      { id: 'profile', label: '个人中心', icon: <User className="w-4 h-4" />, href: '/profile' },
      { id: 'settings', label: '设置', icon: <Settings className="w-4 h-4" />, href: '/settings' }
    ],
    showQuickActions: true
  }

  return (
    <AppCard className="p-4">
      <div className="space-y-4">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{safeData.title}</h3>
          <Badge variant="secondary" className="text-xs">
            📱 移动端
          </Badge>
        </div>

        {/* 导航项目 */}
        <div className="space-y-2">
          {safeData.items.map((item) => (
            <Button
              key={item.id}
              variant={item.isActive ? "default" : "ghost"}
              className="w-full justify-start h-12 px-4"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-center w-full">
                <div className="flex items-center gap-3 flex-1">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge variant="outline" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* 快速操作 */}
        {safeData.showQuickActions && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col gap-1"
                onClick={() => handleQuickAction('home')}
              >
                <Home className="w-4 h-4" />
                <span className="text-xs">首页</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col gap-1"
                onClick={() => handleQuickAction('search')}
              >
                <Search className="w-4 h-4" />
                <span className="text-xs">搜索</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col gap-1"
                onClick={() => handleQuickAction('profile')}
              >
                <User className="w-4 h-4" />
                <span className="text-xs">我的</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col gap-1"
                onClick={() => handleQuickAction('settings')}
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs">设置</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppCard>
  )
}
