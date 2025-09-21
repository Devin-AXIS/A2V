"use client"

import { AppCard } from "@/components/layout/app-card"
import { PercentageRankingCard } from "@/components/data-display/percentage-ranking-card"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { getRandomHexColor } from "@/lib/utils"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"

interface CityRecord {
    label: string
    value: string | number
    percentage: number
    color?: string
}

interface JobCityRankingData {
    title: string
    description: string
    data: CityRecord[]
}

interface JobCityRankingCardProps {
    disableLocalTheme?: boolean
    className?: string
}

const defaultData: JobCityRankingData = {
    title: "工作城市排名",
    description:
        "不同城市的人工智能训练师职位分布情况如何？武汉地区职位数量最多，占比40%；北京和深圳分别占比35%和25%，薪资水平也有所差异。",
    data: [
        { label: "武汉", value: "8", percentage: 40, color: "#10b981" },
        { label: "北京", value: "5", percentage: 35, color: "#06b6d4" },
        { label: "深圳", value: "5", percentage: 25, color: "#8b5cf6" },
    ],
}

export function JobCityRankingCard({ disableLocalTheme, className }: JobCityRankingCardProps) {
    const { key: providedKey } = useLocalThemeKey()
    const { realData: data, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultData)
    data.data = data.data.map(item => ({ ...item, percentage: Number(item.percentage), color: getRandomHexColor() }))
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
                columns={{ label: "城市", value: "职位数量", percentage: "职位占比" }}
                showTitle={false}
            />
        </AppCard>
    )
}

export default JobCityRankingCard


