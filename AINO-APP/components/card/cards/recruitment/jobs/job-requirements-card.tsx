"use client"

import { AppCard } from "@/components/layout/app-card"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"
import { isType, findItemCardDataByTitle } from "@/components/card/utils"

export interface JobRequirementsData {
    title: string
    requirements: string[]
}

export interface JobRequirementsCardProps {
    data?: Partial<JobRequirementsData>
    className?: string
}

const defaultJobRequirementsData: JobRequirementsData = {
    title: "岗位需求",
    requirements: [
        "3年以上互联网产品经验，有人工智能相关产品经验者优先。",
        "熟悉产品设计、研发、运营全流程。",
        "具备优秀的数据分析能力和逻辑思维能力。",
        "良好的沟通协调能力和团队合作精神。",
    ],
}

export function JobRequirementsCard({ data, className }: JobRequirementsCardProps) {
    const { key: providedKey, recMainTitle } = useLocalThemeKey()
    let { realData: merged, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultJobRequirementsData)
    merged = isType(merged) === 'Array' ? findItemCardDataByTitle(merged, recMainTitle) : merged;
    return (
        <AppCard className={className}>
            <div className="p-5 space-y-4">
                <h3 className="text-base font-semibold">{merged.title}</h3>
                <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                    {merged.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                    ))}
                </ul>
            </div>
        </AppCard>
    )
}

export default JobRequirementsCard


