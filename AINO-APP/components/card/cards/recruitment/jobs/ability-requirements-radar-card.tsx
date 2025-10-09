"use client"

import { AppCard } from "@/components/layout/app-card"
import { AbilityRequirementsRadar } from "@/components/data-display/ability-requirements-radar"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"
import { isType } from "@/components/card/utils"

interface AbilityRequirementsRadarCardProps {
    disableLocalTheme?: boolean
    className?: string
    insideData?: any
}

interface AbilityRequirementsRadarDataPoint {
    subject: string
    value: number
    fullMark?: number
}

interface AbilityRequirementsRadarData {
    title: string
    chartData: AbilityRequirementsRadarDataPoint[]
}

const defaultData: AbilityRequirementsRadarData = {
    title: "能力要求分布",
    chartData: [
        { subject: "数据分析", value: 90, fullMark: 100 },
        { subject: "沟通能力", value: 85, fullMark: 100 },
        { subject: "行业知识", value: 80, fullMark: 100 },
        { subject: "AI工具", value: 95, fullMark: 100 },
        { subject: "项目管理", value: 75, fullMark: 100 },
        { subject: "创新思维", value: 88, fullMark: 100 },
    ],
}

export function AbilityRequirementsRadarCard({ insideData, disableLocalTheme, className }: AbilityRequirementsRadarCardProps) {
    const { key: providedKey } = useLocalThemeKey()
    let { realData: data, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultData)
    data = isType(data) === "Array" ? data[0] : data;
    data.chartData = data.chartData.map(item => ({ ...item, value: Number(item.value), fullMark: Number(item.fullMark) }))
    if (insideData) data = insideData;
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <h2 className="text-base font-semibold mb-4" data-slot="card-title">{data.title}</h2>
            <AbilityRequirementsRadar data={data.chartData} />
        </AppCard>
    )
}

export default AbilityRequirementsRadarCard


