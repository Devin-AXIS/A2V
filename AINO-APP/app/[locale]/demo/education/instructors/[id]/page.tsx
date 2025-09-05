"use client"

import { useState } from "react"
import { use } from "react"
import { useRouter, useParams } from "next/navigation"
import { Award, BookOpen, Building2 } from "lucide-react"
import Image from "next/image"
import { AppCard } from "@/components/layout/app-card"
import { AppHeader } from "@/components/navigation/app-header"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { Tabs } from "@/components/navigation/tabs"
import { PillButton } from "@/components/basic/pill-button"
import { Tag } from "@/components/basic/tag"
import { EducationBottomNavigation } from "@/components/navigation/education-bottom-navigation"
import InstructorCoursesListCard from "@/components/card/business-cards/instructor-courses-list-card"
import type { Locale } from "@/lib/dictionaries"

export default function InstructorDetailPage({ params }: { params: Promise<{ id: string; locale: Locale }> }) {
  const { id, locale } = use(params)
  const [activeTab, setActiveTab] = useState("introduction")
  const router = useRouter()

  // 模拟导师数据
  const instructor = {
    id: Number.parseInt(id),
    name: id === "1" ? "张教授" : "李博士",
    title: id === "1" ? "AI技术专家" : "机器学习专家",
    company: id === "1" ? "百度" : "腾讯",
    avatar: id === "1" ? "/person-avatar-1.png" : "/person-avatar-2.png",
    experience: "8年",
    specialties:
      id === "1"
        ? ["深度学习", "自然语言处理", "计算机视觉", "机器学习", "Python", "TensorFlow"]
        : ["机器学习", "数据挖掘", "算法优化", "深度学习", "PyTorch", "Scikit-learn"],
    achievements:
      id === "1"
        ? ["发表论文50+篇", "AI专利20+项", "指导学员1000+人", "Google Scholar引用3000+次"]
        : ["发表论文30+篇", "AI专利15+项", "指导学员800+人", "IEEE Fellow"],
    description:
      id === "1"
        ? "前百度资深算法工程师，专注于深度学习和自然语言处理领域研究，拥有丰富的工业界项目经验。"
        : "腾讯AI Lab资深研究员，在机器学习和数据挖掘领域有深厚造诣，致力于AI技术的产业化应用。",
    detailedBio:
      id === "1"
        ? `张教授是人工智能领域的资深专家，拥有清华大学计算机科学博士学位。在百度工作期间，他主导了多个核心AI项目的研发，包括百度大脑的自然语言处理模块和智能对话系统。

他在深度学习、自然语言处理和计算机视觉方面有着深厚的理论基础和丰富的实践经验。发表了50多篇高质量学术论文，获得了20多项AI相关专利，在Google Scholar上的引用次数超过3000次。

作为一名优秀的教育者，张教授已经指导了超过1000名学员，帮助他们在AI领域取得了显著的成就。他的教学风格深入浅出，善于将复杂的理论知识转化为易于理解的实践案例。`
        : `李博士是机器学习领域的知名专家，拥有斯坦福大学计算机科学博士学位。在腾讯AI Lab工作期间，他专注于机器学习算法的研究与应用，参与了多个重要的AI产品开发。

他在机器学习、数据挖掘和算法优化方面有着丰富的经验，发表了30多篇高质量学术论文，获得了15项AI相关专利，是IEEE Fellow。

李博士在教学方面也有着出色的表现，已经指导了800多名学员，他注重理论与实践相结合，善于培养学员的创新思维和解决问题的能力。`,
    courses: [
      {
        id: "1",
        name: "提示词工程师",
        duration: "60个课时",
        students: 856,
        certificate: "AI提示词工程师认证证书",
        tags: ["热门课程", "实战项目", "就业推荐"],
      },
      {
        id: "2",
        name: "AIGC应用开发",
        duration: "80个课时",
        students: 642,
        certificate: "AIGC应用开发专业证书",
        tags: ["前沿技术", "项目实战", "导师指导"],
      },
    ],
    education:
      id === "1"
        ? [
            {
              degree: "博士",
              major: "计算机科学",
              school: "清华大学",
              year: "2012-2016",
            },
            {
              degree: "硕士",
              major: "人工智能",
              school: "北京大学",
              year: "2010-2012",
            },
          ]
        : [
            {
              degree: "博士",
              major: "计算机科学",
              school: "斯坦福大学",
              year: "2011-2015",
            },
            {
              degree: "硕士",
              major: "机器学习",
              school: "麻省理工学院",
              year: "2009-2011",
            },
          ],
    workExperience:
      id === "1"
        ? [
            {
              position: "资深算法工程师",
              company: "百度",
              period: "2016-2024",
              description: "负责百度大脑自然语言处理模块的研发，主导智能对话系统的设计与优化。",
            },
            {
              position: "算法实习生",
              company: "微软亚洲研究院",
              period: "2015-2016",
              description: "参与机器学习算法的研究与开发，专注于深度学习模型的优化。",
            },
          ]
        : [
            {
              position: "资深研究员",
              company: "腾讯AI Lab",
              period: "2015-2024",
              description: "负责机器学习算法的研究与产业化应用，主导多个AI产品的核心算法开发。",
            },
            {
              position: "研究实习生",
              company: "Google Research",
              period: "2014-2015",
              description: "参与深度学习和机器学习算法的前沿研究，发表多篇顶级会议论文。",
            },
          ],
    publications:
      id === "1"
        ? [
            "Deep Learning for Natural Language Processing: A Comprehensive Survey (IJCAI 2023)",
            "Attention Mechanisms in Neural Machine Translation (ACL 2022)",
            "Transformer-based Models for Text Generation (EMNLP 2021)",
            "Multi-modal Learning for AI Applications (ICCV 2020)",
          ]
        : [
            "Advanced Machine Learning Algorithms for Big Data (ICML 2023)",
            "Optimization Techniques in Deep Learning (NeurIPS 2022)",
            "Scalable Data Mining for Industrial Applications (KDD 2021)",
            "Reinforcement Learning in Real-world Systems (AAAI 2020)",
          ],
    rating: 4.9,
    totalStudents: id === "1" ? 1200 : 800,
  }

  const tabItems = [
    { id: "introduction", label: "导师介绍" },
    { id: "courses", label: "导师课程" },
    { id: "achievements", label: "发表研究" },
  ]

  const handleCourseClick = (courseId: number) => {
    router.push(`/${locale}/demo/education/courses/${courseId}`)
  }

  return (
    <>
      <DynamicBackground />
      <div className="min-h-screen pb-24">
        <AppHeader title="导师详情" showBackButton={true} />

        <div className="p-4 sm:p-6 space-y-6 pt-20">
          {/* Instructor Header */}
          <AppCard>
            <div className="p-5 space-y-4">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-24 h-28 flex-shrink-0">
                  <div className="relative w-full h-full bg-muted rounded-2xl overflow-hidden">
                    <Image
                      src={instructor.avatar || "/placeholder.svg"}
                      alt={instructor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold">{instructor.name}</h2>
                    <p className="text-base text-primary font-medium">{instructor.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building2 className="w-4 h-4" />
                      <span>{instructor.company}</span>
                      <span>•</span>
                      <span>{instructor.experience}经验</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{instructor.description}</p>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <p className="text-sm font-medium mb-2">专业领域</p>
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map((specialty, index) => (
                    <Tag key={index} variant="white" size="sm">
                      {specialty}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </AppCard>

          {/* Navigation Tabs */}
          <Tabs
            tabs={tabItems.map((item) => item.label)}
            activeTab={tabItems.find((item) => item.id === activeTab)?.label || tabItems[0].label}
            onTabChange={(label) => {
              const item = tabItems.find((item) => item.label === label)
              if (item) setActiveTab(item.id)
            }}
            className="w-full"
          />

          {/* Instructor Introduction */}
          {activeTab === "introduction" && (
            <div className="space-y-4">
              <AppCard>
                <div className="p-6">
                  <h3 className="text-base font-semibold mb-4">个人简介</h3>
                  <div className="space-y-4 text-sm leading-relaxed">
                    {instructor.detailedBio.split("\n\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </AppCard>

              <AppCard>
                <div className="p-6">
                  <h3 className="text-base font-semibold mb-4">教育背景</h3>
                  <div className="space-y-3">
                    {instructor.education.map((edu, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {edu.degree} - {edu.major}
                          </p>
                          <p className="text-sm text-muted-foreground">{edu.school}</p>
                          <p className="text-xs text-muted-foreground">{edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AppCard>

              <AppCard>
                <div className="p-6">
                  <h3 className="text-base font-semibold mb-4">工作经历</h3>
                  <div className="space-y-3">
                    {instructor.workExperience.map((work, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <p className="font-semibold">{work.position}</p>
                          <p className="text-sm text-muted-foreground">{work.company}</p>
                          <p className="text-xs text-muted-foreground mb-2">{work.period}</p>
                          <p className="text-sm">{work.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AppCard>

              <AppCard>
                <div className="p-6">
                  <h3 className="text-base font-semibold mb-4">主要成就</h3>
                  <div className="space-y-3">
                    {instructor.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="w-4 h-4 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AppCard>
            </div>
          )}

          {/* Instructor Courses */}
          {activeTab === "courses" && (
            <InstructorCoursesListCard
              courses={instructor.courses}
              onAction={(action, data) => {
                console.log("Course action:", action, data)
              }}
            />
          )}

          {/* Achievements */}
          {activeTab === "achievements" && (
            <div className="space-y-4">
              <AppCard>
                <div className="p-6">
                  <h3 className="text-base font-semibold mb-4">发表研究</h3>
                  <div className="space-y-3">
                    {instructor.publications.map((publication, index) => (
                      <AppCard key={index}>
                        <div className="p-4">
                          <p className="text-sm font-medium leading-relaxed">{publication}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">点击查看全文</span>
                            <div className="w-4 h-4 text-muted-foreground">→</div>
                          </div>
                        </div>
                      </AppCard>
                    ))}
                  </div>
                </div>
              </AppCard>

              <AppCard>
                <div className="p-6">
                  <h3 className="text-base font-semibold mb-4">研究领域</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p>深度学习算法优化与应用</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <p>自然语言处理技术研究</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p>计算机视觉与图像识别</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>多模态AI系统设计</p>
                    </div>
                  </div>
                </div>
              </AppCard>
            </div>
          )}

          {/* Contact Button */}
          <div className="pt-4">
            <PillButton variant="primary" className="w-full py-4 text-lg font-semibold">
              联系导师
            </PillButton>
          </div>
        </div>
      </div>
      <EducationBottomNavigation />
    </>
  )
}
