"use client"

import { useRouter, useParams } from "next/navigation"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { Tag } from "@/components/basic/tag"
import { Clock, Users, Award } from "lucide-react"
import type { BusinessCardProps } from "@/types"

interface Course {
  id: string
  name: string
  duration: string
  students: number
  certificate: string
  tags: string[]
}

interface InstructorCoursesListCardProps extends BusinessCardProps {
  courses: Course[]
}

export function InstructorCoursesListCard({ courses = [], onAction, ...props }: InstructorCoursesListCardProps) {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string

  const handleCourseClick = (courseId: string) => {
    router.push(`/${locale}/demo/education/courses/${courseId}`)
    onAction?.("viewCourseDetail", { courseId })
  }

  if (!courses || courses.length === 0) {
    return (
      <AppCard {...props}>
        <div className="p-6">
          <h3 className="text-base font-semibold mb-4">授课课程</h3>
          <p className="text-muted-foreground text-center py-8">暂无课程信息</p>
        </div>
      </AppCard>
    )
  }

  return (
    <AppCard {...props}>
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4">授课课程</h3>
        <div className="space-y-4">
          {courses.map((course) => (
            <AppCard key={course.id}>
              <div
                onClick={() => handleCourseClick(course.id)}
                className="flex gap-4 p-4 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex-1">
                  <h4 className="font-medium mb-2">{course.name}</h4>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}人学习</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>{course.certificate}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.tags.map((tag) => (
                      <Tag key={tag} variant="white" size="sm">
                        {tag}
                      </Tag>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <PillButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCourseClick(course.id)
                      }}
                    >
                      查看详情
                    </PillButton>
                  </div>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      </div>
    </AppCard>
  )
}

// Default export for compatibility
export default InstructorCoursesListCard
