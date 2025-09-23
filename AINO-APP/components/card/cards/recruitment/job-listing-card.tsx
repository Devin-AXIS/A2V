"use client"

import { AppCard } from "@/components/layout/app-card"
import { Briefcase, MapPin } from "lucide-react"
import { useCardRegistryData } from "@/hooks/use-card-registry-data"
import { useLocalThemeKey } from "@/components/providers/local-theme-key"

interface JobListingCardProps {
  disableLocalTheme?: boolean
  onJobClick?: (jobId: string) => void
}

const defaultData = {
  id: "1",
  title: "AI提示词工程师",
  location: "北京·海淀区",
  salary: "¥15,000-25,000",
  education: "本科",
  experience: "1-3年",
  jobType: "全职",
}

export function JobListingCard({
  disableLocalTheme,
  onJobClick,
}: JobListingCardProps) {
  const { key: providedKey } = useLocalThemeKey()
  const { realData: jobData, CARD_DISPLAY_DATA } = useCardRegistryData(providedKey, defaultData)

  const handleClick = () => {
    if (onJobClick) {
      onJobClick(jobData.id)
    }
  }

  return (
    <AppCard 
      disableLocalTheme={disableLocalTheme} 
      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* 职位图标 */}
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-6 h-6 text-gray-600" />
        </div>

        {/* 职位信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1 text-gray-900" data-slot="card-title">
            {jobData.title}
          </h3>
          
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{jobData.location}</span>
          </div>

          {/* 薪资信息 */}
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {jobData.salary}
            </div>
            <div className="text-xs text-gray-500">平均月薪</div>
          </div>
        </div>
      </div>

      {/* 职位要求标签 */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-200">
          {jobData.education}
        </span>
        <span className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-200">
          {jobData.experience}
        </span>
        <span className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded-full border border-gray-200">
          {jobData.jobType}
        </span>
      </div>
    </AppCard>
  )
}
