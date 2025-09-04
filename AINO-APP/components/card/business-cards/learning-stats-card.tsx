"use client"

import { AppCard } from "@/components/layout/app-card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Award, Users, Target } from "lucide-react"
import { CardRegistry } from "../registry"
import type { BusinessCardProps } from "@/types"

interface StatsData {
  skillImprovement: number
  practiceSuccess: number
  certifications: number
  students: string
  progressDetails: {
    name: string
    percentage: number
    icon?: string
  }[]
}

interface LearningStatsCardProps extends BusinessCardProps {
  data: StatsData
}

export function LearningStatsCard({ data, ...props }: LearningStatsCardProps) {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "trending":
        return <TrendingUp className="w-4 h-4" />
      case "award":
        return <Award className="w-4 h-4" />
      case "users":
        return <Users className="w-4 h-4" />
      case "target":
        return <Target className="w-4 h-4" />
      default:
        return <TrendingUp className="w-4 h-4" />
    }
  }

  return (
    <AppCard className="overflow-hidden" {...props}>
      <div className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--card-title-color)" }}>
          <TrendingUp className="w-4 h-4" />
          学习成果预期
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{data.skillImprovement}%</div>
            <div className="text-xs" style={{ color: "var(--card-text-color)" }}>
              技能提升
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.practiceSuccess}%</div>
            <div className="text-xs" style={{ color: "var(--card-text-color)" }}>
              就业成功
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{data.certifications}+</div>
            <div className="text-xs" style={{ color: "var(--card-text-color)" }}>
              专业认证
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{data.students}</div>
            <div className="text-xs" style={{ color: "var(--card-text-color)" }}>
              成功学员
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {data.progressDetails.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  {getIcon(item.icon)}
                  <span style={{ color: "var(--card-text-color)" }}>{item.name}</span>
                </div>
                <span className="font-medium" style={{ color: "var(--card-title-color)" }}>
                  {item.percentage}%
                </span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    </AppCard>
  )
}

// 注册学习统计卡片
CardRegistry.register({
  name: "learning-stats-card",
  category: "ai",
  component: LearningStatsCard,
  businessFlow: {
    hasDetailPage: false,
    hasModal: false,
    actions: [],
  },
  developer: {
    name: "AI Education Team",
    version: "1.0.0",
    description: "学习统计卡片，展示学习成果和进度数据",
  },
})
