"use client"

import { AppCard } from "@/components/layout/app-card"
import { JobProspectLineChart } from "@/components/data-display/job-prospect-line-chart"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"

interface ProspectTrendData {
    title: string
    monthlyNewJobs: string
    monthlyLabel: string
    rankText: string
    chartData: { month: string; value: number }[]
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
    chartData: [
        { month: "3月", value: 2 },
        { month: "4月", value: 3 },
        { month: "5月", value: 1 },
        { month: "6月", value: 4 },
    ],
}

export function JobProspectTrendCard({ disableLocalTheme, className }: JobProspectTrendCardProps) {
    const { key: providedKey } = useLocalThemeKey()
    const { realData: data, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultData)
    data.chartData = data.chartData.map(item => ({ ...item, value: Number(item.value) }))

    let renderData = data.chartData;
    if (CARD_DISPLAY_DATA?.limit && renderData?.length) renderData = renderData.slice(0, CARD_DISPLAY_DATA.limit)
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
            <JobProspectLineChart data={data.chartData} />
        </AppCard>
    )
}

export default JobProspectTrendCard


