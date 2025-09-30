"use client"

import { useState } from "react"
import { Tabs } from "@/components/navigation/tabs"
import { Breadcrumbs } from "@/components/navigation/breadcrumbs"
import { SegmentedControl } from "@/components/navigation/segmented-control"
import { ActionToolbar } from "@/components/navigation/action-toolbar"
import { FilterTabs, type FilterTabItem } from "@/components/navigation/filter-tabs"
import { DropdownFilterTabs, type DropdownFilterItem } from "@/components/navigation/dropdown-filter-tabs"
import { CategoryTabNavigation } from "@/components/navigation/category-tab-navigation"
import { FilterPillNavigation } from "@/components/navigation/filter-pill-navigation"
import { Home, Settings, User, Star, Zap, Heart, Check, Bookmark, Share, Download, MessageCircle, Copy, Users, ShoppingCart, CreditCard, Trash2, Edit, Filter, Search, Bell, Mail } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { PillNavigation } from "@/components/navigation/pill-navigation"
import { PillButton } from "@/components/basic/pill-button"
import ContentNavigation, { type ContentNavConfig } from "@/components/navigation/content-navigation"
import { 
  PrimaryPillBottomNav, 
  SecondaryPillBottomNav,
  SinglePillBottomNav,
  PillNavigationBar,
  TextActionBottomNav,
  type PrimaryPillBottomNavAction,
  type SecondaryPillBottomNavAction,
  type SinglePillBottomNavAction,
  type PillNavigationBarItem,
  type TextActionBottomNavAction,
  type TextActionBottomNavInfo
} from "@/components/navigation"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"

interface NavigationComponentsClientViewProps {
  dict: {
    title: string
    tabs: string
    tabsContent: string[]
    appHeader: string
    appHeaderDescription: string
    breadcrumbs: string
    breadcrumbItems: { label: string; href: string }[]
    segmentedControl: string
    actionToolbar: string
    filterTabs: string
  }
}

export function NavigationComponentsClientView({ dict }: NavigationComponentsClientViewProps) {
  
  const [activeTab, setActiveTab] = useState(dict.tabsContent[0])
  const [activeFilterTab, setActiveFilterTab] = useState("Featured")
  const [activePillTab, setActivePillTab] = useState("职业数据")
  const [activeSegmentedControl, setActiveSegmentedControl] = useState("home")
  const [dropdownFilters, setDropdownFilters] = useState<Record<string, string>>({
    industry: "全部",
    city: "全国",
    salary: "不限",
    education: "不限",
  })

  // 胶囊导航状态
  const [primaryLoading, setPrimaryLoading] = useState(false)
  
  // 交互状态
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showShareDrawer, setShowShareDrawer] = useState(false)

  // 交互处理函数
  const handleLike = () => {
    setIsLiked(!isLiked)
    // 这里可以添加API调用
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    // 这里可以添加API调用
  }

  const handleShare = (platform: string) => {
    const currentUrl = window.location.href
    const title = "AINO 导航组件演示"
    
    switch (platform) {
      case 'wechat':
        // 微信分享需要微信SDK
        alert('微信分享功能需要微信SDK支持')
        break
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(`${title} ${currentUrl}`)}`)
        break
      case 'copy':
        navigator.clipboard.writeText(currentUrl).then(() => {
          alert('链接已复制到剪贴板')
        })
        break
      case 'moments':
        // 朋友圈分享需要微信SDK
        alert('朋友圈分享功能需要微信SDK支持')
        break
    }
    setShowShareDrawer(false)
  }

  const segmentedControlItems = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ]

  // 主功能胶囊导航配置 - 2个按钮（可配置内容）
  const primaryPillActions: PrimaryPillBottomNavAction[] = [
    {
      label: "确定",
      onClick: () => {
        setPrimaryLoading(true)
        setTimeout(() => setPrimaryLoading(false), 2000)
        alert("操作成功！")
      },
      variant: "primary",
      icon: <Check className="w-4 h-4" />,
      loading: primaryLoading
    },
    {
      label: "取消",
      onClick: () => alert("已取消"),
      variant: "default"
    }
  ]

  // 辅助功能胶囊导航配置 - 1个主胶囊 + 3个图标按钮
  const secondaryPillActions: SecondaryPillBottomNavAction[] = [
    {
      label: "主操作胶囊",
      onClick: () => alert("主操作功能"),
      icon: <Star className="w-4 h-4" />,
      variant: "primary",
      isMain: true
    },
    {
      label: "",
      onClick: handleLike,
      icon: <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500' : ''}`} />,
      iconOnly: true
    },
    {
      label: "",
      onClick: handleFavorite,
      icon: <Bookmark className={`w-4 h-4 transition-colors ${isFavorited ? 'text-yellow-500' : ''}`} />,
      iconOnly: true
    },
    {
      label: "",
      onClick: () => setShowShareDrawer(true),
      icon: <Share className="w-4 h-4" />,
      iconOnly: true
    }
  ]

  // 单个胶囊底部导航配置
  const singlePillAction: SinglePillBottomNavAction = {
    label: "立即购买",
    onClick: () => alert("立即购买"),
    icon: <ShoppingCart className="w-4 h-4" />,
    variant: "primary"
  }

  // 底部胶囊导航栏配置
  const pillNavBarItems: PillNavigationBarItem[] = [
    {
      id: "home",
      label: "首页",
      icon: <Home className="w-4 h-4" />,
      onClick: () => alert("首页")
    },
    {
      id: "search",
      label: "搜索",
      icon: <Search className="w-4 h-4" />,
      onClick: () => alert("搜索")
    },
    {
      id: "filter",
      label: "筛选",
      icon: <Filter className="w-4 h-4" />,
      onClick: () => alert("筛选"),
      badge: 2
    },
    {
      id: "favorites",
      label: "收藏",
      icon: <Heart className="w-4 h-4" />,
      onClick: () => alert("收藏")
    },
    {
      id: "notifications",
      label: "通知",
      icon: <Bell className="w-4 h-4" />,
      onClick: () => alert("通知"),
      badge: 5
    },
    {
      id: "settings",
      label: "设置",
      icon: <Settings className="w-4 h-4" />,
      onClick: () => alert("设置")
    }
  ]

  // 左文字右按钮导航配置
  const textActionInfo: TextActionBottomNavInfo = {
    title: "总计: ¥299.00",
    subtitle: "已选择 3 个商品",
    icon: <ShoppingCart className="w-4 h-4" style={{ color: "var(--card-accent-color, #3b82f6)" }} />
  }

  const textActionButtons: TextActionBottomNavAction[] = [
    {
      id: "addToCart",
      label: "加购物车",
      icon: <ShoppingCart className="w-4 h-4" />,
      onClick: () => alert("已加入购物车"),
      variant: "default"
    },
    {
      id: "buyNow",
      label: "立即购买",
      icon: <CreditCard className="w-4 h-4" />,
      onClick: () => alert("立即购买"),
      variant: "primary"
    }
  ]

  // 其他场景的左文字右按钮配置
  const managementInfo: TextActionBottomNavInfo = {
    title: "已选择 5 项",
    subtitle: "管理模式",
    icon: <Edit className="w-5 h-5" style={{ color: "var(--card-accent-color, #3b82f6)" }} />
  }

  const managementActions: TextActionBottomNavAction[] = [
    {
      id: "delete",
      label: "删除",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => alert("删除选中项"),
      variant: "default"
    },
    {
      id: "share",
      label: "分享",
      icon: <Share className="w-4 h-4" />,
      onClick: () => alert("分享选中项"),
      variant: "primary"
    }
  ]

  const filterTabItems: FilterTabItem[] = [
    { label: "Featured", icon: <Star className="w-4 h-4 mr-2" /> },
    { label: "Popular", icon: <Zap className="w-4 h-4 mr-2" /> },
    { label: "Favorites", icon: <Heart className="w-4 h-4 mr-2" /> },
  ]

  const pillNavigationTabs = ["职业数据", "具备能力", "相关岗位", "技能要求", "发展前景"]

  const dropdownFilterItems: DropdownFilterItem[] = [
    {
      category: "industry",
      defaultValue: "全部",
      options: [
        { label: "全部", value: "全部" },
        { label: "互联网", value: "互联网" },
        { label: "人工智能", value: "人工智能" },
        { label: "金融", value: "金融" },
      ],
    },
    {
      category: "city",
      defaultValue: "全国",
      options: [
        { label: "全国", value: "全国" },
        { label: "北京", value: "北京" },
        { label: "上海", value: "上海" },
        { label: "深圳", value: "深圳" },
      ],
    },
    {
      category: "salary",
      defaultValue: "不限",
      options: [
        { label: "不限", value: "不限" },
        { label: "10K-20K", value: "10K-20K" },
        { label: "20K-30K", value: "20K-30K" },
        { label: "30K以上", value: "30K以上" },
      ],
    },
    {
      category: "education",
      defaultValue: "不限",
      options: [
        { label: "不限", value: "不限" },
        { label: "本科", value: "本科" },
        { label: "硕士", value: "硕士" },
        { label: "博士", value: "博士" },
      ],
    },
  ]

  // Demo configs for ContentNavigation
  const navTextConfig: ContentNavConfig = {
    type: "text",
    header: { title: "标题内容", search: true, notify: true },
    items: [
      { title: "默认" },
      { title: "导航1" },
      { title: "导航2" },
      { title: "导航3" },
      { title: "导航5" },
    ],
  }
  const navIconGridConfig: ContentNavConfig = {
    type: "iconText",
    layout: "grid-5",
    items: [
      { title: "简单赚钱" },
      { title: "链上赚钱" },
      { title: "借贷" },
      { title: "策略交易" },
      { title: "BTC 理财" },
    ],
  }
  const navIconScrollConfig: ContentNavConfig = {
    type: "iconText",
    layout: "scroll",
    items: [
      { title: "A" },
      { title: "B" },
      { title: "C" },
      { title: "D" },
      { title: "E" },
      { title: "F" },
      { title: "G" },
    ],
  }

  return (
    <main className="px-4">
      <div className="space-y-12 pt-16">
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">内容导航（文字标签）</h3>
          <AppCard className="p-0 overflow-hidden">
            <ContentNavigation config={navTextConfig} />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">内容导航（图+文 · 网格一行5）</h3>
          <AppCard className="p-0 overflow-hidden">
            <ContentNavigation config={navIconGridConfig} />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">内容导航（图+文 · 横向滑动）</h3>
          <AppCard className="p-0 overflow-hidden">
            <ContentNavigation config={navIconScrollConfig} />
          </AppCard>
        </section>
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">分类顶部导航（含搜索/通知）</h3>
          <AppCard className="p-0 overflow-hidden">
            <CategoryTabNavigation
              onSearchChange={(query) => console.log("Search:", query)}
              onMenuClick={() => console.log("Menu clicked")}
              onMessageClick={() => console.log("Message clicked")}
              onTabChange={(tab) => console.log("Tab changed:", tab)}
            />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">筛选胶囊导航</h3>
          <AppCard className="p-0 overflow-hidden">
            <FilterPillNavigation
              onSearchChange={(query) => console.log("Filter search:", query)}
              onFilterChange={(filter) => console.log("Filter changed:", filter)}
            />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.tabs}</h3>
          <AppCard className="flex justify-center items-center p-8">
            <Tabs tabs={dict.tabsContent} activeTab={activeTab} onTabChange={setActiveTab} />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.filterTabs}</h3>
          <AppCard className="flex justify-center items-center p-8">
            <FilterTabs items={filterTabItems} activeItem={activeFilterTab} onItemChange={setActiveFilterTab} />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">下拉筛选标签</h3>
          <div className="bg-card text-card-foreground shadow-sm border rounded-xl p-4">
            <DropdownFilterTabs
              items={dropdownFilterItems}
              values={dropdownFilters}
              onValueChange={(category, value) => setDropdownFilters(prev => ({ ...prev, [category]: value }))}
            />
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Pill Navigation</h3>
          <AppCard className="p-8">
            <PillNavigation tabs={pillNavigationTabs} activeTab={activePillTab} onTabChange={setActivePillTab} />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.appHeader}</h3>
          <AppCard className="flex justify-center items-center h-40 p-8">
            <p style={{ color: "var(--card-text-color)" }}>{dict.appHeaderDescription}</p>
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.breadcrumbs}</h3>
          <AppCard className="flex justify-center items-center p-8">
            <Breadcrumbs items={dict.breadcrumbItems} />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.segmentedControl}</h3>
          <AppCard className="flex justify-center items-center p-8">
            <SegmentedControl 
              options={segmentedControlItems} 
              value={activeSegmentedControl}
              onChange={setActiveSegmentedControl}
            />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.actionToolbar}</h3>
          <AppCard className="flex justify-center items-center p-8">
            <ActionToolbar />
          </AppCard>
        </section>

        {/* 主功能胶囊型底部导航 */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">主功能胶囊型底部导航</h3>
          <AppCard className="p-6">
            <div className="flex gap-2">
              {primaryPillActions.map((action, index) => (
                <PillButton
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                  variant={action.variant || (index === 0 ? "primary" : "default")}
                  className="flex-1 h-10 flex items-center justify-center gap-2 text-sm"
                >
                  {action.loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    action.icon
                  )}
                  {action.loading ? "处理中..." : action.label}
                </PillButton>
              ))}
            </div>
          </AppCard>
        </section>

        {/* 辅助功能胶囊型底部导航 */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">辅助功能胶囊型底部导航</h3>
          <AppCard className="p-6">
            <div className="flex items-center gap-2">
              {secondaryPillActions.map((action, index) => (
                <div key={index} className="relative" style={{
                  // 主胶囊按钮占满大部分空间，图标按钮固定宽度
                  flex: action.iconOnly ? '0 0 40px' : '1'
                }}>
                  {action.iconOnly ? (
                    // 圆形图标按钮
                    <button
                      onClick={action.onClick}
                      disabled={action.disabled || action.loading}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: "var(--card-background, #ffffff)",
                        color: "var(--card-text-color, #64748b)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      {action.loading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        action.icon
                      )}
                    </button>
                  ) : (
                    // 主胶囊按钮 - 占满剩余空间
                    <PillButton
                      onClick={action.onClick}
                      disabled={action.disabled || action.loading}
                      variant={action.variant || "default"}
                      className="w-full h-10 flex items-center justify-center gap-2 px-4 text-sm"
                    >
                      {action.loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        action.icon
                      )}
                      {action.loading ? "..." : action.label}
                    </PillButton>
                  )}
                  
                  {/* 徽章显示 */}
                  {action.badge && action.badge > 0 && (
                    <div 
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold px-1"
                      style={{
                        backgroundColor: "var(--card-error-color, #ef4444)",
                        color: "#ffffff"
                      }}
                    >
                      {action.badge > 99 ? "99+" : action.badge}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AppCard>
        </section>

        {/* 单个胶囊底部导航 */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">单个胶囊底部导航</h3>
          <AppCard className="p-6">
            <PillButton
              onClick={singlePillAction.onClick}
              disabled={singlePillAction.disabled || singlePillAction.loading}
              variant={singlePillAction.variant || "primary"}
              className="w-full h-10 flex items-center justify-center gap-2 px-6 text-sm"
            >
              {singlePillAction.loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                singlePillAction.icon
              )}
              {singlePillAction.loading ? "处理中..." : singlePillAction.label}
            </PillButton>
          </AppCard>
        </section>

        {/* 胶囊导航底部 */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">胶囊导航底部</h3>
          <AppCard>
            <PillNavigationBar
              items={pillNavBarItems.slice(0, 4)}
              activeId="home"
            />
          </AppCard>
        </section>

        {/* 文字+胶囊导航底部 */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">文字+胶囊导航底部</h3>
          <AppCard>
            <TextActionBottomNav
              info={textActionInfo}
              actions={textActionButtons}
            />
          </AppCard>
        </section>
      </div>

      {/* 分享抽屉 */}
      <BottomDrawer
        isOpen={showShareDrawer}
        onClose={() => setShowShareDrawer(false)}
        title="分享到"
      >
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {/* 微信 */}
            <button
              onClick={() => handleShare('wechat')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs" style={{ color: "var(--card-text-color)" }}>微信</span>
            </button>

            {/* 朋友圈 */}
            <button
              onClick={() => handleShare('moments')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs" style={{ color: "var(--card-text-color)" }}>朋友圈</span>
            </button>

            {/* 短信 */}
            <button
              onClick={() => handleShare('sms')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs" style={{ color: "var(--card-text-color)" }}>短信</span>
            </button>

            {/* 复制链接 */}
            <button
              onClick={() => handleShare('copy')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                <Copy className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs" style={{ color: "var(--card-text-color)" }}>复制链接</span>
            </button>
          </div>

          {/* 取消按钮 */}
          <PillButton
            onClick={() => setShowShareDrawer(false)}
            variant="default"
            className="w-full mt-6"
          >
            取消
          </PillButton>
        </div>
      </BottomDrawer>
    </main>
  )
}
