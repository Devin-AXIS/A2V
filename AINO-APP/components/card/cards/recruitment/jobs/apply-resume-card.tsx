"use client"
import { isType } from "@/components/card/utils"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"

export interface ApplyResumeData {
    buttonText: string
    href: string
}

export interface ApplyResumeCardProps {
    data?: Partial<ApplyResumeData>
    onApply?: () => void
    className?: string
}

const defaultApplyResumeData: ApplyResumeData = {
    buttonText: "投递简历",
    href: "#"
}

export function ApplyResumeCard({ data, onApply, className }: ApplyResumeCardProps) {
    const { key: providedKey } = useLocalThemeKey()
    let { realData: merged, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultApplyResumeData)
    merged = isType(merged) === "Array" ? merged[0] : merged;

    const handleClick = () => {
        if (merged.href) {
            window.location.href = merged.href;
        } else {
            alert("简历投递功能开发中...")
        }
    }
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


