"use client"

import Link from "next/link"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { SalaryTrendMiniChart } from "@/components/data-display/salary-trend-mini-chart"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"

interface JobPositionCardProps {
  disableLocalTheme?: boolean
}

const defaultData = {
  id: "1",
  title: "软件工程师",
  salary: "15K-25K",
  location: "上海·浦东新区",
  demandGrowth: "+12%",
  salaryGrowth: "+8%",
}

export function JobPositionCard({
  disableLocalTheme,
}: JobPositionCardProps) {
  const jobData = useCardRegistryData("job-position", defaultData)
  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1" data-slot="card-title">
            {jobData.title}
          </h3>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-xl font-bold text-blue-600">{jobData.salary}</span>
            <span className="text-sm" data-slot="card-text">
              {jobData.location}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">需求 {jobData.demandGrowth}</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">薪资 {jobData.salaryGrowth}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SalaryTrendMiniChart />
          <Link href={`/demo/education/jobs/${jobData.id}`}>
            <PillButton variant="primary" className="text-xs px-3 py-1">
              查看详情
            </PillButton>
          </Link>
        </div>
      </div>
    </AppCard>
  )
}
