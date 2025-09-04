"use client"

import React from "react"

import type { ReactNode } from "react"
import { useState, useEffect, cloneElement, isValidElement, useMemo } from "react"
import { AppHeader } from "@/components/navigation/app-header"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardRegistry } from "@/components/card/registry"
import { AppCard } from "@/components/layout/app-card"
import { EnhancedDraggableCardContainer } from "@/components/card/enhanced-draggable-card-container"
import { FilterTabs } from "@/components/navigation/filter-tabs"
import { cn } from "@/lib/utils"
import {
  Heart,
  Share2,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  Settings,
  Plus,
  X,
  Grid3X3,
  Edit3,
  Save,
  Layers,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  FileText,
  MessageSquare,
  BarChart3,
  Store,
  MapPin,
  Zap,
  Home,
  User,
} from "lucide-react"
import { LocalThemeEditorVisibilityProvider } from "@/components/providers/local-theme-editor-visibility"
import { LocalThemeKeyProvider } from "@/components/providers/local-theme-key"
import { useCardTheme } from "@/components/providers/card-theme-provider"

// 页面类别配置
export interface PageCategory {
  id: string
  name: string
  description: string
  type: "workspace" | "content" | "education" | "custom"
  config: {
    showHeader?: boolean
    showBottomNav?: boolean
    allowEdit?: boolean
    layout?: "mobile" | "pc"
    customCards?: any[]
    staticContent?: ReactNode
  }
}

// 预定义的页面类别
export const PAGE_CATEGORIES: Record<string, PageCategory> = {
  workspace: {
    id: "workspace",
    name: "工作台",
    description: "可拖拽的工作台卡片系统",
    type: "workspace",
    config: {
      showHeader: true,
      showBottomNav: false,
      allowEdit: true,
      layout: "mobile",
    },
  },
  content: {
    id: "content",
    name: "内容管理",
    description: "内容管理平台界面",
    type: "content",
    config: {
      showHeader: true,
      showBottomNav: true,
      allowEdit: false,
      layout: "mobile",
    },
  },
  education: {
    id: "education",
    name: "在线教育",
    description: "在线教育移动应用",
    type: "education",
    config: {
      showHeader: true,
      showBottomNav: false,
      allowEdit: true,
      layout: "mobile",
    },
  },
  "pc-workspace": {
    id: "pc-workspace",
    name: "PC工作台",
    description: "PC版可拖拽的工作台卡片系统",
    type: "workspace",
    config: {
      showHeader: false,
      showBottomNav: false,
      allowEdit: true,
      layout: "pc",
    },
  },
}

// 基础卡片配置
const BASIC_CARDS = [
  {
    id: "user-info",
    name: "用户信息",
    category: "基础",
    component: (
      <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-5 h-5 text-accent" />
            <h4 className="text-lg font-bold">用户信息</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">查看和编辑用户基本信息</p>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src="/generic-user-avatar.png"
                alt="用户头像"
                className="w-12 h-12 rounded-full object-cover border-2 border-accent/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium">张三</p>
              <p className="text-sm text-muted-foreground">zhang.san@example.com</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                活跃用户
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
                          className="w-full hover:bg-accent hover:text-accent-foreground transition-colors mt-4 bg-transparent"
          >
            <Settings className="w-4 h-4 mr-2" />
            编辑资料
          </Button>
        </div>
      </AppCard>
    ),
  },
  {
    id: "sales-data",
    name: "销售数据",
    category: "基础",
    component: (
      <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-bold">今日销售</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">实时销售数据统计</p>
          <div className="space-y-3">
            <div className="text-3xl font-bold">¥12,345</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">+15.2%</span>
                <span className="text-muted-foreground">较昨日</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600/30">
                增长中
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all duration-500" style={{ width: "75%" }}></div>
            </div>
          </div>
        </div>
      </AppCard>
    ),
  },
  {
    id: "quick-actions",
    name: "快速操作",
    category: "基础",
    component: (
      <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-5 h-5 text-accent" />
            <h4 className="text-lg font-bold">快速操作</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">常用功能快捷入口</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-12 flex-col space-y-1 hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs">订单</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-12 flex-col space-y-1 hover:bg-red-500 hover:text-white transition-colors bg-transparent"
            >
              <Heart className="w-4 h-4" />
              <span className="text-xs">收藏</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-12 flex-col space-y-1 hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs">分享</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-12 flex-col space-y-1 hover:bg-yellow-500 hover:text-white transition-colors bg-transparent"
            >
              <Star className="w-4 h-4" />
              <span className="text-xs">评价</span>
            </Button>
          </div>
        </div>
      </AppCard>
    ),
  },
]

interface WorkspaceCard {
  id: string
  type: string
  name: string
  category: string
  component: ReactNode
}

interface DynamicPageComponentProps {
  category: string
  locale: string
  layout?: "mobile" | "pc"
}

export function DynamicPageComponent({ category, locale, layout: propLayout }: DynamicPageComponentProps) {
  const [cards, setCards] = useState<WorkspaceCard[]>([])
  const [showCardSelector, setShowCardSelector] = useState(false)
  const [isEditing, setIsEditing] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("全部")

  const STORAGE_KEY = `dynamic_page_layout_${category}_${locale}`

  const serializeCards = (cardList: WorkspaceCard[]) => cardList.map((c) => ({ id: c.id, type: c.type }))

  const recreateWorkspaceCardsFromSaved = (saved: Array<{ id?: string; type: string }>): WorkspaceCard[] => {
    const templates = getAllAvailableCards()
    const now = Date.now()
    return saved
      .map((item, index) => {
        const tpl = templates.find((t: any) => t.id === item.type)
        if (!tpl) return null
        const restored: WorkspaceCard = {
          id: item.id || `${tpl.id}-${now}-${index}`,
          type: tpl.id,
          name: tpl.name,
          category: tpl.category,
          component: tpl.component,
          width: tpl.width,
        }
        return restored
      })
      .filter(Boolean) as WorkspaceCard[]
  }

  const saveLayoutToLocalStorage = () => {
    try {
      const themeMap: Record<string, any> = {}
      if (typeof window !== "undefined") {
        cards.forEach((c) => {
          try {
            // 兼容读取：优先新键，其次旧键
            const rawNew = localStorage.getItem(c.id)
            const rawLegacy = localStorage.getItem(`card_theme_${c.id}`)
            const raw = rawNew || rawLegacy
            if (raw) themeMap[c.id] = JSON.parse(raw)
          } catch { }
        })
      }
      const payload = { cards: serializeCards(cards), themes: themeMap, updatedAt: Date.now() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      console.error("保存布局到本地存储失败", err)
    }
  }

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.cards)) {
        const savedList: Array<{ id?: string; type: string }> = parsed.cards.map((c: any) =>
          typeof c === "string" ? { type: c } : { id: c.id, type: c.type },
        )
        if (parsed.themes && typeof parsed.themes === "object") {
          try {
            Object.entries(parsed.themes as Record<string, any>).forEach(([cardId, theme]) => {
              const value = JSON.stringify(theme)
              // 写回原键
              try { localStorage.setItem(cardId, value) } catch { }
              // 如果是旧键(带前缀)，同步写回去掉前缀的新键
              if (cardId.startsWith("card_theme_")) {
                const newKey = cardId.replace(/^card_theme_/, "")
                try { localStorage.setItem(newKey, value) } catch { }
              }
            })
          } catch { }
        }
        const restored = recreateWorkspaceCardsFromSaved(savedList)
        if (restored.length > 0) {
          setCards(restored)
          setIsEditing(false)
        }
      }
    } catch (err) {
      console.error("恢复布局失败", err)
    }
  }, [STORAGE_KEY])

  const withInstanceId = (element: ReactNode, id: string) => {
    return isValidElement(element) ? cloneElement(element as React.ReactElement, { id, "data-theme-key": id }) : element
  }

  const getAllAvailableCards = () => {
    const allCards = []

    // 添加基础卡片
    allCards.push(...BASIC_CARDS)

    // 添加注册的业务卡片
    const registeredCards = CardRegistry.getAll()
    registeredCards.forEach((card) => {
      if (card.component) {
        const CardComponent = card.component
        
        // 为特定卡片提供默认数据
        const getDefaultData = (cardName: string) => {
          switch (cardName) {
            case 'mobile-navigation':
              return {
                title: '移动端导航',
                items: [
                  { id: 'home', label: '首页', icon: <Home className="w-4 h-4" />, href: '/', isActive: true },
                  { id: 'courses', label: '课程', icon: <GraduationCap className="w-4 h-4" />, href: '/courses' },
                  { id: 'profile', label: '个人中心', icon: <User className="w-4 h-4" />, href: '/profile' },
                  { id: 'settings', label: '设置', icon: <Settings className="w-4 h-4" />, href: '/settings' }
                ],
                showQuickActions: true
              }
            default:
              return {}
          }
        }
        
        const defaultData = getDefaultData(card.name)
        
        allCards.push({
          id: card.name,
          name: card.displayName || card.name,
          category: card.category,
          width: card.width,
          component: React.createElement(CardComponent as any, { 
            data: defaultData,
            onAction: (action: string, data: any) => console.log("Card action:", action, data)
          }),
        })
      } else {
        // 如果没有组件实现，显示开发中的占位符
        allCards.push({
          id: card.name,
          name: card.displayName || card.name,
          category: card.category,
          component: (
            <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Grid3X3 className="w-5 h-5 text-accent" />
                  <h4 className="text-lg font-bold">{card.displayName || card.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{card.businessFlow}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">状态</span>
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                      开发中
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">类别：{card.category}</div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent" disabled>
                    即将推出
                  </Button>
                </div>
              </div>
            </AppCard>
          ),
        })
      }
    })

    return allCards
  }

  const availableCards = getAllAvailableCards()
  const filteredCards =
    selectedCategory === "全部" ? availableCards : availableCards.filter((card) => card.category === selectedCategory)
  const allCategories = ["全部", ...Array.from(new Set(CardRegistry.getAll().map((card) => card.category)))]

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, ReactNode> = {
      全部: <Layers className="w-4 h-4 mr-2" />,
      基础: <Grid3X3 className="w-4 h-4 mr-2" />,
      教育: <GraduationCap className="w-4 h-4 mr-2" />,
      媒体: <FileText className="w-4 h-4 mr-2" />,
      招聘: <Briefcase className="w-4 h-4 mr-2" />,
      电商: <ShoppingBag className="w-4 h-4 mr-2" />,
      内容: <MessageSquare className="w-4 h-4 mr-2" />,
      社交: <Users className="w-4 h-4 mr-2" />,
      数据: <BarChart3 className="w-4 h-4 mr-2" />,
      零售: <Store className="w-4 h-4 mr-2" />,
      旅行: <MapPin className="w-4 h-4 mr-2" />,
      功能: <Zap className="w-4 h-4 mr-2" />,
    }
    return iconMap[category] || <Grid3X3 className="w-4 h-4 mr-2" />
  }

  const filterTabItems = allCategories.map((cat) => ({
    label: cat,
    icon: getCategoryIcon(cat),
  }))

  const addCard = (cardConfig: any) => {
    const newCard: WorkspaceCard = {
      id: `${cardConfig.id}-${Date.now()}`,
      type: cardConfig.id,
      name: cardConfig.name,
      category: cardConfig.category,
      component: cardConfig.component,
      width: cardConfig.width,
    }
    setCards([...cards, newCard])
    setShowCardSelector(false)
  }

  const removeCard = (cardId: string) => {
    setCards(cards.filter((card) => card.id !== cardId))
  }

  const handleReorder = (newOrder: string[]) => {
    const reorderedCards = newOrder.map((id) => cards.find((card) => card.id === id)).filter(Boolean) as WorkspaceCard[]
    setCards(reorderedCards)
  }

  const toggleEditMode = () => {
    if (isEditing) {
      saveLayoutToLocalStorage()
    }
    setIsEditing(!isEditing)
  }

  const pageCategory = useMemo(() => {
    if (propLayout === "pc" && category === "workspace") {
      return PAGE_CATEGORIES["pc-workspace"]
    }
    return PAGE_CATEGORIES[category] || PAGE_CATEGORIES.workspace
  }, [category, propLayout])

  return (
    <LocalThemeEditorVisibilityProvider visible={isEditing}>
      <div className={cn("min-h-screen relative", "bg-transparent")}>
        {/* Header - 只在移动端显示 */}
        {pageCategory.config.showHeader && propLayout !== "pc" && (
          <AppHeader
            title={pageCategory.type === "education" ? "教育应用Demo" : "自定义动态页面"}
            showBack={false}
            actions={
              pageCategory.config.allowEdit ? (
                <Button variant="ghost" size="sm" onClick={toggleEditMode}>
                  {isEditing ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </Button>
              ) : undefined
            }
          />
        )}

        {/* 工作台类型 */}
        {pageCategory.type === "workspace" && (
          <div className={cn("relative z-10", propLayout === "pc" ? "p-6" : "p-4 pt-20")}>
            <div className="mb-6">
              {cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Grid3X3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {propLayout === "pc" ? "PC自定义工作台" : "自定义动态页面"}
                  </h1>
                  <p className="text-gray-600 mb-4">点击右下角 ➕ 按钮添加功能卡片，自定义您的页面</p>
                </div>
              ) : (
                <EnhancedDraggableCardContainer
                  items={cards.map((card) => ({
                    id: card.id,
                    content: (
                      <LocalThemeKeyProvider value={card.id}>
                        <div className={`relative group ${card.width === "half" ? "w-full" : ""}`}>
                          {isEditing && pageCategory.config.allowEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0 z-10"
                              onClick={() => removeCard(card.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                          {withInstanceId(card.component, card.id)}
                        </div>
                      </LocalThemeKeyProvider>
                    ),
                    className: cn(
                      // PC 网格：half 占 1 列，其它占满（跨两列/三列）
                      propLayout === "pc"
                        ? card.width === "half"
                          ? "col-span-1"
                          : "col-span-2 lg:col-span-3"
                        : // 移动端网格：两列，half 占 1 列，其它占 2 列
                        card.width === "half" ? "col-span-1" : "col-span-2",
                    ),
                  }))}
                  onReorder={handleReorder}
                  layout={"grid"}
                  className={
                    propLayout === "pc"
                      ? // 设定 3 列网格，gap-6
                      "grid grid-cols-2 lg:grid-cols-3 gap-6"
                      : // 移动端设为两列网格，由 item.className 控制跨列
                      "grid grid-cols-2 gap-4"
                  }
                  disabled={!isEditing}
                />
              )}
            </div>

            {pageCategory.config.allowEdit && (
              <div className="flex gap-2">
                <Button variant={isEditing ? "outline" : "outline"} className="flex-1 hover:bg-accent hover:text-accent-foreground" onClick={toggleEditMode}>
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      保存布局
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      编辑布局
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 工作台编辑按钮 */}
        {isEditing && pageCategory.config.allowEdit && (
          <Button
            className={cn(
              "fixed shadow-lg z-30 w-14 h-14 rounded-full bg-accent text-accent-foreground hover:bg-accent/90",
              propLayout === "pc" ? "bottom-8 right-8" : "bottom-24 right-6",
            )}
            size="icon"
            onClick={() => setShowCardSelector(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        )}

        {/* 卡片选择器 */}
        {showCardSelector && isEditing && pageCategory.config.allowEdit && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowCardSelector(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl max-h-[75vh] overflow-hidden border-t border-white/20">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4"></div>

              <div className="px-6 pb-4 border-b border-gray-100/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      选择功能卡片
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">预览卡片效果，点击添加到工作台</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full w-8 h-8 p-0 hover:bg-gray-100"
                    onClick={() => setShowCardSelector(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <FilterTabs
                  items={filterTabItems}
                  activeItem={selectedCategory}
                  onItemChange={setSelectedCategory}
                  className="flex-nowrap overflow-x-auto scrollbar-hide whitespace-nowrap pb-2"
                />
              </div>

              <div className="px-6 py-4 overflow-y-auto max-h-[calc(75vh-180px)]">
                <div className="space-y-4">
                  {filteredCards.map((cardConfig) => {
                    const isAdded = cards.some((card) => card.type === cardConfig.id)
                    return (
                      <div
                        key={cardConfig.id}
                        className={cn(
                          "transition-all duration-300 border rounded-2xl overflow-hidden",
                          isAdded
                            ? "bg-gray-50/80 border-gray-200 opacity-60"
                            : "bg-white/90 backdrop-blur-sm border-gray-200 hover:shadow-xl hover:scale-[1.02] hover:border-accent cursor-pointer",
                        )}
                        onClick={() => !isAdded && addCard(cardConfig)}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-semibold text-base text-gray-900 mb-1">{cardConfig.name}</h5>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-accent/10 text-accent-foreground border-accent/20">
                                  {cardConfig.category}
                                </Badge>
                                {isAdded && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-green-50 text-green-700 border-green-200"
                                  >
                                    已添加
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="relative">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 border border-gray-200/50 overflow-hidden">
                              <div className="transform scale-[0.7] origin-top-left w-[143%] pointer-events-none">
                                <div className="max-h-48 overflow-hidden">{cardConfig.component}</div>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent rounded-xl flex items-end justify-center pb-2">
                              <div className="text-xs text-gray-600 font-medium bg-white/90 px-2 py-1 rounded-full">
                                点击添加
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 底部导航 */}
        {pageCategory.config.showBottomNav && (
          <BottomNavigation
            dict={{
              browseComponents: "组件",
              dashboard: "仪表板",
              chat: "AI",
              search: "搜索",
              profile: "我的",
            }}
          />
        )}
      </div>
    </LocalThemeEditorVisibilityProvider>
  )
}

export default DynamicPageComponent
