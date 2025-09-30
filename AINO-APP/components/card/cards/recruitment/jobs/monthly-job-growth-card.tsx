"use client"

import { AppCard } from "@/components/layout/app-card"
import { MonthlyJobAreaChart } from "@/components/data-display/monthly-job-area-chart"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"

interface MonthlyJobGrowthCardProps {
    disableLocalTheme?: boolean
    className?: string
}

interface MonthlyJobGrowthDataPoint {
    month: string
    jobs: number
}

interface MonthlyJobGrowthData {
    title: string
    chartData: MonthlyJobGrowthDataPoint[]
}

const defaultData: MonthlyJobGrowthData = {
    title: "每月新增多少职位？",
    chartData: [
        { month: "2023-03", jobs: 2 },
        { month: "2023-04", jobs: 5 },
        { month: "2023-05", jobs: 3 },
        { month: "2023-06", jobs: 4 },
    ],
}

export function MonthlyJobGrowthCard({ disableLocalTheme, className }: MonthlyJobGrowthCardProps) {
    const { key: providedKey } = useLocalThemeKey()
    const { realData: data, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultData)
    data.chartData = data.chartData.map(item => ({ ...item, jobs: Number(item.jobs) }))
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                {data.title}
            </h2>
            <MonthlyJobAreaChart data={data.chartData} />
        </AppCard>
    )
}

export default MonthlyJobGrowthCard


