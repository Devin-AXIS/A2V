"use client"

import { useState } from "react"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"

interface JobPostingCardProps {
  disableLocalTheme?: boolean
}

export default function JobPostingCard({ disableLocalTheme }: JobPostingCardProps) {
  const [jobData, setJobData] = useState({
    title: "高级前端工程师",
    company: "科技创新公司",
    location: "北京·朝阳区",
    salary: "20K-35K",
    experience: "3-5年",
    education: "本科",
    tags: ["React", "TypeScript", "Node.js"],
  })

  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-6 h-full w-full flex flex-col">
      <div className="space-y-4 flex-1 min-h-0 overflow-auto">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-bold" data-slot="card-title">
              {jobData.title}
            </h3>
            <p className="text-sm" data-slot="card-text">
              {jobData.company} · {jobData.location}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{jobData.salary}</div>
            <div className="text-xs" data-slot="card-text">
              月薪
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
          <div>
            <div className="text-xs" data-slot="card-text">
              工作经验
            </div>
            <div className="text-sm font-medium" data-slot="card-title">
              {jobData.experience}
            </div>
          </div>
          <div>
            <div className="text-xs" data-slot="card-text">
              学历要求
            </div>
            <div className="text-sm font-medium" data-slot="card-title">
              {jobData.education}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs" data-slot="card-text">
            技能要求
          </div>
          <div className="flex flex-wrap gap-2">
            {jobData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <PillButton variant="primary" className="flex-1">
            立即申请
          </PillButton>
          <PillButton variant="outline">收藏职位</PillButton>
        </div>
      </div>
    </AppCard>
  )
}
