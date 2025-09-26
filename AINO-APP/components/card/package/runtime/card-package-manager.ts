import { CardRegistry } from "../../core/registry"
import type { CardPackageConfig } from "./card-package-config"
import { CARD_PACKAGES } from "./card-package-config"

export class CardPackageManager {
  private static packages = new Map<string, CardPackageConfig>()
  private static subCardToPackage = new Map<string, string>()

  /**
   * 注册卡片包
   */
  static registerPackage(packageConfig: CardPackageConfig) {
    this.packages.set(packageConfig.packageId, packageConfig)

    // 建立子卡片到包的映射关系
    packageConfig.subCards.forEach(subCard => {
      this.subCardToPackage.set(subCard.cardId, packageConfig.packageId)
    })
  }

  /**
   * 获取所有卡片包
   */
  static getAllPackages(): CardPackageConfig[] {
    return Array.from(this.packages.values())
  }

  /**
   * 获取主卡片列表（用于卡片选择器显示）
   */
  static getMainCards() {
    const mainCards = Array.from(this.packages.values()).map(pkg => {
      // 从注册表获取实际的组件
      const registeredCard = CardRegistry.get(pkg.mainCard.cardId)
      return {
        id: pkg.mainCard.cardId,
        name: pkg.packageName,
        category: pkg.packageCategory,
        component: registeredCard?.component || pkg.mainCard.component,
        businessFlow: pkg.businessFlow,
        developer: pkg.developer,
        packageId: pkg.packageId,
        hasSubCards: pkg.subCards.length > 0,
        hasDetailPage: pkg.detailPage?.enabled || false,
        hasModal: pkg.modal?.enabled || false
      }
    })
    return mainCards
  }

  /**
   * 根据主卡片ID获取子卡片列表
   */
  static getSubCardsByMainCard(mainCardId: string): Array<{
    id: string
    name: string
    component: React.ComponentType<any>
    type?: string
    category?: string
  }> {
    const pkg = Array.from(this.packages.values()).find(
      p => p.mainCard.cardId === mainCardId
    )

    if (!pkg) return []

    return pkg.subCards.map(subCard => {
      const registeredCard = CardRegistry.get(subCard.cardId)
      return {
        packageId: subCard.packageId,
        id: subCard.cardId,
        name: subCard.displayName,
        component: registeredCard?.component || null,
        type: subCard.type,
        category: subCard.category
      }
    }).filter(card => card.component !== null)
  }

  /**
   * 检查是否是主卡片
   */
  static isMainCard(cardId: string): boolean {
    return Array.from(this.packages.values()).some(
      pkg => pkg.mainCard.cardId === cardId
    )
  }

  /**
   * 检查是否是子卡片
   */
  static isSubCard(cardId: string): boolean {
    return this.subCardToPackage.has(cardId)
  }

  /**
   * 根据子卡片ID获取所属包
   */
  static getPackageBySubCard(cardId: string): CardPackageConfig | null {
    const packageId = this.subCardToPackage.get(cardId)
    return packageId ? this.packages.get(packageId) || null : null
  }

  /**
   * 获取卡片包信息
   */
  static getPackage(packageId: string): CardPackageConfig | null {
    return this.packages.get(packageId) || null
  }

  /**
   * 检查卡片是否支持详情页
   */
  static supportsDetailPage(cardId: string): boolean {
    const pkg = this.getPackageByMainCard(cardId)
    return pkg?.detailPage?.enabled || false
  }

  /**
   * 检查卡片是否支持弹窗
   */
  static supportsModal(cardId: string): boolean {
    const pkg = this.getPackageByMainCard(cardId)
    return pkg?.modal?.enabled || false
  }

  /**
   * 获取卡片详情页路由
   */
  static getDetailPageRoute(cardId: string): string | null {
    const pkg = this.getPackageByMainCard(cardId)
    return pkg?.detailPage?.route || null
  }

  /**
   * 根据主卡片ID获取卡片包
   */
  static getPackageByMainCard(mainCardId: string): CardPackageConfig | null {
    return Array.from(this.packages.values()).find(
      pkg => pkg.mainCard.cardId === mainCardId
    ) || null
  }

  /**
   * 初始化所有卡片包
   */
  static initializePackages() {
    // 注册所有预定义的卡片包
    Object.values(CARD_PACKAGES).forEach(packageConfig => {
      // 从 CardRegistry 获取主卡片组件
      const mainCardRegistration = CardRegistry.get(packageConfig.mainCard.cardId)
      if (mainCardRegistration) {
        packageConfig.mainCard.component = mainCardRegistration.component
      }

      this.registerPackage(packageConfig)
    })

  }
}

// 自动初始化卡片包
CardPackageManager.initializePackages()
