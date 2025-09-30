"use client"

import { AppCard } from "@/components/layout/app-card"
import { CoreSkillsMastery } from "@/components/data-display/core-skills-mastery"

interface CoreSkillsMasteryCardProps {
    disableLocalTheme?: boolean
    className?: string
}

export function CoreSkillsMasteryCard({ disableLocalTheme, className }: CoreSkillsMasteryCardProps) {
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <CoreSkillsMastery />
        </AppCard>
    )
}

export default CoreSkillsMasteryCard


