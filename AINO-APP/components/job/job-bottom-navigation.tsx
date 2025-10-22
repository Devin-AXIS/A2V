"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/basic/badge"
import { LayoutGrid, Star, MessageCircle, User } from "lucide-react"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"
import { useCardTheme } from "@/components/providers/card-theme-provider"

interface JobBottomNavigationProps {
    activeTab?: string
    onTabChange?: (tab: string) => void
}

export function JobBottomNavigation({
    activeTab = "职位",
    onTabChange
}: JobBottomNavigationProps) {
    const { frostedEffect } = useFrostedEffect()
    const { theme } = useCardTheme()

    const navItems = [
        {
            id: "职位",
            label: "职位",
            icon: LayoutGrid,
            active: true
        },
        {
            id: "有了",
            label: "有了",
            icon: Star
        },
        {
            id: "消息",
            label: "消息",
            icon: MessageCircle,
            badge: 3
        },
        {
            id: "我的",
            label: "我的",
            icon: User,
            dot: true
        }
    ]

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <AppCard className="px-4 py-1">
                <div className="flex items-center space-x-2 md:space-x-3">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id || item.active

                        return (
                            <Button
                                key={item.id}
                                onClick={() => onTabChange?.(item.id)}
                                variant="ghost"
                                className="relative rounded-2xl w-12 h-12 flex flex-col items-center justify-center transition-all duration-300 group"
                                style={{
                                    backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                                }}
                            >
                                <div className="relative">
                                    <Icon
                                        className="w-6 h-6 transition-colors"
                                        style={{
                                            color: isActive ? "#3b82f6" : theme.fontColor,
                                            opacity: isActive ? 1 : 0.7,
                                        }}
                                    />
                                    {/* 消息数量徽章 */}
                                    {item.badge && (
                                        <Badge
                                            variant="error"
                                            size="sm"
                                            shape="pill"
                                            className="absolute -top-2 -right-2 min-w-[18px] h-[18px] text-xs flex items-center justify-center"
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                    {/* 红点通知 */}
                                    {item.dot && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                    )}
                                </div>
                                <span className="sr-only">{item.label}</span>
                            </Button>
                        )
                    })}
                </div>
            </AppCard>
        </div>
    )
}
