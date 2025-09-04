"use client"

import React from 'react'
import { ComponentUsageChecker } from '@/components/dev/component-usage-checker'
import { STANDARD_UI_COMPONENTS, CUSTOM_COMPONENTS } from '@/lib/component-usage-guide'

export default function ComponentGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">组件使用规范指南</h1>
          <p className="text-muted-foreground text-lg">
            帮助开发者选择正确的公用组件，避免重复开发，保持设计一致性
          </p>
        </div>

        {/* 组件使用规范检查器 */}
        <div className="mb-8">
          <ComponentUsageChecker />
        </div>

        {/* 标准UI组件库 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">标准UI组件库（优先使用）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(STANDARD_UI_COMPONENTS).map(([key, component]) => (
              <div key={key} className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{key}</h3>
                <p className="text-muted-foreground text-sm mb-3">{component.description}</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">路径：</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded ml-2">{component.path}</code>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">变体：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {component.variants.map((variant) => (
                        <span key={variant} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {variant}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">尺寸：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {component.sizes.map((size) => (
                        <span key={size} className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 自定义组件 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">自定义组件（特殊需求时使用）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(CUSTOM_COMPONENTS).map(([key, component]) => (
              <div key={key} className="bg-card border rounded-lg p-4 border-yellow-200">
                <h3 className="font-semibold text-lg mb-2">{key}</h3>
                <p className="text-muted-foreground text-sm mb-3">{component.description}</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">路径：</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded ml-2">{component.path}</code>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-yellow-700">使用场景：</span>
                    <p className="text-xs text-yellow-600 mt-1">{component.useWhen}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">替代方案：</span>
                    <div className="mt-1">
                      {component.alternatives.map((alt, index) => (
                        <div key={index} className="text-xs text-muted-foreground">{alt}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 开发规范 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">开发规范</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-800">✅ 应该做的</h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>开发新功能前，先检查现有组件库</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>优先使用标准UI组件，确保设计一致性</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>新组件应遵循现有的毛玻璃设计风格</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>使用TypeScript类型，确保类型安全</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-800">❌ 不应该做的</h3>
              <ul className="space-y-2 text-red-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>重复开发已有功能的组件</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>使用内联样式，应该使用Tailwind CSS类</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>忽略现有组件的变体和尺寸选项</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>创建不符合设计规范的组件</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 快速参考 */}
        <div className="mt-8 bg-muted border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">快速参考</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">常用组件路径</h3>
              <div className="space-y-1">
                <div><code>@/components/ui/button</code> - 按钮</div>
                <div><code>@/components/ui/input</code> - 输入框</div>
                <div><code>@/components/ui/card</code> - 卡片</div>
                <div><code>@/components/ui/dialog</code> - 对话框</div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">特殊组件路径</h3>
              <div className="space-y-1">
                <div><code>@/components/basic/pill-button</code> - 胶囊按钮</div>
                <div><code>@/components/basic/floating-button</code> - 浮动按钮</div>
                <div><code>@/components/input/text-input</code> - 带标签输入框</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
