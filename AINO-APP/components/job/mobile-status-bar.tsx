"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface MobileStatusBarProps {
    className?: string
}

export function MobileStatusBar({ className }: MobileStatusBarProps) {
    return (
        <div className={cn(
            "bg-black text-white text-center py-1 text-xs",
            className
        )}>
            <div className="flex items-center justify-between px-4">
                <span>11:09</span>
                <div className="flex items-center space-x-1">
                    <span>28.2 KB/s</span>
                    <span>5G</span>
                    <span>5G</span>
                    <span>Wi-Fi</span>
                    <div className="flex items-center">
                        <div className="w-6 h-3 border border-white rounded-sm">
                            <div
                                className="h-full bg-white rounded-sm"
                                style={{ width: "78%" }}
                            ></div>
                        </div>
                        <span className="ml-1">78%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
