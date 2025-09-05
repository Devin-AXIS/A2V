"use client"

import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, ChevronUp, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface CourseItem {
  id: number | string
  title: string
  duration: string
  completed?: boolean
  index?: number
}

interface CourseModuleCardProps {
  title?: string
  moduleCount?: number
  courses?: CourseItem[]
  className?: string
  disableLocalTheme?: boolean
  stepId?: string
  stepStatus?: "pending" | "in-progress" | "completed"
  onAction?: (action: string, data: any) => void
  isVisible?: boolean
  animationDelay?: number
  isStreaming?: boolean
}

const defaultCourses: CourseItem[] = [
  { id: 1, title: "AI基础概念介绍", duration: "40分钟" },
  { id: 2, title: "AI发展历程回顾", duration: "45分钟" },
  { id: 3, title: "机器学习入门", duration: "60分钟" },
  { id: 4, title: "深度学习基础", duration: "55分钟" },
]

export default function CourseModuleCard({
  title = "基础课程",
  moduleCount = 4,
  courses = defaultCourses,
  className = "",
  disableLocalTheme = false,
  stepId,
  stepStatus = "pending",
  onAction,
  isVisible = true,
  animationDelay = 0,
  isStreaming = false,
}: CourseModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [shouldRender, setShouldRender] = useState(!isStreaming)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isStreaming && isVisible) {
      const timer = setTimeout(() => {
        setShouldRender(true)
        setTimeout(() => setIsAnimating(true), 50)
      }, animationDelay)
      return () => clearTimeout(timer)
    } else if (!isStreaming) {
      setShouldRender(true)
      setIsAnimating(true)
    }
  }, [isVisible, animationDelay, isStreaming])

  const handleStartCourse = (courseId: string | number) => {
    onAction?.("startCourse", { courseId, stepId })
  }

  const handleCompleteCourse = (courseId: string | number) => {
    onAction?.("completeCourse", { courseId, stepId })
  }

  if (!shouldRender) {
    return null
  }

  return (
    <AppCard
      className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } ${className}`}
      disableLocalTheme={disableLocalTheme}
    >
      <div className="p-6" style={{ width: "400px" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
            <div>
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 opacity-60" />
                <h3 className="text-lg font-semibold" data-slot="card-title">
                  {title}
                </h3>
                {stepStatus === "completed" && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    已完成
                  </Badge>
                )}
                {stepStatus === "in-progress" && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    进行中
                  </Badge>
                )}
              </div>
              <p className="text-sm opacity-70" data-slot="card-description">
                {moduleCount} 个课程模块
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-slate-800 text-white text-xs rounded-full">线上</span>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="p-1">
              <ChevronUp className={`w-4 h-4 transition-transform ${isExpanded ? "" : "rotate-180"}`} />
            </Button>
          </div>
        </div>

        {/* Course List */}
        {isExpanded && (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${course.completed
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                  }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${course.completed ? "bg-green-600 text-white" : "bg-slate-800 dark:bg-slate-600 text-white"
                      }`}
                  >
                    {course.completed ? <CheckCircle className="w-4 h-4" /> : course.index || course.id}
                  </div>
                  <div>
                    <h4
                      className={`font-medium ${course.completed ? "line-through opacity-70" : ""}`}
                      data-slot="card-title"
                    >
                      {course.title}
                    </h4>
                    <div className="flex items-center text-sm opacity-70">
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration}
                      {course.completed && <span className="ml-2 text-green-600 text-xs">已完成</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {course.completed ? (
                    <Button size="sm" variant="outline" disabled className="px-4 py-2 bg-transparent">
                      已完成
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2"
                        onClick={() => handleStartCourse(course.id)}
                      >
                        开始
                      </Button>
                      {stepStatus === "in-progress" && (
                        <Button size="sm" variant="outline" onClick={() => handleCompleteCourse(course.id)}>
                          完成
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {courses.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">课程进度</span>
              <span className="font-medium">
                {courses.filter((c) => c.completed).length} / {courses.length} 完成
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(courses.filter((c) => c.completed).length / courses.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AppCard>
  )
}
