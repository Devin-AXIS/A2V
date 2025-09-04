"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeviceTypeBadge, DeviceTypeBadgeGroup } from "@/components/ui/device-type-badge"
import { DeviceTypeFilter, DeviceTypeSelector } from "@/components/ui/device-type-filter"
import { CardFactory } from "@/components/card/card-factory"
import { Monitor, Smartphone, Globe } from "lucide-react"
import type { DeviceType } from "@/lib/device-utils"

interface DeviceTypeDemoClientViewProps {
  dict: any
  locale: string
}

// 示例卡片数据
const sampleCards = [
  {
    id: "universal-card-1",
    name: "通用信息卡片",
    description: "适用于所有设备的通用卡片",
    deviceType: "universal" as DeviceType,
    data: { title: "通用卡片", content: "这个卡片在所有设备上都能正常显示" }
  },
  {
    id: "mobile-card-1", 
    name: "移动端专用卡片",
    description: "专为移动端优化的卡片，包含触摸友好的交互",
    deviceType: "mobile" as DeviceType,
    data: { title: "移动端卡片", content: "这个卡片只在移动端显示，包含触摸优化" }
  },
  {
    id: "pc-card-1",
    name: "PC端专用卡片", 
    description: "专为PC端设计的卡片，包含鼠标悬停效果",
    deviceType: "pc" as DeviceType,
    data: { title: "PC端卡片", content: "这个卡片只在PC端显示，包含鼠标交互" }
  },
  {
    id: "universal-card-2",
    name: "通用数据展示卡片",
    description: "跨平台的数据展示卡片",
    deviceType: "universal" as DeviceType,
    data: { title: "数据卡片", content: "显示统计数据的通用卡片" }
  },
  {
    id: "mobile-card-2",
    name: "移动端导航卡片",
    description: "移动端专用的导航卡片",
    deviceType: "mobile" as DeviceType,
    data: { title: "移动导航", content: "移动端专用的导航卡片" }
  },
  {
    id: "pc-card-2",
    name: "PC端工具面板",
    description: "PC端专用的工具面板卡片",
    deviceType: "pc" as DeviceType,
    data: { title: "工具面板", content: "PC端专用的工具面板" }
  }
]

// 示例组件数据
const sampleComponents = [
  {
    id: "universal-button",
    name: "通用按钮",
    deviceType: "universal" as DeviceType,
    description: "适用于所有设备的按钮组件"
  },
  {
    id: "mobile-button",
    name: "移动端按钮",
    deviceType: "mobile" as DeviceType,
    description: "专为移动端优化的按钮，更大的触摸区域"
  },
  {
    id: "pc-button",
    name: "PC端按钮",
    deviceType: "pc" as DeviceType,
    description: "PC端按钮，包含悬停效果和键盘导航"
  }
]

export function DeviceTypeDemoClientView({ dict, locale }: DeviceTypeDemoClientViewProps) {
  const [filteredCards, setFilteredCards] = useState(sampleCards)
  const [filteredComponents, setFilteredComponents] = useState(sampleComponents)
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType>("universal")

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          {locale === 'zh' ? '设备类型系统演示' : 'Device Type System Demo'}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {locale === 'zh' 
            ? '展示卡片和组件的设备类型属性，支持通用、移动端和PC端三种类型'
            : 'Demonstrating device type attributes for cards and components, supporting universal, mobile, and PC types'
          }
        </p>
      </div>

      {/* 设备类型说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {locale === 'zh' ? '设备类型说明' : 'Device Type Description'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Globe className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-semibold">通用 (Universal)</h3>
                <p className="text-sm text-muted-foreground">
                  {locale === 'zh' ? '适用于所有设备' : 'Compatible with all devices'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Smartphone className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold">移动端 (Mobile)</h3>
                <p className="text-sm text-muted-foreground">
                  {locale === 'zh' ? '专为移动设备优化' : 'Optimized for mobile devices'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Monitor className="w-6 h-6 text-purple-500" />
              <div>
                <h3 className="font-semibold">PC端 (PC)</h3>
                <p className="text-sm text-muted-foreground">
                  {locale === 'zh' ? '专为桌面设备设计' : 'Designed for desktop devices'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 卡片演示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{locale === 'zh' ? '卡片设备类型演示' : 'Card Device Type Demo'}</span>
            <DeviceTypeBadgeGroup 
              deviceTypes={['universal', 'mobile', 'pc']} 
              size="sm"
            />
          </CardTitle>
          <CardDescription>
            {locale === 'zh' 
              ? '使用设备类型过滤器来查看不同类型的卡片'
              : 'Use device type filter to view different types of cards'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 设备类型过滤器 */}
          <DeviceTypeFilter
            items={sampleCards}
            onFilteredItemsChange={setFilteredCards}
            showCurrentDevice={true}
            showCount={true}
          />

          {/* 卡片展示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => (
              <Card key={card.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{card.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {card.description}
                      </CardDescription>
                    </div>
                    <DeviceTypeBadge deviceType={card.deviceType} size="sm" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{card.data.title}</p>
                    <p className="text-sm text-muted-foreground">{card.data.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 组件演示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{locale === 'zh' ? '组件设备类型演示' : 'Component Device Type Demo'}</span>
            <DeviceTypeBadgeGroup 
              deviceTypes={['universal', 'mobile', 'pc']} 
              size="sm"
            />
          </CardTitle>
          <CardDescription>
            {locale === 'zh' 
              ? '展示不同设备类型的组件'
              : 'Demonstrating components with different device types'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 设备类型选择器 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {locale === 'zh' ? '选择设备类型:' : 'Select Device Type:'}
            </span>
            <DeviceTypeSelector
              value={selectedDeviceType}
              onChange={setSelectedDeviceType}
            />
          </div>

          {/* 组件展示 */}
          <div className="space-y-3">
            {filteredComponents.map((component) => (
              <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{component.name}</h3>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
                <DeviceTypeBadge deviceType={component.deviceType} size="sm" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 实际卡片工厂演示 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {locale === 'zh' ? '卡片工厂演示' : 'Card Factory Demo'}
          </CardTitle>
          <CardDescription>
            {locale === 'zh' 
              ? '使用CardFactory创建不同设备类型的卡片'
              : 'Using CardFactory to create cards with different device types'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardFactory
              id="demo-universal"
              type="custom"
              deviceType="universal"
            >
              <div className="p-4 text-center">
                <h3 className="font-semibold mb-2">通用卡片</h3>
                <p className="text-sm text-muted-foreground">在所有设备上显示</p>
              </div>
            </CardFactory>

            <CardFactory
              id="demo-mobile"
              type="custom"
              deviceType="mobile"
            >
              <div className="p-4 text-center">
                <h3 className="font-semibold mb-2">移动端卡片</h3>
                <p className="text-sm text-muted-foreground">只在移动端显示</p>
              </div>
            </CardFactory>

            <CardFactory
              id="demo-pc"
              type="custom"
              deviceType="pc"
            >
              <div className="p-4 text-center">
                <h3 className="font-semibold mb-2">PC端卡片</h3>
                <p className="text-sm text-muted-foreground">只在PC端显示</p>
              </div>
            </CardFactory>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
