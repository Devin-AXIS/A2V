"use client"

import { AppCard } from "@/components/layout/app-card"
import { MonthlyJobGrowthChart } from "@/components/data-display/monthly-job-growth-chart"

interface MonthlyJobGrowthCardProps {
  disableLocalTheme?: boolean
}

export default function MonthlyJobGrowthCard({ disableLocalTheme }: MonthlyJobGrowthCardProps) {
  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-6 h-full w-full flex flex-col">
      <div className="space-y-2">
        <h2 className="text-xl font-bold" data-slot="card-title">
          每月新增多少职位？
        </h2>
        <p className="text-sm" data-slot="card-text">
          2023年3月至6月职位变化趋势
        </p>
      </div>

      {/* 图表内容 */}
      <div className="flex-1 min-h-0 h-full overflow-hidden">
        <MonthlyJobGrowthChart />
      </div>
    </AppCard>
  )
}
