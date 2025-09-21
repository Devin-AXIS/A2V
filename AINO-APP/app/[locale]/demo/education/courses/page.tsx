"use client"

import { useState } from "react"
import { use } from "react"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppHeader } from "@/components/navigation/app-header"
import { PillNavigation } from "@/components/navigation/pill-navigation"
import { FutureSkillsCourseCard } from "@/components/card/future-skills-course-card"
import { EducationBottomNavigation } from "@/components/navigation/education-bottom-navigation"
import type { Locale } from "@/lib/dictionaries"

const courseCategories = ["全部课程", "人工智能", "机器学习", "深度学习", "自然语言处理", "计算机视觉"]

const coursesData = [
  {
    id: "ai-fundamentals",
    name: "人工智能基础与应用",
    duration: "12周",
    students: 15420,
    rating: 4.8,
    difficulty: "初级" as const,
    tags: ["AI基础", "Python"],
    certificate: {
      name: "人工智能基础认证",
      issuer: "AI技能认证中心",
    },
    relatedJobs: ["AI产品经理", "数据分析师", "AI项目经理"],
    instructor: "张教授",
    price: "¥2,999",
    originalPrice: "¥3,999",
  },
  {
    id: "machine-learning",
    name: "机器学习算法与实战",
    duration: "16周",
    students: 12350,
    rating: 4.9,
    difficulty: "中级" as const,
    tags: ["机器学习", "算法"],
    certificate: {
      name: "机器学习工程师认证",
      issuer: "机器学习协会",
    },
    relatedJobs: ["机器学习工程师", "算法工程师", "数据科学家"],
    instructor: "李博士",
    price: "¥3,999",
    originalPrice: "¥5,999",
  },
  {
    id: "deep-learning",
    name: "深度学习与神经网络",
    duration: "20周",
    students: 8960,
    rating: 4.7,
    difficulty: "高级" as const,
    tags: ["深度学习", "神经网络"],
    certificate: {
      name: "深度学习专家认证",
      issuer: "深度学习研究院",
    },
    relatedJobs: ["深度学习工程师", "AI研究员", "算法专家"],
    instructor: "王研究员",
    price: "¥4,999",
    originalPrice: "¥6,999",
  },
  {
    id: "nlp-course",
    name: "自然语言处理技术",
    duration: "14周",
    students: 7230,
    rating: 4.6,
    difficulty: "中级" as const,
    tags: ["NLP", "文本处理"],
    certificate: {
      name: "NLP工程师认证",
      issuer: "自然语言处理学会",
    },
    relatedJobs: ["NLP工程师", "对话系统工程师", "文本挖掘专家"],
    instructor: "陈教授",
    price: "¥3,599",
    originalPrice: "¥4,599",
  },
  {
    id: "computer-vision",
    name: "计算机视觉与图像识别",
    duration: "18周",
    students: 6540,
    rating: 4.8,
    difficulty: "高级" as const,
    tags: ["计算机视觉", "图像处理"],
    certificate: {
      name: "计算机视觉专家认证",
      issuer: "计算机视觉协会",
    },
    relatedJobs: ["计算机视觉工程师", "图像算法工程师", "自动驾驶工程师"],
    instructor: "刘博士",
    price: "¥4,599",
    originalPrice: "¥5,999",
  },
  {
    id: "ai-ethics",
    name: "AI伦理与可解释性",
    duration: "8周",
    students: 4320,
    rating: 4.5,
    difficulty: "初级" as const,
    tags: ["AI伦理", "可解释AI"],
    certificate: {
      name: "AI伦理专家认证",
      issuer: "AI伦理委员会",
    },
    relatedJobs: ["AI伦理专家", "AI政策分析师", "AI合规专员"],
    instructor: "赵教授",
    price: "¥1,999",
    originalPrice: "¥2,999",
  },
]

export default function EducationCoursesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params)
  const [activeCategory, setActiveCategory] = useState("全部课程")

  const filteredCourses = coursesData.filter((course) => {
    if (activeCategory === "全部课程") return true
    return course.tags.some((tag) =>
      tag.includes(
        activeCategory
          .replace("人工智能", "AI")
          .replace("机器学习", "机器学习")
          .replace("深度学习", "深度学习")
          .replace("自然语言处理", "NLP")
          .replace("计算机视觉", "计算机视觉"),
      ),
    )
  })

  const handleCourseAction = (action: string, data: any) => {
    console.log("Course action:", action, data)
    // 这里可以添加具体的课程操作逻辑
  }

  return (
    <>
      <DynamicBackground />
      <div className="min-h-screen pb-20">
        <AppHeader title="未来技能课程" showBackButton={true} />

        <div className="pt-16 px-4">
          <div className="mb-6">
            <PillNavigation
              tabs={courseCategories}
              activeTab={activeCategory}
              onTabChange={setActiveCategory}
              className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm py-4 px-4"
            />
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--card-title-color)" }}>
              掌握未来技能，开启AI时代
            </h2>
            <p className="text-muted-foreground mb-4">
              {filteredCourses.length} 门精品课程 · 超过{" "}
              {coursesData.reduce((sum, course) => sum + course.students, 0).toLocaleString()} 人正在学习
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <FutureSkillsCourseCard key={course.id} data={course} onAction={handleCourseAction} />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">该分类下暂无课程</p>
            </div>
          )}
        </div>
      </div>

      <EducationBottomNavigation locale={locale} />
    </>
  )
}
