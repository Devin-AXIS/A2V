"use client"

import { AppCard } from "@/components/layout/app-card"
import { PercentageRankingCard } from "@/components/data-display/percentage-ranking-card"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"

interface EducationSalaryRecord {
    label: string
    value: string
    percentage: number
    color?: string
}

interface EducationSalaryRequirementsData {
    title: string
    description: string
    data: EducationSalaryRecord[]
}

interface EducationSalaryRequirementsCardProps {
    disableLocalTheme?: boolean
    className?: string
}

const defaultData: EducationSalaryRequirementsData = {
    title: "不同学历的收入要求",
    description:
        "学历不同，人工智能训练师的收入要求是否相同呢？本科学历占比最高为60%，平均薪资¥15,900；硕士学历占比20%，平均薪资¥18,500；博士学历占比5%，平均薪资¥22,000。",
    data: [
        { label: "大专", value: "¥12,000", percentage: 15, color: "#10b981" },
        { label: "本科", value: "¥15,900", percentage: 60, color: "#06b6d4" },
        { label: "硕士", value: "¥18,500", percentage: 20, color: "#8b5cf6" },
        { label: "博士", value: "¥22,000", percentage: 5, color: "#f59e0b" },
    ],
}

export function EducationSalaryRequirementsCard({ disableLocalTheme, className }: EducationSalaryRequirementsCardProps) {
    const { key: providedKey } = useLocalThemeKey()
    const { realData: data, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultData)

    let renderData = data.data;
    if (CARD_DISPLAY_DATA?.limit && renderData?.length) renderData = renderData.slice(0, CARD_DISPLAY_DATA.limit)
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                {data.title}
            </h2>
            <PercentageRankingCard
                title=""
                description={data.description}
                data={data.data}
                columns={{ label: "学历要求", value: "平均薪资", percentage: "占比" }}
                showTitle={false}
            />
        </AppCard>
    )
}

export default EducationSalaryRequirementsCard


