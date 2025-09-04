"use client"

import React from "react"
import { useFontSizeConfig } from "@/hooks/use-font-size-config"
import type { FontSize } from "@/types"

export default function FontSizeTestPage() {
  const { currentPreset, fontSizes, getFontSize } = useFontSizeConfig()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">字体大小测试</h1>
        <p className="text-xl text-muted-foreground">
          测试字体大小配置系统
        </p>
      </div>
      
      <div className="space-y-6">
        {/* 字体大小控制 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">字体大小控制</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'small', name: '小', scale: 0.8 },
              { key: 'normal', name: '正常', scale: 1.0 },
              { key: 'large', name: '大', scale: 1.2 }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  // 这里暂时不实现切换逻辑
                  console.log('切换到:', option.key)
                }}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-lg font-semibold">{option.name}</div>
                <div className="text-sm text-gray-500">{Math.round(option.scale * 100)}%</div>
              </button>
            ))}
          </div>
        </div>

        {/* 字体大小预览 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">字体大小预览</h2>
          <div className="space-y-4">
            {[
              { label: "超大标题", size: "3xl" },
              { label: "大标题", size: "2xl" },
              { label: "标题", size: "xl" },
              { label: "正文", size: "base" },
              { label: "小字", size: "sm" },
              { label: "极小字", size: "xs" }
            ].map((text, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="text-sm text-gray-500 mb-1">{text.label}</div>
                <div 
                  className="font-semibold"
                  style={{ fontSize: getFontSize(text.size as keyof FontSize) }}
                >
                  这是 {text.label} 的示例文字
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 当前状态 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">当前状态</h2>
          <div className="space-y-2">
            <p><strong>当前预设:</strong> {currentPreset.name}</p>
            <p><strong>缩放比例:</strong> {currentPreset.scale}</p>
            <p><strong>基础字体:</strong> {getFontSize('base')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
