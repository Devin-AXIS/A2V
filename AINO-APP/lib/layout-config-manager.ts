import type { LayoutConfig } from "@/types"

export class LayoutConfigManager {
  private config: LayoutConfig
  private subscribers: Set<(config: LayoutConfig) => void>

  constructor(initialConfig: LayoutConfig) {
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
  updateConfig(updates: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...updates }
    this.notifySubscribers()
  }

  // 获取所有配置
  getAllConfig(): LayoutConfig {
    return this.config
  }

  // 订阅配置变化
  subscribe(callback: (config: LayoutConfig) => void): () => void {
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
  private generateCSSFromConfig(config: LayoutConfig): string {
    const cssVariables: string[] = []
    
    // 页面布局变量
    cssVariables.push(`--layout-sidebar-width: ${config.pageLayout.sidebar.width}px;`)
    cssVariables.push(`--layout-sidebar-collapsed-width: ${config.pageLayout.sidebar.collapsedWidth}px;`)
    cssVariables.push(`--layout-header-height: ${config.pageLayout.header.height}px;`)
    cssVariables.push(`--layout-footer-height: ${config.pageLayout.footer.height}px;`)
    cssVariables.push(`--layout-content-max-width: ${config.pageLayout.content.maxWidth}px;`)
    cssVariables.push(`--layout-content-padding: ${config.pageLayout.content.padding}px;`)

    // 网格系统变量
    cssVariables.push(`--grid-columns: ${config.gridSystem.columns};`)
    cssVariables.push(`--grid-gutter: ${config.gridSystem.gutter}px;`)
    cssVariables.push(`--grid-margin: ${config.gridSystem.margin}px;`)

    // 断点变量
    Object.entries(config.gridSystem.breakpoints).forEach(([breakpoint, value]) => {
      cssVariables.push(`--breakpoint-${breakpoint}: ${value}px;`)
    })

    // 容器变量
    Object.entries(config.containers).forEach(([size, value]) => {
      if (typeof value === 'number') {
        cssVariables.push(`--container-${size}: ${value}px;`)
      } else {
        cssVariables.push(`--container-${size}: ${value};`)
      }
    })

    // 间距变量
    Object.entries(config.spacing).forEach(([size, value]) => {
      cssVariables.push(`--spacing-${size}: ${value}px;`)
    })

    return `:root {\n  ${cssVariables.join('\n  ')}\n}`
  }
}
