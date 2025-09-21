"use client"

import { useState, use } from "react"
import { SecondaryPillBottomNav, type SecondaryPillBottomNavAction } from "@/components/navigation/secondary-pill-bottom-nav"
import { Bot, Heart, Bookmark, Share } from "lucide-react"
// import { useFavorites } from "@/hooks/use-favorites"
import { AppCard } from "@/components/layout/app-card"
import { PercentageRankingCard } from "@/components/data-display/percentage-ranking-card"
import { WorkExperienceDonut } from "@/components/data-display/work-experience-donut"
import { JobProspectLineChart } from "@/components/data-display/job-prospect-line-chart"
import { MonthlyJobAreaChart } from "@/components/data-display/monthly-job-area-chart"
import { CompanyRankingList } from "@/components/data-display/company-ranking-list"
import { SalaryExperienceDonut } from "@/components/data-display/salary-experience-donut"
import { PillNavigation } from "@/components/navigation/pill-navigation"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppHeader } from "@/components/navigation/app-header"
import type { Locale } from "@/lib/dictionaries"
// import JobDetailIntroCard from "@/components/card/jobs/job-detail-intro-card"
// import JobSalaryOverviewCard from "@/components/card/jobs/job-salary-overview-card"
// import EducationSalaryRequirementsCard from "@/components/card/jobs/education-salary-requirements-card"
// import JobExperienceRatioCard from "@/components/card/business-cards/job-experience-ratio-card"
// import JobProspectTrendCard from "@/components/card/jobs/job-prospect-trend-card"
// import MonthlyJobGrowthCard from "@/components/card/jobs/monthly-job-growth-card"
// import JobCityRankingCard from "@/components/card/jobs/job-city-ranking-card"
// import CompanyRankingCard from "@/components/card/jobs/company-ranking-card"
// import AbilityRequirementsRadarCard from "@/components/card/jobs/ability-requirements-radar-card"
// import CoreSkillsMasteryCard from "@/components/card/jobs/core-skills-mastery-card"
// import BasicAbilityRequirementsCard from "@/components/card/jobs/basic-ability-requirements-card"
// import EducationBackgroundCard from "@/components/card/jobs/education-background-card"
// import { RelatedJobsListCard } from "@/components/card/business-cards/related-jobs-list-card"

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>
}) {
  const { locale, id } = use(params)
  const [activeTab, setActiveTab] = useState("职业数据")
  const tabs = ["职业数据", "具备能力", "相关岗位"]

  // 临时使用本地状态（稍后连接全局状态）
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  // 当前页面信息
  const currentPageUrl = `/zh/demo/education/jobs/${id}`
  const currentPageInfo = {
    id: `job-${id}`,
    title: "人工智能训练师",
    url: currentPageUrl
  }

  // 数据改由各卡片自行通过 useCardRegistryData 读取，保留局部默认在卡片内实现

  const relatedJobsData = [
    {
      id: 1,
      title: "AI产品经理",
      avgSalary: "25k-45k",
      location: "北京市",
      education: "本科",
      experience: "3-5年",
      jobType: "全职",
    },
    {
      id: 2,
      title: "算法工程师",
      avgSalary: "30k-50k",
      location: "杭州市",
      education: "硕士",
      experience: "3-5年",
      jobType: "全职",
    },
    {
      id: 3,
      title: "数据分析师",
      avgSalary: "20k-35k",
      location: "深圳市",
      education: "本科",
      experience: "1-3年",
      jobType: "全职",
    },
  ]

  // 辅助功能胶囊型底部导航配置
  const secondaryPillActions: SecondaryPillBottomNavAction[] = [
    {
      label: "测试匹配度",
      onClick: () => {
        setIsTesting(true)
        setTimeout(() => {
          setIsTesting(false)
          alert("AI匹配度分析完成！匹配度：85%")
        }, 2000)
      },
      icon: <Bot className="w-4 h-4" />,
      variant: "primary",
      loading: isTesting
    },
    {
      label: "",
      onClick: () => setIsLiked(!isLiked),
      icon: <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500' : ''}`} />,
      iconOnly: true
    },
    {
      label: "",
      onClick: () => setIsFavorited(!isFavorited),
      icon: <Bookmark className={`w-4 h-4 transition-colors ${isFavorited ? 'text-yellow-500' : ''}`} />,
      iconOnly: true
    },
    {
      label: "",
      onClick: () => alert("分享功能"),
      icon: <Share className="w-4 h-4" />,
      iconOnly: true
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "职业数据":
        return (
          <div className="space-y-6">
            <AppCard className="p-6">
              <h2 className="text-lg font-bold mb-4">收入分布</h2>
              <p className="text-gray-600">职业数据卡片内容...</p>
            </AppCard>
          </div>
        )
      case "具备能力":
        return (
          <div className="space-y-6">
            <AppCard className="p-6">
              <h2 className="text-lg font-bold mb-4">能力要求</h2>
              <p className="text-gray-600">能力要求卡片内容...</p>
            </AppCard>
          </div>
        )
      case "相关岗位":
        return (
          <div className="space-y-6">
            <AppCard className="p-6">
              <h2 className="text-lg font-bold mb-4">相关岗位</h2>
              <div className="space-y-3">
                {relatedJobsData.map((job) => (
                  <div key={job.id} className="p-3 border rounded-lg">
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.location} · {job.avgSalary}</p>
                  </div>
                ))}
              </div>
            </AppCard>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <DynamicBackground />
      <AppHeader title="职位详情" showBackButton={true} />
      <div className="pt-16 p-4 space-y-6">
        <AppCard className="p-6">
          <h1 className="text-xl font-bold mb-4">人工智能训练师</h1>
          <p className="text-gray-600 mb-4">
            人工智能训练师是一种非常重要的职位，主要负责指导和帮助用户以及其他相关人员更好地掌握人工智能相关技术和技能。
          </p>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-500">平均月薪</div>
              <div className="text-2xl font-bold text-blue-600">¥15,900</div>
            </div>
          </div>
        </AppCard>

        <div className="px-4">
          <PillNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="justify-start" />
        </div>

        {renderTabContent()}
      </div>

      {/* 辅助功能胶囊型底部导航 */}
      <SecondaryPillBottomNav
        actions={secondaryPillActions}
        position="center"
      />
    </div>
  )
}
