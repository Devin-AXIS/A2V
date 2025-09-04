/**
 * 简化的组件使用指南
 * 替代复杂的component-usage-guide.ts，提供轻量级的组件使用指导
 */

// 简化的组件使用规则
export interface SimpleUsageRule {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
}

// 简化的组件使用指南
export class SimplifiedComponentGuide {
  // 检查组件使用规则
  static checkUsageRules(componentName: string, props: any): SimpleUsageRule[] {
    const rules: SimpleUsageRule[] = []
    
    // 检查必需的props
    const requiredProps = this.getRequiredProps(componentName)
    requiredProps.forEach(prop => {
      if (!(prop in props)) {
        rules.push({
          id: `missing-${prop}`,
          type: 'error',
          message: `组件 ${componentName} 缺少必需的 prop: ${prop}`,
          suggestion: `请添加 ${prop} prop`
        })
      }
    })
    
    // 检查不推荐的props
    const deprecatedProps = this.getDeprecatedProps(componentName)
    deprecatedProps.forEach(prop => {
      if (prop in props) {
        rules.push({
          id: `deprecated-${prop}`,
          type: 'warning',
          message: `组件 ${componentName} 使用了已废弃的 prop: ${prop}`,
          suggestion: `请使用替代方案`
        })
      }
    })
    
    // 检查props类型
    const propTypes = this.getPropTypes(componentName)
    Object.entries(propTypes).forEach(([prop, expectedType]) => {
      if (prop in props) {
        const actualType = typeof props[prop]
        if (actualType !== expectedType) {
          rules.push({
            id: `type-mismatch-${prop}`,
            type: 'warning',
            message: `组件 ${componentName} 的 prop ${prop} 类型不匹配`,
            suggestion: `期望类型: ${expectedType}, 实际类型: ${actualType}`
          })
        }
      }
    })
    
    return rules
  }
  
  // 获取组件必需的props
  static getRequiredProps(componentName: string): string[] {
    const requiredPropsMap: Record<string, string[]> = {
      'Button': ['children'],
      'Input': ['type'],
      'Card': ['children'],
      'Badge': ['children'],
      'Modal': ['isOpen', 'onClose'],
      'Form': ['onSubmit'],
      'Table': ['data', 'columns'],
      'Chart': ['data'],
      'Navigation': ['items'],
      'Layout': ['children']
    }
    
    return requiredPropsMap[componentName] || []
  }
  
  // 获取组件已废弃的props
  static getDeprecatedProps(componentName: string): string[] {
    const deprecatedPropsMap: Record<string, string[]> = {
      'Button': ['onClick'], // 建议使用 onAction
      'Input': ['onChange'], // 建议使用 onValueChange
      'Card': ['onClick'], // 建议使用 onAction
      'Modal': ['onClose'], // 建议使用 onAction
      'Form': ['onSubmit'], // 建议使用 onAction
      'Table': ['onRowClick'], // 建议使用 onAction
      'Chart': ['onClick'], // 建议使用 onAction
      'Navigation': ['onItemClick'], // 建议使用 onAction
      'Layout': ['onResize'] // 建议使用 onAction
    }
    
    return deprecatedPropsMap[componentName] || []
  }
  
  // 获取组件props类型
  static getPropTypes(componentName: string): Record<string, string> {
    const propTypesMap: Record<string, Record<string, string>> = {
      'Button': {
        'variant': 'string',
        'size': 'string',
        'disabled': 'boolean',
        'children': 'string'
      },
      'Input': {
        'type': 'string',
        'placeholder': 'string',
        'value': 'string',
        'disabled': 'boolean'
      },
      'Card': {
        'title': 'string',
        'children': 'string',
        'elevated': 'boolean'
      },
      'Badge': {
        'variant': 'string',
        'size': 'string',
        'children': 'string'
      },
      'Modal': {
        'isOpen': 'boolean',
        'title': 'string',
        'children': 'string'
      },
      'Form': {
        'onSubmit': 'function',
        'children': 'string'
      },
      'Table': {
        'data': 'object',
        'columns': 'object',
        'loading': 'boolean'
      },
      'Chart': {
        'data': 'object',
        'type': 'string',
        'height': 'number'
      },
      'Navigation': {
        'items': 'object',
        'activeItem': 'string'
      },
      'Layout': {
        'children': 'string',
        'sidebar': 'boolean'
      }
    }
    
    return propTypesMap[componentName] || {}
  }
  
  // 获取组件使用建议
  static getUsageSuggestions(componentName: string): string[] {
    const suggestionsMap: Record<string, string[]> = {
      'Button': [
        '使用 variant 属性控制按钮样式',
        '使用 size 属性控制按钮大小',
        '使用 disabled 属性禁用按钮',
        '建议使用 onAction 而不是 onClick'
      ],
      'Input': [
        '使用 type 属性指定输入类型',
        '使用 placeholder 属性提供占位符',
        '使用 value 属性控制输入值',
        '建议使用 onValueChange 而不是 onChange'
      ],
      'Card': [
        '使用 title 属性设置卡片标题',
        '使用 elevated 属性添加阴影效果',
        '建议使用 onAction 而不是 onClick'
      ],
      'Badge': [
        '使用 variant 属性控制徽章样式',
        '使用 size 属性控制徽章大小',
        '建议使用语义化的 variant 值'
      ],
      'Modal': [
        '使用 isOpen 属性控制模态框显示',
        '使用 title 属性设置模态框标题',
        '建议使用 onAction 而不是 onClose'
      ],
      'Form': [
        '使用 onSubmit 属性处理表单提交',
        '建议使用 onAction 而不是 onSubmit',
        '建议使用统一的表单验证'
      ],
      'Table': [
        '使用 data 属性提供表格数据',
        '使用 columns 属性定义表格列',
        '使用 loading 属性显示加载状态',
        '建议使用 onAction 而不是 onRowClick'
      ],
      'Chart': [
        '使用 data 属性提供图表数据',
        '使用 type 属性指定图表类型',
        '使用 height 属性设置图表高度',
        '建议使用 onAction 而不是 onClick'
      ],
      'Navigation': [
        '使用 items 属性提供导航项',
        '使用 activeItem 属性设置当前项',
        '建议使用 onAction 而不是 onItemClick'
      ],
      'Layout': [
        '使用 children 属性设置布局内容',
        '使用 sidebar 属性控制侧边栏显示',
        '建议使用响应式布局'
      ]
    }
    
    return suggestionsMap[componentName] || []
  }
  
  // 验证组件使用
  static validateUsage(componentName: string, props: any): {
    isValid: boolean
    rules: SimpleUsageRule[]
    suggestions: string[]
  } {
    const rules = this.checkUsageRules(componentName, props)
    const suggestions = this.getUsageSuggestions(componentName)
    
    return {
      isValid: rules.filter(rule => rule.type === 'error').length === 0,
      rules,
      suggestions
    }
  }
  
  // 生成使用报告
  static generateUsageReport(components: Array<{name: string, props: any}>): {
    totalComponents: number
    validComponents: number
    invalidComponents: number
    totalErrors: number
    totalWarnings: number
    componentReports: Array<{
      name: string
      isValid: boolean
      errors: number
      warnings: number
      rules: SimpleUsageRule[]
    }>
  } {
    const report = {
      totalComponents: components.length,
      validComponents: 0,
      invalidComponents: 0,
      totalErrors: 0,
      totalWarnings: 0,
      componentReports: [] as Array<{
        name: string
        isValid: boolean
        errors: number
        warnings: number
        rules: SimpleUsageRule[]
      }>
    }
    
    components.forEach(({ name, props }) => {
      const validation = this.validateUsage(name, props)
      const errors = validation.rules.filter(rule => rule.type === 'error').length
      const warnings = validation.rules.filter(rule => rule.type === 'warning').length
      
      if (validation.isValid) {
        report.validComponents++
      } else {
        report.invalidComponents++
      }
      
      report.totalErrors += errors
      report.totalWarnings += warnings
      
      report.componentReports.push({
        name,
        isValid: validation.isValid,
        errors,
        warnings,
        rules: validation.rules
      })
    })
    
    return report
  }
}

// 导出便捷函数
export const validateUsage = SimplifiedComponentGuide.validateUsage
export const getUsageSuggestions = SimplifiedComponentGuide.getUsageSuggestions
export const generateUsageReport = SimplifiedComponentGuide.generateUsageReport