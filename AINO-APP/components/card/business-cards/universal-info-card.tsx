"use client"

import { useState, useEffect } from "react"
import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, ExternalLink, Share2 } from "lucide-react"
import type { BusinessCardProps } from "@/types"
import { CardRegistry } from "../registry"

interface InfoItem {
  label: string
  value: string | number
  type?: 'text' | 'number' | 'percentage' | 'currency'
  trend?: 'up' | 'down' | 'stable'
}

interface UniversalInfoCardProps extends BusinessCardProps {
  data: {
    title: string
    description?: string
    items: InfoItem[]
    showActions?: boolean
    source?: string
  }
  deviceType?: 'universal' // 明确标注为通用
}

const defaultData: UniversalInfoCardProps['data'] = {
  title: "信息概览",
  description: "关键指标与状态汇总",
  items: [
    { label: '今日新增', value: 128, type: 'number', trend: 'up' },
    { label: '活跃率', value: 67.5, type: 'percentage', trend: 'stable' },
    { label: '收入', value: 52300, type: 'currency', trend: 'up' },
    { label: '异常告警', value: 2, type: 'number', trend: 'down' },
  ],
  showActions: true,
  source: '系统默认',
}

export function UniversalInfoCard({ onAction, deviceType = 'universal' }: UniversalInfoCardProps) {
  console.log(12121212, defaultData)
  const [safeData, setSafeData] = useState(defaultData)

  useEffect(() => {
    const newData = CardRegistry.getData("universal-info");
    if (newData) {
      setSafeData(newData || defaultData)
    } else {
      CardRegistry.listen((name, data) => {
        if (name === 'universal-info') {
          setSafeData(data || defaultData)
        }
      })
    }
  }, [])
  // const safeData = {
  //   title: data?.title ?? "",
  //   description: data?.description ?? undefined,
  //   items: Array.isArray(data?.items) ? data.items : [],
  //   showActions: data?.showActions ?? false,
  //   source: data?.source ?? undefined,
  // }
  const handleAction = (action: string) => {
    onAction?.(action, { cardId: safeData.title })
  }

  const formatValue = (item: InfoItem) => {
    switch (item.type) {
      case 'percentage':
        return `${item.value}%`
      case 'currency':
        return `¥${item.value}`
      case 'number':
        return item.value.toLocaleString()
      default:
        return item.value
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      case 'stable':
        return '➡️'
      default:
        return null
    }
  }

  return (
    <AppCard className="p-4">
      <div className="space-y-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{safeData.title}</h3>
              <Badge variant="outline" className="text-xs">
                🌐 通用
              </Badge>
            </div>
            {safeData.description && (
              <p className="text-sm text-muted-foreground">{safeData.description}</p>
            )}
          </div>
        </div>

        {/* 信息项 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {safeData.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {formatValue(item)}
                  </span>
                  {getTrendIcon(item.trend) && (
                    <span className="text-sm">
                      {getTrendIcon(item.trend)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        {safeData.showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {safeData.source && (
                <span className="text-xs text-muted-foreground">
                  数据来源: {safeData.source}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('share')}
              >
                <Share2 className="w-4 h-4 mr-1" />
                分享
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('viewDetails')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                详情
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppCard>
  )
}
