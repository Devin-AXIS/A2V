"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { Check } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

interface Step {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  status?: "pending" | "current" | "completed" | "error"
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  showStepNumbers?: boolean
  className?: string
}

const sizeConfig = {
  sm: {
    container: "gap-4",
    step: "text-sm",
    icon: "w-6 h-6",
    line: "h-0.5"
  },
  md: {
    container: "gap-6",
    step: "text-base",
    icon: "w-8 h-8",
    line: "h-1"
  },
  lg: {
    container: "gap-8",
    step: "text-lg",
    icon: "w-10 h-10",
    line: "h-1.5"
  }
}

export function Stepper({ 
  steps, 
  currentStep, 
  onStepClick,
  orientation = "horizontal",
  size = "md",
  showStepNumbers = true,
  className 
}: StepperProps) {
  const { isFrosted } = useFrostedEffect()
  const sizeStyles = sizeConfig[size]

  const getStepStatus = (stepIndex: number): Step["status"] => {
    if (stepIndex < currentStep) return "completed"
    if (stepIndex === currentStep) return "current"
    return "pending"
  }

  const getStepClasses = (stepIndex: number, status: Step["status"]) => {
    const baseClasses = cn(
      "flex items-center transition-all duration-200",
      orientation === "horizontal" ? "flex-col" : "flex-row",
      sizeStyles.step,
      className
    )

    const statusClasses = {
      completed: "text-blue-600",
      current: "text-blue-600",
      pending: "text-gray-400",
      error: "text-red-600"
    }

    return cn(baseClasses, statusClasses[status])
  }

  const getIconClasses = (status: Step["status"]) => {
    const baseClasses = cn(
      "flex items-center justify-center rounded-full border-2 transition-all duration-200",
      sizeStyles.icon
    )

    const statusClasses = {
      completed: "bg-blue-500 border-blue-500 text-white",
      current: "bg-blue-500 border-blue-500 text-white",
      pending: "bg-white border-gray-300 text-gray-400",
      error: "bg-red-500 border-red-500 text-white"
    }

    return cn(baseClasses, statusClasses[status])
  }

  const getLineClasses = (status: Step["status"]) => {
    const baseClasses = cn(
      "flex-1 transition-all duration-200",
      sizeStyles.line
    )

    const statusClasses = {
      completed: "bg-blue-500",
      current: "bg-blue-500",
      pending: "bg-gray-200",
      error: "bg-red-500"
    }

    return cn(baseClasses, statusClasses[status])
  }

  const handleStepClick = (stepIndex: number) => {
    if (onStepClick && stepIndex <= currentStep) {
      onStepClick(stepIndex)
    }
  }

  return (
    <div className={cn(
      "flex",
      orientation === "horizontal" ? "flex-row" : "flex-col",
      sizeStyles.container,
      className
    )}>
      {steps.map((step, index) => {
        const status = step.status || getStepStatus(index)
        const isLast = index === steps.length - 1
        const isClickable = onStepClick && index <= currentStep

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className={cn(
              "flex items-center",
              orientation === "horizontal" ? "flex-col" : "flex-row"
            )}>
              {/* 步骤图标/数字 */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    getIconClasses(status),
                    isClickable && "cursor-pointer hover:scale-105",
                    !isClickable && "cursor-default"
                  )}
                  aria-label={`步骤 ${index + 1}: ${step.title}`}
                >
                  {status === "completed" ? (
                    <Check className="w-4 h-4" />
                  ) : step.icon ? (
                    step.icon
                  ) : showStepNumbers ? (
                    <span className="font-medium">{index + 1}</span>
                  ) : null}
                </button>
              </div>

              {/* 步骤内容 */}
              <div className={cn(
                "text-center",
                orientation === "horizontal" ? "mt-2" : "ml-3"
              )}>
                <div className={cn(
                  "font-medium",
                  status === "completed" && "text-blue-600",
                  status === "current" && "text-blue-600",
                  status === "pending" && "text-gray-500",
                  status === "error" && "text-red-600"
                )}>
                  {step.title}
                </div>
                {step.description && (
                  <div className={cn(
                    "text-sm mt-1",
                    status === "completed" && "text-blue-500",
                    status === "current" && "text-blue-500",
                    status === "pending" && "text-gray-400",
                    status === "error" && "text-red-500"
                  )}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* 连接线 */}
            {!isLast && (
              <div className={cn(
                "mx-4",
                orientation === "horizontal" ? "w-full" : "h-full"
              )}>
                <div className={cn(
                  getLineClasses(status),
                  orientation === "horizontal" ? "w-full" : "h-full"
                )} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

