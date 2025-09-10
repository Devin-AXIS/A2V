"use client"

import { AppCard } from "@/components/layout/app-card"
import { Tag } from "@/components/basic/tag"
import { CheckCircle } from "lucide-react"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"

export interface JobBenefitsData {
    title: string
    benefits: string[]
}

export interface JobBenefitsCardProps {
    data?: Partial<JobBenefitsData>
    className?: string
}

const defaultJobBenefitsData: JobBenefitsData = {
    title: "特色待遇",
    benefits: ["周末双休", "五险一金", "定期体检", "带薪年假", "餐饮补贴"],
}

export function JobBenefitsCard({ data, className }: JobBenefitsCardProps) {
    const merged = useCardRegistryData('job-benefits', defaultJobBenefitsData)
    return (
        <AppCard className={className}>
            <div className="p-5 space-y-4">
                <h3 className="text-base font-semibold">{merged.title}</h3>
                <div className="flex flex-wrap gap-2">
                    {merged.benefits.map((benefit) => (
                        <Tag key={benefit} variant="white" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                            {benefit}
                        </Tag>
                    ))}
                </div>
            </div>
        </AppCard>
    )
}

export default JobBenefitsCard


