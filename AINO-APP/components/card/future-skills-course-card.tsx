"use client"

import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star, Award, Briefcase } from "lucide-react"
import { CardRegistry } from "./registry"
import type { BusinessCardProps } from "@/types"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

interface CourseData {
  id: string
  name: string
  duration: string
  students: number
  rating: number
  progress?: number
  difficulty: "初级" | "中级" | "高级"
  tags: string[]
  certificate: {
    name: string
    issuer: string
  }
  relatedJobs: string[]
  instructor: string
  price: string
  originalPrice?: string
}

interface FutureSkillsCourseCardProps extends BusinessCardProps {
  data: CourseData
}

export function FutureSkillsCourseCard({ data, onAction, ...props }: FutureSkillsCourseCardProps) {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const handleStart = () => {
    onAction?.("startCourse", { courseId: data.id })
  }

  const handleViewDetails = () => {
    router.push(`/${locale}/demo/education/courses/${data.id}`)
    onAction?.("viewDetails", { courseId: data.id })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "初级":
        return "bg-green-100 text-green-700 border-green-200"
      case "中级":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "高级":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <AppCard className="overflow-hidden hover:shadow-lg transition-all duration-300" {...props}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2" style={{ color: "var(--card-title-color)" }}>
              {data.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className={`text-xs border ${getDifficultyColor(data.difficulty)}`}>
                {data.difficulty}
              </Badge>
              {data.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary mb-1">{data.price}</div>
            {data.originalPrice && (
              <div className="text-sm text-muted-foreground line-through">{data.originalPrice}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm mb-4" style={{ color: "var(--card-text-color)" }}>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{data.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{data.students}人学习</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{data.rating}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm" style={{ color: "var(--card-text-color)" }}>
            讲师：<span className="font-medium">{data.instructor}</span>
          </p>
        </div>

        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">可获得证书</span>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">{data.certificate.name}</p>
          <p className="text-xs text-blue-500 dark:text-blue-500">由 {data.certificate.issuer} 颁发</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">相关岗位</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.relatedJobs.map((job) => (
              <Badge key={job} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                {job}
              </Badge>
            ))}
          </div>
        </div>

        {data.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--card-text-color)" }}>学习进度</span>
              <span style={{ color: "var(--card-title-color)" }}>{data.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <PillButton className="flex-1" onClick={handleStart}>
            {data.progress ? "继续学习" : "立即报名"}
          </PillButton>
          <PillButton variant="outline" onClick={handleViewDetails}>
            详情
          </PillButton>
        </div>
      </div>
    </AppCard>
  )
}

CardRegistry.register({
  name: "future-skills-course-card",
  category: "education",
  component: FutureSkillsCourseCard,
  businessFlow: {
    hasDetailPage: true,
    hasModal: false,
    actions: ["startCourse", "viewDetails"],
  },
  developer: {
    name: "AI Education Team",
    version: "1.0.0",
    description: "未来技能课程卡片，展示AI等新技能课程信息，包含证书和相关岗位",
  },
})
