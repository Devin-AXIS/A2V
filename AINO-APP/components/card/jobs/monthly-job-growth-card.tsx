"use client"

import { AppCard } from "@/components/layout/app-card"
import { MonthlyJobAreaChart } from "@/components/data-display/monthly-job-area-chart"

interface MonthlyJobGrowthCardProps {
    disableLocalTheme?: boolean
    className?: string
}

export function MonthlyJobGrowthCard({ disableLocalTheme, className }: MonthlyJobGrowthCardProps) {
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                每月新增多少职位？
            </h2>
            <MonthlyJobAreaChart />
        </AppCard>
    )
}

export default MonthlyJobGrowthCard


