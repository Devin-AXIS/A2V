"use client"

import { AppCard } from "@/components/layout/app-card"
import { JobProspectLineChart } from "@/components/data-display/job-prospect-line-chart"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"

interface ProspectTrendData {
    title: string
    monthlyNewJobs: string
    monthlyLabel: string
    rankText: string
}

interface JobProspectTrendCardProps {
    disableLocalTheme?: boolean
    className?: string
}

const defaultData: ProspectTrendData = {
    title: "就业前景怎么样？",
    monthlyNewJobs: "4",
    monthlyLabel: "06月新增职位",
    rankText: "排名第18",
}

export function JobProspectTrendCard({ disableLocalTheme, className }: JobProspectTrendCardProps) {
    const data = useCardRegistryData("job-prospect-trend", defaultData)
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                {data.title}
            </h2>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-xl font-bold text-primary">{data.monthlyNewJobs}</div>
                    <div className="text-xs text-muted-foreground">{data.monthlyLabel}</div>
                </div>
                <div className="text-xs text-muted-foreground">{data.rankText}</div>
            </div>
            <JobProspectLineChart />
        </AppCard>
    )
}

export default JobProspectTrendCard


