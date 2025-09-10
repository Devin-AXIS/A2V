"use client"

import { AppCard } from "@/components/layout/app-card"
import { EducationBackground } from "@/components/data-display/education-background"

interface EducationBackgroundCardProps {
    disableLocalTheme?: boolean
    className?: string
}

export function EducationBackgroundCard({ disableLocalTheme, className }: EducationBackgroundCardProps) {
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <EducationBackground />
        </AppCard>
    )
}

export default EducationBackgroundCard


