"use client"

import { useState, useEffect } from "react"
import { AppCard } from "@/components/layout/app-card"
import { JobExperienceRatioChart } from "@/components/data-display/job-experience-ratio-chart"
import { CardRegistry } from "../registry"

interface JobExperienceRatioCardProps {
  disableLocalTheme?: boolean
}

const defaultData = {
  title: "不同工作年限的工作机会占比",
  description: "工作年限不同，人工智能训练师的工作机会是否相同呢？面向工作年限1到3年的人群职位开放数为1个，占比为25%；面向不限工作年限的人群职位开放数为3个，占比为75%。",
  list: [
    { name: "1-3年", value: 25, jobs: 1, color: "#10b981" },
    { name: "不限经验", value: 75, jobs: 3, color: "#06b6d4" },
  ]
}

export default function JobExperienceRatioCard({ disableLocalTheme }: JobExperienceRatioCardProps) {

  const [data, setData] = useState(defaultData)

  useEffect(() => {
    const newData = CardRegistry.getData("job-experience-ratio");
    if (newData) {
      setData(newData || defaultData)
    } else {
      CardRegistry.listen((name, data) => {
        if (name === 'job-experience-ratio') {
          setData(data || defaultData)
        }
      })
    }
  }, [])

  console.log(data)
  return (
    <AppCard disableLocalTheme={disableLocalTheme} className="p-6 h-full w-full flex flex-col">
      <div className="space-y-2">
        <h2 className="text-xl font-bold" data-slot="card-title">
          {data.title}
        </h2>
        <p className="text-sm" data-slot="card-text">
          {data.description}
        </p>
      </div>

      {/* 图表内容 */}
      <div className="flex-1 min-h-0 h-full overflow-hidden">
        <JobExperienceRatioChart data={data.list} showTitle={false} />
      </div>
    </AppCard>
  )
}
