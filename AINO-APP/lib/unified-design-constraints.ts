import type { DesignTokens, CardThemeConfig } from "@/types"

/**
 * 统一设计约束系统
 * 确保所有组件、导航、图表、图标都遵循统一配置
 */
export class UnifiedDesignConstraints {
  private static instance: UnifiedDesignConstraints
  private designTokens: DesignTokens | null = null
  private cardTheme: CardThemeConfig | null = null

  private constructor() {}

  static getInstance(): UnifiedDesignConstraints {
    if (!UnifiedDesignConstraints.instance) {
      UnifiedDesignConstraints.instance = new UnifiedDesignConstraints()
    }
    return UnifiedDesignConstraints.instance
  }

  /**
   * 设置当前设计配置
   */
  setDesignConfig(tokens: DesignTokens, cardTheme: CardThemeConfig) {
    this.designTokens = tokens
    this.cardTheme = cardTheme
  }

  /**
   * 验证组件是否遵循统一设计规范
   */
  validateComponent(componentName: string, props: any): {
    isValid: boolean
    violations: string[]
    recommendations: string[]
  } {
    const violations: string[] = []
    const recommendations: string[] = []

    // 1. 颜色使用约束
    if (this.designTokens) {
      this.validateColorUsage(componentName, props, violations, recommendations)
    }

    // 2. 字体使用约束
    if (this.designTokens) {
      this.validateFontUsage(componentName, props, violations, recommendations)
    }

    // 3. 卡片主题约束
    if (this.cardTheme) {
      this.validateCardTheme(componentName, props, violations, recommendations)
    }

    // 4. 布局约束
    this.validateLayout(componentName, props, violations, recommendations)

    return {
      isValid: violations.length === 0,
      violations,
      recommendations
    }
  }

  /**
   * 验证颜色使用
   */
  private validateColorUsage(
    componentName: string, 
    props: any, 
    violations: string[], 
    recommendations: string[]
  ) {
    if (!this.designTokens) return

    // 检查是否使用了硬编码颜色
    const hardcodedColors = this.findHardcodedColors(props)
    if (hardcodedColors.length > 0) {
      violations.push(`组件 ${componentName} 使用了硬编码颜色: ${hardcodedColors.join(', ')}`)
      recommendations.push('使用 designTokens 中的颜色变量')
    }

    // 检查是否使用了主题外的颜色
    const themeColors = Object.keys(this.designTokens.colors)
    const usedColors = this.extractUsedColors(props)
    const invalidColors = usedColors.filter(color => !themeColors.includes(color))
    
    if (invalidColors.length > 0) {
      violations.push(`组件 ${componentName} 使用了未定义的主题颜色: ${invalidColors.join(', ')}`)
      recommendations.push('只使用 designTokens.colors 中定义的颜色')
    }
  }

  /**
   * 验证字体使用
   */
  private validateFontUsage(
    componentName: string, 
    props: any, 
    violations: string[], 
    recommendations: string[]
  ) {
    if (!this.designTokens) return

    // 检查是否使用了硬编码字体
    const hardcodedFonts = this.findHardcodedFonts(props)
    if (hardcodedFonts.length > 0) {
      violations.push(`组件 ${componentName} 使用了硬编码字体: ${hardcodedFonts.join(', ')}`)
      recommendations.push('使用 designTokens 中的字体变量')
    }
  }

  /**
   * 验证卡片主题
   */
  private validateCardTheme(
    componentName: string, 
    props: any, 
    violations: string[], 
    recommendations: string[]
  ) {
    if (!this.cardTheme) return

    // 检查是否使用了卡片主题配置
    const hasCardTheme = this.hasCardThemeUsage(props)
    if (!hasCardTheme) {
      recommendations.push('使用 useCardTheme() 获取卡片主题配置')
    }
  }

  /**
   * 验证布局约束
   */
  private validateLayout(
    componentName: string, 
    props: any, 
    violations: string[], 
    recommendations: string[]
  ) {
    // 检查是否使用了统一的间距系统
    const hasUnifiedSpacing = this.hasUnifiedSpacing(props)
    if (!hasUnifiedSpacing) {
      recommendations.push('使用统一的间距系统 (p-4, m-6 等)')
    }

    // 检查是否使用了统一的圆角系统
    const hasUnifiedRadius = this.hasUnifiedRadius(props)
    if (!hasUnifiedRadius) {
      recommendations.push('使用统一的圆角系统 (rounded-lg, rounded-xl 等)')
    }
  }

  /**
   * 获取组件推荐配置
   */
  getComponentRecommendations(componentType: string): {
    colors: string[]
    fonts: string[]
    spacing: string[]
    radius: string[]
  } {
    if (!this.designTokens) {
      return { colors: [], fonts: [], spacing: [], radius: [] }
    }

    return {
      colors: Object.keys(this.designTokens.colors),
      fonts: Object.keys(this.designTokens.typography.fonts),
      spacing: ['p-2', 'p-4', 'p-6', 'p-8', 'm-2', 'm-4', 'm-6', 'm-8'],
      radius: ['rounded', 'rounded-lg', 'rounded-xl', 'rounded-2xl']
    }
  }

  /**
   * 生成组件约束报告
   */
  generateConstraintReport(components: Array<{name: string, props: any}>): {
    totalComponents: number
    validComponents: number
    invalidComponents: number
    violations: Array<{component: string, violations: string[], recommendations: string[]}>
  } {
    const report = {
      totalComponents: components.length,
      validComponents: 0,
      invalidComponents: 0,
      violations: [] as Array<{component: string, violations: string[], recommendations: string[]}>
    }

    components.forEach(({ name, props }) => {
      const validation = this.validateComponent(name, props)
      if (validation.isValid) {
        report.validComponents++
      } else {
        report.invalidComponents++
        report.violations.push({
          component: name,
          violations: validation.violations,
          recommendations: validation.recommendations
        })
      }
    })

    return report
  }

  /**
   * 检查组件是否遵循设计规范
   */
  isComponentCompliant(componentName: string, props: any): boolean {
    const validation = this.validateComponent(componentName, props)
    return validation.isValid
  }

  // 辅助方法
  private findHardcodedColors(props: any): string[] {
    // 实现查找硬编码颜色的逻辑
    return []
  }

  private findHardcodedFonts(props: any): string[] {
    // 实现查找硬编码字体的逻辑
    return []
  }

  private extractUsedColors(props: any): string[] {
    // 实现提取使用颜色的逻辑
    return []
  }

  private hasCardThemeUsage(props: any): boolean {
    // 实现检查是否使用卡片主题的逻辑
    return false
  }

  private hasUnifiedSpacing(props: any): boolean {
    // 实现检查是否使用统一间距的逻辑
    return false
  }

  private hasUnifiedRadius(props: any): boolean {
    // 实现检查是否使用统一圆角的逻辑
    return false
  }
}

// 导出单例实例
export const unifiedDesignConstraints = UnifiedDesignConstraints.getInstance()

// 导出便捷函数
export function validateComponent(componentName: string, props: any) {
  return unifiedDesignConstraints.validateComponent(componentName, props)
}

export function getComponentRecommendations(componentType: string) {
  return unifiedDesignConstraints.getComponentRecommendations(componentType)
}
export function generateConstraintReport(components: Array<{name: string, props: any}>) {
  return unifiedDesignConstraints.generateConstraintReport(components)
}

