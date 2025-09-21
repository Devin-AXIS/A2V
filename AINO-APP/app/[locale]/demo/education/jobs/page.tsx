"use client"

import { useState, use } from "react"
import { DropdownFilterTabs } from "@/components/navigation/dropdown-filter-tabs"
import { JobPositionCard } from "@/components/card/job-position-card"
import { JobOverviewCard } from "@/components/card/job-overview-card"
import { EducationBottomNavigation } from "@/components/navigation/education-bottom-navigation"
import type { Locale } from "@/lib/dictionaries"

const filterItems = [
  {
    category: "行业",
    options: [
      { label: "全部", value: "all" },
      { label: "互联网", value: "internet" },
      { label: "人工智能", value: "ai" },
      { label: "金融", value: "finance" },
    ],
    defaultValue: "all",
  },
  {
    category: "城市",
    options: [
      { label: "全国", value: "all" },
      { label: "北京", value: "beijing" },
      { label: "上海", value: "shanghai" },
      { label: "深圳", value: "shenzhen" },
      { label: "杭州", value: "hangzhou" },
    ],
    defaultValue: "all",
  },
  {
    category: "薪资",
    options: [
      { label: "不限", value: "all" },
      { label: "10K-15K", value: "10-15" },
      { label: "15K-20K", value: "15-20" },
      { label: "20K以上", value: "20+" },
    ],
    defaultValue: "all",
  },
  {
    category: "学历",
    options: [
      { label: "不限", value: "all" },
      { label: "大专", value: "college" },
      { label: "本科", value: "bachelor" },
      { label: "硕士", value: "master" },
    ],
    defaultValue: "all",
  },
]

const jobPositions = [
  {
    id: "ai-trainer", // 为每个职位添加唯一ID
    title: "人工智能训练师",
    salary: "¥15,900",
    location: "北京·本科起",
    demandGrowth: "+44%",
    salaryGrowth: "+7%",
  },
  {
    id: "prompt-engineer", // 添加ID
    title: "提示词工程师",
    salary: "¥14,600",
    location: "上海·本科起",
    demandGrowth: "+41%",
    salaryGrowth: "+5%",
  },
  {
    id: "ai-application-engineer", // 添加ID
    title: "人工智能应用师",
    salary: "¥16,800",
    location: "深圳·本科起",
    demandGrowth: "+38%",
    salaryGrowth: "+6%",
  },
  {
    id: "aigc-designer", // 添加ID
    title: "AIGC设计师",
    salary: "¥13,900",
    location: "杭州·大专起",
    demandGrowth: "+33%",
    salaryGrowth: "+4%",
  },
  {
    id: "alignment-safety-engineer", // 添加ID
    title: "对齐与安全工程师",
    salary: "¥18,200",
    location: "北京·硕士起",
    demandGrowth: "+29%",
    salaryGrowth: "+8%",
  },
]

export default function EducationJobsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params)
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    行业: "all",
    城市: "all",
    薪资: "all",
    学历: "all",
  })

  const handleFilterChange = (category: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [category]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">
            {locale === "en" ? "Job Positions" : "职位列表"}
          </h1>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="px-4 py-3 bg-white/60 backdrop-blur-sm border-b border-gray-200/40">
        <DropdownFilterTabs
          items={filterItems}
          values={filterValues}
          onValueChange={handleFilterChange}
        />
      </div>

      {/* 内容区域 */}
      <div className="px-4 py-6 space-y-6">
        {/* 职位概览卡片 */}
        <JobOverviewCard
          totalPositions={jobPositions.length}
          averageSalary="¥15,280"
          topIndustry="人工智能"
          growthRate="+38%"
        />

        {/* 职位列表 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {locale === "en" ? "Available Positions" : "可申请职位"}
          </h2>
          {jobPositions.map((position) => (
            <JobPositionCard
              key={position.id}
              position={position}
              locale={locale}
            />
          ))}
        </div>
      </div>

      {/* 底部导航 */}
      <EducationBottomNavigation locale={locale} />
    </div>
  )
}
