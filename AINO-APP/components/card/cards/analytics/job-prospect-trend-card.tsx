"use client"

import { AppCard } from "@/components/layout/app-card"
import { JobProspectTrendChart } from "@/components/data-display/job-prospect-trend-chart"

interface JobProspectTrendCardProps {
  disableLocalTheme?: boolean
}

export default function JobProspectTrendCard({ disableLocalTheme }: JobProspectTrendCardProps) {
  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-6 h-full w-full flex flex-col">
      <div className="space-y-2">
        <h2 className="text-xl font-bold" data-slot="card-title">
          就业前景怎么样？
        </h2>
        <div className="flex items-baseline gap-4">
          <div>
            <div className="text-2xl font-bold" data-slot="card-title">
              4
            </div>
            <div className="text-sm text-gray-500">06月新增职位</div>
          </div>
          <div className="text-sm text-gray-500">排名第18</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 h-full overflow-hidden">
        <JobProspectTrendChart />
      </div>
    </AppCard>
  )
}
