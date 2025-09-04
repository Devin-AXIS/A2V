"use client"

import { useState } from "react"
import { AppCard } from "@/components/layout/app-card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Tag } from "@/components/basic/tag"
import { CardRegistry } from "../registry"
import type { BusinessCardProps } from "@/types"

interface CourseSection {
  id: string
  title: string
  type: "线上" | "线下"
  duration: string
  subsections: {
    id: string
    title: string
    lessons: {
      id: string
      title: string
      duration: string
    }[]
  }[]
}

interface CourseOutlineData {
  sections: CourseSection[]
  totalDuration: string
  onlineDuration: string
  offlineDuration: string
  estimatedPeriod: string
}

interface CourseOutlineCardProps extends BusinessCardProps {
  data: CourseOutlineData
}

export function CourseOutlineCard({ data, onAction, ...props }: CourseOutlineCardProps) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    application: true,
    practice: true,
  })

  const toggleSection = (section: "basic" | "application" | "practice") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <AppCard {...props}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">课程大纲</h3>

        <div className="space-y-6">
          {data.sections.map((section, sectionIndex) => (
            <div key={section.id} className="space-y-3">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                onClick={() => toggleSection(section.id as "basic" | "application" | "practice")}
              >
                <h4 className="text-base font-semibold">{section.title}</h4>
                <div className="flex items-center gap-2">
                  <Tag variant="white" size="sm">
                    {section.type}
                  </Tag>
                  <span className="text-sm text-muted-foreground">{section.duration}</span>
                  {expandedSections[section.id as keyof typeof expandedSections] ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedSections[section.id as keyof typeof expandedSections] && (
                <div className="space-y-4 pl-0">
                  {section.subsections.map((subsection, subsectionIndex) => (
                    <div key={subsection.id} className="space-y-2">
                      <h5 className="text-sm font-semibold bg-primary/10 px-3 py-2 rounded-lg">{subsection.title}</h5>
                      <div className="space-y-2 pl-4">
                        {subsection.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <span className="text-sm">{lesson.title}</span>
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">课程总计</span>
              <span className="font-bold">{data.totalDuration}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>
                线上课程：{data.onlineDuration} | 线下课程：{data.offlineDuration}
              </span>
              <span>预计学习周期：{data.estimatedPeriod}</span>
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  )
}

CardRegistry.register({
  name: "course-outline",
  displayName: "课程大纲",
  category: "教育",
  component: CourseOutlineCard,
  businessFlow: "课程大纲展示，包含多层级结构的课程内容和可展开的章节",
  developer: {
    name: "Education System",
    version: "1.0.0",
    description: "课程大纲卡片，支持多层级结构展示和章节展开功能",
  },
})

export default CourseOutlineCard
