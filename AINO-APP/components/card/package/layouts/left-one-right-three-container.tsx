"use client"

import type React from "react"
import { cn } from "@/lib/utils"

export interface LeftOneRightThreeContainerProps {
    left: React.ReactNode
    rightTop: React.ReactNode
    rightMiddle: React.ReactNode
    rightBottom: React.ReactNode
    className?: string
    gapClassName?: string
    breakpoint?: "base" | "sm" | "md" | "lg" | "xl" | "2xl"
}

/**
 * 左 1 右 3 结构的卡片容器
 * - 移动端：垂直排列
 * - ≥lg：左侧卡片跨三行，右侧上下三张
 * - 传入本项目任意卡片组件作为子节点即可
 */
export function LeftOneRightThreeContainer({
    left,
    rightTop,
    rightMiddle,
    rightBottom,
    className,
    gapClassName = "gap-6",
    breakpoint = "lg",
}: LeftOneRightThreeContainerProps) {
    const gridColsByBreakpoint: Record<string, string> = {
        base: "grid-cols-2",
        sm: "sm:grid-cols-2",
        md: "md:grid-cols-2",
        lg: "lg:grid-cols-2",
        xl: "xl:grid-cols-2",
        "2xl": "2xl:grid-cols-2",
    }
    const rowSpanByBreakpoint: Record<string, string> = {
        base: "row-span-3",
        sm: "sm:row-span-3",
        md: "md:row-span-3",
        lg: "lg:row-span-3",
        xl: "xl:row-span-3",
        "2xl": "2xl:row-span-3",
    }
    return (
        <div className={cn("grid grid-cols-1 auto-rows-auto", gridColsByBreakpoint[breakpoint], gapClassName, className)}>
            <div className={cn(rowSpanByBreakpoint[breakpoint], "h-full")}>{left}</div>
            <div className="h-full">{rightTop}</div>
            <div className="h-full">{rightMiddle}</div>
            <div className="h-full">{rightBottom}</div>
        </div>
    )
}
