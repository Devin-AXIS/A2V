/**
 * 配置验证系统（策略引擎）
 * 确保所有配置符合设计约束，实现架构师方案的"变更门槛与回退链"
 */

import type { ConfigValidator, ConfigPolicy, ValidationResult } from "@/types"
import { validateSemanticToken } from "@/config/semantic-tokens"
import { validateContrastRatio } from "@/config/accessibility-constraints"

// 默认配置策略
const defaultPolicies: ConfigPolicy[] = [
  {
    name: 'semantic-token-validation',
    description: '验证语义令牌的有效性',
    rules: [
      '所有语义令牌必须存在于语义令牌映射中',
      '语义令牌必须具有有效的回退链',
      '禁止直接使用Foundation层的颜色值'
    ],
    severity: 'error'
  },
  {
    name: 'contrast-ratio-compliance',
    description: '确保对比度符合WCAG标准',
    rules: [
      '文本对比度必须满足WCAG AA标准（4.5:1）',
      '大文本对比度必须满足WCAG AA标准（3:1）',
      'UI组件对比度必须满足WCAG AA标准（3:1）'
    ],
    severity: 'error'
  },
  {
    name: 'color-token-usage',
    description: '强制使用语义令牌而非硬编码颜色',
    rules: [
      '组件必须使用语义令牌（如surface.default, text.primary）',
      '禁止使用硬编码的十六进制颜色值',
      '禁止直接引用Foundation层的调色板'
    ],
    severity: 'error'
  },
  {
    name: 'component-variant-consistency',
    description: '确保组件变体的一致性',
    rules: [
      '所有组件变体必须定义完整的交互状态',
      '组件尺寸必须遵循设计系统的比例关系',
      '组件形状必须使用预定义的圆角值'
    ],
    severity: 'warning'
  },
  {
    name: 'animation-accessibility',
    description: '确保动画的可访问性',
    rules: [
      '动画必须支持prefers-reduced-motion',
      '动画时长不得超过400ms',
      '动画必须提供适当的缓动函数'
    ],
    severity: 'warning'
  },
  {
    name: 'focus-management',
    description: '确保焦点管理的可访问性',
    rules: [
      '所有交互元素必须支持键盘导航',
      '焦点必须清晰可见',
      '模态框必须实现焦点陷阱'
    ],
    severity: 'error'
  }
]

// 配置验证器实现
export class ConfigValidatorImpl implements ConfigValidator {
  private policies: ConfigPolicy[] = [...defaultPolicies]

  // 验证配置
  validate(config: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 应用所有策略
    this.policies.forEach(policy => {
      const result = this.applyPolicy(policy, config)
      if (policy.severity === 'error') {
        errors.push(...result)
      } else {
        warnings.push(...result)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        total: errors.length + warnings.length,
        violations: errors.length,
        warnings: warnings.length
      }
    }
  }

  // 应用单个策略
  private applyPolicy(policy: ConfigPolicy, config: any): string[] {
    const violations: string[] = []

    switch (policy.name) {
      case 'semantic-token-validation':
        violations.push(...this.validateSemanticTokens(config))
        break
      case 'contrast-ratio-compliance':
        violations.push(...this.validateContrastRatios(config))
        break
      case 'color-token-usage':
        violations.push(...this.validateColorTokenUsage(config))
        break
      case 'component-variant-consistency':
        violations.push(...this.validateComponentVariants(config))
        break
      case 'animation-accessibility':
        violations.push(...this.validateAnimationAccessibility(config))
        break
      case 'focus-management':
        violations.push(...this.validateFocusManagement(config))
        break
    }

    return violations
  }

  // 验证语义令牌
  private validateSemanticTokens(config: any): string[] {
    const violations: string[] = []

    if (config.semanticTokens) {
      Object.keys(config.semanticTokens).forEach(tokenPath => {
        const validation = validateSemanticToken(tokenPath)
        if (!validation.isValid) {
          violations.push(`Invalid semantic token: ${tokenPath} - ${validation.error}`)
        }
      })
    }

    return violations
  }

  // 验证对比度
  private validateContrastRatios(config: any): string[] {
    const violations: string[] = []

    if (config.colorPairs) {
      config.colorPairs.forEach((pair: any) => {
        const result = validateContrastRatio(
          pair.foreground,
          pair.background,
          pair.requirement || 'AA-normal'
        )
        if (!result.isValid) {
          violations.push(`Contrast violation: ${result.error}`)
        }
      })
    }

    return violations
  }

  // 验证颜色令牌使用
  private validateColorTokenUsage(config: any): string[] {
    const violations: string[] = []

    // 检查是否有硬编码颜色值
    const hardcodedColors = this.findHardcodedColors(config)
    hardcodedColors.forEach(color => {
      violations.push(`Hardcoded color found: ${color} - Use semantic tokens instead`)
    })

    // 检查是否直接引用Foundation层
    const foundationReferences = this.findFoundationReferences(config)
    foundationReferences.forEach(ref => {
      violations.push(`Direct Foundation reference: ${ref} - Use semantic tokens instead`)
    })

    return violations
  }

  // 查找硬编码颜色值
  private findHardcodedColors(config: any): string[] {
    const colors: string[] = []
    const configStr = JSON.stringify(config)

    // 查找十六进制颜色值
    const hexColorRegex = /#[0-9a-fA-F]{3,6}/g
    const hexMatches = configStr.match(hexColorRegex) || []
    colors.push(...hexMatches)

    // 查找RGB颜色值
    const rgbColorRegex = /rgb\([^)]+\)/g
    const rgbMatches = configStr.match(rgbColorRegex) || []
    colors.push(...rgbMatches)

    return colors
  }

  // 查找Foundation层引用
  private findFoundationReferences(config: any): string[] {
    const references: string[] = []
    const configStr = JSON.stringify(config)

    // 查找直接的颜色引用
    const colorRefs = [
      'colors.primary',
      'colors.secondary',
      'colors.neutral',
      'colors.success',
      'colors.warning',
      'colors.error'
    ]

    colorRefs.forEach(ref => {
      if (configStr.includes(ref)) {
        references.push(ref)
      }
    })

    return references
  }

  // 验证组件变体
  private validateComponentVariants(config: any): string[] {
    const violations: string[] = []

    if (config.components) {
      Object.entries(config.components).forEach(([componentName, component]: [string, any]) => {
        if (component.variants) {
          Object.entries(component.variants).forEach(([variantName, variant]: [string, any]) => {
            // 检查交互状态完整性
            const requiredStates = ['hover', 'active', 'focus', 'disabled']
            requiredStates.forEach(state => {
              if (!variant[state]) {
                violations.push(`Component ${componentName}.${variantName} missing ${state} state`)
              }
            })
          })
        }
      })
    }

    return violations
  }

  // 验证动画可访问性
  private validateAnimationAccessibility(config: any): string[] {
    const violations: string[] = []

    if (config.animations) {
      Object.entries(config.animations).forEach(([animName, anim]: [string, any]) => {
        // 检查动画时长
        if (anim.duration && this.parseDuration(anim.duration) > 400) {
          violations.push(`Animation ${animName} duration exceeds 400ms accessibility limit`)
        }

        // 检查是否支持减少运动
        if (!anim.reducedMotion) {
          violations.push(`Animation ${animName} missing reduced motion support`)
        }
      })
    }

    return violations
  }

  // 验证焦点管理
  private validateFocusManagement(config: any): string[] {
    const violations: string[] = []

    if (config.components) {
      Object.entries(config.components).forEach(([componentName, component]: [string, any]) => {
        // 检查交互元素是否支持键盘导航
        if (component.interactive && !component.keyboardSupport) {
          violations.push(`Interactive component ${componentName} missing keyboard navigation support`)
        }

        // 检查模态框是否实现焦点陷阱
        if (component.modal && !component.focusTrap) {
          violations.push(`Modal component ${componentName} missing focus trap implementation`)
        }
      })
    }

    return violations
  }

  // 解析持续时间字符串为毫秒
  private parseDuration(duration: string): number {
    if (typeof duration === 'number') return duration
    
    const match = duration.match(/^(\d+(?:\.\d+)?)\s*(ms|s|m)$/)
    if (!match) return 0

    const value = parseFloat(match[1])
    const unit = match[2]

    switch (unit) {
      case 'ms': return value
      case 's': return value * 1000
      case 'm': return value * 60000
      default: return 0
    }
  }

  // 添加策略
  addPolicy(policy: ConfigPolicy): void {
    const existingIndex = this.policies.findIndex(p => p.name === policy.name)
    if (existingIndex >= 0) {
      this.policies[existingIndex] = policy
    } else {
      this.policies.push(policy)
    }
  }

  // 移除策略
  removePolicy(policyName: string): void {
    this.policies = this.policies.filter(p => p.name !== policyName)
  }

  // 获取所有策略
  getPolicies(): ConfigPolicy[] {
    return [...this.policies]
  }

  // 获取策略详情
  getPolicy(policyName: string): ConfigPolicy | undefined {
    return this.policies.find(p => p.name === policyName)
  }

  // 验证特定策略
  validatePolicy(policyName: string, config: any): string[] {
    const policy = this.getPolicy(policyName)
    if (!policy) {
      return [`Policy '${policyName}' not found`]
    }
    return this.applyPolicy(policy, config)
  }
}

// 导出默认验证器实例
export const defaultConfigValidator = new ConfigValidatorImpl()

// 导出验证函数
export function validateConfig(config: any): ValidationResult {
  return defaultConfigValidator.validate(config)
}

// 导出策略管理函数
export function addConfigPolicy(policy: ConfigPolicy): void {
  defaultConfigValidator.addPolicy(policy)
}

export function removeConfigPolicy(policyName: string): void {
  defaultConfigValidator.removePolicy(policyName)
}
