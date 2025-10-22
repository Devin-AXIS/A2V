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

// 模拟数据
const mockJobs: JobData[] = [
    {
        id: "1",
        title: "工作室合伙人",
        company: "万家分享",
        companySize: "500-999人",
        salary: "15-30K",
        location: "昌平区 天通苑",
        tags: ["经验不限", "学历不限", "创业型", "资源整合", "各类人才"],
        contact: {
            name: "王先生",
            position: "联合创始人"
        },
        activity: "今日回复10+次",
        isActive: true
    },
    {
        id: "2",
        title: "前端开发工程 (长期兼职)",
        company: "柠檬优力 天使轮",
        companySize: "0-20人",
        salary: "500-600元/天",
        location: "朝阳区 常营",
        tags: ["本科", "HTML5", "JavaScript", "Vue", "CSS"],
        contact: {
            name: "朱俊",
            position: "HRBP"
        },
        activity: "今日活跃"
    },
    {
        id: "3",
        title: "居家日结!不需要面试!兼职/全职 日结",
        company: "扬州捷挚运动科技",
        companySize: "20-99人",
        salary: "9-11K",
        location: "朝阳区 大望路",
        tags: ["经验不限", "学历不限", "抖音", "全职兼职均可", "远程办公"],
        contact: {
            name: "于先生",
            position: "主管"
        },
        activity: "回复率高"
    },
    {
        id: "4",
        title: "1w别墅管理员值班",
        company: "北京秧渊芯科技",
        companySize: "20-99人",
        salary: "10-11K",
        location: "昌平区 天通苑",
        tags: ["经验不限", "学历不限", "缴纳五险", "带薪年假", "包吃"],
        contact: {
            name: "屈女士",
            position: "经理"
        },
        activity: "回复率高"
    }
]

interface JobListPageProps {
    className?: string
}

export function JobListPage({ className }: JobListPageProps) {
    const [activeTab, setActiveTab] = useState("推荐")
    const [selectedLocation, setSelectedLocation] = useState("北京")
    const { frostedEffect } = useFrostedEffect()
    const [jobs, setJobs] = useState<any[]>([]);

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
        getAllJobs();
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
