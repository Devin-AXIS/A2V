/**
 * 简化的配置验证系统
 * 替代复杂的config-validator.ts，提供轻量级的配置验证
 */

// 简化的验证结果类型
export interface SimpleValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// 简化的配置验证器
export class SimplifiedConfigValidator {
  // 验证颜色配置
  static validateColors(colors: any): SimpleValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!colors) {
      errors.push("颜色配置不能为空")
      return { isValid: false, errors, warnings }
    }

    // 检查必需的颜色
    const requiredColors = ['primary', 'secondary', 'background', 'text']
    requiredColors.forEach(color => {
      if (!colors[color]) {
        errors.push(`缺少必需的颜色配置: ${color}`)
      }
    })

    // 检查颜色格式
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string' && !value.match(/^#[0-9A-Fa-f]{6}$/)) {
        warnings.push(`颜色 ${key} 格式可能不正确: ${value}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 验证字体配置
  static validateFonts(fonts: any): SimpleValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!fonts) {
      errors.push("字体配置不能为空")
      return { isValid: false, errors, warnings }
    }

    // 检查字体族
    if (!fonts.fontFamily) {
      errors.push("缺少字体族配置")
    }

    // 检查字体大小
    if (!fonts.fontSize) {
      errors.push("缺少字体大小配置")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 验证间距配置
  static validateSpacing(spacing: any): SimpleValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!spacing) {
      errors.push("间距配置不能为空")
      return { isValid: false, errors, warnings }
    }

    // 检查间距值
    Object.entries(spacing).forEach(([key, value]) => {
      if (typeof value === 'string' && !value.match(/^\d+(\.\d+)?(rem|px|em)$/)) {
        warnings.push(`间距 ${key} 格式可能不正确: ${value}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 验证组件配置
  static validateComponent(componentName: string, props: any): SimpleValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!componentName) {
      errors.push("组件名称不能为空")
    }

    if (!props) {
      warnings.push("组件props为空")
    }

    // 检查硬编码颜色
    const propsString = JSON.stringify(props)
    if (propsString.includes('#') && !propsString.includes('var(--')) {
      warnings.push("检测到可能的硬编码颜色值")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 验证完整配置
  static validateConfig(config: any): SimpleValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config) {
      errors.push("配置不能为空")
      return { isValid: false, errors, warnings }
    }

    // 验证各个部分
    const colorResult = this.validateColors(config.colors)
    const fontResult = this.validateFonts(config.typography)
    const spacingResult = this.validateSpacing(config.spacing)

    errors.push(...colorResult.errors, ...fontResult.errors, ...spacingResult.errors)
    warnings.push(...colorResult.warnings, ...fontResult.warnings, ...spacingResult.warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 生成验证报告
  static generateReport(config: any): string {
    const result = this.validateConfig(config)
    
    let report = "配置验证报告\n"
    report += "=" * 20 + "\n"
    
    if (result.isValid) {
      report += "✅ 配置验证通过\n"
    } else {
      report += "❌ 配置验证失败\n"
    }
    
    if (result.errors.length > 0) {
      report += "\n错误:\n"
      result.errors.forEach(error => {
        report += `  - ${error}\n`
      })
    }
    
    if (result.warnings.length > 0) {
      report += "\n警告:\n"
      result.warnings.forEach(warning => {
        report += `  - ${warning}\n`
      })
    }
    
    return report
  }
}

// 导出便捷函数
export const validateConfig = SimplifiedConfigValidator.validateConfig
export const validateComponent = SimplifiedConfigValidator.validateComponent
export const generateReport = SimplifiedConfigValidator.generateReport
