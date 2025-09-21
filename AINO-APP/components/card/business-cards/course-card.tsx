"use client"

import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Users, Star } from "lucide-react"
import { CardRegistry } from "../registry"
import type { BusinessCardProps } from "@/types"

interface CourseData {
  id: string
  name: string
  duration: string
  students: number
  rating: number
  progress?: number
  difficulty: "初级" | "中级" | "高级"
  tags: string[]
}

interface CourseCardProps extends BusinessCardProps {
  data: CourseData
  deviceType?: 'universal' | 'mobile' | 'pc'
}

export function CourseCard({ data, onAction, ...props }: CourseCardProps) {
  const handleStart = () => {
    onAction?.("startCourse", { courseId: data.id })
  }

  const handleViewDetails = () => {
    onAction?.("viewDetails", { courseId: data.id })
  }

  return (
    <AppCard className="overflow-hidden" {...props}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--card-title-color)" }}>
              {data.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {data.difficulty}
              </Badge>
              {data.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs mb-3" style={{ color: "var(--card-text-color)" }}>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{data.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{data.students}人学习</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{data.rating}</span>
          </div>
        </div>

        {data.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: "var(--card-text-color)" }}>学习进度</span>
              <span style={{ color: "var(--card-title-color)" }}>{data.progress}%</span>
            </div>
            <Progress value={data.progress} className="h-1" />
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={handleStart}>
            {data.progress ? "继续学习" : "开始学习"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleViewDetails}>
            详情
          </Button>
        </div>
      </div>
    </AppCard>
  )
}

// 注册课程卡片
CardRegistry.register({
  name: "course-card",
  category: "ai",
  component: CourseCard,
  businessFlow: {
    hasDetailPage: true,
    hasModal: false,
    actions: ["startCourse", "viewDetails"],
  },
  developer: {
    name: "AI Education Team",
    version: "1.0.0",
    description: "课程卡片组件，展示课程信息和学习进度",
  },
})
