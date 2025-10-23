"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"
import { Tag } from "@/components/basic/tag"
import { Button } from "@/components/ui/button"
import { CardRegistry } from "../../core/registry"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"
import { DropdownFilterTabs, DropdownFilterItem } from "@/components/navigation/dropdown-filter-tabs"

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
  isRelatedJobsList?: boolean
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
  isRelatedJobsList,
  disableLocalTheme,
  jobs,
  title = "相关岗位",
  pageSize = 3,
  showPagination = true,
}: RelatedJobsListCardProps) {
  const router = useRouter()
  const { locale, id: dirId } = useParams()
  let { key: providedKey } = useLocalThemeKey()
  if (!providedKey) {
    const qs = new URLSearchParams(window.location.search)
    providedKey = qs.get('providedKey')
  }

  const { realData, CARD_DISPLAY_DATA, original } = useCardRegistryData(providedKey, defaultJobs)

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)

  // 筛选状态
  const [filterValues, setFilterValues] = useState({
    "职业类型": "",
    "工作地点": "",
    "薪资区间": ""
  })

  // 优先使用传入的 jobs 数据，否则使用注册数据
  let allData = realData || jobs;
  if (insideData) allData = insideData;

  // 定义6个固定的薪资区间
  const SALARY_RANGES = [
    "5K以下",
    "5K-10K",
    "10K-15K",
    "15K-20K",
    "20K-30K",
    "30K以上"
  ]

  // 薪资区间函数 - 优化处理数字类型的salary参数
  const getSalaryRange = (salary: number | string) => {
    if (!salary) return null

    let avgSalary: number

    // 处理数字类型
    if (typeof salary === 'number') {
      avgSalary = salary
    } else {
      // 处理字符串类型，提取薪资范围
      const salaryStr = `${salary}`

      // 提取薪资范围，处理 "15,000-25,000" 格式
      const match = salaryStr.match(/(\d+)[^\d]*(\d+)/)
      if (!match) return null

      const minSalary = parseInt(match[1])
      const maxSalary = parseInt(match[2])
      avgSalary = (minSalary + maxSalary) / 2
    }

    // 根据平均薪资返回对应区间
    if (avgSalary < 5000) return "5K以下"
    if (avgSalary < 10000) return "5K-10K"
    if (avgSalary < 15000) return "10K-15K"
    if (avgSalary < 20000) return "15K-20K"
    if (avgSalary < 30000) return "20K-30K"
    return "30K以上"
  }

  // 从 allData 中提取筛选选项
  const filterOptions = useMemo(() => {
    if (!allData || !Array.isArray(allData)) return { jobTypes: [], locations: [], salaryRanges: [] }

    const jobTypes = [...new Set(allData.map(job => job.jobType).filter(Boolean))]
    const locations = [...new Set(allData.map(job => job.location).filter(Boolean))]
    // 使用固定的6个薪资区间，不再从数据中动态生成
    const salaryRanges = SALARY_RANGES

    return { jobTypes, locations, salaryRanges }
  }, [allData])

  // 筛选数据
  const filteredData = useMemo(() => {
    if (!allData || !Array.isArray(allData)) return []

    return allData.filter(job => {
      const jobTypeMatch = !filterValues["职业类型"] || job.jobType === filterValues['职业类型']
      const locationMatch = !filterValues['工作地点'] || job.location === filterValues['工作地点']
      const salaryMatch = !filterValues['薪资区间'] || getSalaryRange(job.avgSalary) === filterValues['薪资区间']

      return jobTypeMatch && locationMatch && salaryMatch
    })
  }, [allData, filterValues])

  // 计算分页数据
  const totalItems = filteredData?.length || 0
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  let renderData = filteredData?.slice(startIndex, endIndex) || []
  console.log(renderData, 23232323)

  if (isRelatedJobsList) {
    renderData = [];
    insideData.forEach(item => {
      renderData.push({
        title: item.title,
        avgSalary: item.salary,
        location: item.local,
        education: item.edu,
        experience: item.exp,
        jobType: item.type,
        href: item.href,
      })
    })
  }

  // 当数据变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [allData])

  // 当筛选条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [filterValues])

  // 分页控制函数
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // 筛选处理函数
  const handleFilterChange = (category: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const handleJobClick = (job: any, index: number) => {
    if (isRelatedJobsList) {
      window.location.href = job.href;
    } else {
      router.push(`/${locale}/cards/job-position/detail/${original[index]?.__dirId}?rid=${job.recordId}&providedKey=${providedKey}&jobType=${job.jobType}`)
    }
  }

  // 构建筛选组件配置
  const filterItems: DropdownFilterItem[] = [
    {
      category: "职业类型",
      options: [
        { label: "全部", value: "" },
        ...filterOptions.jobTypes.map(type => ({ label: type, value: type }))
      ],
      defaultValue: ""
    },
    {
      category: "工作地点",
      options: [
        { label: "全部", value: "" },
        ...filterOptions.locations.map(location => ({ label: location, value: location }))
      ],
      defaultValue: ""
    },
    {
      category: "薪资区间",
      options: [
        { label: "全部", value: "" },
        ...filterOptions.salaryRanges.map(range => ({ label: range, value: range }))
      ],
      defaultValue: ""
    }
  ]

  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-6 h-full w-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4" data-slot="card-title">
        {title}
      </h3>

      {/* 筛选组件 */}
      <div className="mb-4">
        <DropdownFilterTabs
          items={filterItems}
          values={filterValues}
          onValueChange={handleFilterChange}
          cardId="related-jobs-list-card"
        />
      </div>

      <div className="space-y-3 flex-1 min-h-0 overflow-auto">
        {renderData.length > 0 ? (
          renderData.map((job, index) => (
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
                      {job.jobType || "其它"}
                    </Tag>
                  </div>
                </div>
              </div>
            </AppCard>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">暂无匹配的岗位</h3>
            <p className="text-sm text-muted-foreground">
              请尝试调整筛选条件或选择其他筛选选项
            </p>
          </div>
        )}
      </div>

      {/* 分页控制器 */}
      {showPagination && totalPages > 1 && !isRelatedJobsList && (
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
