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
import { Home, Settings, User, Star, Zap, Heart } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { PillNavigation } from "@/components/navigation/pill-navigation"

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

  const segmentedControlItems = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
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
      label: "行业",
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
      label: "城市",
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
      label: "薪资",
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
      label: "学历",
      defaultValue: "不限",
      options: [
        { label: "不限", value: "不限" },
        { label: "本科", value: "本科" },
        { label: "硕士", value: "硕士" },
        { label: "博士", value: "博士" },
      ],
    },
  ]

  return (
    <main className="px-4">
      <div className="space-y-12 pt-16">
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">媒体导航</h3>
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
          <h3 className="text-xl font-semibold text-gray-800 mb-4">食谱导航</h3>
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
      </div>
    </main>
  )
}
