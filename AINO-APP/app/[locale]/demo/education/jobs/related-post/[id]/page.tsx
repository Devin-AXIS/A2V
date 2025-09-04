"use client"

import { useParams, useRouter } from "next/navigation"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppHeader } from "@/components/navigation/app-header"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { Tag } from "@/components/basic/tag" // 添加公用Tag组件导入
import { MapPin, GraduationCap, Briefcase, Clock, DollarSign, CheckCircle } from "lucide-react"
import Image from "next/image"

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
  const router = useRouter()
  const jobId = params.id as string
  const locale = params.locale as string

  const job = jobData[jobId] || jobData["1"]

  return (
    <>
      <DynamicBackground />
      <AppHeader title={job.title} showBackButton={true} />

      <div className="min-h-screen pt-16 pb-24">
        <div className="p-4 sm:p-6 space-y-6">
          <AppCard>
            <div className="p-5 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">{job.salary}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <span>{`${job.location.province}·${job.location.city}·${job.location.district}`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span>{job.education}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{job.experience}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{job.employmentType}</span>
                </div>
              </div>
            </div>
          </AppCard>

          <AppCard>
            <div className="p-5 space-y-4">
              <h3 className="text-base font-semibold">岗位需求</h3>
              <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </AppCard>

          <AppCard>
            <div className="p-5 space-y-4">
              <h3 className="text-base font-semibold">特色待遇</h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit) => (
                  <Tag key={benefit} variant="white" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                    {benefit}
                  </Tag>
                ))}
              </div>
            </div>
          </AppCard>

          <div className="pt-4">
            <AppCard>
              <div className="p-4 flex items-center gap-4">
                <Image
                  src={job.company.logo || "/placeholder.svg"}
                  alt={`${job.company.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-lg bg-white p-1"
                />
                <div>
                  <p className="font-bold text-gray-800">{job.company.name}</p>
                  <p className="text-xs text-gray-500">{job.company.description}</p>
                </div>
              </div>
            </AppCard>
          </div>

          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-sm z-50">
            <AppCard>
              <div className="p-3">
                <PillButton
                  variant="primary"
                  className="w-full py-3 px-6 text-lg font-semibold"
                  onClick={() => {
                    alert("简历投递功能开发中...")
                  }}
                >
                  投递简历
                </PillButton>
              </div>
            </AppCard>
          </div>
        </div>
      </div>
    </>
  )
}
