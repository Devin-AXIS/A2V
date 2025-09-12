"use client"

import React from "react"

import type { ReactNode } from "react"
import { useState, useEffect, cloneElement, isValidElement, useMemo, useRef } from "react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InlineSandbox } from "./inline-sandbox"
import ContentNavigation, { type ContentNavConfig } from "@/components/navigation/content-navigation"
import { DropdownFilterTabs } from "@/components/navigation/dropdown-filter-tabs"
import { getIframeBridge } from "@/lib/iframe-bridge"
import { dataInputs } from "@/components/card/set-datas"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

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
  width?: 'half' | 'full'
}

interface DynamicPageComponentProps {
  category: string
  locale: string
  layout?: "mobile" | "pc"
  // per-page overrides for dynamic pages
  showHeader?: boolean
  showBottomNav?: boolean
  headerTitle?: string
  showBack?: boolean
  aiOpsUrl?: string
  aiOpsLabel?: string
  topTabsConfig?: ContentNavConfig | null
  contentNavConfig?: ContentNavConfig | null
  initialTabIndex?: number
  pageId?: string
}

export function DynamicPageComponent({ category, locale, layout: propLayout, showHeader: showHeaderProp, showBottomNav: showBottomNavProp, headerTitle, showBack, aiOpsUrl, aiOpsLabel, topTabsConfig, contentNavConfig, initialTabIndex, pageId }: DynamicPageComponentProps) {
  const [cards, setCards] = useState<WorkspaceCard[]>([])
  const cardsCacheRef = useRef<Record<string, WorkspaceCard[]>>({})
  const [showCardSelector, setShowCardSelector] = useState(false)
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isEditeParam = (sp.get('isEdite') === 'true' || sp.get('isEdit') === 'true')
  const [isEditing, setIsEditing] = useState<boolean>(isEditeParam)
  const [selectedCategory, setSelectedCategory] = useState<string>("全部")
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [activeConfigCardId, setActiveConfigCardId] = useState<string | null>(null)
  const [dataSourceOptions, setDataSourceOptions] = useState<Array<{ key: string; label: string }>>([])
  const [configError, setConfigError] = useState<string | null>(null)
  const [selectedDataSourceLabels, setSelectedDataSourceLabels] = useState<Record<string, string>>({})
  // 顶部标签栏索引（父级）
  const [activeTopIndex, setActiveTopIndex] = useState<number>(initialTabIndex ?? 0)
  // 内容导航索引（子级）
  const [activeContentIndex, setActiveContentIndex] = useState<number>(0)
  const [overrideTick, setOverrideTick] = useState<number>(0)
  const [activeFiltersByCardId, setActiveFiltersByCardId] = useState<Record<string, Record<string, string>>>({})

  const setCardsForKey = (key: string, list: WorkspaceCard[]) => {
    try { cardsCacheRef.current[key] = list } catch { }
    if (key === STORAGE_KEY) setCards(list)
  }

  // 在不触发路由导航的情况下更新 URL 中的 tab 参数
  const updateTabParamInUrl = (index: number) => {
    try {
      const params = new URLSearchParams(sp?.toString?.() || '')
      if (index === 0) params.delete('tab')
      else params.set('tab', String(index))
      const qs = params.toString()
      const url = qs ? `${pathname}?${qs}` : `${pathname}`
      if (typeof window !== 'undefined') {
        window.history.replaceState(window.history.state, '', url)
      }
    } catch { }
  }

  const updateContentParamInUrl = (index: number) => {
    try {
      const params = new URLSearchParams(sp?.toString?.() || '')
      if (index === 0) params.delete('nav')
      else params.set('nav', String(index))
      const qs = params.toString()
      const url = qs ? `${pathname}?${qs}` : `${pathname}`
      if (typeof window !== 'undefined') {
        window.history.replaceState(window.history.state, '', url)
      }
    } catch { }
  }

  useEffect(() => {
    if (typeof initialTabIndex === 'number') setActiveTopIndex(initialTabIndex)
  }, [initialTabIndex])

  // 读取页面配置以适配新的 topBar/tabContent 模型（优先使用本地存储 APP_PAGE_{id}）
  const pageConfig = useMemo(() => {
    try {
      if (!pageId || typeof window === 'undefined') return null
      const raw = localStorage.getItem(`APP_PAGE_${pageId}`)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }, [pageId, activeTopIndex, overrideTick])

  // 归一化顶部标签栏为文本型导航（只用作切换）。优先使用外部传入的 topTabsConfig
  const computedTopTabs = useMemo(() => {
    try {
      if (topTabsConfig && topTabsConfig.type === 'text' && Array.isArray(topTabsConfig.items) && topTabsConfig.items.length > 0) {
        return topTabsConfig
      }
      const tb = (pageConfig && (pageConfig as any).topBar) || null
      const enabled = !!(tb && (tb as any).enabled)
      const tabs = enabled ? ((tb as any).tabs || []) : []
      if (enabled && Array.isArray(tabs) && tabs.length > 0) {
        return {
          type: 'text',
          items: tabs.map((t: any) => ({ title: (t && (t.title || '').trim()) || '标签' })),
        } as ContentNavConfig
      }
      // fallback：当未开启顶部标签栏时，若页面级 contentNav 是文本型，则用它作为顶部标签栏
      const cnav = pageConfig && (pageConfig as any).contentNav
      if (cnav) {
        const style = (cnav as any).style
        if (style === 'text') {
          return { ...(cnav as any), type: 'text' } as ContentNavConfig
        }
        if ((cnav as any).type === 'text') {
          return cnav as ContentNavConfig
        }
      }
      return null
    } catch { return null }
  }, [pageConfig])

  // 当前分区的内容导航（若开启顶部标签栏，则取每个标签下的 contentNav，否则取页面级 contentNav）
  const currentContentNav = useMemo(() => {
    const normalize = (cfg: any | null | undefined): ContentNavConfig | null => {
      if (!cfg) return null
      const style = (cfg as any).style
      if (style === 'text' || style === 'icon') {
        return { ...(cfg as any), type: style === 'text' ? 'text' : 'iconText' }
      }
      if ((cfg as any).type === 'text' || (cfg as any).type === 'iconText') return cfg as ContentNavConfig
      return null
    }
    try {
      if (computedTopTabs) {
        const tbc = (pageConfig && (pageConfig as any).tabContent) || {}
        const perTab = (tbc as any)?.[activeTopIndex] || {}
        return normalize(perTab?.contentNav) || null
      }
      return normalize(pageConfig && (pageConfig as any).contentNav) || null
    } catch { return null }
  }, [pageConfig, computedTopTabs, activeTopIndex])

  const workspaceCategory = useMemo(() => {
    const hasTop = !!(computedTopTabs && computedTopTabs.type === 'text')
    const hasIcon = !!(currentContentNav && currentContentNav.type === 'iconText')
    if (hasTop && hasIcon) return `${category}-tab-${activeTopIndex}-icon-${activeContentIndex}`
    if (hasTop) return `${category}-tab-${activeTopIndex}`
    if (hasIcon) return `${category}-icon-${activeContentIndex}`
    return category
  }, [category, computedTopTabs, currentContentNav, activeTopIndex, activeContentIndex])

  const STORAGE_KEY = `dynamic_page_layout_${workspaceCategory}_${locale}`

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
          width: (tpl as any).width as any,
        }
        return restored
      })
      .filter(Boolean) as WorkspaceCard[]
  }

  const saveLayoutToLocalStorage = () => {
    try {
      const themeMap: Record<string, any> = {}
      const dataSourcesMap: Record<string, any> = {}
      if (typeof window !== "undefined") {
        cards.forEach((c) => {
          try {
            // 兼容读取：优先新键，其次旧键
            const rawNew = localStorage.getItem(c.id)
            const rawLegacy = localStorage.getItem(`card_theme_${c.id}`)
            const raw = rawNew || rawLegacy
            if (raw) themeMap[c.id] = JSON.parse(raw)
          } catch { }
          try {
            const dsRaw = localStorage.getItem(`CARD_DS_${c.id}`)
            if (dsRaw) dataSourcesMap[c.id] = JSON.parse(dsRaw)
          } catch {
            const dsRaw = localStorage.getItem(`CARD_DS_${c.id}`)
            if (dsRaw) dataSourcesMap[c.id] = dsRaw
          }
        })
      }
      const payload = { cards: serializeCards(cards), themes: themeMap, dataSources: dataSourcesMap, updatedAt: Date.now() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      // 同步到后端（按 key 持久化）
      try {
        fetch(`http://47.94.52.142:3007/api/page-configs/key/${encodeURIComponent(STORAGE_KEY)}`,
          { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          .catch(() => { })
      } catch { }
    } catch (err) {
      console.error("保存布局到本地存储失败", err)
    }
  }

  // 自动保存：在编辑模式下，卡片/数据源标签等变更后防抖写入本地存储
  const autosaveTimerRef = useRef<number | null>(null)
  useEffect(() => {
    if (!isEditing) return
    try {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = window.setTimeout(() => {
        try { saveLayoutToLocalStorage() } catch { }
      }, 400)
    } catch { }
    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current)
        autosaveTimerRef.current = null
      }
    }
  }, [cards, selectedDataSourceLabels, STORAGE_KEY, isEditing])

  // 监听跨标签页的配置变化（如 CARD_DS_* 或 APP_PAGE_{id}），在编辑模式下触发保存
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      try {
        if (!isEditing) return
        const key = e.key || ""
        if ((pageId && key === `APP_PAGE_${pageId}`) || key.startsWith('CARD_DS_')) {
          if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current)
          autosaveTimerRef.current = window.setTimeout(() => {
            try { saveLayoutToLocalStorage() } catch { }
          }, 300)
        }
      } catch { }
    }
    if (typeof window !== 'undefined') window.addEventListener('storage', handler)
    return () => { if (typeof window !== 'undefined') window.removeEventListener('storage', handler) }
  }, [isEditing, pageId])

  // 监听来自 Studio 的覆盖配置写入（SET_OVERRIDE）
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const msg: any = e.data
      if (!msg || msg.type !== 'SET_OVERRIDE') return
      try {
        const { pageId: targetId, sectionKey, cardType, props, jsx, display, filters } = msg
        if (!targetId || targetId !== pageId) return
        const key = `APP_PAGE_${targetId}`
        const raw = localStorage.getItem(key)
        const cfg = raw ? JSON.parse(raw) : {}
        const overrides = { ...(cfg.overrides || {}) }
        const sec = { ...(overrides[sectionKey] || {}) }
        const nextCard = { ...(sec[cardType] || {}) }
        if (props !== undefined) nextCard.props = props
        if (jsx !== undefined) nextCard.jsx = jsx
        if (display !== undefined) nextCard.display = display
        if (filters !== undefined) nextCard.filters = filters
        sec[cardType] = nextCard
        overrides[sectionKey] = sec
        const next = { ...cfg, overrides }
        localStorage.setItem(key, JSON.stringify(next))
        setOverrideTick((v) => v + 1)
        // 同步到后端（按 key 持久化 APP_PAGE_{id}）
        try {
          fetch(`http://47.94.52.142:3007/api/page-configs/key/${encodeURIComponent(key)}`,
            { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) })
            .catch(() => { })
        } catch { }
      } catch (err) {
        console.error('SET_OVERRIDE failed:', err)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [pageId])

  // 处理 GET_OVERRIDE：返回当前 props/jsx
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const msg: any = e.data
      if (!msg || msg.type !== 'GET_OVERRIDE') return
      try {
        const { pageId: targetId, sectionKey, cardType } = msg
        if (!targetId || targetId !== pageId) return
        const key = `APP_PAGE_${targetId}`
        const raw = localStorage.getItem(key)
        const cfg = raw ? JSON.parse(raw) : {}
        const props = cfg?.overrides?.[sectionKey]?.[cardType]?.props
        const jsx = cfg?.overrides?.[sectionKey]?.[cardType]?.jsx
        const filters = cfg?.overrides?.[sectionKey]?.[cardType]?.filters
        window.parent?.postMessage({ type: 'OVERRIDE', pageId: targetId, sectionKey, cardType, props, jsx, filters }, '*')
      } catch (err) {
        console.error('GET_OVERRIDE failed:', err)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [pageId])

  // 向父窗口（Studio）同步当前可见卡片列表（含显示名），便于左侧配置显示
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const items = (typeof window !== 'undefined' ? cards : []).map((c) => ({ type: c.type, displayName: c.name }))
        window.parent?.postMessage({ type: 'DYN_CARDS', category: workspaceCategory, cards: items }, '*')
      }
    } catch { }
  }, [cards, workspaceCategory])

  // 根据页面可见性规则（由 Studio 写入 APP_PAGE_{id}.visibility）过滤显示卡片
  const visibleCards = useMemo(() => {
    try {
      if (!pageId) return cards
      const raw = typeof window !== 'undefined' ? localStorage.getItem(`APP_PAGE_${pageId}`) : null
      if (!raw) return cards
      const cfg = JSON.parse(raw || '{}')
      // 优先支持组合可见性：combined[topIndex][contentIndex]
      const combined: string[] | undefined = (cfg?.visibility?.combined?.[activeTopIndex]?.[activeContentIndex])
      if (combined && combined.length > 0) return cards.filter((c) => combined.includes(c.type))
      // 其次按内容导航
      const byIcon: string[] | undefined = (cfg?.visibility?.icon?.[activeContentIndex])
      if (byIcon && byIcon.length > 0) return cards.filter((c) => byIcon.includes(c.type))
      // 再次按顶部标签
      const byText: string[] | undefined = (cfg?.visibility?.text?.[activeTopIndex])
      if (byText && byText.length > 0) return cards.filter((c) => byText.includes(c.type))
      return cards
    } catch {
      return cards
    }
  }, [cards, pageId, computedTopTabs, currentContentNav, activeTopIndex, activeContentIndex])

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (!raw) {
        // 若本地无数据，尝试从后端拉取
        (async () => {
          try {
            const res = await fetch(`http://47.94.52.142:3007/api/page-configs/key/${encodeURIComponent(STORAGE_KEY)}`)
            if (res.ok) {
              const j = await res.json().catch(() => null)
              const data = j && (j.data ?? j)
              if (data && Array.isArray(data.cards)) {
                const parsed = data
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)) } catch { }
                const savedList: Array<{ id?: string; type: string }> = parsed.cards.map((c: any) =>
                  typeof c === "string" ? { type: c } : { id: c.id, type: c.type },
                )
                if (parsed.themes && typeof parsed.themes === "object") {
                  try {
                    Object.entries(parsed.themes as Record<string, any>).forEach(([cardId, theme]) => {
                      const value = JSON.stringify(theme)
                      try { localStorage.setItem(cardId, value) } catch { }
                      if (cardId.startsWith("card_theme_")) {
                        const newKey = cardId.replace(/^card_theme_/, "")
                        try { localStorage.setItem(newKey, value) } catch { }
                      }
                    })
                  } catch { }
                }
                if (parsed.dataSources && typeof parsed.dataSources === 'object') {
                  const restoredLabels: Record<string, string> = {}
                  try {
                    Object.entries(parsed.dataSources as Record<string, any>).forEach(([cardId, info]) => {
                      try { localStorage.setItem(`CARD_DS_${cardId}`, JSON.stringify(info)) } catch { }
                      const label = (info && (info as any).label) || ""
                      if (label) restoredLabels[cardId] = String(label)
                    })
                  } catch { }
                  if (Object.keys(restoredLabels).length > 0) {
                    setSelectedDataSourceLabels((prev) => ({ ...prev, ...restoredLabels }))
                  }
                }
                const restored = recreateWorkspaceCardsFromSaved(savedList)
                if (restored.length > 0) {
                  setCardsForKey(STORAGE_KEY, restored)
                  setIsEditing(false)
                  return
                }
              }
            }
          } catch { }
          setCards([])
          setIsEditing(true)
        })()
        return
      }
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
        // 恢复数据源选择
        if (parsed.dataSources && typeof parsed.dataSources === 'object') {
          const restoredLabels: Record<string, string> = {}
          try {
            Object.entries(parsed.dataSources as Record<string, any>).forEach(([cardId, info]) => {
              try { localStorage.setItem(`CARD_DS_${cardId}`, JSON.stringify(info)) } catch { }
              const label = (info && (info as any).label) || ""
              if (label) restoredLabels[cardId] = String(label)
            })
          } catch { }
          if (Object.keys(restoredLabels).length > 0) {
            setSelectedDataSourceLabels((prev) => ({ ...prev, ...restoredLabels }))
          }
        }
        const restored = recreateWorkspaceCardsFromSaved(savedList)
        if (restored.length > 0) {
          setCardsForKey(STORAGE_KEY, restored)
          setIsEditing(false)
        }
      }
    } catch (err) {
      console.error("恢复布局失败", err)
    }
  }, [STORAGE_KEY])

  useEffect(() => {
    try {
      if (typeof window === "undefined") return
      const restored: Record<string, string> = {}
      cards.forEach((c) => {
        try {
          const raw = localStorage.getItem(`CARD_DS_${c.id}`)
          if (raw) {
            const parsed = JSON.parse(raw as any)
            const label = typeof parsed === "string" ? parsed : (parsed && parsed.label)
            if (label) restored[c.id] = label
          }
        } catch {
          const raw = localStorage.getItem(`CARD_DS_${c.id}`)
          if (raw) restored[c.id] = raw
        }
      })
      if (Object.keys(restored).length > 0) {
        setSelectedDataSourceLabels((prev) => ({ ...prev, ...restored }))
      }
    } catch { }
  }, [cards])

  const openConfigForCard = (cardId: string) => {
    setActiveConfigCardId(cardId)
    setConfigError(null)
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('APPLICATION_CONFIG') : null
      if (!raw) {
        setDataSourceOptions([])
        setConfigError('未找到 APPLICATION_CONFIG')
        setShowConfigDialog(true)
        return
      }
      const parsed = JSON.parse(raw)
      const ds = parsed && parsed.config && parsed.config.clientManifest && parsed.config.clientManifest.dataSources
      let options: Array<{ key: string; label: string }> = []
      if (ds && typeof ds === 'object') {
        options = Object.keys(ds).map((k) => ({ key: k, label: (ds[k] && ds[k].label) || k }))
      }
      if (!options.length) {
        setConfigError('dataSources 为空或结构不正确')
      }
      setDataSourceOptions(options)
      setShowConfigDialog(true)
    } catch (e) {
      setConfigError('解析 APPLICATION_CONFIG 失败')
      setDataSourceOptions([])
      setShowConfigDialog(true)
    }
  }

  const handleSelectDataSource = (opt: { key: string; label: string }) => {
    if (!activeConfigCardId) return
    console.log(activeConfigCardId, opt)
    setSelectedDataSourceLabels((prev) => ({ ...prev, [activeConfigCardId]: opt.label }))
    try {
      localStorage.setItem(`CARD_DS_${activeConfigCardId}`, JSON.stringify({ key: opt.key, label: opt.label }))
    } catch { }
    try {
      // 发送到 Studio：aino:data
      const bridge = getIframeBridge()
      // 找到当前卡片配置与入参（假定使用 mock props 作为入参字段原型）
      const currentCard = cards.find((c) => c.id === activeConfigCardId)
      const cardConfig = currentCard ? CardRegistry.getConfig(currentCard.type) : undefined
      // 从 mock provider 获取该卡片的默认入参结构，作为字段参考
      let inputFields: any = dataInputs[currentCard?.type] || {}

      bridge.post("aino:data", {
        card: {
          id: currentCard?.id,
          name: currentCard?.name,
          type: currentCard?.type,
          config: cardConfig ? {
            displayName: cardConfig.displayName,
            category: cardConfig.category,
            width: cardConfig.width,
            businessFlow: cardConfig.businessFlow,
          } : undefined,
        },
        inputs: inputFields,
        dataSource: { key: opt.key, label: opt.label },
        timestamp: Date.now(),
      })
    } catch { }
    setShowConfigDialog(false)
  }

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
            case 'pc-toolbar':
              return {
                title: '编辑工具栏',
                showShortcuts: true,
                isCollapsed: false,
                items: [
                  { id: 'save', label: '保存', icon: <Save className="w-4 h-4" />, shortcut: 'Ctrl+S', group: 'file' },
                  { id: 'edit', label: '编辑', icon: <Edit3 className="w-4 h-4" />, group: 'edit' },
                  { id: 'favorite', label: '收藏', icon: <Star className="w-4 h-4" />, group: 'view' },
                ]
              }
            case 'universal-info':
              return {
                title: '平台概况',
                description: '关键指标总览',
                showActions: true,
                source: '系统统计',
                items: [
                  { label: '活跃用户', value: 12890, type: 'number', trend: 'up' },
                  { label: '日访问量', value: 52340, type: 'number', trend: 'up' },
                  { label: '转化率', value: 3.2, type: 'percentage', trend: 'stable' },
                  { label: '营收', value: 98765, type: 'currency', trend: 'down' },
                ]
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
          width: 'full',
          component: (
            <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Grid3X3 className="w-5 h-5 text-accent" />
                  <h4 className="text-lg font-bold">{card.displayName || card.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{typeof card.businessFlow === 'string' ? card.businessFlow : (card.businessFlow?.description || '')}</p>

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
    const next = [...cards, newCard]
    setCards(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ cards: serializeCards(next) })) } catch { }
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

  const showHeader = showHeaderProp ?? pageCategory.config.showHeader
  const showBottomNav = showBottomNavProp ?? pageCategory.config.showBottomNav
  const canEdit = isEditeParam

  return (
    <LocalThemeEditorVisibilityProvider visible={isEditing}>
      <div className={cn("min-h-screen relative", "bg-transparent")}>
        {/* Header - 只在移动端显示 */}
        {showHeader && propLayout !== "pc" && (
          <AppHeader
            title={headerTitle || (pageCategory.type === "education" ? "教育应用Demo" : window.location.pathname === "/zh/preview" ? "首页" : "自定义动态页面")}
            showBackButton={showBack}
          />
        )}

        {/* 顶部标签导航：读取页面 topBar 并归一化为文本型
            由于 AppHeader 是 fixed 定位，这里需要为内容预留顶部空间，
            否则标签栏会被头部遮挡而不可见。 */}
        {computedTopTabs && computedTopTabs.type === 'text' && (
          <div className={cn("px-4 mb-2", propLayout === 'pc' ? 'hidden' : 'block', showHeader ? 'pt-16' : 'pt-2')}>
            <ContentNavigation
              config={computedTopTabs}
              activeIndex={activeTopIndex}
              disableNavigate
              onSwitchTab={({ index }) => {
                if (typeof index === 'number') {
                  // 切换父级：更新 topIndex，并且重置内容导航索引为 0
                  updateTabParamInUrl(index)
                  setActiveTopIndex(index)
                  setActiveContentIndex(0)
                }
              }}
            />
          </div>
        )}

        {/* 顶部右侧AI运营入口（可选） */}
        {showHeader && propLayout !== "pc" && aiOpsUrl && (
          <div className="fixed top-3 right-20 z-30">
            <a href={aiOpsUrl} target="_blank" rel="noreferrer">
              <Button size="sm" variant="secondary" className="rounded-full h-8 px-3">
                {aiOpsLabel || "AI运营"}
              </Button>
            </a>
          </div>
        )}

        {/* 工作台类型 */}
        {pageCategory.type === "workspace" && (
          <div key={workspaceCategory} className={cn(
            "relative z-10",
            propLayout === "pc"
              ? "p-6"
              : // 顶部存在标签栏时，减少顶部内边距，避免与标签栏重复留白
              (computedTopTabs ? "p-4 pt-4" : "p-4 pt-20")
          )}>
            {/* 图文入口导航容器：支持新旧模型，统一归一化为 currentContentNav */}
            {currentContentNav && currentContentNav.type === 'iconText' && (
              <div className="mb-4">
                <ContentNavigation
                  config={currentContentNav}
                  activeIndex={activeContentIndex}
                  disableNavigate
                  onSwitchTab={({ index }) => {
                    if (typeof index === 'number') {
                      // 切换子级：只更新内容导航索引，不影响顶部标签
                      updateContentParamInUrl(index)
                      setActiveContentIndex(index)
                    }
                  }}
                />
              </div>
            )}
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
                  key={STORAGE_KEY}
                  items={visibleCards.map((card) => ({
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
                          {
                            isEditing && pageCategory.config.allowEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0 z-10"
                                onClick={() => openConfigForCard(card.id)}
                                title="配置数据"
                              >
                                <Settings className="w-3 h-3" />
                              </Button>
                            )
                          }
                          {
                            isEditing && pageCategory.config.allowEdit && selectedDataSourceLabels[card.id] && (
                              <div className="absolute top-2 left-2 z-10">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200">
                                  {selectedDataSourceLabels[card.id]}
                                </Badge>
                              </div>
                            )
                          }
                          {/* { withInstanceId(card.component, card.id) } */}
                          {withInstanceId((() => {
                            try {
                              const reg = CardRegistry.getAll().find((r) => r.name === card.type)
                              if (!reg || !reg.component) return card.component
                              const CardComponent = reg.component
                              const defaultData = {}
                              // 组合查找：优先 tab+nav，再退化到单键
                              const hasTop = !!(computedTopTabs && computedTopTabs.type === 'text')
                              const hasIcon = !!(currentContentNav && currentContentNav.type === 'iconText')
                              const combinedKey = hasTop && hasIcon ? `tab-${activeTopIndex}::icon-${activeContentIndex}` : undefined
                              const sectionKey = combinedKey || (hasTop ? `tab-${activeTopIndex}` : (hasIcon ? `icon-${activeContentIndex}` : ''))
                              let overrideProps: any = undefined
                              let overrideJsx: string | undefined
                              let overrideDisplay: any = undefined
                              let overrideFilters: any = undefined
                              if (pageId && sectionKey) {
                                try {
                                  const raw = localStorage.getItem(`APP_PAGE_${pageId}`)
                                  const cfg = raw ? JSON.parse(raw) : {}
                                  const pick = (key?: string) => key ? cfg?.overrides?.[key]?.[card.type] : undefined
                                  const preferred = pick(combinedKey) || pick(sectionKey)
                                  overrideProps = preferred?.props
                                  overrideJsx = preferred?.jsx
                                  overrideDisplay = preferred?.display
                                  overrideFilters = preferred?.filters
                                } catch { }
                              }
                              if (overrideJsx) {
                                const themeObj = {}
                                return (<InlineSandbox code={overrideJsx} data={defaultData} props={overrideProps} theme={themeObj} className="w-full" />)
                              }
                              // 构造筛选条 items 与当前值
                              const items = (() => {
                                try {
                                  if (!overrideFilters?.enabled || !Array.isArray(overrideFilters?.fields)) return []
                                  return (overrideFilters.fields as any[]).map((f: any) => {
                                    // 统一为扁平 options：{label,value}[]
                                    const flatOptions: Array<{ label: string; value: string }> = []
                                    if (Array.isArray(f.options) && f.type === 'select') {
                                      (f.options as any[]).forEach((opt: any) => {
                                        if (typeof opt === 'string') flatOptions.push({ label: String(opt), value: String(opt) })
                                        else if (opt && typeof opt === 'object') flatOptions.push({ label: opt.label ?? String(opt.value ?? ''), value: String(opt.value ?? opt.label ?? '') })
                                      })
                                    } else if (Array.isArray(f.optionsTree) && f.type === 'cascader') {
                                      const walk = (nodes: any[], pathLabels: string[], pathValues: string[]) => {
                                        nodes.forEach((n) => {
                                          const nextLabels = [...pathLabels, String(n.name ?? n.label ?? n.id ?? '')]
                                          const nextValues = [...pathValues, String(n.id ?? n.value ?? n.name ?? '')]
                                          if (Array.isArray(n.children) && n.children.length > 0) {
                                            walk(n.children, nextLabels, nextValues)
                                          } else {
                                            flatOptions.push({ label: nextLabels.join(' / '), value: nextValues.join('/') })
                                          }
                                        })
                                      }
                                      walk(f.optionsTree as any[], [], [])
                                    }
                                    // 演示用：本地兜底选项，避免为空看不到效果
                                    if (flatOptions.length === 0) {
                                      if (f.type === 'select') {
                                        flatOptions.push(
                                          { label: '全部', value: 'all' },
                                          { label: '选项A', value: 'a' },
                                          { label: '选项B', value: 'b' }
                                        )
                                      } else if (f.type === 'cascader') {
                                        flatOptions.push(
                                          { label: '中国 / 北京', value: 'cn/bj' },
                                          { label: '中国 / 上海', value: 'cn/sh' },
                                          { label: '美国 / 纽约', value: 'us/ny' }
                                        )
                                      }
                                    }
                                    // 如果没有选项也返回占位
                                    return { category: f.label || f.fieldId, options: flatOptions, defaultValue: f.default }
                                  })
                                } catch { return [] }
                              })()

                              const values = activeFiltersByCardId[card.id] || (() => {
                                const v: Record<string, string> = {}
                                items.forEach((it) => {
                                  const dv = it.defaultValue || (it.options[0]?.value || '')
                                  v[it.category] = dv
                                })
                                return v
                              })()

                              const handleValueChange = (category: string, value: string) => {
                                setActiveFiltersByCardId((s) => ({
                                  ...s,
                                  [card.id]: { ...(s[card.id] || {}), [category]: value },
                                }))
                              }

                              // 简化：当存在 display.limit 时，在 props 中注入 listLimit 供卡片自行使用；注入 activeFilters
                              const activeFilters = (() => {
                                const map: Record<string, string> = {}
                                if (overrideFilters?.enabled && Array.isArray(overrideFilters.fields)) {
                                  overrideFilters.fields.forEach((f: any) => {
                                    const cat = f.label || f.fieldId
                                    const val = values[cat]
                                    if (val != null) map[f.fieldId || cat] = val
                                  })
                                }
                                return map
                              })()

                              const mergedProps = { ...(overrideProps || {}), listLimit: (overrideDisplay && overrideDisplay.limit), activeFilters }

                              return (
                                <div className="space-y-2">
                                  {overrideFilters?.enabled && items.length > 0 && (
                                    <DropdownFilterTabs items={items as any} values={values} onValueChange={handleValueChange} />
                                  )}
                                  {React.createElement(CardComponent as any, {
                                    data: defaultData,
                                    props: mergedProps,
                                    onAction: (action: string, data: any) => console.log('Card action:', action, data),
                                  })}
                                </div>
                              )
                            } catch {
                              return card.component
                            }
                          })(), card.id)}
                        </div >
                      </LocalThemeKeyProvider >
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
            </div >

            {
              canEdit && pageCategory.config.allowEdit && (
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
              )
            }
          </div >
        )}

        {/* 工作台编辑按钮 */}
        {
          isEditing && pageCategory.config.allowEdit && (
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
          )
        }

        {/* 卡片选择器 */}
        {
          showCardSelector && isEditing && pageCategory.config.allowEdit && (
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
          )
        }

        {/* 底部导航 */}
        {/* {
          showBottomNav && (
            <BottomNavigation
              dict={{
                browseComponents: "组件",
                dashboard: "仪表板",
                chat: "AI",
                search: "搜索",
                profile: "我的",
              }}
            />
          )
        } */}
      </div>
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>选择数据源</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            {configError && (
              <div className="text-sm text-red-600">{configError}</div>
            )}
            {!configError && dataSourceOptions.length === 0 && (
              <div className="text-sm text-muted-foreground">暂无可用数据源</div>
            )}
            <div className="grid grid-cols-1 gap-2">
              {dataSourceOptions.map((opt) => (
                <Button key={opt.key} variant="outline" className="justify-start" onClick={() => handleSelectDataSource(opt)}>
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </LocalThemeEditorVisibilityProvider >
  )
}

export default DynamicPageComponent
