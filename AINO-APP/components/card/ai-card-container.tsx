"use client"

import { useState, useEffect, useRef } from "react"
import { AppCard } from "@/components/layout/app-card"
import { TypewriterText } from "@/components/ui/typewriter-text"
import { BusinessCardWrapper } from "./business-cards/business-card-wrapper"
import { Bot } from "lucide-react"

interface AICardStep {
  id: string
  type: "text" | "card" | "learning-step"
  content?: string
  cardName?: string
  cardProps?: any
  delay?: number
  stepNumber?: number
  stepTitle?: string
  stepContent?: string
  stepCourses?: any[]
  autoExpand?: boolean
}

interface AICardContainerProps {
  title: string
  avatar?: string
  steps: AICardStep[]
  className?: string
  autoStart?: boolean
  useStreamingMode?: boolean
}

export function AICardContainer({
  title,
  avatar,
  steps,
  className = "",
  autoStart = true,
  useStreamingMode = false,
}: AICardContainerProps) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [expandedLearningSteps, setExpandedLearningSteps] = useState<Set<string>>(new Set())
  const [visibleStepContent, setVisibleStepContent] = useState<Record<string, boolean>>({})
  const [visibleCourseCards, setVisibleCourseCards] = useState<Record<string, number>>({})
  const processingSteps = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (autoStart && currentStep === -1) {
      if (useStreamingMode) {
        const streamingTimeline = [
          500, // AI header
          2000, // First explanation
          1000, // Learning plan card
          1500, // Step 1 appears
          3000, // Step 1 auto-expands and content loads
          2000, // Step 2 appears
          2000, // Step 3 appears
        ]

        let cumulativeDelay = 0
        streamingTimeline.forEach((delay, index) => {
          cumulativeDelay += delay
          setTimeout(() => {
            setCurrentStep(index)

            // Auto-expand first learning step
            if (index === 4) {
              setExpandedLearningSteps((prev) => new Set(prev).add("step1"))
              setTimeout(() => {
                setVisibleStepContent((prev) => ({ ...prev, step1: true }))
                setTimeout(() => {
                  startCourseCardsAnimation("step1")
                }, 800)
              }, 500)
            }
          }, cumulativeDelay)
        })
      } else {
        setCurrentStep(0)
      }
    }
  }, [autoStart, useStreamingMode])

  const startCourseCardsAnimation = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId)
    if (!step?.stepCourses) return

    step.stepCourses.forEach((_, courseIndex) => {
      setTimeout(() => {
        setVisibleCourseCards((prev) => ({
          ...prev,
          [`${stepId}-${courseIndex}`]: courseIndex + 1,
        }))
      }, courseIndex * 600) // 每个卡片间隔600ms出现
    })
  }

  const handleStepComplete = (stepIndex: number) => {
    if (processingSteps.current.has(stepIndex)) {
      return
    }

    processingSteps.current.add(stepIndex)
    setCompletedSteps((prev) => new Set([...prev, stepIndex]))

    // 启动下一步
    if (stepIndex + 1 < steps.length) {
      const nextStep = steps[stepIndex + 1]
      const delay = nextStep.delay || 500

      setTimeout(() => {
        setCurrentStep(stepIndex + 1)
        processingSteps.current.delete(stepIndex)
      }, delay)
    } else {
      processingSteps.current.delete(stepIndex)
    }
  }

  const toggleLearningStep = (stepId: string) => {
    const newExpanded = new Set(expandedLearningSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
      setVisibleStepContent((prev) => ({ ...prev, [stepId]: false }))
      setVisibleCourseCards((prev) => {
        const newState = { ...prev }
        Object.keys(newState).forEach((key) => {
          if (key.startsWith(`${stepId}-`)) {
            delete newState[key]
          }
        })
        return newState
      })
    } else {
      newExpanded.add(stepId)
      setTimeout(() => {
        setVisibleStepContent((prev) => ({ ...prev, [stepId]: true }))
        setTimeout(() => {
          startCourseCardsAnimation(stepId)
        }, 800)
      }, 300)
    }
    setExpandedLearningSteps(newExpanded)
  }

  const handleLearningStepComplete = (stepId: string) => {
    const stepNumbers = ["step1", "step2", "step3", "step4", "step5"]
    const currentIndex = stepNumbers.indexOf(stepId)

    if (currentIndex !== -1 && currentIndex < stepNumbers.length - 1) {
      const nextStepId = stepNumbers[currentIndex + 1]
      setTimeout(() => {
        setExpandedLearningSteps((prev) => new Set(prev).add(nextStepId))
        setTimeout(() => {
          setVisibleStepContent((prev) => ({ ...prev, [nextStepId]: true }))
          setTimeout(() => {
            startCourseCardsAnimation(nextStepId)
          }, 800)
        }, 500)
      }, 1000)
    }
  }

  return (
    <AppCard className={`${className} overflow-hidden`}>
      {/* AI头像和标题 */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
          {avatar ? (
            <img src={avatar || "/placeholder.svg"} alt="AI Avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: "var(--card-title-color)" }}>
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs" style={{ color: "var(--card-text-color)" }}>
              在线
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {steps.map((step, index) => {
          const isVisible = currentStep >= index
          const isCompleted = completedSteps.has(index)

          if (!isVisible) return null

          return (
            <div
              key={step.id}
              className={`transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {step.type === "text" && step.content && (
                <div className="mb-4">
                  <TypewriterText
                    text={step.content}
                    speed={30}
                    onComplete={() => handleStepComplete(index)}
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--card-text-color)" }}
                  />
                </div>
              )}

              {step.type === "card" && step.cardName && (
                <div
                  className="transition-all duration-500 opacity-100 scale-100"
                  onAnimationEnd={() => {
                    if (!completedSteps.has(index)) {
                      setTimeout(() => handleStepComplete(index), 1000)
                    }
                  }}
                >
                  <BusinessCardWrapper cardName={step.cardName} {...step.cardProps} disableLocalTheme={true} />
                </div>
              )}

              {step.type === "learning-step" && (
                <div className="mb-6">
                  <div
                    className="flex items-center justify-between cursor-pointer mb-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors"
                    onClick={() => toggleLearningStep(step.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {step.stepNumber}
                      </div>
                      <h4 className="font-bold text-gray-900">{step.stepTitle}</h4>
                    </div>
                    <div className="w-6 h-6 bg-gray-100/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                      {expandedLearningSteps.has(step.id) ? "▲" : "▼"}
                    </div>
                  </div>

                  {expandedLearningSteps.has(step.id) && (
                    <div className="ml-11 space-y-4">
                      {step.stepContent && (
                        <div className="mb-6 p-4 bg-gray-50/50 backdrop-blur-sm rounded-xl border border-gray-200/30">
                          <TypewriterText
                            text={step.stepContent}
                            speed={25}
                            onComplete={() => {
                              setTimeout(() => handleLearningStepComplete(step.id), 500)
                            }}
                            className="text-sm text-gray-700 leading-relaxed"
                          />
                        </div>
                      )}

                      {visibleStepContent[step.id] && step.stepCourses && (
                        <div className="space-y-4">
                          {step.stepCourses.map((course: any, courseIndex: number) => {
                            const cardKey = `${step.id}-${courseIndex}`
                            const isCardVisible = visibleCourseCards[cardKey] > 0

                            return (
                              <div
                                key={courseIndex}
                                className={`transition-all duration-700 ${
                                  isCardVisible
                                    ? "opacity-100 translate-y-0 scale-100"
                                    : "opacity-0 translate-y-8 scale-95"
                                }`}
                                style={{
                                  transitionDelay: isCardVisible ? `${courseIndex * 100}ms` : "0ms",
                                }}
                              >
                                {isCardVisible && (
                                  <BusinessCardWrapper
                                    cardName="course-module-card"
                                    {...course}
                                    disableLocalTheme={true}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AppCard>
  )
}
