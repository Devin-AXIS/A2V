"use client"

import Link from "next/link"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { SalaryTrendMiniChart } from "@/components/data-display/salary-trend-mini-chart"

interface JobPositionCardProps {
  id: string
  title: string
  salary: string
  location: string
  demandGrowth: string
  salaryGrowth: string
  locale: string // 添加locale参数用于动态路径
  disableLocalTheme?: boolean
}

export function JobPositionCard({
  id,
  title,
  salary,
  location,
  demandGrowth,
  salaryGrowth,
  locale, // 接收locale参数
  disableLocalTheme,
}: JobPositionCardProps) {
  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1" data-slot="card-title">
            {title}
          </h3>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-xl font-bold text-blue-600">{salary}</span>
            <span className="text-sm" data-slot="card-text">
              {location}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">需求 {demandGrowth}</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">薪资 {salaryGrowth}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SalaryTrendMiniChart />
          <Link href={`/${locale}/demo/education/jobs/${id}`}>
            <PillButton variant="primary" className="text-xs px-3 py-1">
              查看详情
            </PillButton>
          </Link>
        </div>
      </div>
    </AppCard>
  )
}
