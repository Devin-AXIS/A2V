"use client"

import { useParams } from "next/navigation"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppHeader } from "@/components/navigation/app-header"
import { JobHeaderCard } from "@/components/card/jobs/job-header-card"
import { JobRequirementsCard } from "@/components/card/jobs/job-requirements-card"
import { JobBenefitsCard } from "@/components/card/jobs/job-benefits-card"
import { CompanyInfoCard } from "@/components/card/jobs/company-info-card"
import { ApplyResumeCard } from "@/components/card/jobs/apply-resume-card"

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

          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-sm z-50">
            <ApplyResumeCard data={{}} onApply={() => alert("简历投递功能开发中...")} />
          </div>
        </div>
      </div>
    </>
  )
}
