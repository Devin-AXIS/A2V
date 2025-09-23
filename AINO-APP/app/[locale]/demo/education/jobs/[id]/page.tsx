"use client"

import { useState, use } from "react"
import { SecondaryPillBottomNav, type SecondaryPillBottomNavAction } from "@/components/navigation/secondary-pill-bottom-nav"
import { Bot } from "lucide-react"
import { usePageActions } from "@/hooks/use-page-actions"
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
import JobDetailIntroCard from "@/components/card/cards/recruitment/jobs/job-detail-intro-card"
import JobSalaryOverviewCard from "@/components/card/cards/recruitment/jobs/job-salary-overview-card"
import EducationSalaryRequirementsCard from "@/components/card/cards/recruitment/jobs/education-salary-requirements-card"
import JobExperienceRatioCard from "@/components/card/cards/recruitment/job-experience-ratio-card"
import JobProspectTrendCard from "@/components/card/cards/recruitment/jobs/job-prospect-trend-card"
import MonthlyJobGrowthCard from "@/components/card/cards/recruitment/jobs/monthly-job-growth-card"
import JobCityRankingCard from "@/components/card/cards/recruitment/jobs/job-city-ranking-card"
import CompanyRankingCard from "@/components/card/cards/recruitment/jobs/company-ranking-card"
import AbilityRequirementsRadarCard from "@/components/card/cards/recruitment/jobs/ability-requirements-radar-card"
import CoreSkillsMasteryCard from "@/components/card/cards/recruitment/jobs/core-skills-mastery-card"
import BasicAbilityRequirementsCard from "@/components/card/cards/recruitment/jobs/basic-ability-requirements-card"
import EducationBackgroundCard from "@/components/card/cards/recruitment/jobs/education-background-card"
import { RelatedJobsListCard } from "@/components/card/cards/recruitment/related-jobs-list-card"

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>
}) {
  const { locale, id } = use(params)
  const [activeTab, setActiveTab] = useState("职业数据")
  const tabs = ["职业数据", "具备能力", "相关岗位"]

  const [isTesting, setIsTesting] = useState(false)

  // 使用通用页面操作Hook
  const { actions } = usePageActions({
    title: "人工智能训练师",
    customActions: [
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
      }
    ]
  })

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


  const renderTabContent = () => {
    switch (activeTab) {
      case "职业数据":
        return (
          <>
            <JobSalaryOverviewCard />

            <EducationSalaryRequirementsCard />

            <JobExperienceRatioCard />

            <JobProspectTrendCard />

            <MonthlyJobGrowthCard />

            <JobCityRankingCard />

            <CompanyRankingCard />
          </>
        )
      case "具备能力":
        return (
          <>
            <AbilityRequirementsRadarCard />

            <CoreSkillsMasteryCard />

            <BasicAbilityRequirementsCard />

            <EducationBackgroundCard />
          </>
        )
      case "相关岗位":
        return <RelatedJobsListCard jobs={relatedJobsData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <DynamicBackground />
      <AppHeader title="职位详情" showBackButton={true} />
      <div className="pt-16 p-4 space-y-6">
        <JobDetailIntroCard className="p-6" />

        <div className="px-4">
          <PillNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="justify-start" />
        </div>

        {renderTabContent()}
      </div>

      {/* 辅助功能胶囊型底部导航 */}
      <SecondaryPillBottomNav
        actions={actions}
        position="center"
      />
    </div>
  )
}
