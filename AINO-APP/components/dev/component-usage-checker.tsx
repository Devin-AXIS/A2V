"use client"

import React, { useState, useEffect } from 'react'
import { ComponentUsageGuide, STANDARD_UI_COMPONENTS, CUSTOM_COMPONENTS } from '@/lib/component-usage-guide'

interface ComponentUsageCheckerProps {
  className?: string
}

export function ComponentUsageChecker({ className }: ComponentUsageCheckerProps) {
  const [codeInput, setCodeInput] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showReport, setShowReport] = useState(false)

  // 分析代码中的组件使用
  const analyzeCode = () => {
    if (!codeInput.trim()) return

    const componentUsages: Array<{path: string, context: string}> = []
    
    // 简单的正则匹配，实际项目中可能需要更复杂的解析
    const importRegex = /import\s+.*?from\s+['"](@\/components\/[^'"]+)['"]/g
    const matches = codeInput.matchAll(importRegex)
    
    for (const match of matches) {
      const path = match[1]
      const context = `第${match.index}行附近`
      componentUsages.push({ path, context })
    }

    if (componentUsages.length > 0) {
      const report = ComponentUsageGuide.generateUsageReport(componentUsages)
      setAnalysisResult({ report, usages: componentUsages })
      setShowReport(true)
    } else {
      setAnalysisResult({ report: "未找到组件导入语句", usages: [] })
      setShowReport(true)
    }
  }

  // 获取组件推荐
  const getRecommendation = (type: string) => {
    return ComponentUsageGuide.getComponentRecommendation(type)
  }

  return (
    <div className={className}>
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">组件使用规范检查器</h2>
        
        <div className="space-y-4">
          {/* 代码输入 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              粘贴代码片段（包含import语句）
            </label>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="粘贴包含组件导入的代码片段..."
              rows={8}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
            />
          </div>

          {/* 分析按钮 */}
          <button
            onClick={analyzeCode}
            disabled={!codeInput.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            分析组件使用
          </button>

          {/* 分析结果 */}
          {showReport && analysisResult && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">分析结果</h3>
              
              {/* 使用报告 */}
              <div className="bg-muted p-4 rounded-md mb-4">
                <h4 className="font-medium mb-2">组件使用报告</h4>
                <pre className="text-sm whitespace-pre-wrap">{analysisResult.report}</pre>
              </div>

              {/* 详细使用情况 */}
              {analysisResult.usages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">详细使用情况</h4>
                  {analysisResult.usages.map((usage: any, index: number) => {
                    const check = ComponentUsageGuide.checkComponentUsage(usage.path, usage.context)
                    return (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm">{usage.path}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            check.isStandard ? 'bg-green-100 text-green-800' : 
                            check.warning ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {check.isStandard ? '标准' : check.warning ? '违规' : '自定义'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{usage.context}</p>
                        <p className="text-sm">{check.recommendation}</p>
                        {check.warning && (
                          <p className="text-sm text-red-600 mt-1">{check.warning}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* 组件推荐 */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">快速组件推荐</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(STANDARD_UI_COMPONENTS).slice(0, 8).map(([key, component]) => (
                <div key={key} className="border rounded-md p-3">
                  <h4 className="font-medium text-sm">{key}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{component.description}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{component.path}</code>
                </div>
              ))}
            </div>
          </div>

          {/* 使用指南 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-lg font-medium text-blue-900 mb-2">使用指南</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>优先使用标准UI组件</strong>：确保设计一致性和功能完整性</li>
              <li>• <strong>谨慎使用自定义组件</strong>：只在标准组件无法满足需求时使用</li>
              <li>• <strong>避免重复开发</strong>：开发新功能前，先检查现有组件库</li>
              <li>• <strong>保持毛玻璃主题</strong>：新组件应遵循现有的毛玻璃设计风格</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
