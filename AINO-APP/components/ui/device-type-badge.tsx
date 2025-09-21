"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { createDeviceTypeBadge, type DeviceType } from "@/lib/device-utils"
import { cn } from "@/lib/utils"

interface DeviceTypeBadgeProps {
  deviceType: DeviceType
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function DeviceTypeBadge({ 
  deviceType, 
  className,
  showIcon = true,
  size = 'md'
}: DeviceTypeBadgeProps) {
  const badgeData = createDeviceTypeBadge(deviceType)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <Badge 
      variant={badgeData.variant}
      className={cn(
        badgeData.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <span className="mr-1">
          {badgeData.icon}
        </span>
      )}
      {badgeData.label}
    </Badge>
  )
}

// 设备类型徽章组
export function DeviceTypeBadgeGroup({ 
  deviceTypes, 
  className,
  showIcon = true,
  size = 'sm'
}: {
  deviceTypes: DeviceType[]
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {deviceTypes.map((deviceType) => (
        <DeviceTypeBadge
          key={deviceType}
          deviceType={deviceType}
          showIcon={showIcon}
          size={size}
        />
      ))}
    </div>
  )
}
