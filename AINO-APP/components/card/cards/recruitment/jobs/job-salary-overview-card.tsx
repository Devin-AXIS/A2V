"use client"

import { AppCard } from "@/components/layout/app-card"
import { SalaryOverviewCard } from "@/components/data-display/salary-overview-card"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"
import { getRandomHexColor } from '@/lib/utils'
import { isType } from "@/components/card/utils"

interface JobSalaryOverviewCardProps {
    disableLocalTheme?: boolean
    className?: string
    insideData?: any
}

const defaultJobSalaryOverviewData: JobSalaryOverviewData = {
    rankingData: [
        { name: "互联网专家", rank: 340 },
        { name: "人工智能开发", rank: 351 },
        { name: "售前解决方案", rank: 360 },
    ],
    salaryDistribution: [
        { range: "0-8k", percentage: 10, color: "bg-teal-400" },
        { range: "8-15k", percentage: 40, color: "bg-teal-500" },
        { range: "15-30k", percentage: 50, color: "bg-teal-600" },
        { range: ">30k", percentage: 0, color: "bg-gray-300" },
    ],
}

export function JobSalaryOverviewCard({ insideData, disableLocalTheme, className }: JobSalaryOverviewCardProps) {
    const { key: providedKey } = useLocalThemeKey()
    const { realData: merged, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultJobSalaryOverviewData)
    let data = {
        title: "收入分布怎么样？",
        avgSalary: "¥15900",
        ranking: 351,
        rankingData: [],
        salaryDistribution: [],
    };
    if (isType(merged) === 'Array') {
        merged.forEach(item => {
            Object.keys(item).map(key => {
                data.rankingData.push({
                    name: item[key].name,
                    rank: item[key].rank,
                })
                data.salaryDistribution.push({
                    range: item[key].range,
                    percentage: item[key].percentage,
                    color: getRandomHexColor(),
                })
            })
        })
    }
    if (insideData) {
        data = insideData;
    }
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                {data.title}
            </h2>
            <SalaryOverviewCard data={data} />
        </AppCard>
    )
}

export default JobSalaryOverviewCard


