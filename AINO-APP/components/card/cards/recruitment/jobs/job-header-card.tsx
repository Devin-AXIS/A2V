"use client"

import { AppCard } from "@/components/layout/app-card"
import { MapPin, GraduationCap, Briefcase, Clock, DollarSign } from "lucide-react"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"
import { isType } from "@/components/card/utils"

export interface JobLocation {
    province: string
    city: string
    district: string
}

export interface JobHeaderData {
    title: string
    salary: string
    location_province: string
    location_city: string
    location_district: string
    education: string
    experience: string
    employmentType: string
}

export interface JobHeaderCardProps {
    insideData?: any
    data?: Partial<JobHeaderData>
    className?: string
}

const defaultJobHeaderData: JobHeaderData = {
    title: "AI产品经理",
    salary: "25k-45k",
    location_province: "北京",
    location_city: "北京市",
    location_district: "海淀区",
    education: "本科",
    experience: "3-5年",
    employmentType: "全职",
}

export function JobHeaderCard({ insideData, data, className }: JobHeaderCardProps) {
    const { key: providedKey } = useLocalThemeKey()
    let { realData: merged, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultJobHeaderData)
    merged = isType(merged) === 'Array' ? merged[0] : merged;
    return (
        <AppCard className={className}>
            <div className="p-5 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">{merged.title}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-primary">{merged.salary}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-secondary" />
                        <span>{`${merged.location_province || ""} ${merged.location_city || ""} ${merged.location_district || ""}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        <span>{merged.education}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span>{merged.experience}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{merged.employmentType}</span>
                    </div>
                </div>
            </div>
        </AppCard>
    )
}

export default JobHeaderCard


