/**
 * 组件约束检查器
 * 自动检测组件是否违反统一设计约束
 */

export interface ConstraintViolation {
  type: 'hardcoded-color' | 'custom-contrast' | 'missing-unified-config' | 'duplicate-implementation'
  message: string
  suggestion: string
  severity: 'error' | 'warning' | 'info'
  line?: number
  file?: string
}

export interface ComponentConstraintReport {
  componentName: string
  violations: ConstraintViolation[]
  score: number // 0-100, 100表示完全符合约束
  recommendations: string[]
}

/**
 * 检查组件源码是否违反统一设计约束
 */
export function validateComponent(
  componentSource: string, 
  componentName: string
): ComponentConstraintReport {
  const violations: ConstraintViolation[] = []
  
  // 检查硬编码颜色
  const hardcodedColorViolations = checkHardcodedColors(componentSource)
  violations.push(...hardcodedColorViolations)
  
  // 检查自定义对比度函数
  const customContrastViolations = checkCustomContrastFunctions(componentSource)
  violations.push(...customContrastViolations)
  
  // 检查是否使用统一配置
  const unifiedConfigViolations = checkUnifiedConfigUsage(componentSource)
  violations.push(...unifiedConfigViolations)
  
  // 检查重复实现
  const duplicateImplementationViolations = checkDuplicateImplementations(componentSource)
  violations.push(...duplicateImplementationViolations)
  
  // 计算分数
  const score = calculateConstraintScore(violations)
  
  // 生成建议
  const recommendations = generateRecommendations(violations)
  
  return {
    componentName,
    violations,
    score,
    recommendations
  }
}

/**
 * 检查硬编码颜色
 */
function checkHardcodedColors(source: string): ConstraintViolation[] {
  const violations: ConstraintViolation[] = []
  
  // 检查十六进制颜色
  const hexColorRegex = /#[0-9a-fA-F]{3,6}/g
  const hexMatches = source.match(hexColorRegex)
  
  if (hexMatches) {
    hexMatches.forEach(match => {
      violations.push({
        type: 'hardcoded-color',
        message: `发现硬编码颜色: ${match}`,
        suggestion: '使用设计令牌中的颜色变量，如 tokens.colors.primary',
        severity: 'error'
      })
    })
  }
  
  // 检查RGB颜色
  const rgbColorRegex = /rgb\([^)]+\)/g
  const rgbMatches = source.match(rgbColorRegex)
  
  if (rgbMatches) {
    rgbMatches.forEach(match => {
      violations.push({
        type: 'hardcoded-color',
        message: `发现硬编码RGB颜色: ${match}`,
        suggestion: '使用设计令牌中的颜色变量',
        severity: 'error'
      })
    })
  }
  
  // 检查HSL颜色
  const hslColorRegex = /hsl\([^)]+\)/g
  const hslMatches = source.match(hslColorRegex)
  
  if (hslMatches) {
    hslMatches.forEach(match => {
      violations.push({
        type: 'hardcoded-color',
        message: `发现硬编码HSL颜色: ${match}`,
        suggestion: '使用设计令牌中的颜色变量',
        severity: 'error'
      })
    })
  }
  
  return violations
}

/**
 * 检查自定义对比度函数
 */
function checkCustomContrastFunctions(source: string): ConstraintViolation[] {
  const violations: ConstraintViolation[] = []
  
  // 检查常见的自定义对比度函数名
  const contrastFunctionNames = [
    'getContrastColor',
    'calculateContrast',
    'getTextColor',
    'getOptimalColor',
    'contrastColor'
  ]
  
  contrastFunctionNames.forEach(funcName => {
    const regex = new RegExp(`function\\s+${funcName}|const\\s+${funcName}\\s*=`, 'g')
    if (regex.test(source)) {
      violations.push({
        type: 'custom-contrast',
        message: `发现自定义对比度函数: ${funcName}`,
        suggestion: '使用统一的智能对比度工具: import { getOptimalTextColor } from "@/lib/contrast-utils"',
        severity: 'error'
      })
    }
  })
  
  return violations
}

/**
 * 检查是否使用统一配置
 */
function checkUnifiedConfigUsage(source: string): ConstraintViolation[] {
  const violations: ConstraintViolation[] = []
  
  // 检查是否导入了统一配置
  const hasUnifiedConfig = source.includes('useDesignTokens') || 
                          source.includes('useUnifiedConfig') ||
                          source.includes('getOptimalTextColor')
  
  if (!hasUnifiedConfig && source.includes('backgroundColor') && source.includes('color')) {
    violations.push({
      type: 'missing-unified-config',
      message: '组件使用背景色和文字色，但未使用统一配置系统',
      suggestion: '导入并使用统一配置: import { useDesignTokens } from "@/components/providers/design-tokens-provider"',
      severity: 'warning'
    })
  }
  
  return violations
}

/**
 * 检查重复实现
 */
function checkDuplicateImplementations(source: string): ConstraintViolation[] {
  const violations: ConstraintViolation[] = []
  
  // 检查是否重复实现了常见功能
  const duplicatePatterns = [
    {
      pattern: /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*parseInt[^}]*}/,
      message: '发现重复的颜色解析实现',
      suggestion: '使用统一的颜色解析工具'
    },
    {
      pattern: /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*299[^}]*587[^}]*114[^}]*}/,
      message: '发现重复的亮度计算实现',
      suggestion: '使用统一的智能对比度工具'
    }
  ]
  
  duplicatePatterns.forEach(({ pattern, message, suggestion }) => {
    if (pattern.test(source)) {
      violations.push({
        type: 'duplicate-implementation',
        message,
        suggestion,
        severity: 'warning'
      })
    }
  })
  
  return violations
}

/**
 * 计算约束分数
 */
function calculateConstraintScore(violations: ConstraintViolation[]): number {
  if (violations.length === 0) return 100
  
  let score = 100
  violations.forEach(violation => {
    switch (violation.severity) {
      case 'error':
        score -= 20
        break
      case 'warning':
        score -= 10
        break
      case 'info':
        score -= 5
        break
    }
  })
  
  return Math.max(0, score)
}

/**
 * 生成修复建议
 */
function generateRecommendations(violations: ConstraintViolation[]): string[] {
  const recommendations: string[] = []
  
  if (violations.some(v => v.type === 'hardcoded-color')) {
    recommendations.push('将所有硬编码颜色替换为设计令牌变量')
  }
  
  if (violations.some(v => v.type === 'custom-contrast')) {
    recommendations.push('移除自定义对比度函数，使用统一的智能对比度工具')
  }
  
  if (violations.some(v => v.type === 'missing-unified-config')) {
    recommendations.push('导入并使用统一配置系统')
  }
  
  if (violations.some(v => v.type === 'duplicate-implementation')) {
    recommendations.push('移除重复实现，使用现有的工具函数')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('组件完全符合统一设计约束')
  }
  
  return recommendations
}

/**
 * 批量检查多个组件
 */
export function validateComponents(
  components: Array<{ name: string; source: string }>
): ComponentConstraintReport[] {
  return components.map(component => 
    validateComponent(component.source, component.name)
  )
}

/**
 * 生成约束检查报告
 */
export function generateConstraintReport(
  reports: ComponentConstraintReport[]
): string {
  const totalComponents = reports.length
  const totalViolations = reports.reduce((sum, report) => sum + report.violations.length, 0)
  const averageScore = reports.reduce((sum, report) => sum + report.score, 0) / totalComponents
  
  let report = `# 组件约束检查报告\n\n`
  report += `## 总体统计\n`
  report += `- 检查组件数量: ${totalComponents}\n`
  report += `- 总违规数量: ${totalViolations}\n`
  report += `- 平均约束分数: ${averageScore.toFixed(1)}/100\n\n`
  
  report += `## 详细报告\n\n`
  
  reports.forEach(report => {
    report += `### ${report.componentName}\n`
    report += `- 约束分数: ${report.score}/100\n`
    report += `- 违规数量: ${report.violations.length}\n\n`
    
    if (report.violations.length > 0) {
      report += `#### 违规详情\n`
      report.violations.forEach(violation => {
        report += `- **${violation.severity.toUpperCase()}**: ${violation.message}\n`
        report += `  - 建议: ${violation.suggestion}\n`
      })
      report += `\n`
    }
    
    if (report.recommendations.length > 0) {
      report += `#### 修复建议\n`
      report.recommendations.forEach(rec => {
        report += `- ${rec}\n`
      })
      report += `\n`
    }
  })
  
  return report
}

/**
 * 实时约束检查Hook
 */
export function useConstraintChecker() {
  const checkComponent = (componentSource: string, componentName: string) => {
    return validateComponent(componentSource, componentName)
  }
  
  const checkMultipleComponents = (components: Array<{ name: string; source: string }>) => {
    return validateComponents(components)
  }
  
  return {
    checkComponent,
    checkMultipleComponents,
    generateReport: generateConstraintReport
  }
}
