"use client"

import React, { createContext, useContext, useEffect, type ReactNode } from "react"
import { useDesignTokens } from "./design-tokens-provider"
import { useCardTheme } from "./card-theme-provider"
import { unifiedDesignConstraints } from "@/lib/unified-design-constraints"

interface UnifiedDesignConstraintsContextType {
  // 约束检查
  validateComponent: (componentName: string, props: any) => {
    isValid: boolean
    violations: string[]
    recommendations: string[]
  }
  
  // 获取推荐配置
  getRecommendations: (componentType: string) => {
    colors: string[]
    fonts: string[]
    spacing: string[]
    radius: string[]
  }
  
  // 生成约束报告
  generateReport: (components: Array<{name: string, props: any}>) => {
    totalComponents: number
    validComponents: number
    invalidComponents: number
    violations: Array<{component: string, violations: string[], recommendations: string[]}>
  }
  
  // 强制约束检查
  enforceConstraints: () => void
}

const UnifiedDesignConstraintsContext = createContext<UnifiedDesignConstraintsContextType | undefined>(undefined)

export function UnifiedDesignConstraintsProvider({ children }: { children: ReactNode }) {
  const { tokens } = useDesignTokens()
  const { theme } = useCardTheme()

  // 同步设计配置到约束系统
  useEffect(() => {
    if (tokens && theme) {
      unifiedDesignConstraints.setDesignConfig(tokens, theme)
    }
  }, [tokens, theme])

  // 强制约束检查 - 在开发模式下自动运行
  const enforceConstraints = () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🎨 统一设计约束检查')
      
      // 检查所有已注册的组件
      const registeredComponents = getRegisteredComponents()
      const report = unifiedDesignConstraints.generateConstraintReport(registeredComponents)
      
      console.log(`📊 约束检查报告:`)
      console.log(`   总组件数: ${report.totalComponents}`)
      console.log(`   符合约束: ${report.validComponents}`)
      console.log(`   违反约束: ${report.invalidComponents}`)
      
      if (report.violations.length > 0) {
        console.warn('⚠️ 发现违反约束的组件:')
        report.violations.forEach(({ component, violations, recommendations }) => {
          console.warn(`   组件: ${component}`)
          violations.forEach(v => console.warn(`     ❌ ${v}`))
          recommendations.forEach(r => console.log(`     💡 ${r}`))
        })
      } else {
        console.log('✅ 所有组件都符合统一设计约束!')
      }
      
      console.groupEnd()
    }
  }

  // 获取已注册的组件列表
  const getRegisteredComponents = () => {
    // 这里可以集成 CardRegistry 或其他组件注册系统
    return [
      { name: 'LearningPlanSummaryCard', props: {} },
      { name: 'CourseModuleCard', props: {} },
      { name: 'JobExperienceRatioCard', props: {} },
      // ... 其他组件
    ]
  }

  const value: UnifiedDesignConstraintsContextType = {
    validateComponent: (componentName: string, props: any) => {
      return unifiedDesignConstraints.validateComponent(componentName, props)
    },
    
    getRecommendations: (componentType: string) => {
      return unifiedDesignConstraints.getComponentRecommendations(componentType)
    },
    
    generateReport: (components: Array<{name: string, props: any}>) => {
      return unifiedDesignConstraints.generateConstraintReport(components)
    },
    
    enforceConstraints
  }

  // 在开发模式下自动执行约束检查
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(enforceConstraints, 1000) // 延迟1秒执行
      return () => clearTimeout(timer)
    }
  }, [tokens, theme])

  return (
    <UnifiedDesignConstraintsContext.Provider value={value}>
      {children}
    </UnifiedDesignConstraintsContext.Provider>
  )
}

// Hook
export function useUnifiedDesignConstraints() {
  const context = useContext(UnifiedDesignConstraintsContext)
  if (context === undefined) {
    throw new Error("useUnifiedDesignConstraints must be used within a UnifiedDesignConstraintsProvider")
  }
  return context
}

// 便捷函数
export function validateComponent(componentName: string, props: any) {
  return unifiedDesignConstraints.validateComponent(componentName, props)
}

export function getComponentRecommendations(componentType: string) {
  return unifiedDesignConstraints.getComponentRecommendations(componentType)
}
