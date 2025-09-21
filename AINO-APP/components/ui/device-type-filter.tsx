"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeviceTypeBadge } from "./device-type-badge"
import { filterComponentsByDevice, detectCurrentDeviceType, type DeviceType } from "@/lib/device-utils"
import { cn } from "@/lib/utils"

interface DeviceTypeFilterProps<T> {
  items: T[]
  onFilteredItemsChange: (filteredItems: T[]) => void
  deviceTypeKey?: keyof T
  className?: string
  showCurrentDevice?: boolean
  showCount?: boolean
}

export function DeviceTypeFilter<T extends { deviceType?: DeviceType }>({
  items,
  onFilteredItemsChange,
  deviceTypeKey = 'deviceType',
  className,
  showCurrentDevice = true,
  showCount = true
}: DeviceTypeFilterProps<T>) {
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType>('universal')
  const [currentDeviceType, setCurrentDeviceType] = useState<DeviceType>('universal')

  useEffect(() => {
    const detected = detectCurrentDeviceType()
    setCurrentDeviceType(detected)
    setSelectedDeviceType(detected)
  }, [])

  useEffect(() => {
    const filtered = filterComponentsByDevice(items, selectedDeviceType)
    onFilteredItemsChange(filtered)
  }, [items, selectedDeviceType, onFilteredItemsChange])

  const deviceTypes: DeviceType[] = ['universal', 'mobile', 'pc']
  
  const getItemCount = (deviceType: DeviceType) => {
    return filterComponentsByDevice(items, deviceType).length
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {showCurrentDevice && (
        <div className="flex items-center gap-2 mr-2">
          <span className="text-sm text-muted-foreground">当前设备:</span>
          <DeviceTypeBadge deviceType={currentDeviceType} size="sm" />
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {deviceTypes.map((deviceType) => {
          const count = getItemCount(deviceType)
          const isSelected = selectedDeviceType === deviceType
          
          return (
            <Button
              key={deviceType}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDeviceType(deviceType)}
              className="h-8"
            >
              <DeviceTypeBadge 
                deviceType={deviceType} 
                size="sm"
                className="border-0 bg-transparent p-0 h-auto"
              />
              {showCount && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 text-xs px-1 py-0 h-4 min-w-4"
                >
                  {count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

// 简化的设备类型选择器
export function DeviceTypeSelector({
  value,
  onChange,
  className
}: {
  value: DeviceType
  onChange: (deviceType: DeviceType) => void
  className?: string
}) {
  const deviceTypes: DeviceType[] = ['universal', 'mobile', 'pc']

  return (
    <div className={cn("flex gap-1", className)}>
      {deviceTypes.map((deviceType) => (
        <Button
          key={deviceType}
          variant={value === deviceType ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(deviceType)}
        >
          <DeviceTypeBadge deviceType={deviceType} size="sm" />
        </Button>
      ))}
    </div>
  )
}
