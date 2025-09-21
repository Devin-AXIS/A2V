"use client"

import type React from "react"
import { EnhancedBaseCard } from "./enhanced-base-card"
import { BusinessCardWrapper } from "./business-cards/business-card-wrapper"

export interface CardFactoryProps {
  id: string
  type: "business" | "custom"
  cardName?: string
  data?: any
  onAction?: (action: string, data?: any) => void
  children?: React.ReactNode
  // 强制的卡片约束
  disableConstraints?: boolean
  // 设备类型属性
  deviceType?: 'universal' | 'mobile' | 'pc'
}

/**
 * 卡片工厂组件
 * 确保所有卡片都遵循统一的约束和能力
 * - 自动集成拖拽、主题配置、设置入口
 * - 统一的错误处理和加载状态
 * - 强制的架构约束
 */
export function CardFactory({
  id,
  type,
  cardName,
  data,
  onAction,
  children,
  disableConstraints = false,
  deviceType = 'universal',
}: CardFactoryProps) {
  const cardConstraints = {
    isDraggable: !disableConstraints,
    showSettings: !disableConstraints,
    disableLocalTheme: disableConstraints,
    deviceType,
  }

  if (type === "business" && cardName) {
    return (
      <EnhancedBaseCard id={id} data={data} onAction={onAction} {...cardConstraints}>
        <BusinessCardWrapper cardName={cardName} data={data} onAction={onAction} />
      </EnhancedBaseCard>
    )
  }

  if (type === "custom" && children) {
    return (
      <EnhancedBaseCard id={id} data={data} onAction={onAction} {...cardConstraints}>
        {children}
      </EnhancedBaseCard>
    )
  }

  // 错误状态也要遵循约束
  return (
    <EnhancedBaseCard id={id} {...cardConstraints}>
      <div className="p-4 text-center text-muted-foreground">
        <p>卡片配置错误</p>
        <p className="text-sm">请检查卡片类型和参数</p>
      </div>
    </EnhancedBaseCard>
  )
}
