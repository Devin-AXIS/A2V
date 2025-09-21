"use client"

import { AICardContainer } from "@/components/card/ai-card-container"
import { BusinessCardWrapper } from "@/components/card/business-cards/business-card-wrapper"
import { AppHeader } from "@/components/navigation/app-header"
import { Bot, Sparkles } from "lucide-react"

interface AICardsPageProps {
  params: { locale: string }
}

export default async function AICardsPage({ params }: AICardsPageProps) {
  const { locale } = await params
  const isEnglish = locale === "en"
  
  const aiCardSteps = [
    {
      id: "welcome",
      type: "text" as const,
      content: isEnglish 
        ? "Welcome to the AI Smart Cards world! Here we showcase various AI-driven intelligent card components."
        : "欢迎来到AI智能卡片世界！这里展示了各种AI驱动的智能卡片组件。",
      delay: 1000,
    },
    {
      id: "intro",
      type: "text" as const,
      content: isEnglish
        ? "Let's start with the AI Learning Plan card to experience intelligent learning path planning. Now supports dynamic step management and progressive unlocking display!"
        : "让我们从AI学习规划卡片开始，体验智能化的学习路径规划。现在支持动态步骤管理和逐步解锁显示！",
      delay: 1500,
    },
    {
      id: "ai-learning-plan",
      type: "card" as const,
      cardName: "ai-learning-plan",
      cardProps: {
        data: {
          id: "ai-learning-plan-1",
          title: isEnglish ? "Personalized Learning Plan" : "个性定制学习计划",
          duration: "4-8周",
          weeklyHours: "4.8周",
          goal: isEnglish ? "Master Intermediate Knowledge" : "掌握中级知识",
          overallProgress: 35,
          currentStep: 1, // Set to 1 to show progressive unlocking
          steps: [
            {
              id: "step-1",
              stepNumber: 1,
              title: isEnglish ? "Basic Knowledge Foundation" : "基础知识建立",
              description: isEnglish
                ? "The first step is crucial! We start with basic AI concepts to help you build a solid theoretical foundation. This stage covers basic AI concepts, development history, and core technologies, laying a solid foundation for further in-depth learning."
                : "第一步很关键！我们先从AI基础概念开始，让你建立扎实的理论基础。这个阶段会涵盖AI的基本概念、发展历程和核心技术，为后续深入学习打下坚实基础。",
              status: "in-progress" as const, // Changed to in-progress to show active state
              estimatedDuration: "3-4周",
              courses: [
                { id: "1-1", name: isEnglish ? "Introduction to AI Basic Concepts" : "AI基础概念介绍", duration: "40分钟", completed: false },
                { id: "1-2", name: isEnglish ? "AI Development History Review" : "AI发展历程回顾", duration: "45分钟", completed: false },
                { id: "1-3", name: isEnglish ? "Machine Learning Introduction" : "机器学习入门", duration: "60分钟", completed: false },
                { id: "1-4", name: isEnglish ? "Deep Learning Basics" : "深度学习基础", duration: "55分钟", completed: false },
              ],
            },
            {
              id: "step-2",
              stepNumber: 2,
              title: isEnglish ? "Advanced Skill Enhancement" : "进阶技能提升",
              description: isEnglish
                ? "After mastering the basics, we will dive deeper into more advanced AI technologies and application scenarios. This stage involves actual project development and skill application."
                : "在掌握基础知识后，我们将深入学习更高级的AI技术和应用场景。这个阶段会涉及实际项目开发和技能应用。",
              status: "pending" as const, // This will be unlocked after step 1
              estimatedDuration: "2-3周",
              courses: [
                { id: "2-1", name: isEnglish ? "Neural Networks Deep Dive" : "神经网络深入", duration: "65分钟", completed: false },
                { id: "2-2", name: isEnglish ? "Computer Vision Applications" : "计算机视觉应用", duration: "70分钟", completed: false },
                { id: "2-3", name: isEnglish ? "Natural Language Processing" : "自然语言处理", duration: "60分钟", completed: false },
                { id: "2-4", name: isEnglish ? "Project Combat Training" : "项目实战演练", duration: "90分钟", completed: false },
              ],
            },
            {
              id: "step-3",
              stepNumber: 3,
              title: isEnglish ? "Professional Certification & Employment" : "专业认证与就业",
              description: isEnglish
                ? "The final stage will help you obtain professional certification and prepare fully for employment. Including interview skills, project portfolio creation, etc."
                : "最后阶段将帮助你获得专业认证，并为就业做好充分准备。包括面试技巧、项目作品集制作等。",
              status: "pending" as const, // This will be unlocked after step 2
              estimatedDuration: "1-2周",
              courses: [
                { id: "3-1", name: isEnglish ? "Certification Exam Preparation" : "认证考试准备", duration: "45分钟", completed: false },
                { id: "3-2", name: isEnglish ? "Portfolio Creation" : "作品集制作", duration: "120分钟", completed: false },
                { id: "3-3", name: isEnglish ? "Interview Skills Training" : "面试技巧培训", duration: "60分钟", completed: false },
              ],
            },
          ],
          progress: {
            skillImprovement: 85,
            practiceSuccess: 92,
            certifications: 3,
            students: "2.8K",
          },
          progressDetails: [
            { name: isEnglish ? "Machine Learning Basics" : "机器学习基础", percentage: 90 },
            { name: isEnglish ? "Deep Learning Applications" : "深度学习应用", percentage: 85 },
            { name: isEnglish ? "Project Combat Capability" : "项目实战能力", percentage: 80 },
            { name: isEnglish ? "Industry Application Understanding" : "行业应用理解", percentage: 75 },
          ],
        },
        useStreamingMode: true, // Enable streaming mode
        onAction: (action: string, data: any) => {
          console.log("AI Learning Plan Action:", action, data)
        },
      },
      delay: 2000,
    },
    {
      id: "explanation",
      type: "text" as const,
      content: isEnglish
        ? "AI Learning Plan card now supports progressive unlocking display, the second step will be automatically displayed after completing the first step, making the learning process more rhythmic."
        : "AI学习规划卡片现在支持逐步解锁显示，完成第一步后会自动显示第二步，让学习过程更有节奏感。",
      delay: 1500,
    },
    {
      id: "more-info",
      type: "text" as const,
      content: isEnglish
        ? "Next, we will showcase more AI card types, each with unique intelligent features and quotable functionality."
        : "接下来，我们将展示更多AI卡片类型，每种都有独特的智能化特性和可引用功能。",
      delay: 1000,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <AppHeader title={isEnglish ? "AI Smart Cards" : "AI智能卡片"} showBackButton={true} />

      <div className="pt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-8 w-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {isEnglish ? "Experience AI-Driven Smart Cards" : "体验AI驱动的智能卡片"}
            </h2>
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {isEnglish
              ? "Explore various AI smart cards, experience streaming display, typing effects, and intelligent interaction features. Now supports progressive unlocking of learning steps!"
              : "探索各种AI智能卡片，体验流式显示、打字效果和智能交互功能。现在支持逐步解锁学习步骤！"}
          </p>
        </div>

        {/* AI Card Container */}
        <div className="max-w-4xl mx-auto">
          <AICardContainer
            title={isEnglish ? "AI Smart Mentor" : "AI智能导师"}
            avatar="/ai-robot-avatar.png"
            steps={aiCardSteps}
            autoStart={true}
            useStreamingMode={true}
            className="space-y-6"
          />
        </div>

        {/* Additional Demo Cards */}
        <div className="mt-12 max-w-4xl mx-auto space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 text-center mb-6">
            {isEnglish ? "Other AI Card Components" : "其他AI卡片组件"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BusinessCardWrapper
              cardName="learning-plan-summary"
              data={{
                title: isEnglish ? "Personalized Learning Plan" : "个性定制学习计划",
                duration: "4-8周",
                weeklyHours: "4.8周",
                goal: isEnglish ? "Master Intermediate Knowledge" : "掌握中级知识",
                overallProgress: 35,
                currentStep: 2,
                totalSteps: 3,
              }}
            />

            <BusinessCardWrapper
              cardName="course-module"
              data={{
                title: isEnglish ? "Basic Course" : "基础课程",
                moduleCount: 4,
                courses: [
                  { id: "1", name: isEnglish ? "Introduction to AI Basic Concepts" : "AI基础概念介绍", duration: "40分钟", index: 1, completed: true },
                  { id: "2", name: isEnglish ? "AI Development History Review" : "AI发展历程回顾", duration: "45分钟", index: 2, completed: true },
                  { id: "3", name: isEnglish ? "Machine Learning Introduction" : "机器学习入门", duration: "60分钟", index: 3, completed: false },
                  { id: "4", name: isEnglish ? "Deep Learning Basics" : "深度学习基础", duration: "55分钟", index: 4, completed: false },
                ],
                stepId: "step-1",
                stepStatus: "in-progress",
              }}
            />
          </div>

          <BusinessCardWrapper
            cardName="learning-outcome"
            data={{
              skillImprovement: 85,
              practiceSuccess: 92,
              certifications: 3,
              students: "2.8K",
              progressDetails: [
                { name: isEnglish ? "Machine Learning Basics" : "机器学习基础", percentage: 90, icon: "trending" },
                { name: isEnglish ? "Deep Learning Applications" : "深度学习应用", percentage: 85, icon: "award" },
                { name: isEnglish ? "Project Combat Capability" : "项目实战能力", percentage: 80, icon: "users" },
                { name: isEnglish ? "Industry Application Understanding" : "行业应用理解", percentage: 75, icon: "target" },
              ],
            }}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {isEnglish ? "AI Card Features" : "AI卡片特性"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {isEnglish ? "Intelligent Interaction" : "智能交互"}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isEnglish ? "AI-driven dynamic content generation" : "AI驱动的动态内容生成"}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {isEnglish ? "Progressive Unlocking" : "逐步解锁"}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isEnglish ? "Complete one step to automatically display the next step" : "完成一步自动显示下一步"}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-6 h-6 bg-green-600 rounded-sm" />
                </div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {isEnglish ? "Modular Design" : "模块化设计"}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isEnglish ? "Composable card component system" : "可组合的卡片组件系统"}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ∞
                  </div>
                </div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {isEnglish ? "Dynamic Steps" : "动态步骤"}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isEnglish ? "Supports infinite extension of learning steps" : "支持无限扩展的学习步骤"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
