/**
 * 简化的设计约束系统
 * 替代复杂的unified-design-constraints.ts，提供轻量级的设计约束检查
 */

// 简化的约束检查结果
export interface SimpleConstraintResult {
  isValid: boolean
  violations: string[]
  recommendations: string[]
}

// 简化的设计约束检查器
export class SimplifiedDesignConstraints {
  // 检查硬编码颜色
  static checkHardcodedColors(props: any): string[] {
    const violations: string[] = []
    const propsString = JSON.stringify(props)
    
    // 检查常见的硬编码颜色模式
    const hardcodedPatterns = [
      /#[0-9A-Fa-f]{6}/g,  // 十六进制颜色
      /#[0-9A-Fa-f]{3}/g,  // 短十六进制颜色
      /rgb\(/g,            // RGB颜色
      /rgba\(/g,           // RGBA颜色
      /hsl\(/g,            // HSL颜色
      /hsla\(/g            // HSLA颜色
    ]
    
    hardcodedPatterns.forEach(pattern => {
      if (pattern.test(propsString)) {
        violations.push("检测到硬编码颜色值，建议使用设计令牌")
      }
    })
    
    return violations
  }

  // 检查硬编码字体
  static checkHardcodedFonts(props: any): string[] {
    const violations: string[] = []
    const propsString = JSON.stringify(props)
    
    // 检查常见的硬编码字体
    const hardcodedFonts = [
      'Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana',
      'Courier New', 'Comic Sans MS', 'Impact', 'Trebuchet MS'
    ]
    
    hardcodedFonts.forEach(font => {
      if (propsString.includes(font)) {
        violations.push(`检测到硬编码字体: ${font}，建议使用设计令牌`)
      }
    })
    
    return violations
  }

  // 检查硬编码尺寸
  static checkHardcodedSizes(props: any): string[] {
    const violations: string[] = []
    const propsString = JSON.stringify(props)
    
    // 检查硬编码的像素值
    const pixelPattern = /\d+px/g
    if (pixelPattern.test(propsString)) {
      violations.push("检测到硬编码像素值，建议使用相对单位或设计令牌")
    }
    
    return violations
  }

  // 检查组件结构
  static checkComponentStructure(componentName: string, props: any): string[] {
    const violations: string[] = []
    
    // 检查是否缺少必要的props
    if (!props.className && !props.style) {
      violations.push("组件缺少样式相关的props")
    }
    
    // 检查是否使用了正确的类型
    if (props.children && typeof props.children !== 'object') {
      violations.push("children prop类型可能不正确")
    }
    
    return violations
  }

  // 检查样式一致性
  static checkStyleConsistency(props: any): string[] {
    const violations: string[] = []
    const propsString = JSON.stringify(props)
    
    // 检查是否使用了cn函数
    if (propsString.includes('className') && !propsString.includes('cn(')) {
      violations.push("建议使用cn函数合并类名")
    }
    
    // 检查是否使用了Tailwind类名
    if (propsString.includes('className') && !propsString.includes('bg-') && !propsString.includes('text-')) {
      violations.push("建议使用Tailwind CSS类名")
    }
    
    return violations
  }

  // 验证组件约束
  static validateComponent(componentName: string, props: any): SimpleConstraintResult {
    const violations: string[] = []
    const recommendations: string[] = []
    
    // 执行各种检查
    violations.push(...this.checkHardcodedColors(props))
    violations.push(...this.checkHardcodedFonts(props))
    violations.push(...this.checkHardcodedSizes(props))
    violations.push(...this.checkComponentStructure(componentName, props))
    violations.push(...this.checkStyleConsistency(props))
    
    // 生成建议
    if (violations.length > 0) {
      recommendations.push("建议使用设计令牌系统")
      recommendations.push("建议使用统一的样式工具函数")
      recommendations.push("建议遵循组件设计规范")
    }
    
    return {
      isValid: violations.length === 0,
      violations,
      recommendations
    }
  }

  // 获取推荐配置
  static getRecommendations(componentType: string): {
    colors: string[]
    fonts: string[]
    spacing: string[]
    radius: string[]
  } {
    return {
      colors: [
        'bg-primary', 'bg-secondary', 'bg-background', 'bg-card',
        'text-primary', 'text-secondary', 'text-foreground', 'text-muted-foreground'
      ],
      fonts: [
        'font-sans', 'font-serif', 'font-mono',
        'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'
      ],
      spacing: [
        'p-2', 'p-4', 'p-6', 'p-8',
        'm-2', 'm-4', 'm-6', 'm-8',
        'gap-2', 'gap-4', 'gap-6', 'gap-8'
      ],
      radius: [
        'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full'
      ]
    }
  }

  // 生成约束报告
  static generateReport(components: Array<{name: string, props: any}>): {
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
}

// 导出便捷函数
export const validateComponent = SimplifiedDesignConstraints.validateComponent
export const getRecommendations = SimplifiedDesignConstraints.getRecommendations
export const generateReport = SimplifiedDesignConstraints.generateReport
