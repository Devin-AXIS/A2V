"use client"

import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { SalaryTrendMiniChart } from "@/components/data-display/salary-trend-mini-chart"
import { MapPin, Clock, Heart, Share2 } from "lucide-react"
import { useState } from "react"

interface JobDetailCardProps {
  jobData: {
    title: string
    company: string
    location: string
    salary: string
    salaryRange: string
    experience: string
    education: string
    jobType: string
    publishTime: string
    description: string
    skills: string[]
  }
  disableLocalTheme?: boolean
}

export function JobDetailCard({ jobData, disableLocalTheme }: JobDetailCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-2" data-slot="card-title">
              {jobData.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {jobData.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {jobData.publishTime}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-2 rounded-full transition-colors ${
                isFavorited ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
            </button>
            <button className="p-2 rounded-full text-gray-400 hover:text-blue-500 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{jobData.salaryRange}</div>
            <div className="text-sm text-gray-500">月薪</div>
          </div>
          <div className="w-20 h-12">
            <SalaryTrendMiniChart />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">工作经验</div>
            <div className="font-medium" data-slot="card-text">
              {jobData.experience}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">学历要求</div>
            <div className="font-medium" data-slot="card-text">
              {jobData.education}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">工作性质</div>
            <div className="font-medium" data-slot="card-text">
              {jobData.jobType}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-4" data-slot="card-text">
            {jobData.description}
          </p>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-2">技能要求</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {jobData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <PillButton variant="primary" className="flex-1">
            立即申请
          </PillButton>
          <PillButton variant="outline">查看详情</PillButton>
        </div>
      </div>
    </AppCard>
  )
}
