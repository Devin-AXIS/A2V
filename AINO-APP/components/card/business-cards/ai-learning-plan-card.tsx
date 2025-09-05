"use client"

import { useState } from "react"
import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, CheckCircle, Circle, Clock } from "lucide-react"
import { CardRegistry } from "../registry"
import type { BusinessCardProps } from "@/types"
import { BusinessCardWrapper } from "./business-card-wrapper"
import { AICardContainer } from "../ai-card-container"

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

interface LearningPlanData {
  id: string
  title: string
  duration: string
  weeklyHours: string
  goal: string
  steps: LearningStep[]
  progress: {
    skillImprovement: number
    practiceSuccess: number
    certifications: number
    students: string
  }
  progressDetails: {
    name: string
    percentage: number
  }[]
  overallProgress: number
  currentStep: number
}

interface AILearningPlanCardProps extends BusinessCardProps {
  data: LearningPlanData
  useStreamingMode?: boolean
}

export function AILearningPlanCard({ data, onAction, useStreamingMode = true, ...props }: AILearningPlanCardProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [showSubCards, setShowSubCards] = useState(false)

  if (useStreamingMode) {
    const aiSteps = [
      {
        id: "intro",
        type: "text" as const,
        content:
          "我通过分析了你的需求、考虑了你的背景、时间和目标，这个学习方案结合了理论基础和实践应用，让你能够循序渐进地掌握核心AI技术。同时，我会一直陪伴你的学习，有问题随时问我！",
        delay: 1000,
      },
      {
        id: "summary",
        type: "card" as const,
        cardName: "learning-plan-summary",
        cardProps: {
          data: {
            title: data.title,
            duration: data.duration,
            weeklyHours: data.weeklyHours,
            goal: data.goal,
            overallProgress: data.overallProgress,
            currentStep: data.currentStep,
            totalSteps: data.steps.length,
          },
          onAction,
        },
        delay: 1500,
      },
      ...data.steps
        .filter((_, index) => index <= data.currentStep + 1)
        .map((step, index) => ({
          id: `step-${step.id}`,
          type: "learning-step" as const,
          stepNumber: step.stepNumber,
          stepTitle: step.title,
          stepContent: step.description,
          stepCourses: step.courses.map((course) => ({
            data: {
              id: course.id,
              name: course.name,
              duration: course.duration,
              completed: course.completed,
              stepId: step.id,
            },
          })),
          autoExpand: index === 0, // Auto-expand first step
          delay: 2000 + index * 1000,
        })),
      ...(data.currentStep > 0
        ? [
          {
            id: "outcome",
            type: "card" as const,
            cardName: "learning-outcome",
            cardProps: {
              data: {
                skillImprovement: data.progress.skillImprovement,
                practiceSuccess: data.progress.practiceSuccess,
                certifications: data.progress.certifications,
                students: data.progress.students,
                progressDetails: data.progressDetails.map((item, index) => ({
                  ...item,
                  icon: ["trending", "award", "users", "target"][index % 4],
                })),
              },
              onAction,
            },
            delay: 1000,
          },
        ]
        : []),
    ]

    return (
      <AICardContainer title="AI智能导师" avatar="/ai-robot-avatar.png" steps={aiSteps} autoStart={true} {...props} />
    )
  }

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const handleCompleteStep = (stepId: string) => {
    onAction?.("completeStep", { stepId, planId: data.id })
  }

  const handleNavigateToStep = (stepNumber: number) => {
    onAction?.("navigateToStep", { stepNumber, planId: data.id })
  }

  const handleStartCourse = (courseId: string) => {
    onAction?.("startCourse", { courseId })
  }

  const handleJoinPlan = () => {
    onAction?.("joinPlan", { planId: data.id })
  }

  const handleShowDetails = () => {
    setShowSubCards(!showSubCards)
    onAction?.("showDetails", { planId: data.id })
  }

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

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in-progress":
        return <Clock className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  return (
    <AppCard className="overflow-hidden" {...props}>
      {/* AI智能导师头部 */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
            <img src="/ai-robot-avatar.png" alt="AI导师" className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold" style={{ color: "var(--card-title-color)" }}>
                AI智能导师
              </h2>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">在线</span>
            </div>
            <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
              为你量身定制的AI学习方案
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-start gap-2">
            <div className="w-1 h-4 bg-orange-400 rounded mt-1"></div>
            <div>
              <h3 className="font-medium mb-1" style={{ color: "var(--card-title-color)" }}>
                专属推荐理由
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--card-text-color)" }}>
                我通过分析了你的需求、考虑了你的背景、时间和目标，这个学习方案结合了理论基础和实践应用，让你能够循序渐进地掌握核心AI技术。同时，我会一直陪伴你的学习，有问题随时问我！
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 学习计划概览 */}
      <div className="p-4">
        <BusinessCardWrapper
          cardName="learning-plan-summary"
          data={{
            title: data.title,
            duration: data.duration,
            weeklyHours: data.weeklyHours,
            goal: data.goal,
            overallProgress: data.overallProgress,
            currentStep: data.currentStep,
            totalSteps: data.steps.length,
          }}
          onAction={onAction}
        />
      </div>

      <div className="p-4 space-y-3">
        {data.steps.map((step, index) => (
          <div key={step.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => toggleStep(step.id)}
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
                {step.status === "pending" && step.stepNumber === data.currentStep && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNavigateToStep(step.stepNumber)
                    }}
                  >
                    开始学习
                  </Button>
                )}
                {expandedSteps.has(step.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {expandedSteps.has(step.id) && (
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
                    <Button size="sm" variant="ghost" onClick={handleShowDetails}>
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
                      onAction={(action, data) => {
                        onAction?.(action, { ...data, stepId: step.id })
                      }}
                    />
                  </div>

                  {step.status === "in-progress" && (
                    <div className="mt-4 pt-3 border-t">
                      <Button size="sm" className="w-full" onClick={() => handleCompleteStep(step.id)}>
                        完成第{step.stepNumber}步
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {data.steps.length < 10 && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => onAction?.("addStep", { planId: data.id, afterStep: data.steps.length })}
            >
              + 添加更多学习步骤
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <BusinessCardWrapper
          cardName="learning-outcome"
          data={{
            skillImprovement: data.progress.skillImprovement,
            practiceSuccess: data.progress.practiceSuccess,
            certifications: data.progress.certifications,
            students: data.progress.students,
            progressDetails: data.progressDetails.map((item, index) => ({
              ...item,
              icon: ["trending", "award", "users", "target"][index % 4],
            })),
          }}
          onAction={onAction}
        />

        <div className="flex gap-2 mt-4">
          <Button className="flex-1" onClick={handleJoinPlan}>
            加入学习计划
          </Button>
          <Button variant="outline" onClick={() => onAction?.("requestUpdate", {})}>
            重新评估需求
          </Button>
        </div>
      </div>
    </AppCard>
  )
}

CardRegistry.register({
  name: "ai-learning-plan",
  category: "ai",
  component: AILearningPlanCard,
  businessFlow: {
    hasDetailPage: true,
    hasModal: true,
    actions: ["startCourse", "joinPlan", "requestUpdate", "showDetails", "completeStep", "navigateToStep", "addStep"],
  },
  developer: {
    name: "AI Education Team",
    version: "2.0.0",
    description: "AI智能学习规划卡片，支持动态步骤管理和个性化学习路径定制",
  },
})

CardRegistry.registerActionHandler("ai-learning-plan", (action) => {
  switch (action.target) {
    case "startCourse":
      console.log("开始课程:", action.data)
      break
    case "joinPlan":
      console.log("加入学习计划:", action.data)
      break
    case "requestUpdate":
      console.log("重新评估需求:", action.data)
      break
    case "showDetails":
      console.log("显示详细信息:", action.data)
      break
    case "completeStep":
      console.log("完成步骤:", action.data)
      break
    case "navigateToStep":
      console.log("导航到步骤:", action.data)
      break
    case "addStep":
      console.log("添加新步骤:", action.data)
      break
  }
})
