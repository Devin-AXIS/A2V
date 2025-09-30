"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { usePageActions } from "@/hooks/use-page-actions"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppHeader } from "@/components/navigation/app-header"
import { JobHeaderCard } from "@/components/card/cards/recruitment/jobs/job-header-card"
import { JobRequirementsCard } from "@/components/card/cards/recruitment/jobs/job-requirements-card"
import { JobBenefitsCard } from "@/components/card/cards/recruitment/jobs/job-benefits-card"
import { CompanyInfoCard } from "@/components/card/cards/recruitment/jobs/company-info-card"
import { SecondaryPillBottomNav, type SecondaryPillBottomNavAction } from "@/components/navigation/secondary-pill-bottom-nav"
import { Send, Heart, Bookmark, Share } from "lucide-react"

interface JobDetail {
  id: string
  title: string
  salary: string
  location: {
    province: string
    city: string
    district: string
  }
  education: string
  experience: string
  employmentType: string
  requirements: string[]
  benefits: string[]
  company: {
    name: string
    logo: string
    description: string
  }
}

const jobData: Record<string, JobDetail> = {
  "1": {
    id: "1",
    title: "AI产品经理",
    salary: "25k-45k",
    location: {
      province: "北京",
      city: "北京市",
      district: "海淀区",
    },
    education: "本科",
    experience: "3-5年",
    employmentType: "全职",
    requirements: [
      "3年以上互联网产品经验，有人工智能相关产品经验者优先。",
      "熟悉产品设计、研发、运营全流程。",
      "具备优秀的数据分析能力和逻辑思维能力。",
      "良好的沟通协调能力和团队合作精神。",
    ],
    benefits: ["周末双休", "五险一金", "定期体检", "带薪年假", "餐饮补贴"],
    company: {
      name: "字节跳动",
      logo: "/bytedance-logo.png",
      description: "期待你的加入",
    },
  },
  "ai-product-manager": {
    id: "ai-product-manager",
    title: "AI产品经理",
    salary: "25k-45k",
    location: {
      province: "北京",
      city: "北京市",
      district: "海淀区",
    },
    education: "本科",
    experience: "3-5年",
    employmentType: "全职",
    requirements: [
      "3年以上互联网产品经验，有人工智能相关产品经验者优先。",
      "熟悉产品设计、研发、运营全流程。",
      "具备优秀的数据分析能力和逻辑思维能力。",
      "良好的沟通协调能力和团队合作精神。",
    ],
    benefits: ["周末双休", "五险一金", "定期体检", "带薪年假", "餐饮补贴"],
    company: {
      name: "字节跳动",
      logo: "/bytedance-logo.png",
      description: "期待你的加入",
    },
  },
}

export default function RelatedJobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  const locale = params.locale as string

  const job = jobData[jobId] || jobData["1"]
  const [isApplying, setIsApplying] = useState(false)

  // 使用通用页面操作Hook
  const { actions } = usePageActions({
    title: job.title,
    customActions: [
      {
        label: "投递简历",
        onClick: () => {
          setIsApplying(true)
          setTimeout(() => {
            setIsApplying(false)
            alert("简历投递成功！")
          }, 2000)
        },
        icon: <Send className="w-4 h-4" />,
        variant: "primary",
        loading: isApplying
      }
    ]
  })

  return (
    <>
      <DynamicBackground />
      <AppHeader title={job.title} showBackButton={true} />

      <div className="min-h-screen pt-16 pb-24">
        <div className="p-4 sm:p-6 space-y-6">
          <JobHeaderCard
            data={{
              title: job.title,
              salary: job.salary,
              location: job.location,
              education: job.education,
              experience: job.experience,
              employmentType: job.employmentType,
            }}
          />

          <JobRequirementsCard data={{ requirements: job.requirements }} />

          <JobBenefitsCard data={{ benefits: job.benefits }} />

          <div className="pt-4">
            <CompanyInfoCard data={{ name: job.company.name, logo: job.company.logo, description: job.company.description }} />
          </div>
        </div>
      </div>

      {/* 辅助功能胶囊型底部导航 */}
      <SecondaryPillBottomNav
        actions={actions}
        position="center"
      />
    </>
  )
}
