"use client"

import { AppCard } from "@/components/layout/app-card"
import { BasicAbilityRequirements } from "@/components/data-display/basic-ability-requirements"

interface BasicAbilityRequirementsCardProps {
    disableLocalTheme?: boolean
    className?: string
}

export function BasicAbilityRequirementsCard({ disableLocalTheme, className }: BasicAbilityRequirementsCardProps) {
    return (
        <AppCard disableLocalTheme={disableLocalTheme} className={className ? className : "p-6"}>
            <BasicAbilityRequirements />
        </AppCard>
    )
}

export default BasicAbilityRequirementsCard


