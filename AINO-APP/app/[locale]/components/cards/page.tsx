"use client"

import React, { useState, useMemo } from 'react'
import { BrowserHeader } from '@/components/layout/browser-header'
import { AppCard } from '@/components/layout/app-card'
import { FilterTabs, type FilterTabItem } from '@/components/navigation/filter-tabs'
import { CardRegistry } from '@/components/card/registry'
import { useCardTheme } from '@/components/providers/card-theme-provider'
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  ShoppingCart,
  BookOpen,
  Briefcase,
  Image,
  TrendingUp,
  Globe
} from 'lucide-react'

interface CardsPageProps {
  params: { locale: string }
}

export default function CardsPage({ params }: CardsPageProps) {
  const [activeCategory, setActiveCategory] = useState('全部卡片')
  const { theme } = useCardTheme()

  // 获取所有注册的卡片
  const allCards = CardRegistry.getAll()
  
  // 定义分类导航，使用您现有的FilterTabs格式
  const categoryItems: FilterTabItem[] = [
    { label: '全部卡片', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: '教育卡片', icon: <BookOpen className="w-4 h-4" /> },
    { label: '功能卡片', icon: <Briefcase className="w-4 h-4" /> },
    { label: '内容卡片', icon: <BarChart3 className="w-4 h-4" /> },
    { label: '媒体卡片', icon: <Image className="w-4 h-4" /> },
    { label: '数据卡片', icon: <TrendingUp className="w-4 h-4" /> },
    { label: '社交卡片', icon: <Users className="w-4 h-4" /> },
    { label: '电商卡片', icon: <ShoppingCart className="w-4 h-4" /> },
    { label: '招聘卡片', icon: <Briefcase className="w-4 h-4" /> },
    { label: '零售卡片', icon: <ShoppingCart className="w-4 h-4" /> },
    { label: '旅行卡片', icon: <Globe className="w-4 h-4" /> },
    { label: '基础卡片', icon: <LayoutDashboard className="w-4 h-4" /> }
  ]

  // 过滤卡片 - 修复分类匹配问题
  const filteredCards = useMemo(() => {
    if (activeCategory === '全部卡片') return allCards
    
    const categoryMap: Record<string, string> = {
      '教育卡片': '教育',
      '功能卡片': '功能',
      '内容卡片': '内容',
      '媒体卡片': '媒体',
      '数据卡片': '数据',
      '社交卡片': '社交',
      '电商卡片': '电商',
      '招聘卡片': '招聘',
      '零售卡片': '零售',
      '旅行卡片': '旅行',
      '基础卡片': '基础'
    }
    
    const targetCategory = categoryMap[activeCategory]
    if (!targetCategory) return allCards
    
    return allCards.filter(card => card.category === targetCategory)
  }, [allCards, activeCategory])

  return (
    <div className="min-h-screen pb-32">
      <BrowserHeader title="卡片库" />

      <div className="px-4 pt-4">
        {/* 页面标题和描述 */}
        <AppCard 
          className="mb-8 p-6"
          localThemeKey="cards-page-header"
        >
          <h1 className="text-3xl font-bold mb-3" style={{ color: theme.titleColor }}>
            卡片库
          </h1>
          <p className="mb-6 opacity-80" style={{ color: theme.textColor }}>
            探索和使用我们丰富的卡片组件库，快速构建现代化的用户界面
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg opacity-80" style={{ backgroundColor: `${theme.background}40` }}>
              <h3 className="font-semibold mb-1" style={{ color: theme.titleColor }}>丰富的组件</h3>
              <p style={{ color: theme.textColor }}>包含教育、功能、内容等多种类型的卡片组件</p>
            </div>
            <div className="p-3 rounded-lg opacity-80" style={{ backgroundColor: `${theme.background}40` }}>
              <h3 className="font-semibold mb-1" style={{ color: theme.titleColor }}>即插即用</h3>
              <p style={{ color: theme.textColor }}>所有卡片都经过精心设计，可直接在项目中使用</p>
            </div>
            <div className="p-3 rounded-lg opacity-80" style={{ backgroundColor: `${theme.background}40` }}>
              <h3 className="font-semibold mb-1" style={{ color: theme.titleColor }}>主题统一</h3>
              <p style={{ color: theme.textColor }}>遵循统一的设计规范，保持视觉一致性</p>
            </div>
          </div>
        </AppCard>

        {/* 使用您现有的FilterTabs进行分类导航 */}
        <div className="mb-6">
          <FilterTabs
            items={categoryItems}
            activeItem={activeCategory}
            onItemChange={setActiveCategory}
            className="mb-4"
          />
          <div className="text-center text-sm opacity-60" style={{ color: theme.textColor }}>
            共 {filteredCards.length} 张卡片
          </div>
        </div>

        {/* 卡片网格展示 */}
        <div className="mb-8">
          {filteredCards.length === 0 ? (
            <AppCard className="text-center py-12" localThemeKey="no-cards">
              <p className="text-lg font-medium mb-2" style={{ color: theme.titleColor }}>
                暂无卡片显示
              </p>
              <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
                请检查卡片注册或分类设置
              </p>
            </AppCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card) => (
                <div 
                  key={card.name} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  style={{ border: `1px solid ${theme.titleColor}15` }}
                >
                  {/* 卡片内容 - 显示占位符，避免渲染问题 */}
                  <div className="p-4">
                    <div 
                      className="h-40 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${theme.background}20` }}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-lg" style={{ backgroundColor: `${theme.titleColor}20` }} />
                        <p className="text-sm" style={{ color: theme.titleColor }}>
                          {card.displayName || card.name}
                        </p>
                        <p className="text-xs mt-1" style={{ color: theme.textColor }}>
                          {card.category} - {card.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 底部信息 - 只显示版本号和类型分类 */}
                  <div className="px-4 py-3 border-t" style={{ borderColor: `${theme.titleColor}10` }}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <span className="opacity-70" style={{ color: theme.textColor }}>
                          类型: <span className="font-medium" style={{ color: theme.titleColor }}>{card.type || '基础'}</span>
                        </span>
                        <span className="opacity-70" style={{ color: theme.textColor }}>
                          分类: <span className="font-medium" style={{ color: theme.titleColor }}>{card.category || '未分类'}</span>
                        </span>
                      </div>
                      <span className="opacity-70" style={{ color: theme.textColor }}>
                        版本: <span className="font-medium" style={{ color: theme.titleColor }}>{card.developer?.version || '1.0.0'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
