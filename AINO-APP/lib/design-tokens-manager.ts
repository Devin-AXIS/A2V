import type { DesignTokens } from "@/types"

export class DesignTokensManager {
  private tokens: DesignTokens
  private subscribers: Set<(tokens: DesignTokens) => void>

  constructor(initialTokens: DesignTokens) {
    this.tokens = initialTokens
    this.subscribers = new Set()
  }

  // 获取令牌
  getToken(path: string): any {
    return this.getNestedValue(this.tokens, path)
  }

  // 设置令牌
  setToken(path: string, value: any): void {
    this.setNestedValue(this.tokens, path, value)
    this.notifySubscribers()
  }

  // 批量更新令牌
  updateTokens(updates: Partial<DesignTokens>): void {
    this.tokens = { ...this.tokens, ...updates }
    this.notifySubscribers()
  }

  // 获取所有令牌
  getAllTokens(): DesignTokens {
    return this.tokens
  }

  // 订阅令牌变化
  subscribe(callback: (tokens: DesignTokens) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // 生成 CSS 变量
  generateCSSVariables(): string {
    return this.generateCSSFromTokens(this.tokens)
  }

  // 导出配置
  export(format: 'json' | 'css' | 'scss'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.tokens, null, 2)
      case 'css':
        return this.generateCSSVariables()
      case 'scss':
        return this.generateSCSSFromTokens(this.tokens)
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
    this.subscribers.forEach(callback => callback(this.tokens))
  }

  // 生成 CSS 变量
  private generateCSSFromTokens(tokens: DesignTokens): string {
    const cssVariables: string[] = []
    
    // 颜色变量
    Object.entries(tokens.colors).forEach(([category, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([key, colorValue]) => {
          if (typeof colorValue === 'object' && colorValue !== null) {
            // 处理颜色刻度
            Object.entries(colorValue).forEach(([scale, scaleValue]) => {
              cssVariables.push(`--color-${category}-${key}-${scale}: ${scaleValue};`)
            })
          } else {
            cssVariables.push(`--color-${category}-${key}: ${colorValue};`)
          }
        })
      }
    })

    // 字体变量
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      cssVariables.push(`--font-family-${key}: ${value};`)
    })

    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      cssVariables.push(`--font-size-${key}: ${value};`)
    })

    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      cssVariables.push(`--font-weight-${key}: ${value};`)
    })

    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      cssVariables.push(`--line-height-${key}: ${value};`)
    })

    // 间距变量
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      cssVariables.push(`--spacing-${key}: ${value};`)
    })

    // 圆角变量
    Object.entries(tokens.radius).forEach(([key, value]) => {
      cssVariables.push(`--radius-${key}: ${value};`)
    })

    // 阴影变量
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      cssVariables.push(`--shadow-${key}: ${value};`)
    })

    // 边框变量
    Object.entries(tokens.borders.width).forEach(([key, value]) => {
      cssVariables.push(`--border-width-${key}: ${value};`)
    })

    Object.entries(tokens.borders.style).forEach(([key, value]) => {
      cssVariables.push(`--border-style-${key}: ${value};`)
    })

    return `:root {\n  ${cssVariables.join('\n  ')}\n}`
  }

  // 生成 SCSS 变量
  private generateSCSSFromTokens(tokens: DesignTokens): string {
    const scssVariables: string[] = []
    
    // 颜色变量
    Object.entries(tokens.colors).forEach(([category, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([key, colorValue]) => {
          if (typeof colorValue === 'object' && colorValue !== null) {
            // 处理颜色刻度
            Object.entries(colorValue).forEach(([scale, scaleValue]) => {
              scssVariables.push(`$color-${category}-${key}-${scale}: ${scaleValue};`)
            })
          } else {
            scssVariables.push(`$color-${category}-${key}: ${colorValue};`)
          }
        })
      }
    })

    // 字体变量
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      scssVariables.push(`$font-family-${key}: ${value};`)
    })

    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      scssVariables.push(`$font-size-${key}: ${value};`)
    })

    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      scssVariables.push(`$font-weight-${key}: ${value};`)
    })

    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      scssVariables.push(`$line-height-${key}: ${value};`)
    })

    // 间距变量
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      scssVariables.push(`$spacing-${key}: ${value};`)
    })

    // 圆角变量
    Object.entries(tokens.radius).forEach(([key, value]) => {
      scssVariables.push(`$radius-${key}: ${value};`)
    })

    // 阴影变量
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      scssVariables.push(`$shadow-${key}: ${value};`)
    })

    // 边框变量
    Object.entries(tokens.borders.width).forEach(([key, value]) => {
      scssVariables.push(`$border-width-${key}: ${value};`)
    })

    Object.entries(tokens.borders.style).forEach(([key, value]) => {
      scssVariables.push(`$border-style-${key}: ${value};`)
    })

    return scssVariables.join('\n')
  }
}
