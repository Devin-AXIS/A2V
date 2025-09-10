"use client"

import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"

export interface ApplyResumeData {
    buttonText: string
}

export interface ApplyResumeCardProps {
    data?: Partial<ApplyResumeData>
    onApply?: () => void
    className?: string
}

const defaultApplyResumeData: ApplyResumeData = {
    buttonText: "投递简历",
}

export function ApplyResumeCard({ data, onApply, className }: ApplyResumeCardProps) {
    const handleClick = () => {
        if (onApply) {
            onApply()
        } else {
            alert("简历投递功能开发中...")
        }
    }

    const merged = useCardRegistryData('apply-resume', defaultApplyResumeData)

    return (
        <AppCard className={className}>
            <div className="p-3">
                <PillButton variant="primary" className="w-full py-3 px-6 text-lg font-semibold" onClick={handleClick}>
                    {merged.buttonText}
                </PillButton>
            </div>
        </AppCard>
    )
}

export default ApplyResumeCard


