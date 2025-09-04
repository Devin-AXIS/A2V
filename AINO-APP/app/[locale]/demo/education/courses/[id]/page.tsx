"use client"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Clock, DollarSign } from "lucide-react"
import Image from "next/image"
import { AppCard } from "@/components/layout/app-card"
import { AppHeader } from "@/components/navigation/app-header"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { Tabs } from "@/components/navigation/tabs"
import { PillButton } from "@/components/basic/pill-button"
import { Tag } from "@/components/basic/tag"
import { EducationBottomNavigation } from "@/components/navigation/education-bottom-navigation"
import RelatedJobsListCard from "@/components/card/business-cards/related-jobs-list-card"
import { CourseOutlineCard } from "@/components/card/business-cards/course-outline-card"

const courseData = {
  id: 1,
  title: "AI提示词工程师专业课程",
  coverImage: "/ai-course-cover.png",
  duration: "50课时",
  price: "23444",
  description:
    "本课程专为想要掌握AI提示词工程技能的学员设计，通过系统性学习，您将掌握如何与AI模型进行有效沟通，创建高质量的提示词，并将这些技能应用到实际工作中。",
  tutors: [
    {
      id: 1,
      name: "张教授",
      title: "AI技术专家",
      avatar: "/professor-avatar.png",
    },
    {
      id: 2,
      name: "李博士",
      title: "机器学习专家",
      avatar: "/doctor-avatar.png",
    },
  ],
}

const jobsData = [
  {
    id: 1,
    title: "AI提示词工程师",
    avgSalary: "15,000-25,000",
    location: "北京·海淀区",
    education: "本科",
    experience: "1-3年",
    jobType: "全职",
  },
  {
    id: 2,
    title: "AI产品经理",
    avgSalary: "20,000-35,000",
    location: "上海·浦东新区",
    education: "本科",
    experience: "3-5年",
    jobType: "全职",
  },
  {
    id: 3,
    title: "机器学习工程师",
    avgSalary: "18,000-30,000",
    location: "深圳·南山区",
    education: "硕士",
    experience: "2-4年",
    jobType: "全职",
  },
  {
    id: 4,
    title: "AI应用开发工程师",
    avgSalary: "16,000-28,000",
    location: "杭州·西湖区",
    education: "本科",
    experience: "1-3年",
    jobType: "全职",
  },
]

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    application: true,
    practice: true,
  })

  const [activeTab, setActiveTab] = useState("introduction")

  const router = useRouter()
  const { locale } = useParams()

  const toggleSection = (section: "basic" | "application" | "practice") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleJobClick = (jobId: number) => {
    router.push(`/${locale}/demo/education/jobs/related-post/${jobId}`)
  }

  const handleInstructorClick = (instructorId: number) => {
    router.push(`/${locale}/demo/education/instructors/${instructorId}`)
  }

  const course = courseData

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>课程未找到</p>
      </div>
    )
  }

  const tabItems = [
    { id: "introduction", label: "课程介绍" },
    { id: "outline", label: "课程大纲" },
    { id: "tutors", label: "教学导师" },
    { id: "positions", label: "相关岗位" },
  ]

  const onAction = () => {
    // Handle action here, e.g., registration
  }

  return (
    <>
      <DynamicBackground />
      <div className="min-h-screen pb-24">
        <AppHeader title="课程详情" showBackButton={true} />

        <div className="p-4 sm:p-6 space-y-6 pt-20">
          {/* Course Header */}
          <AppCard>
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{course.title}</h2>

              <div className="flex gap-4">
                {/* Course Cover */}
                <div className="w-1/3 flex-shrink-0">
                  <div className="relative w-full aspect-[3/4] bg-muted rounded-2xl overflow-hidden">
                    <Image
                      src={course.coverImage || "/placeholder.svg"}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Course Info */}
                <div className="w-2/3 space-y-3">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <p>{course.description}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">课时</span>
                      <span className="font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">费用</span>
                      <span className="font-bold text-xl text-primary">{course.price}元</span>
                    </div>
                  </div>
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

          {/* Course Introduction */}
          {activeTab === "introduction" && (
            <AppCard>
              <div className="p-6">
                <div className="space-y-4 text-sm leading-relaxed">
                  <h3 className="text-lg font-semibold mb-4">课程简介</h3>

                  <p>
                    本课程是专为想要掌握AI提示词工程技能的学员设计的综合性培训课程。通过系统性的学习，
                    您将掌握如何与AI模型进行有效沟通，创建高质量的提示词，并将这些技能应用到实际工作中。
                  </p>

                  <p>
                    课程涵盖了从基础理论到高级应用的全方位内容，包括提示词设计原理、优化技巧、
                    实战案例分析等。无论您是初学者还是有一定基础的从业者，都能在这里找到适合的学习内容。
                  </p>

                  <h4 className="text-base font-semibold mt-6 mb-3">学习目标</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>掌握AI提示词工程的核心概念和基本原理</li>
                    <li>学会设计和优化各种类型的提示词</li>
                    <li>了解不同AI模型的特点和适用场景</li>
                    <li>具备独立完成提示词项目的能力</li>
                    <li>掌握提示词在各行业中的应用技巧</li>
                  </ul>

                  <h4 className="text-base font-semibold mt-6 mb-3">适合人群</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>对AI技术感兴趣的初学者</li>
                    <li>希望转型AI领域的职场人士</li>
                    <li>需要提升AI应用能力的在职人员</li>
                    <li>创业者和产品经理</li>
                    <li>内容创作者和营销人员</li>
                  </ul>

                  <h4 className="text-base font-semibold mt-6 mb-3">课程特色</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <h5 className="font-medium text-primary mb-1">实战导向</h5>
                      <p className="text-xs text-muted-foreground">真实项目案例，边学边练</p>
                    </div>
                    <div className="bg-secondary/10 p-3 rounded-lg">
                      <h5 className="font-medium text-secondary mb-1">专家指导</h5>
                      <p className="text-xs text-muted-foreground">行业资深导师一对一指导</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <h5 className="font-medium text-primary mb-1">就业保障</h5>
                      <p className="text-xs text-muted-foreground">完善的就业指导服务</p>
                    </div>
                    <div className="bg-secondary/10 p-3 rounded-lg">
                      <h5 className="font-medium text-secondary mb-1">持续更新</h5>
                      <p className="text-xs text-muted-foreground">课程内容紧跟技术发展</p>
                    </div>
                  </div>
                </div>
              </div>
            </AppCard>
          )}

          {/* Course Outline */}
          {activeTab === "outline" && (
            <CourseOutlineCard
              data={{
                sections: [
                  {
                    id: "basic",
                    title: "基础课程",
                    type: "线上",
                    duration: "20课时",
                    subsections: [
                      {
                        id: "ai-theory",
                        title: "AI基础理论",
                        lessons: [
                          { id: "1", title: "1. AI基础概念介绍", duration: "40分钟" },
                          { id: "2", title: "2. AI发展历程回顾", duration: "45分钟" },
                        ],
                      },
                      {
                        id: "ml-basics",
                        title: "机器学习基础",
                        lessons: [
                          { id: "3", title: "3. 机器学习基础理论", duration: "50分钟" },
                          { id: "4", title: "4. 机器学习算法分类", duration: "45分钟" },
                          { id: "5", title: "5. 机器学习实践案例", duration: "60分钟" },
                        ],
                      },
                      {
                        id: "deep-learning",
                        title: "深度学习与神经网络",
                        lessons: [
                          { id: "6", title: "6. 深度学习基础概念", duration: "40分钟" },
                          { id: "7", title: "7. 神经网络结构", duration: "55分钟" },
                          { id: "8", title: "8. 深度学习框架介绍", duration: "45分钟" },
                          { id: "9", title: "9. 深度学习应用实例", duration: "50分钟" },
                        ],
                      },
                    ],
                  },
                  {
                    id: "application",
                    title: "应用课程",
                    type: "线下",
                    duration: "15课时",
                    subsections: [
                      {
                        id: "prompt-design",
                        title: "提示词设计与优化",
                        lessons: [
                          { id: "10", title: "10. 提示词设计基本原理", duration: "50分钟" },
                          { id: "11", title: "11. 提示词优化技巧", duration: "45分钟" },
                          { id: "12", title: "12. 多模态提示词应用", duration: "60分钟" },
                        ],
                      },
                      {
                        id: "ai-tools",
                        title: "AI工具应用",
                        lessons: [
                          { id: "13", title: "13. ChatGPT高级应用", duration: "55分钟" },
                          { id: "14", title: "14. Claude与其他AI工具", duration: "50分钟" },
                        ],
                      },
                    ],
                  },
                  {
                    id: "practice",
                    title: "实操实训",
                    type: "线下",
                    duration: "15课时",
                    subsections: [
                      {
                        id: "enterprise-project",
                        title: "企业项目实战",
                        lessons: [
                          { id: "15", title: "15. 企业项目需求分析", duration: "60分钟" },
                          { id: "16", title: "16. 项目方案设计与实施", duration: "90分钟" },
                          { id: "17", title: "17. 项目成果展示与评估", duration: "75分钟" },
                        ],
                      },
                      {
                        id: "industry-cases",
                        title: "行业应用案例",
                        lessons: [
                          { id: "18", title: "18. 电商营销提示词案例", duration: "65分钟" },
                          { id: "19", title: "19. 内容创作提示词案例", duration: "70分钟" },
                          { id: "20", title: "20. 数据分析提示词案例", duration: "60分钟" },
                        ],
                      },
                    ],
                  },
                ],
                totalDuration: "50课时",
                onlineDuration: "20课时",
                offlineDuration: "30课时",
                estimatedPeriod: "3个月",
              }}
              onAction={onAction}
            />
          )}

          {/* Tutors */}
          {activeTab === "tutors" && (
            <div className="space-y-6">
              {course.tutors.map((tutor, index) => (
                <AppCard
                  key={index}
                  onClick={() => handleInstructorClick(tutor.id)}
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Tutor Avatar */}
                      <div className="flex-shrink-0">
                        <div className="relative w-20 h-24 bg-muted rounded-lg overflow-hidden">
                          <Image
                            src={tutor.avatar || "/placeholder.svg"}
                            alt={tutor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Tutor Info */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-lg font-bold">{tutor.name}</h4>
                          <p className="text-sm text-primary font-medium">{tutor.title}</p>
                        </div>

                        <div className="text-sm leading-relaxed">
                          <p>
                            {index === 0
                              ? "拥有8年AI领域研发经验，曾参与多个大型AI项目的设计与实施。专注于自然语言处理和机器学习算法优化，在提示词工程方面有深入研究。"
                              : "资深AI应用专家，具有丰富的企业级AI项目实战经验。擅长将复杂的AI技术转化为实用的商业解决方案。"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {index === 0 ? (
                            <>
                              <Tag variant="white" size="sm">
                                自然语言处理
                              </Tag>
                              <Tag variant="white" size="sm">
                                机器学习
                              </Tag>
                              <Tag variant="white" size="sm">
                                提示词工程
                              </Tag>
                            </>
                          ) : (
                            <>
                              <Tag variant="white" size="sm">
                                AIGC应用
                              </Tag>
                              <Tag variant="white" size="sm">
                                产品设计
                              </Tag>
                              <Tag variant="white" size="sm">
                                企业咨询
                              </Tag>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </AppCard>
              ))}

              {/* Additional Teaching Team */}
              <AppCard>
                <div className="p-4">
                  <h4 className="text-base font-semibold mb-3">教学团队优势</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>平均8年以上行业经验</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span>来自知名互联网公司</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>实战项目经验丰富</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span>一对一指导服务</span>
                    </div>
                  </div>
                </div>
              </AppCard>
            </div>
          )}

          {/* Related Positions */}
          {activeTab === "positions" && <RelatedJobsListCard jobs={jobsData} />}

          {/* Fixed Bottom Registration Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-gray-200 p-4 z-50">
            <PillButton variant="primary" className="w-full py-3 text-lg font-semibold">
              报名学习
            </PillButton>
          </div>
        </div>
      </div>
      <EducationBottomNavigation />
    </>
  )
}
