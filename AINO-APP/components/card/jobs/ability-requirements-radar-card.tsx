"use client"

import { AppCard } from "@/components/layout/app-card"
import { AbilityRequirementsRadar } from "@/components/data-display/ability-requirements-radar"

interface AbilityRequirementsRadarCardProps {
    disableLocalTheme?: boolean
    className?: string
}

export function AbilityRequirementsRadarCard({ disableLocalTheme, className }: AbilityRequirementsRadarCardProps) {
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <AbilityRequirementsRadar />
        </AppCard>
    )
}

export default AbilityRequirementsRadarCard


