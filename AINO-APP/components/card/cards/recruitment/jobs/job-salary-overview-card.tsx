"use client"

import { AppCard } from "@/components/layout/app-card"
import { SalaryOverviewCard } from "@/components/data-display/salary-overview-card"

interface JobSalaryOverviewCardProps {
    disableLocalTheme?: boolean
    className?: string
}

export function JobSalaryOverviewCard({ disableLocalTheme, className }: JobSalaryOverviewCardProps) {
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                人工智能训练师收入分布怎么样？
            </h2>
            <SalaryOverviewCard />
        </AppCard>
    )
}

export default JobSalaryOverviewCard


