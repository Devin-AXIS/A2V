"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { Tag } from "@/components/basic/tag"
import { Button } from "@/components/ui/button"
import { CardRegistry } from "../../core/registry"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"

interface Job {
  id: number
  title: string
  avgSalary: string
  location: string
  education: string
  experience: string
  jobType: string
}

interface RelatedJobsListCardProps {
  insideData?: any
  disableLocalTheme?: boolean
  jobs?: Job[]
  title?: string
  pageSize?: number
  showPagination?: boolean
}

const defaultJobs: Job[] = [
  {
    id: 1,
    title: "AI提示词工程师",
    avgSalary: "15,000-25,000",
    location: "北京·海淀区",
    education: "本科",
    experience: "1-3年",
    jobType: "全职",
  },
  {
    id: 2,
    title: "AI产品经理",
    avgSalary: "20,000-35,000",
    location: "上海·浦东新区",
    education: "本科",
    experience: "3-5年",
    jobType: "全职",
  },
  {
    id: 3,
    title: "机器学习工程师",
    avgSalary: "18,000-30,000",
    location: "深圳·南山区",
    education: "硕士",
    experience: "2-4年",
    jobType: "全职",
  },
  {
    id: 4,
    title: "AI应用开发工程师",
    avgSalary: "16,000-28,000",
    location: "杭州·西湖区",
    education: "本科",
    experience: "1-3年",
    jobType: "全职",
  },
]

export function RelatedJobsListCard({
  insideData,
  disableLocalTheme,
  jobs,
  title = "相关岗位",
  pageSize = 3,
  showPagination = true,
}: RelatedJobsListCardProps) {
  const router = useRouter()
  const { locale } = useParams()
  const { key: providedKey } = useLocalThemeKey()

  const { realData, CARD_DISPLAY_DATA, original } = useCardRegistryData(providedKey, defaultJobs)

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)

  // 优先使用传入的 jobs 数据，否则使用注册数据
  let allData = realData || jobs;
  if (insideData) allData = insideData;
  // if (CARD_DISPLAY_DATA?.limit && allData?.length) allData = allData.slice(0, CARD_DISPLAY_DATA.limit)

  // 计算分页数据
  const totalItems = allData?.length || 0
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const renderData = allData?.slice(startIndex, endIndex) || []

  // 当数据变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [allData])

  // 分页控制函数
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleJobClick = (job: any, index: number) => {
    // job-detail-intro-card
    router.push(`/${locale}/cards/job-position/detail/${original[index]?.__dirId}?rid=${job.recordId}`)
  }

  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-6 h-full w-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4" data-slot="card-title">
        {title}
      </h3>
      <div className="space-y-3 flex-1 min-h-0 overflow-auto">
        {renderData.map((job, index) => (
          <AppCard key={job.title}>
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleJobClick(job, index)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold" data-slot="card-title">
                        {job.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">¥{job.avgSalary}</p>
                    <p className="text-xs text-muted-foreground">平均月薪</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Tag variant="white" size="sm">
                    {job.education}
                  </Tag>
                  <Tag variant="white" size="sm">
                    {job.experience}
                  </Tag>
                  <Tag variant="white" size="sm">
                    {job.jobType}
                  </Tag>
                </div>
              </div>
            </div>
          </AppCard>
        ))}
      </div>

      {/* 分页控制器 */}
      {showPagination && totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {startIndex + 1}-{Math.min(endIndex, totalItems)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* 页码显示 */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppCard>
  )
}

// Also export as default for compatibility
export default RelatedJobsListCard
