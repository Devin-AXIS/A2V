"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/components/navigation/app-header"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { JobBottomNavigation } from "./job-bottom-navigation"
import { MobileStatusBar } from "./mobile-status-bar"
import { JobCard, JobData } from "./job-card"
import { Badge } from "@/components/basic/badge"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, MapPin, X } from "lucide-react"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"
import { http } from "@/lib/request"
import { getInsidePageDatas, insidePageCardDataHandles, insidePageArrayCardDatas } from "@/components/card/core/insidePageHandles"

interface JobListPageProps {
    className?: string
    insideData?: any[]
}

export function JobListPage({ insideData, className }: JobListPageProps) {
    const { frostedEffect } = useFrostedEffect()
    const [jobs, setJobs] = useState<any[]>(insideData || []);

    const getAllJobs = async () => {
        // const {data: dirs} = await http.get(`/api/jobs?appId=${appId}`)
        if (typeof window !== "undefined") {
            const qs = new URLSearchParams(window.location.search)
            const appId = qs.get("appId")
            const { data: dirs } = await http.get(`/api/directories?appId=${appId}&limit=100`)
            const { directories } = dirs;
            let jobsDir;
            for (let i = 0; i < directories.length; i++) {
                if (directories[i].config.moduleKey === "recSub-related-jobs-list") {
                    jobsDir = directories[i];
                    break;
                }
            }
            if (!jobsDir) {
                toast.error("未找到职位目录")
                return;
            }
            const { data: records } = await http.get(`/api/records/${jobsDir.id}?limit=100`)
            const titleKey = jobsDir?.config?.fields?.find(field => field.label === "标题");
            const eduKey = jobsDir?.config?.fields?.find(field => field.label === "教育");
            const expKey = jobsDir?.config?.fields?.find(field => field.label === "经验");
            const hrefKey = jobsDir?.config?.fields?.find(field => field.label === "链接");
            const localKey = jobsDir?.config?.fields?.find(field => field.label === "工作地点");
            const typeKey = jobsDir?.config?.fields?.find(field => field.label === "职位类型");
            const salaryKey = jobsDir?.config?.fields?.find(field => field.label === "平均薪资");
            const companyKey = jobsDir?.config?.fields?.find(field => field.label === "公司名");
            const companySizeKey = jobsDir?.config?.fields?.find(field => field.label === "公司规模");
            const datas = [];
            records.forEach(record => {
                datas.push({
                    title: record[titleKey?.key],
                    edu: record[eduKey?.key] === '未指定' ? "不限" : record[eduKey?.key],
                    exp: record[expKey?.key] === '未指定' ? "不限" : record[expKey?.key],
                    href: record[hrefKey?.key] || "",
                    local: record[localKey?.key] === '未指定' ? "全国" : record[localKey?.key],
                    type: record[typeKey?.key] === '未指定' ? "其它" : record[typeKey?.key],
                    salary: record[salaryKey?.key] === '未指定' ? "面谈" : record[salaryKey?.key],
                    company: (record[companyKey?.key] === "未指定" || record[companyKey?.key] === "不限") ? "未知" : record[companyKey?.key],
                    companySize: (record[companySizeKey?.key] === "未指定" || record[companySizeKey?.key] === "不限") ? "未知" : record[companySizeKey?.key],
                });
            });
            setJobs(datas);
        }
    }

    useEffect(() => {
        if (!insideData) {
            getAllJobs();
        }
    }, [])

    const tabs = ["推荐", "附近", "最新"]

    const handleRemoveLocation = () => {
        setSelectedLocation("")
    }

    return (
        <div className={cn("min-h-screen bg-gray-50", className)}>
            {/* 头部 */}
            <AppHeader title="所有岗位" />

            {/* 主内容区域 */}
            <div className="pt-14 pb-20">
                {/* <div className="px-4 py-3 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 px-3">
                                <Plus className="w-4 h-4 mr-1" />
                                发布
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-3">
                                <Search className="w-4 h-4 mr-1" />
                                搜索
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {selectedLocation && (
                            <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                <MapPin className="w-3 h-3" />
                                <span>{selectedLocation}</span>
                                <button
                                    onClick={handleRemoveLocation}
                                    className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <Button variant="outline" size="sm" className="h-8 px-3">
                            <Filter className="w-4 h-4 mr-1" />
                            筛选
                        </Button>
                    </div>
                </div> */}

                {/* 标签页导航 */}
                {/* <div className="bg-white border-b border-gray-200">
                    <div className="flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200",
                                    activeTab === tab
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div> */}

                {/* 职位列表 */}
                <div className="px-4 py-4">
                    {jobs.map((job) => (
                        <JobCard
                            key={job.href || job.title}
                            job={job}
                        />
                    ))}
                </div>
            </div>

            {/* 底部导航 */}
            <BottomNavigation />
            {/* <JobBottomNavigation
                activeTab="职位"
                onTabChange={(tab) => {
                    // 这里可以添加导航逻辑
                    console.log("切换到:", tab)
                }}
            /> */}
        </div>
    )
}
