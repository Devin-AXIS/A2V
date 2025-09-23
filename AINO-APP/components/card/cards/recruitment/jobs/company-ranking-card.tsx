"use client"

import { AppCard } from "@/components/layout/app-card"
import { CompanyRankingList } from "@/components/data-display/company-ranking-list"

interface CompanyRankingCardProps {
    disableLocalTheme?: boolean
    className?: string
}

export function CompanyRankingCard({ disableLocalTheme, className }: CompanyRankingCardProps) {
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <h2 className="text-base font-semibold mb-4" data-slot="card-title">
                新兴业务领域企业排行
            </h2>
            <CompanyRankingList />
        </AppCard>
    )
}

export default CompanyRankingCard


