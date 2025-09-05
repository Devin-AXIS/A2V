import { useState, useCallback, useMemo } from "react"
import { validateCardLayout } from "@/lib/card-layout-constraints"

/**
 * 卡片布局配置接口
 */
export interface CardLayoutConfig {
  id: string
  type: string
  position: { x: number; y: number }
  size: { w: number; h: number }
  content: any
  theme?: string
  className?: string
}

/**
 * 卡片布局管理Hook
 * 遵循"卡片是内容承载"的架构原则
 */
export function useCardLayoutManager() {
  // 卡片布局状态
  const [cards, setCards] = useState<CardLayoutConfig[]>([])
  
  // 布局模式
  const [layoutMode, setLayoutMode] = useState<'grid' | 'flex' | 'absolute'>('grid')
  
  // 网格配置
  const [gridConfig, setGridConfig] = useState({
    columns: 12,
    rowHeight: 80,
    gap: 16
  })

  /**
   * 添加卡片 - 遵循架构原则
   */
  const addCard = useCallback((config: Omit<CardLayoutConfig, 'id'>) => {
    const newCard: CardLayoutConfig = {
      ...config,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    // 验证卡片配置是否符合架构原则
    const validation = validateCardLayout(newCard.type, newCard)
    if (!validation.isValid) {
      console.warn(`卡片 ${newCard.type} 违反架构原则:`, validation.violations)
      console.log('建议:', validation.recommendations)
    }
    
    setCards(prev => [...prev, newCard])
  }, [])

  /**
   * 移动卡片 - 只处理位置，不处理内容
   */
  const moveCard = useCallback((id: string, position: { x: number; y: number }) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, position } : card
    ))
  }, [])

  /**
   * 调整卡片大小 - 只处理尺寸，不处理内容
   */
  const resizeCard = useCallback((id: string, size: { w: number; h: number }) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, size } : card
    ))
  }, [])

  /**
   * 删除卡片
   */
  const removeCard = useCallback((id: string) => {
    setCards(prev => prev.filter(card => card.id !== id))
  }, [])

  /**
   * 更新卡片内容 - 遵循"组件专注于功能"原则
   */
  const updateCardContent = useCallback((id: string, content: any) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, content } : card
    ))
  }, [])

  /**
   * 更新卡片主题 - 通过统一配置系统
   */
  const updateCardTheme = useCallback((id: string, theme: string) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, theme } : card
    ))
  }, [])

  /**
   * 获取卡片布局 - 用于渲染
   */
  const getCardLayout = useMemo(() => {
    return cards.map(card => ({
      ...card,
      // 计算实际像素位置
      pixelPosition: {
        x: card.position.x * gridConfig.gap + (card.position.x * gridConfig.rowHeight),
        y: card.position.y * gridConfig.gap + (card.position.y * gridConfig.rowHeight)
      },
      // 计算实际像素尺寸
      pixelSize: {
        width: card.size.w * gridConfig.rowHeight + (card.size.w - 1) * gridConfig.gap,
        height: card.size.h * gridConfig.rowHeight + (card.size.h - 1) * gridConfig.gap
      }
    }))
  }, [cards, gridConfig])

  /**
   * 验证整个布局是否符合架构原则
   */
  const validateLayout = useCallback(() => {
    const violations: string[] = []
    const recommendations: string[] = []

    cards.forEach(card => {
      const validation = validateCardLayout(card.type, card)
      if (!validation.isValid) {
        violations.push(...validation.violations)
        recommendations.push(...validation.recommendations)
      }
    })

    return {
      isValid: violations.length === 0,
      violations,
      recommendations
    }
  }, [cards])

  /**
   * 导出布局配置
   */
  const exportLayout = useCallback(() => {
    return {
      layoutMode,
      gridConfig,
      cards: cards.map(({ id, type, position, size, theme, className }) => ({
        id, type, position, size, theme, className
      }))
    }
  }, [layoutMode, gridConfig, cards])

  /**
   * 导入布局配置
   */
  const importLayout = useCallback((config: any) => {
    if (config.layoutMode) setLayoutMode(config.layoutMode)
    if (config.gridConfig) setGridConfig(config.gridConfig)
    if (config.cards) setCards(config.cards)
  }, [])

  return {
    // 状态
    cards,
    layoutMode,
    gridConfig,
    cardLayout: getCardLayout,
    
    // 操作方法
    addCard,
    moveCard,
    resizeCard,
    removeCard,
    updateCardContent,
    updateCardTheme,
    
    // 布局管理
    setLayoutMode,
    setGridConfig,
    
    // 验证和导出
    validateLayout,
    exportLayout,
    importLayout
  }
}
