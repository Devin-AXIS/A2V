"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/basic/badge"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"
import { MapPin, Clock, Users, X } from "lucide-react"

export interface JobData {
    title: string
    edu: string
    exp: string
    href: string
    local: string
    type: string
    salary: string
}

interface JobCardProps {
    job: JobData
    className?: string
}

export function JobCard({ job, className }: JobCardProps) {
    const { frostedEffect } = useFrostedEffect()

    return (
        <div
            onClick={() => {
                if (job.href) {
                    window.open(job.href, "_blank")
                }
            }}
            className={cn(
                "bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200",
                frostedEffect,
                job.href ? "cursor-pointer" : "",
                className
            )}>
            {/* 职位标题和公司信息 */}
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{job.company}</span>
                        {job.companySize && (
                            <span className="text-xs text-gray-500">({job.companySize})</span>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">¥{job.salary || "面谈"}</div>
                    </div>
                </div>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-3">
                <Badge
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                >
                    {job.type}
                </Badge>
                <Badge
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                >
                    {job.edu}
                </Badge>
                <Badge
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                >
                    {job.exp}
                </Badge>
            </div>

            {/* 联系人和活跃度 */}
            {/* <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{job.contact.name}</span>
                    <span className="text-xs text-gray-500">· {job.contact.position}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">今日活跃</span>
                </div>
            </div> */}

            {/* 位置信息 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{job.local}</span>
                </div>
            </div>
        </div>
    )
}
