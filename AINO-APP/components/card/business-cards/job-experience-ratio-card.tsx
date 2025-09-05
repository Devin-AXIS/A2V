"use client"

import { AppCard } from "@/components/layout/app-card"
import { JobExperienceRatioChart } from "@/components/data-display/job-experience-ratio-chart"

interface JobExperienceRatioCardProps {
  disableLocalTheme?: boolean
}

export default function JobExperienceRatioCard({ disableLocalTheme }: JobExperienceRatioCardProps) {
  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-6 h-full w-full flex flex-col">
      <div className="space-y-2">
        <h2 className="text-xl font-bold" data-slot="card-title">
          不同工作年限的工作机会占比
        </h2>
        <p className="text-sm" data-slot="card-text">
          工作年限不同，人工智能训练师的工作机会是否相同呢？面向工作年限1到3年的人群职位开放数为1个，占比为25%；面向不限工作年限的人群职位开放数为3个，占比为75%。
        </p>
      </div>

      {/* 图表内容 */}
      <div className="flex-1 min-h-0 h-full overflow-hidden">
        <JobExperienceRatioChart showTitle={false} />
      </div>
    </AppCard>
  )
}
