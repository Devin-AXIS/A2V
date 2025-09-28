"use client"

import { AppCard } from "@/components/layout/app-card"
import { SalaryExperienceDonut } from "@/components/data-display/salary-experience-donut"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"
import { isType } from "@/components/card/utils"

interface JobDetailIntroData {
    title: string
    description: string
    avgMonthlySalary: string
    dataSource: string
}

interface JobDetailIntroCardProps {
    disableLocalTheme?: boolean
    className?: string
}

const defaultData: JobDetailIntroData = {
    title: "人工智能训练师",
    description:
        "人工智能训练师是一种非常重要的职位，主要负责指导和帮助用户以及其他相关人员更好地掌握人工智能相关技术和技能。训练师将为客户提供实践经验，并利用人工智能技术和工具来协助客户实现其业务目标。",
    avgMonthlySalary: "¥15900",
    dataSource: "来自全网10份数据",
}

export function JobDetailIntroCard({ disableLocalTheme, className }: JobDetailIntroCardProps) {
    const { key: providedKey } = useLocalThemeKey()
    let { realData: data, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultData)
    data = isType(data) === "Array" ? data[0] : data;

    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <h1 className="text-base font-semibold mb-3" data-slot="card-title">
                {data.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-6" data-slot="card-text">
                {data.description}
            </p>

            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-muted-foreground mb-1">平均月薪</div>
                    <div className="text-2xl font-bold text-primary">{data.avgMonthlySalary}</div>
                    <div className="text-xs text-muted-foreground">{data.dataSource}</div>
                </div>
                <SalaryExperienceDonut />
            </div>
        </AppCard>
    )
}

export default JobDetailIntroCard


