"use client"
import { PillButton } from "@/components/basic/pill-button"
import { Building2 } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"

interface RelatedJob {
  id: string
  title: string
  company: string
  location: string
  salary: string
  icon?: string
}

interface RelatedJobsListProps {
  jobs?: RelatedJob[]
  locale: string
}

export function RelatedJobsList({ jobs, locale }: RelatedJobsListProps) {
  const defaultJobs: RelatedJob[] = [
    {
      id: "ai-product-manager",
      title: "AI产品经理",
      company: "字节跳动",
      location: "北京市",
      salary: "25k-45k",
    },
    {
      id: "algorithm-engineer",
      title: "算法工程师",
      company: "阿里巴巴",
      location: "杭州市",
      salary: "30k-50k",
    },
    {
      id: "data-analyst",
      title: "数据分析师",
      company: "腾讯",
      location: "深圳市",
      salary: "20k-35k",
    },
  ]

  const jobList = jobs || defaultJobs

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">相关岗位推荐</h3>
      <div className="space-y-3">
        {jobList.map((job) => (
          <AppCard key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm" data-slot="card-title">
                    {job.title}
                  </h4>
                  <p className="text-xs text-muted-foreground" data-slot="card-text">
                    {job.company} - {job.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground mb-1">{job.salary}</div>
                <PillButton
                  variant="primary"
                  className="text-xs px-3 py-1"
                  onClick={() => {
                    window.location.href = `/${locale}/demo/education/jobs/related-post/${job.id}`
                  }}
                >
                  查看详情
                </PillButton>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  )
}
