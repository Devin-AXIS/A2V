import type { CardThemeConfig } from "@/types"

/**
 * 卡片布局约束系统
 * 确保拖拽功能符合"卡片是内容承载"的架构原则
 */
export class CardLayoutConstraints {
  private static instance: CardLayoutConstraints
  private cardTheme: CardThemeConfig | null = null

  private constructor() {}

  static getInstance(): CardLayoutConstraints {
    if (!CardLayoutConstraints.instance) {
      CardLayoutConstraints.instance = new CardLayoutConstraints()
    }
    return CardLayoutConstraints.instance
  }

  /**
   * 设置卡片主题配置
   */
  setCardTheme(cardTheme: CardThemeConfig) {
    this.cardTheme = cardTheme
  }

  /**
   * 验证卡片布局是否遵循架构原则
   */
  validateCardLayout(componentName: string, props: any): {
    isValid: boolean
    violations: string[]
    recommendations: string[]
  } {
    const violations: string[] = []
    const recommendations: string[] = []

    // 1. 检查卡片是否作为内容承载
    this.validateCardAsContentCarrier(componentName, props, violations, recommendations)
    
    // 2. 检查组件是否专注于功能
    this.validateComponentFocus(componentName, props, violations, recommendations)
    
    // 3. 检查主次关系是否明确
    this.validateMasterSlaveRelationship(componentName, props, violations, recommendations)

    return {
      isValid: violations.length === 0,
      violations,
      recommendations
    }
  }

  /**
   * 验证卡片是否作为内容承载
   */
  private validateCardAsContentCarrier(
    componentName: string, 
    props: any, 
    violations: string[], 
    recommendations: string[]
  ) {
    // 检查组件是否自带卡片容器
    if (this.hasOwnCardContainer(props)) {
      violations.push(`组件 ${componentName} 自带卡片容器，违反"卡片是内容承载"原则`)
      recommendations.push('移除内部卡片容器，让调用方提供AppCard')
    }

    // 检查是否专注于内容展示
    if (!this.focusesOnContent(props)) {
      violations.push(`组件 ${componentName} 没有专注于内容展示`)
      recommendations.push('组件应该只负责数据展示，不处理布局和容器')
    }
  }

  /**
   * 验证组件是否专注于功能
   */
  private validateComponentFocus(
    componentName: string, 
    props: any, 
    violations: string[], 
    recommendations: string[]
  ) {
    // 检查组件是否包含过多职责
    if (this.hasMultipleResponsibilities(props)) {
      violations.push(`组件 ${componentName} 职责过多，违反单一职责原则`)
      recommendations.push('将组件拆分为更小的、职责单一的组件')
    }

    // 检查是否包含布局逻辑
    if (this.containsLayoutLogic(props)) {
      violations.push(`组件 ${componentName} 包含布局逻辑，应该由卡片容器处理`)
      recommendations.push('移除布局逻辑，专注于功能实现')
    }
  }

  /**
   * 验证主次关系是否明确
   */
  private validateMasterSlaveRelationship(
    componentName: string, 
    props: any, 
    violations: string[], 
    recommendations: string[]
  ) {
    // 检查是否明确自己是次要组件
    if (!this.acknowledgesAsSlave(props)) {
      violations.push(`组件 ${componentName} 没有明确自己的次要地位`)
      recommendations.push('组件应该明确自己是内容提供者，不是容器管理者')
    }

    // 检查是否接受外部控制
    if (!this.acceptsExternalControl(props)) {
      violations.push(`组件 ${componentName} 不接受外部控制，违反主次关系`)
      recommendations.push('组件应该接受className、style等外部控制属性')
    }
  }

  /**
   * 获取卡片布局推荐配置
   */
  getCardLayoutRecommendations(): {
    containerPattern: string
    componentPattern: string
    relationshipPattern: string
  } {
    return {
      containerPattern: `
        // ✅ 正确：调用方提供卡片容器
        <AppCard className="p-6">
          <DataComponent data={data} />
        </AppCard>
      `,
      componentPattern: `
        // ✅ 正确：组件专注于功能
        export function DataComponent({ data, className }) {
          return (
            <div className={className}>
              {/* 只包含数据展示逻辑 */}
            </div>
          )
        }
      `,
      relationshipPattern: `
        // ✅ 正确：主次关系明确
        // 主要：AppCard (容器、样式、布局)
        // 次要：DataComponent (功能、数据)
      `
    }
  }

  // 辅助方法
  private hasOwnCardContainer(props: any): boolean {
    // 检查是否包含卡片相关的props
    return props.hasOwnProperty('cardProps') || 
           props.hasOwnProperty('cardStyle') ||
           props.hasOwnProperty('cardTheme')
  }

  private focusesOnContent(props: any): boolean {
    // 检查是否专注于内容
    return props.hasOwnProperty('data') || 
           props.hasOwnProperty('content') ||
           props.hasOwnProperty('children')
  }

  private hasMultipleResponsibilities(props: any): boolean {
    // 检查职责是否过多
    const responsibilityKeys = ['data', 'layout', 'styling', 'navigation', 'validation']
    return responsibilityKeys.filter(key => props.hasOwnProperty(key)).length > 2
  }

  private containsLayoutLogic(props: any): boolean {
    // 检查是否包含布局逻辑
    const layoutKeys = ['position', 'size', 'grid', 'flex', 'layout']
    return layoutKeys.some(key => props.hasOwnProperty(key))
  }

  private acknowledgesAsSlave(props: any): boolean {
    // 检查是否承认次要地位
    return props.hasOwnProperty('className') || 
           props.hasOwnProperty('style') ||
           props.hasOwnProperty('onClick')
  }

  private acceptsExternalControl(props: any): boolean {
    // 检查是否接受外部控制
    return props.hasOwnProperty('className') || 
           props.hasOwnProperty('style') ||
           props.hasOwnProperty('theme')
  }
}

// 导出单例实例
export const cardLayoutConstraints = CardLayoutConstraints.getInstance()

// 导出便捷函数
export function validateCardLayout(componentName: string, props: any) {
  return cardLayoutConstraints.validateCardLayout(componentName, props)
}

export function getCardLayoutRecommendations() {
  return cardLayoutConstraints.getCardLayoutRecommendations()
}
