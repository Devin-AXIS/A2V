"use client"

import { useRouter, useParams } from "next/navigation"
import { Briefcase } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { Tag } from "@/components/basic/tag"

interface Job {
  id: number
  title: string
  avgSalary: string
  location: string
  education: string
  experience: string
  jobType: string
}

interface RelatedJobsListCardProps {
  disableLocalTheme?: boolean
  jobs?: Job[]
  title?: string
}

const defaultJobs: Job[] = [
  {
    id: 1,
    title: "AI提示词工程师",
    avgSalary: "15,000-25,000",
    location: "北京·海淀区",
    education: "本科",
    experience: "1-3年",
    jobType: "全职",
  },
  {
    id: 2,
    title: "AI产品经理",
    avgSalary: "20,000-35,000",
    location: "上海·浦东新区",
    education: "本科",
    experience: "3-5年",
    jobType: "全职",
  },
  {
    id: 3,
    title: "机器学习工程师",
    avgSalary: "18,000-30,000",
    location: "深圳·南山区",
    education: "硕士",
    experience: "2-4年",
    jobType: "全职",
  },
  {
    id: 4,
    title: "AI应用开发工程师",
    avgSalary: "16,000-28,000",
    location: "杭州·西湖区",
    education: "本科",
    experience: "1-3年",
    jobType: "全职",
  },
]

export function RelatedJobsListCard({
  disableLocalTheme,
  jobs = defaultJobs,
  title = "相关岗位",
}: RelatedJobsListCardProps) {
  const router = useRouter()
  const { locale } = useParams()

  const handleJobClick = (jobId: number) => {
    router.push(`/${locale}/demo/education/jobs/related-post/${jobId}`)
  }

  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-6 h-full w-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4" data-slot="card-title">
        {title}
      </h3>
      <div className="space-y-3 flex-1 min-h-0 overflow-auto">
        {jobs.map((job) => (
          <AppCard key={job.id}>
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleJobClick(job.id)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold" data-slot="card-title">
                        {job.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">¥{job.avgSalary}</p>
                    <p className="text-xs text-muted-foreground">平均月薪</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Tag variant="white" size="sm">
                    {job.education}
                  </Tag>
                  <Tag variant="white" size="sm">
                    {job.experience}
                  </Tag>
                  <Tag variant="white" size="sm">
                    {job.jobType}
                  </Tag>
                </div>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </AppCard>
  )
}

// Also export as default for compatibility
export default RelatedJobsListCard
