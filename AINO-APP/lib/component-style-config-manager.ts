import type { ComponentStyleConfig } from "@/types"

export class ComponentStyleConfigManager {
  private config: ComponentStyleConfig
  private subscribers: Set<(config: ComponentStyleConfig) => void>

  constructor(initialConfig: ComponentStyleConfig) {
    this.config = initialConfig
    this.subscribers = new Set()
  }

  // 获取配置
  getConfig(path: string): any {
    return this.getNestedValue(this.config, path)
  }

  // 设置配置
  setConfig(path: string, value: any): void {
    this.setNestedValue(this.config, path, value)
    this.notifySubscribers()
  }

  // 批量更新配置
  updateConfig(updates: Partial<ComponentStyleConfig>): void {
    this.config = { ...this.config, ...updates }
    this.notifySubscribers()
  }

  // 获取所有配置
  getAllConfig(): ComponentStyleConfig {
    return this.config
  }

  // 订阅配置变化
  subscribe(callback: (config: ComponentStyleConfig) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // 生成 CSS 变量
  generateCSSVariables(): string {
    return this.generateCSSFromConfig(this.config)
  }

  // 导出配置
  export(format: 'json' | 'css'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.config, null, 2)
      case 'css':
        return this.generateCSSVariables()
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  // 从路径获取嵌套值
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  // 设置嵌套值
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {}
      }
      return current[key]
    }, obj)
    target[lastKey] = value
  }

  // 通知订阅者
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.config))
  }

  // 生成 CSS 变量
  private generateCSSFromConfig(config: ComponentStyleConfig): string {
    const cssVariables: string[] = []
    
    // 按钮样式变量
    this.generateButtonCSS(config.button, cssVariables)
    
    // 输入框样式变量
    this.generateInputCSS(config.input, cssVariables)
    
    // 卡片样式变量
    this.generateCardCSS(config.card, cssVariables)
    
    // 导航样式变量
    this.generateNavigationCSS(config.navigation, cssVariables)
    
    // 标签样式变量
    this.generateTagCSS(config.tag, cssVariables)

    return `:root {\n  ${cssVariables.join('\n  ')}\n}`
  }

  // 生成按钮 CSS 变量
  private generateButtonCSS(buttonConfig: any, cssVariables: string[]): void {
    // 基础样式
    Object.entries(buttonConfig.base).forEach(([key, value]) => {
      cssVariables.push(`--button-${key}: ${value};`)
    })

    // 变体样式
    Object.entries(buttonConfig.variants).forEach(([variant, variantConfig]: [string, any]) => {
      Object.entries(variantConfig).forEach(([key, value]) => {
        if (key === 'hover' || key === 'active' || key === 'disabled') {
          Object.entries(value as any).forEach(([subKey, subValue]) => {
            cssVariables.push(`--button-${variant}-${key}-${subKey}: ${subValue};`)
          })
        } else {
          cssVariables.push(`--button-${variant}-${key}: ${value};`)
        }
      })
    })

    // 尺寸样式
    Object.entries(buttonConfig.sizes).forEach(([size, sizeConfig]: [string, any]) => {
      Object.entries(sizeConfig).forEach(([key, value]) => {
        cssVariables.push(`--button-${size}-${key}: ${value};`)
      })
    })
  }

  // 生成输入框 CSS 变量
  private generateInputCSS(inputConfig: any, cssVariables: string[]): void {
    // 基础样式
    Object.entries(inputConfig.base).forEach(([key, value]) => {
      cssVariables.push(`--input-${key}: ${value};`)
    })

    // 状态样式
    Object.entries(inputConfig.states).forEach(([state, stateConfig]: [string, any]) => {
      Object.entries(stateConfig).forEach(([key, value]) => {
        cssVariables.push(`--input-${state}-${key}: ${value};`)
      })
    })

    // 尺寸样式
    Object.entries(inputConfig.sizes).forEach(([size, sizeConfig]: [string, any]) => {
      Object.entries(sizeConfig).forEach(([key, value]) => {
        cssVariables.push(`--input-${size}-${key}: ${value};`)
      })
    })
  }

  // 生成卡片 CSS 变量
  private generateCardCSS(cardConfig: any, cssVariables: string[]): void {
    // 基础样式
    Object.entries(cardConfig.base).forEach(([key, value]) => {
      cssVariables.push(`--card-${key}: ${value};`)
    })

    // 变体样式
    Object.entries(cardConfig.variants).forEach(([variant, variantConfig]: [string, any]) => {
      Object.entries(variantConfig).forEach(([key, value]) => {
        cssVariables.push(`--card-${variant}-${key}: ${value};`)
      })
    })

    // 尺寸样式
    Object.entries(cardConfig.sizes).forEach(([size, sizeConfig]: [string, any]) => {
      Object.entries(sizeConfig).forEach(([key, value]) => {
        cssVariables.push(`--card-${size}-${key}: ${value};`)
      })
    })
  }

  // 生成导航 CSS 变量
  private generateNavigationCSS(navConfig: any, cssVariables: string[]): void {
    // 基础样式
    Object.entries(navConfig.base).forEach(([key, value]) => {
      cssVariables.push(`--nav-${key}: ${value};`)
    })

    // 导航项样式
    Object.entries(navConfig.item.base).forEach(([key, value]) => {
      cssVariables.push(`--nav-item-${key}: ${value};`)
    })

    // 导航项状态样式
    Object.entries(navConfig.item.states).forEach(([state, stateConfig]: [string, any]) => {
      Object.entries(stateConfig).forEach(([key, value]) => {
        cssVariables.push(`--nav-item-${state}-${key}: ${value};`)
      })
    })

    // 下拉菜单样式
    Object.entries(navConfig.dropdown).forEach(([key, value]) => {
      cssVariables.push(`--nav-dropdown-${key}: ${value};`)
    })
  }

  // 生成标签 CSS 变量
  private generateTagCSS(tagConfig: any, cssVariables: string[]): void {
    // 基础样式
    Object.entries(tagConfig.base).forEach(([key, value]) => {
      cssVariables.push(`--tag-${key}: ${value};`)
    })

    // 变体样式
    Object.entries(tagConfig.variants).forEach(([variant, variantConfig]: [string, any]) => {
      Object.entries(variantConfig).forEach(([key, value]) => {
        cssVariables.push(`--tag-${variant}-${key}: ${value};`)
      })
    })

    // 尺寸样式
    Object.entries(tagConfig.sizes).forEach(([size, sizeConfig]: [string, any]) => {
      Object.entries(sizeConfig).forEach(([key, value]) => {
        cssVariables.push(`--tag-${size}-${key}: ${value};`)
      })
    })
  }
}
