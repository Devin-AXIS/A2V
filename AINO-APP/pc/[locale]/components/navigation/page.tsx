import { getDictionary, type Locale } from "@/lib/dictionaries"
import { Breadcrumbs } from "@/components/navigation/breadcrumbs"
import { FilterTabs } from "@/components/navigation/filter-tabs"
import { SegmentedControl } from "@/components/navigation/segmented-control"
import { ActionToolbar } from "@/components/navigation/action-toolbar"
import { Tabs } from "@/components/navigation/tabs"
import { ArrowLeft, Home, Folder, File, Edit, Delete, Share, Download } from 'lucide-react'
import Link from "next/link"

export default async function PCNavigationComponentsPage({ params: { locale } }: { params: { locale: Locale } }) {
  const dict = await getDictionary(locale)

  const breadcrumbItems = [
    { label: "首页", href: `/pc/${locale}`, icon: Home },
    { label: "组件", href: `/pc/${locale}/components`, icon: Folder },
    { label: "导航", href: `/pc/${locale}/components/navigation`, icon: File },
  ]

  const filterOptions = [
    { id: "all", label: "全部", count: 24 },
    { id: "active", label: "活跃", count: 12 },
    { id: "pending", label: "待处理", count: 8 },
    { id: "completed", label: "已完成", count: 4 },
  ]

  const segmentedOptions = [
    { id: "list", label: "列表视图" },
    { id: "grid", label: "网格视图" },
    { id: "card", label: "卡片视图" },
  ]

  const toolbarActions = [
    { id: "edit", label: "编辑", icon: Edit },
    { id: "delete", label: "删除", icon: Delete },
    { id: "share", label: "分享", icon: Share },
    { id: "download", label: "下载", icon: Download },
  ]

  const tabItems = [
    { id: "overview", label: "概览" },
    { id: "details", label: "详情" },
    { id: "settings", label: "设置" },
    { id: "history", label: "历史" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* PC Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/pc/${locale}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-800">导航组件</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          
          {/* Breadcrumbs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">面包屑导航</h3>
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Filter Tabs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">筛选标签</h3>
            <FilterTabs
              options={filterOptions}
              activeFilter="all"
              onFilterChange={(filter) => console.log('Filter changed to:', filter)}
            />
          </div>

          {/* Segmented Control */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">分段控制器</h3>
            <SegmentedControl
              options={segmentedOptions}
              value="list"
              onChange={(value) => console.log('Segmented control changed to:', value)}
            />
          </div>

          {/* Action Toolbar */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">操作工具栏</h3>
            <ActionToolbar
              actions={toolbarActions}
              onActionClick={(actionId) => console.log('Action clicked:', actionId)}
            />
          </div>

          {/* Tabs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">标签页</h3>
            <Tabs
              items={tabItems}
              activeTab="overview"
              onTabChange={(tabId) => console.log('Tab changed to:', tabId)}
            />
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">这里是标签页内容区域</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
