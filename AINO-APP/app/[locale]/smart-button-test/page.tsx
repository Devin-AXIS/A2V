"use client"

import { useState } from "react"
import { SmartButton } from "@/components/ui/smart-button"
import { PillButton } from "@/components/basic/pill-button"
import { Button } from "@/components/ui/button"

export default function SmartButtonTestPage() {
  const [testColors] = useState([
    "#FF6B6B", // 红色
    "#4ECDC4", // 青色
    "#45B7D1", // 蓝色
    "#96CEB4", // 绿色
    "#FFEAA7", // 黄色
    "#DDA0DD", // 紫色
    "#000000", // 黑色
    "#FFFFFF", // 白色
    "#F0F0F0", // 浅灰
    "#333333", // 深灰
  ])

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">智能按钮对比度测试</h1>
        <p className="text-gray-600 mb-8">
          测试智能对比度系统在不同背景色下的文字颜色选择
        </p>
      </div>

      {/* 智能按钮测试 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">SmartButton 组件测试</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {testColors.map((color, index) => (
            <div key={index} className="space-y-2">
              <div 
                className="w-full h-8 rounded border"
                style={{ backgroundColor: color }}
              />
              <SmartButton
                customBackgroundColor={color}
                className="w-full"
              >
                测试按钮
              </SmartButton>
              <p className="text-xs text-gray-500 text-center">
                {color}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PillButton 测试 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">PillButton 组件测试</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {testColors.map((color, index) => (
            <div key={index} className="space-y-2">
              <div 
                className="w-full h-8 rounded border"
                style={{ backgroundColor: color }}
              />
              <PillButton
                variant="primary"
                className="w-full"
                style={{ backgroundColor: color }}
              >
                测试按钮
              </PillButton>
              <p className="text-xs text-gray-500 text-center">
                {color}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 传统按钮对比 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">传统按钮对比（可能有问题）</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {testColors.map((color, index) => (
            <div key={index} className="space-y-2">
              <div 
                className="w-full h-8 rounded border"
                style={{ backgroundColor: color }}
              />
              <Button
                className="w-full"
                style={{ backgroundColor: color }}
              >
                测试按钮
              </Button>
              <p className="text-xs text-gray-500 text-center">
                {color}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">测试说明</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong>SmartButton</strong>：使用智能对比度计算，文字颜色自动优化</li>
          <li>• <strong>PillButton</strong>：已升级使用智能对比度系统</li>
          <li>• <strong>传统Button</strong>：可能受统一颜色配置影响，文字颜色可能不够清晰</li>
          <li>• 深色背景应该显示白色文字，浅色背景应该显示深色文字</li>
        </ul>
      </div>
    </div>
  )
}
