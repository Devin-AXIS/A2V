"use client"
import { isType, findItemCardDataByTitle } from "@/components/card/utils"
import { AppCard } from "@/components/layout/app-card"
import Image from "next/image"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"

export interface CompanyInfoData {
    name: string
    logo: string
    description: string
}

export interface CompanyInfoCardProps {
    data?: Partial<CompanyInfoData>
    className?: string
}

const defaultCompanyInfoData: CompanyInfoData = {
    name: "字节跳动",
    logo: "/bytedance-logo.png",
    description: "期待你的加入",
}

export function CompanyInfoCard({ data, className }: CompanyInfoCardProps) {
    const { key: providedKey, recMainTitle } = useLocalThemeKey()
    let { realData: merged, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultCompanyInfoData)
    merged = isType(merged) === 'Array' ? findItemCardDataByTitle(merged, recMainTitle) : merged;
    return (
        <AppCard className={className}>
            <div className="p-4 flex items-center gap-4">
                <Image src={merged.logo || "/placeholder.svg"} alt={`${merged.name} logo`} width={48} height={48} className="rounded-lg bg-white p-1" />
                <div>
                    <p className="font-bold text-gray-800">{merged.name}</p>
                    <p className="text-xs text-gray-500">{merged.description}</p>
                </div>
            </div>
        </AppCard>
    )
}

export default CompanyInfoCard


