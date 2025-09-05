import type React from "react"
import { CardRegistry } from "./registry"
import type { CardConfig } from "@/types"

export class CardPluginHelper {
  static createCard(config: CardConfig) {
    CardRegistry.register(config)
    return config.component
  }

  static useCardTheme() {
    // 返回当前主题配置，供卡片使用
    return {
      titleColor: "var(--card-title-color)",
      textColor: "var(--card-text-color)",
      // 其他主题变量
    }
  }

  static useCardActions(cardName: string) {
    return {
      navigate: (path: string) => CardRegistry.executeAction(cardName, { type: "navigate", target: path }),
      openModal: (content: React.ReactNode, title?: string) =>
        CardRegistry.executeAction(cardName, {
          type: "modal",
          data: { content, title },
        }),
      custom: (action: string, data: any) =>
        CardRegistry.executeAction(cardName, {
          type: "custom",
          target: action,
          data,
        }),
    }
  }

  static getRegisteredCards() {
    return CardRegistry.getAll()
  }

  static getCardsByCategory(category: string) {
    return CardRegistry.getByCategory(category)
  }

  static getCardsByType(type: string) {
    return CardRegistry.getByType(type)
  }

  static getCardsByCategoryAndType(category: string, type: string) {
    return CardRegistry.getByCategoryAndType(category, type)
  }

  static getAllCardTypes() {
    return CardRegistry.getAllTypes()
  }

  static getTypesByCategory(category: string) {
    return CardRegistry.getTypesByCategory(category)
  }
}

// 便捷的 Hook 函数
export function useCardActions(cardName: string) {
  return CardPluginHelper.useCardActions(cardName)
}

export function useCardThemeVariables() {
  return CardPluginHelper.useCardTheme()
}

export function useCardsByType(type: string) {
  return CardPluginHelper.getCardsByType(type)
}

export function useCardsByCategoryAndType(category: string, type: string) {
  return CardPluginHelper.getCardsByCategoryAndType(category, type)
}

export function useCardTypes() {
  return CardPluginHelper.getAllCardTypes()
}
