"use client"

import { BusinessCardWrapper } from "./business-cards/business-card-wrapper"
import { CardRegistry } from "./registry"
import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, ShoppingCart, Star, TrendingUp, Users, Settings } from "lucide-react"
import { EnhancedDraggableCardContainer } from "./enhanced-draggable-card-container"
import { useState } from "react"

export function CardShowcase() {
  const productData = {
    id: "1",
    name: "iPhone 15 Pro",
    price: "¥7,999",
    image: "/iphone-15-pro.png",
    rating: 4.8,
    inStock: true,
  }

  const articleData = {
    id: "1",
    title: "人工智能技术的最新发展趋势",
    summary:
      "探讨AI技术在各个领域的应用前景，以及对未来社会发展的深远影响。本文将从技术创新、商业应用、社会影响等多个维度进行深入分析。",
    author: "张三",
    publishTime: "2024-01-15",
    category: "科技",
    image: "/ai-technology.png",
    readTime: "5分钟",
    comments: 23,
  }

  const learningPlanData = {
    planDuration: "4-8周",
    weeklyStudy: "4.8周",
    targetGoal: "掌握中级知识",
    assessmentTime: "1分钟评估定制",
  }

  const courseModuleData = {
    title: "基础课程",
    totalModules: 4,
    courses: [
      { id: 1, name: "AI基础概念介绍", duration: "40分钟", status: "available" },
      { id: 2, name: "AI发展历程回顾", duration: "45分钟", status: "available" },
      { id: 3, name: "机器学习入门", duration: "60分钟", status: "available" },
      { id: 4, name: "深度学习基础", duration: "55分钟", status: "available" },
    ],
  }

  const learningOutcomeData = {
    stats: {
      skillMastery: 85,
      employmentSuccess: 92,
      certifications: "3+",
      successfulStudents: "2.8K",
    },
    skillProgress: [
      { skill: "机器学习基础", progress: 90 },
      { skill: "深度学习应用", progress: 85 },
      { skill: "项目实战能力", progress: 80 },
      { skill: "行业应用理解", progress: 75 },
    ],
  }

  const [basicCardOrder, setBasicCardOrder] = useState(["user-info", "sales-data", "quick-actions"])
  const [themeCardOrder, setThemeCardOrder] = useState(["theme-card-1", "theme-card-3", "theme-card-2"])
  const [educationCardOrder, setEducationCardOrder] = useState([
    "learning-plan-summary",
    "course-module",
    "learning-outcome",
  ])
  const [registeredCardOrder, setRegisteredCardOrder] = useState(CardRegistry.getAll().map((card) => card.name))

  const handleAction = (action: string, data: any) => {
    console.log("Card action:", action, data)
    // 这里可以处理全局的卡片动作
  }

  const basicCards = [
    {
      id: "user-info",
      content: (
        <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-bold">用户信息</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">查看和编辑用户基本信息</p>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src="/diverse-user-avatars.png"
                  alt="用户头像"
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div className="flex-1">
                <p className="font-medium">张三</p>
                <p className="text-sm text-muted-foreground">zhang.san@example.com</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  活跃用户
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full hover:bg-primary hover:text-primary-foreground transition-colors mt-4 bg-transparent"
            >
              <Settings className="w-4 h-4 mr-2" />
              编辑资料
            </Button>
          </div>
        </AppCard>
      ),
    },
    {
      id: "sales-data",
      content: (
        <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-bold">今日销售</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">实时销售数据统计</p>

            <div className="space-y-3">
              <div className="text-3xl font-bold">¥12,345</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+15.2%</span>
                  <span className="text-muted-foreground">较昨日</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600/30">
                  增长中
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
          </div>
        </AppCard>
      ),
    },
    {
      id: "quick-actions",
      content: (
        <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-bold">快速操作</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">常用功能快捷入口</p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col space-y-1 hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs">订单</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col space-y-1 hover:bg-red-500 hover:text-white transition-colors bg-transparent"
              >
                <Heart className="w-4 h-4" />
                <span className="text-xs">收藏</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col space-y-1 hover:bg-blue-500 hover:text-white transition-colors bg-transparent"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-xs">分享</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col space-y-1 hover:bg-yellow-500 hover:text-white transition-colors bg-transparent"
              >
                <Star className="w-4 h-4" />
                <span className="text-xs">评价</span>
              </Button>
            </div>
          </div>
        </AppCard>
      ),
    },
  ]

  const themeCards = [
    {
      id: "theme-card-1",
      content: (
        <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold mb-2">产品特色</h4>
              <p className="text-sm text-muted-foreground">
                这是一个支持主题定制的卡片，你可以点击右上角的编辑按钮来调整颜色和样式。
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="secondary">主题</Badge>
              <Badge variant="outline">可编辑</Badge>
            </div>
          </div>
        </AppCard>
      ),
    },
    {
      id: "theme-card-2",
      content: (
        <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="space-y-4">
            <h4 className="text-lg font-bold mb-2">数据展示</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">完成率</span>
                <span className="font-bold text-lg">85%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>
        </AppCard>
      ),
    },
    {
      id: "theme-card-3",
      content: (
        <AppCard className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="space-y-4">
            <h4 className="text-lg font-bold mb-2">通知中心</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm flex-1">新消息</span>
                <Badge variant="destructive" className="text-xs">
                  3
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm flex-1">待处理</span>
                <Badge variant="secondary" className="text-xs">
                  1
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm flex-1">已完成</span>
                <Badge variant="outline" className="text-xs">
                  12
                </Badge>
              </div>
            </div>
          </div>
        </AppCard>
      ),
    },
  ]

  const educationCards = [
    {
      id: "learning-plan-summary",
      content: <BusinessCardWrapper cardName="learning-plan-summary" data={learningPlanData} onAction={handleAction} />,
    },
    {
      id: "course-module",
      content: <BusinessCardWrapper cardName="course-module" data={courseModuleData} onAction={handleAction} />,
    },
    {
      id: "learning-outcome",
      content: <BusinessCardWrapper cardName="learning-outcome" data={learningOutcomeData} onAction={handleAction} />,
    },
  ]

  const registeredCards = CardRegistry.getAll().map((card) => ({
    id: card.name,
    content: (
      <AppCard className="p-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" data-slot="card-content">
        <div className="space-y-2">
          <h4 className="font-bold text-foreground">{card.name}</h4>
          <p className="text-sm text-muted-foreground">分类: {card.category}</p>
          {card.developer && (
            <p className="text-xs text-muted-foreground">
              开发者: {card.developer.name} v{card.developer.version}
            </p>
          )}
          {card.businessFlow && (
            <div className="flex flex-wrap gap-1 mt-2">
              {card.businessFlow.hasDetailPage && (
                <Badge variant="outline" className="text-xs">
                  详情页
                </Badge>
              )}
              {card.businessFlow.hasModal && (
                <Badge variant="outline" className="text-xs">
                  弹窗
                </Badge>
              )}
              {card.businessFlow.actions?.map((action) => (
                <Badge key={action} variant="secondary" className="text-xs">
                  {action}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </AppCard>
    ),
  }))

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4 text-foreground">基础卡片示例 (可拖拽排序)</h3>
        <EnhancedDraggableCardContainer
          items={basicCards}
          onReorder={(newOrder) => {
            setBasicCardOrder(newOrder)
            console.log("基础卡片新排序:", newOrder)
          }}
          layout="grid"
          gridCols={3}
        />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 text-foreground">主题卡片示例 (支持主题编辑 + 可拖拽排序)</h3>
        <EnhancedDraggableCardContainer
          items={themeCards}
          onReorder={(newOrder) => {
            setThemeCardOrder(newOrder)
            console.log("主题卡片新排序:", newOrder)
          }}
          layout="grid"
          gridCols={3}
        />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 text-foreground">电商产品卡片</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BusinessCardWrapper cardName="ecommerce-product" data={productData} onAction={handleAction} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 text-foreground">新闻文章卡片</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BusinessCardWrapper cardName="news-article" data={articleData} onAction={handleAction} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 text-foreground">教育卡片 (支持主题编辑 + 可拖拽排序)</h3>
        <EnhancedDraggableCardContainer
          items={educationCards}
          onReorder={(newOrder) => {
            setEducationCardOrder(newOrder)
            console.log("教育卡片新排序:", newOrder)
          }}
          layout="grid"
          gridCols={3}
        />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 text-foreground">已注册的卡片 (支持主题编辑 + 可拖拽排序)</h3>
        <EnhancedDraggableCardContainer
          items={registeredCards}
          onReorder={(newOrder) => {
            setRegisteredCardOrder(newOrder)
            console.log("已注册卡片新排序:", newOrder)
          }}
          layout="grid"
          gridCols={2}
        />
      </div>
    </div>
  )
}
