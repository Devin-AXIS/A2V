"use client"

import { useState } from "react"
import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, CheckCircle, Clock } from "lucide-react"
import { CardRegistry } from "../registry"
import type { BusinessCardProps } from "@/types"
import { BusinessCardWrapper } from "./business-card-wrapper"

interface Course {
  id: string
  name: string
  duration: string
  completed?: boolean
}

interface LearningStep {
  id: string
  title: string
  description: string
  courses: Course[]
  completed?: boolean
  stepNumber: number
  status: "pending" | "in-progress" | "completed"
  estimatedDuration?: string
}

interface LearningStepDetailCardProps extends BusinessCardProps {
  data: LearningStep
}

export function LearningStepDetailCard({ data: step, onAction, ...props }: LearningStepDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(step.status === "in-progress")

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white"
      case "in-progress":
        return "bg-blue-600 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  const handleCompleteStep = () => {
    onAction?.("completeStep", { stepId: step.id })
  }

  const handleNavigateToStep = () => {
    onAction?.("navigateToStep", { stepNumber: step.stepNumber })
  }

  return (
    <AppCard className="overflow-hidden" {...props}>
      <div className="border rounded-lg overflow-hidden">
        <button
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full text-sm flex items-center justify-center font-medium ${getStepStatusColor(step.status)}`}
            >
              {step.status === "completed" ? <CheckCircle className="w-4 h-4" /> : step.stepNumber}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium" style={{ color: "var(--card-title-color)" }}>
                  第{step.stepNumber}步 - {step.title}
                </h4>
                {step.status === "in-progress" && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    进行中
                  </Badge>
                )}
                {step.status === "completed" && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    已完成
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--card-text-color)" }}>
                <span>{step.courses.length}个课程模块</span>
                {step.estimatedDuration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.estimatedDuration}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNavigateToStep()
                }}
              >
                开始学习
              </Button>
            )}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 bg-gray-50/50 dark:bg-gray-800/20">
            <p className="text-sm mb-4 pl-11 leading-relaxed" style={{ color: "var(--card-text-color)" }}>
              {step.description}
            </p>

            <div className="pl-11">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
                  基础课程
                </span>
                <Badge variant="outline" className="text-xs">
                  {step.courses.length}个课程模块
                </Badge>
                <Button size="sm" variant="ghost">
                  线上
                </Button>
              </div>

              <div className="space-y-2">
                <BusinessCardWrapper
                  cardName="course-module"
                  data={{
                    title: "基础课程",
                    moduleCount: step.courses.length,
                    courses: step.courses.map((course, courseIndex) => ({
                      id: course.id,
                      name: course.name,
                      duration: course.duration,
                      index: courseIndex + 1,
                      completed: course.completed,
                    })),
                    stepId: step.id,
                    stepStatus: step.status,
                  }}
                  onAction={onAction}
                />
              </div>

              {step.status === "in-progress" && (
                <div className="mt-4 pt-3 border-t">
                  <Button size="sm" className="w-full" onClick={handleCompleteStep}>
                    完成第{step.stepNumber}步
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppCard>
  )
}

CardRegistry.register({
  name: "learning-step-detail",
  category: "ai",
  component: LearningStepDetailCard,
  businessFlow: {
    hasDetailPage: false,
    hasModal: false,
    actions: ["completeStep", "navigateToStep", "startCourse"],
  },
  developer: {
    name: "AI Education Team",
    version: "1.0.0",
    description: "学习步骤详情卡片，用于显示单个学习步骤的详细信息",
  },
})
