"use client"

import React, { useState } from 'react'
import { useUnifiedDesignConstraints } from '@/components/providers/unified-design-constraints-provider'
import { AppCard } from '@/components/layout/app-card'
import { useCardTheme } from '@/components/providers/card-theme-provider'

export function ComponentConstraintChecker() {
  const { validateComponent, getRecommendations, generateReport } = useUnifiedDesignConstraints()
  const { theme } = useCardTheme()
  const [componentName, setComponentName] = useState('')
  const [componentProps, setComponentProps] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)

  // 验证组件
  const handleValidate = () => {
    try {
      const props = componentProps ? JSON.parse(componentProps) : {}
      const result = validateComponent(componentName, props)
      setValidationResult(result)
    } catch (error) {
      setValidationResult({
        isValid: false,
        violations: ['JSON 格式错误'],
        recommendations: ['请检查 JSON 格式']
      })
    }
  }

  // 获取推荐配置
  const handleGetRecommendations = () => {
    const recs = getRecommendations(componentName || 'default')
    setRecommendations(recs)
  }

  // 生成约束报告
  const handleGenerateReport = () => {
    const components = [
      { name: 'LearningPlanSummaryCard', props: {} },
      { name: 'CourseModuleCard', props: {} },
      { name: 'JobExperienceRatioCard', props: {} }
    ]
    const report = generateReport(components)
    setValidationResult({ report })
  }

  return (
    <div className="space-y-6">
      <AppCard className="p-6" localThemeKey="constraint-checker-header">
        <h2 className="text-2xl font-bold mb-4" style={{ color: theme.titleColor }}>
          🎨 统一设计约束检查器
        </h2>
        <p className="mb-4" style={{ color: theme.textColor }}>
          确保所有组件都遵循统一设计规范，除非真正需要新功能时才写新组件
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.background}20` }}>
            <h3 className="font-semibold mb-1" style={{ color: theme.titleColor }}>颜色约束</h3>
            <p style={{ color: theme.textColor }}>必须使用 designTokens 中的颜色变量</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.background}20` }}>
            <h3 className="font-semibold mb-1" style={{ color: theme.titleColor }}>字体约束</h3>
            <p style={{ color: theme.textColor }}>必须使用 designTokens 中的字体变量</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.background}20` }}>
            <h3 className="font-semibold mb-1" style={{ color: theme.titleColor }}>主题约束</h3>
            <p style={{ color: theme.textColor }}>必须使用 useCardTheme() 获取主题配置</p>
          </div>
        </div>
      </AppCard>

      {/* 组件验证 */}
      <AppCard className="p-6" localThemeKey="component-validation">
        <h3 className="text-xl font-semibold mb-4" style={{ color: theme.titleColor }}>
          组件约束验证
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>
              组件名称
            </label>
            <input
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="例如: LearningPlanSummaryCard"
              style={{ borderColor: `${theme.titleColor}20` }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>
              组件属性 (JSON)
            </label>
            <textarea
              value={componentProps}
              onChange={(e) => setComponentProps(e.target.value)}
              className="w-full p-2 border rounded-lg h-24"
              placeholder='例如: {"className": "p-4", "style": {"color": "#333"}}'
              style={{ borderColor: `${theme.titleColor}20` }}
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleValidate}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: theme.titleColor,
                color: theme.background
              }}
            >
              验证组件
            </button>
            
            <button
              onClick={handleGetRecommendations}
              className="px-4 py-2 rounded-lg font-medium border"
              style={{ 
                borderColor: theme.titleColor,
                color: theme.titleColor
              }}
            >
              获取推荐配置
            </button>
            
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 rounded-lg font-medium border"
              style={{ 
                borderColor: theme.titleColor,
                color: theme.titleColor
              }}
            >
              生成约束报告
            </button>
          </div>
        </div>
      </AppCard>

      {/* 验证结果 */}
      {validationResult && (
        <AppCard className="p-6" localThemeKey="validation-result">
          <h3 className="text-xl font-semibold mb-4" style={{ color: theme.titleColor }}>
            验证结果
          </h3>
          
          {validationResult.report ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.background}20` }}>
                  <div className="text-2xl font-bold" style={{ color: theme.titleColor }}>
                    {validationResult.report.totalComponents}
                  </div>
                  <div className="text-sm" style={{ color: theme.textColor }}>总组件数</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.background}20` }}>
                  <div className="text-2xl font-bold text-green-600">
                    {validationResult.report.validComponents}
                  </div>
                  <div className="text-sm" style={{ color: theme.textColor }}>符合约束</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.background}20` }}>
                  <div className="text-2xl font-bold text-red-600">
                    {validationResult.report.invalidComponents}
                  </div>
                  <div className="text-sm" style={{ color: theme.textColor }}>违反约束</div>
                </div>
              </div>
              
              {validationResult.report.violations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: theme.titleColor }}>
                    违反约束详情:
                  </h4>
                  <div className="space-y-2">
                    {validationResult.report.violations.map((violation: any, index: number) => (
                      <div key={index} className="p-3 rounded-lg border-l-4 border-red-500" style={{ backgroundColor: `${theme.background}20` }}>
                        <div className="font-medium" style={{ color: theme.titleColor }}>
                          {violation.component}
                        </div>
                        {violation.violations.map((v: string, i: number) => (
                          <div key={i} className="text-sm text-red-600">❌ {v}</div>
                        ))}
                        {violation.recommendations.map((r: string, i: number) => (
                          <div key={i} className="text-sm text-blue-600">💡 {r}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border-l-4 ${
                validationResult.isValid 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-500 bg-red-50'
              }`}>
                <div className="font-medium" style={{ color: theme.titleColor }}>
                  状态: {validationResult.isValid ? '✅ 符合约束' : '❌ 违反约束'}
                </div>
                
                {validationResult.violations.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium text-red-600 mb-1">违反约束:</div>
                    {validationResult.violations.map((violation: string, index: number) => (
                      <div key={index} className="text-sm text-red-600">• {violation}</div>
                    ))}
                  </div>
                )}
                
                {validationResult.recommendations.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium text-blue-600 mb-1">建议:</div>
                    {validationResult.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="text-sm text-blue-600">• {recommendation}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </AppCard>
      )}

      {/* 推荐配置 */}
      {recommendations && (
        <AppCard className="p-6" localThemeKey="recommendations">
          <h3 className="text-xl font-semibold mb-4" style={{ color: theme.titleColor }}>
            推荐配置
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2" style={{ color: theme.titleColor }}>推荐颜色</h4>
              <div className="space-y-1">
                {recommendations.colors.map((color: string, index: number) => (
                  <div key={index} className="text-sm" style={{ color: theme.textColor }}>
                    • {color}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2" style={{ color: theme.titleColor }}>推荐字体</h4>
              <div className="space-y-1">
                {recommendations.fonts.map((font: string, index: number) => (
                  <div key={index} className="text-sm" style={{ color: theme.textColor }}>
                    • {font}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2" style={{ color: theme.titleColor }}>推荐间距</h4>
              <div className="space-y-1">
                {recommendations.spacing.map((spacing: string, index: number) => (
                  <div key={index} className="text-sm" style={{ color: theme.textColor }}>
                    • {spacing}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2" style={{ color: theme.titleColor }}>推荐圆角</h4>
              <div className="space-y-1">
                {recommendations.radius.map((radius: string, index: number) => (
                  <div key={index} className="text-sm" style={{ color: theme.textColor }}>
                    • {radius}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AppCard>
      )}
    </div>
  )
}
