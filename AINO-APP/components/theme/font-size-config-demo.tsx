"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FontSizeSelector } from "./font-size-selector"
import { useFontSizeConfig } from "@/hooks/use-font-size-config"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { FontSize } from "@/types"

export function FontSizeConfigDemo() {
  const { currentPreset, fontSizes, getFontSize, fontSizeConfig } = useFontSizeConfig()

  const sampleTexts = [
    { label: "标题文字", size: "3xl", description: "页面主标题" },
    { label: "副标题", size: "2xl", description: "页面副标题" },
    { label: "大标题", size: "xl", description: "卡片标题" },
    { label: "正文", size: "base", description: "主要内容文字" },
    { label: "小字", size: "sm", description: "辅助说明文字" },
    { label: "注释", size: "xs", description: "注释和标签" }
  ]

  return (
    <div className="space-y-6">
      {/* 字体大小选择器 */}
      <Card>
        <CardHeader>
          <CardTitle>字体大小选择</CardTitle>
          <CardDescription>
            选择不同的字体大小预设，所有文字将按比例调整
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FontSizeSelector />
          
          {/* 调试信息 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">当前配置状态：</h4>
            <div className="text-sm space-y-1">
              <div>当前预设: {currentPreset.current} ({currentPreset.name})</div>
              <div>缩放比例: {currentPreset.scale}</div>
              <div>配置对象: {JSON.stringify(fontSizeConfig, null, 2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 字体大小预览 */}
      <Card>
        <CardHeader>
          <CardTitle>字体大小预览</CardTitle>
          <CardDescription>
            预览不同字体大小的效果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleTexts.map((text) => (
              <div key={text.size} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="text-sm text-gray-500 mb-1">{text.label}</div>
                <div 
                  className="font-medium"
                  style={{ fontSize: `var(--font-size-${text.size})` }}
                >
                  {text.description} - 这是 {text.size} 大小的文字
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  实际大小: {getFontSize(text.size as keyof FontSize)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 实际应用示例 */}
      <Card>
        <CardHeader>
          <CardTitle>实际应用示例</CardTitle>
          <CardDescription>
            这些卡片中的文字会随着字体大小设置变化
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: `var(--font-size-2xl)` }}>
                  卡片标题
                </CardTitle>
                <CardDescription style={{ fontSize: `var(--font-size-sm)` }}>
                  这是卡片的描述文字
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: `var(--font-size-base)` }}>
                  这是卡片的主要内容文字，会随着字体大小设置变化。
                </p>
                <div className="mt-3">
                  <Badge style={{ fontSize: `var(--font-size-xs)` }}>
                    标签文字
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: `var(--font-size-xl)` }}>
                  另一个卡片
                </CardTitle>
                <CardDescription style={{ fontSize: `var(--font-size-sm)` }}>
                  展示不同大小的文字
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p style={{ fontSize: `var(--font-size-lg)` }}>大号文字</p>
                  <p style={{ fontSize: `var(--font-size-base)` }}>正常文字</p>
                  <p style={{ fontSize: `var(--font-size-sm)` }}>小号文字</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
