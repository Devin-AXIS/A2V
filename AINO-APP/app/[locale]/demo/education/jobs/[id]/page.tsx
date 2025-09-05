"use client"

import { useState, use } from "react"
import { AppCard } from "@/components/layout/app-card"
import { PercentageRankingCard } from "@/components/data-display/percentage-ranking-card"
import { WorkExperienceDonut } from "@/components/data-display/work-experience-donut"
import { JobProspectLineChart } from "@/components/data-display/job-prospect-line-chart"
import { MonthlyJobAreaChart } from "@/components/data-display/monthly-job-area-chart"
import { CompanyRankingList } from "@/components/data-display/company-ranking-list"
import { SalaryExperienceDonut } from "@/components/data-display/salary-experience-donut"
import { EducationBottomNavigation } from "@/components/navigation/education-bottom-navigation"
import { PillNavigation } from "@/components/navigation/pill-navigation"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppHeader } from "@/components/navigation/app-header"
import type { Locale } from "@/lib/dictionaries"
import { SalaryOverviewCard } from "@/components/data-display/salary-overview-card"
import { AbilityRequirementsRadar } from "@/components/data-display/ability-requirements-radar"
import { CoreSkillsMastery } from "@/components/data-display/core-skills-mastery"
import { BasicAbilityRequirements } from "@/components/data-display/basic-ability-requirements"
import { EducationBackground } from "@/components/data-display/education-background"
import { RelatedJobsListCard } from "@/components/card/business-cards/related-jobs-list-card"

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>
}) {
  const { locale, id } = use(params)
  const [activeTab, setActiveTab] = useState("职业数据")
  const tabs = ["职业数据", "具备能力", "相关岗位"]

  const educationData = [
    { label: "大专", value: "¥12,000", percentage: 15, color: "#10b981" },
    { label: "本科", value: "¥15,900", percentage: 60, color: "#06b6d4" },
    { label: "硕士", value: "¥18,500", percentage: 20, color: "#8b5cf6" },
    { label: "博士", value: "¥22,000", percentage: 5, color: "#f59e0b" },
  ]

  const cityData = [
    { label: "武汉", value: "8", percentage: 40, color: "#10b981" },
    { label: "北京", value: "5", percentage: 35, color: "#06b6d4" },
    { label: "深圳", value: "5", percentage: 25, color: "#8b5cf6" },
  ]

  const relatedJobsData = [
    {
      id: "ai-product-manager",
      title: "AI产品经理",
      company: "字节跳动",
      location: "北京市",
      salary: "25k-45k",
      education: "本科",
      experience: "3-5年",
      type: "全职",
    },
    {
      id: "algorithm-engineer",
      title: "算法工程师",
      company: "阿里巴巴",
      location: "杭州市",
      salary: "30k-50k",
      education: "硕士",
      experience: "3-5年",
      type: "全职",
    },
    {
      id: "data-analyst",
      title: "数据分析师",
      company: "腾讯",
      location: "深圳市",
      salary: "20k-35k",
      education: "本科",
      experience: "1-3年",
      type: "全职",
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "职业数据":
        return (
          <>
            <AppCard className="p-6">
              <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                人工智能训练师收入分布怎么样？
              </h2>
              <SalaryOverviewCard />
            </AppCard>

            <AppCard className="p-6">
              <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                不同学历的收入要求
              </h2>
              <PercentageRankingCard
                title=""
                description="学历不同，人工智能训练师的收入要求是否相同呢？本科学历占比最高为60%，平均薪资¥15,900；硕士学历占比20%，平均薪资¥18,500；博士学历占比5%，平均薪资¥22,000。"
                data={educationData}
                columns={{
                  label: "学历要求",
                  value: "平均薪资",
                  percentage: "占比",
                }}
                showTitle={false}
              />
            </AppCard>

            <AppCard className="p-6">
              <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                不同工作年限的工作者占比
              </h2>
              <p className="text-sm text-muted-foreground mb-4" data-slot="card-text">
                工作年限不同，人工智能训练师的工作机会是否相同呢？面向工作年限1到3年的人群职位开放数为1个，占比为25%；面向不限工作年限的人群职位开放数为3个，占比为75%。
              </p>
              <WorkExperienceDonut />
            </AppCard>

            <AppCard className="p-6">
              <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                就业前景怎么样？
              </h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xl font-bold text-primary">4</div>
                  <div className="text-xs text-muted-foreground">06月新增职位</div>
                </div>
                <div className="text-xs text-muted-foreground">排名第18</div>
              </div>
              <JobProspectLineChart />
            </AppCard>

            <AppCard className="p-6">
              <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                每月新增多少职位？
              </h2>
              <MonthlyJobAreaChart />
            </AppCard>

            <AppCard className="p-6">
              <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                工作城市排名
              </h2>
              <PercentageRankingCard
                title=""
                description="不同城市的人工智能训练师职位分布情况如何？武汉地区职位数量最多，占比40%；北京和深圳分别占比35%和25%，薪资水平也有所差异。"
                data={cityData}
                columns={{
                  label: "城市",
                  value: "职位数量",
                  percentage: "职位占比",
                }}
                showTitle={false}
              />
            </AppCard>

            <AppCard className="p-6">
              <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                新兴业务领域企业排行
              </h2>
              <CompanyRankingList />
            </AppCard>
          </>
        )
      case "具备能力":
        return (
          <>
            <AppCard className="p-6">
              <AbilityRequirementsRadar />
            </AppCard>

            <AppCard className="p-6">
              <CoreSkillsMastery />
            </AppCard>

            <AppCard className="p-6">
              <BasicAbilityRequirements />
            </AppCard>

            <AppCard className="p-6">
              <EducationBackground />
            </AppCard>
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
        <AppCard className="p-6">
          <h1 className="text-base font-semibold mb-3" data-slot="card-title">
            人工智能训练师
          </h1>
          <p className="text-sm text-muted-foreground mb-6" data-slot="card-text">
            人工智能训练师是一种非常重要的职位，主要负责指导和帮助用户以及其他相关人员更好地掌握人工智能相关技术和技能。训练师将为客户提供实践经验，并利用人工智能技术和工具来协助客户实现其业务目标。
          </p>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">平均月薪</div>
              <div className="text-2xl font-bold text-primary">¥15900</div>
              <div className="text-xs text-muted-foreground">来自全网10份数据</div>
            </div>
            <SalaryExperienceDonut />
          </div>
        </AppCard>

        <div className="px-4">
          <PillNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="justify-start" />
        </div>

        {renderTabContent()}
      </div>

      <EducationBottomNavigation locale={locale} />
    </div>
  )
}
