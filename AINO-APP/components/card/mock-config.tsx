"use client"

import type React from "react"
import { Home, Search, User, Settings, Save, Undo, Redo, Copy, Paste, Cut, Filter, Download, Upload } from "lucide-react"

// 集中管理：为各业务卡片提供默认入参（mock）
// 仅提供业务所需数据，不包含类名、主题等视图类属性

export type CardMockContext = {
    locale?: string
}

export type CardMockProvider = (ctx?: CardMockContext) => Record<string, any>

const createId = () => Math.random().toString(36).slice(2, 10)

export const CardMockConfig: Record<string, CardMockProvider> = {
    // 教育类
<<<<<<< HEAD
=======
    "learning-plan-summary": () => ({
        planDuration: "4-8周",
        weeklyStudy: "4.8周",
        targetGoal: "掌握中级知识",
    }),

    "course-module": () => ({
        title: "基础课程",
        moduleCount: 4,
        courses: [
            { id: 1, title: "AI基础概念介绍", duration: "40分钟" },
            { id: 2, title: "AI发展历程回顾", duration: "45分钟" },
            { id: 3, title: "机器学习入门", duration: "60分钟" },
            { id: 4, title: "深度学习基础", duration: "55分钟" },
        ],
    }),

    "learning-outcome": () => ({
        stats: [
            { value: "85%", label: "技能掌握" },
            { value: "92%", label: "就业成功" },
            { value: "3+", label: "专业认证" },
            { value: "2.8K", label: "成功学员" },
        ],
        skillProgress: [
            { skill: "机器学习基础", percentage: 90 },
            { skill: "深度学习应用", percentage: 85 },
            { skill: "项目实战能力", percentage: 80 },
            { skill: "行业应用理解", percentage: 75 },
        ],
    }),
>>>>>>> 17191d65f9bd796a277d77a3f93a21d3245a77eb

    // 电商/内容类
    "ecommerce-product": () => ({
        data: {
            id: createId(),
            name: "iPhone 15 Pro",
            price: "¥7,999",
            image: "/iphone-15-pro.png",
            rating: 4.8,
            inStock: true,
        },
    }),

    "news-article": () => ({
        data: {
            id: createId(),
            title: "人工智能技术的最新发展趋势",
            summary:
                "探讨AI技术在各个领域的应用前景，以及对未来社会发展的深远影响。本文将从技术创新、商业应用、社会影响等多个维度进行深入分析。",
            author: "张三",
            publishTime: "2024-01-15",
            category: "科技",
            image: "/ai-technology.png",
            readTime: "5分钟",
            comments: 23,
        },
    }),

    // 教育业务扩展
    "future-skills-course-card": () => ({
        data: {
            id: createId(),
            name: "AI 应用工程课程（中级）",
            duration: "6周",
            students: 2680,
            rating: 4.7,
            progress: 30,
            difficulty: "中级",
            tags: ["AI", "应用工程", "实践项目"],
            // 兼容新旧结构：此处采用新结构
            certificate_name: "AI 应用工程证书",
            certificate_issuer: "AINO Academy",
            relatedJobs: ["AI应用工程师", "机器学习工程师"],
            instructor: "李四",
            price: "¥699",
            originalPrice: "¥999",
        },
    }),

    "instructor-courses-list": () => ({
        courses: [
            { id: createId(), name: "机器学习概论", duration: "6小时", students: 1200, certificate: "课程证书", tags: ["ML", "数学基础"] },
            { id: createId(), name: "PyTorch 实战", duration: "8小时", students: 860, certificate: "课程证书", tags: ["深度学习", "PyTorch"] },
        ],
    }),

    "related-jobs-list": () => ({
        title: "相关岗位",
        jobs: [
            { id: 1, title: "AI提示词工程师", avgSalary: "15,000-25,000", location: "北京·海淀区", education: "本科", experience: "1-3年", jobType: "全职" },
            { id: 2, title: "AI产品经理", avgSalary: "20,000-35,000", location: "上海·浦东新区", education: "本科", experience: "3-5年", jobType: "全职" },
        ],
    }),

    // 招聘分析类（多为无入参或可选）
    "job-experience-ratio": () => ({}),
    "job-prospect-trend": () => ({}),
    "monthly-job-growth": () => ({}),
    "job-posting": () => ({}),

    // 数据可视化
    "simple-pie": () => ({
        data: [
            { name: "A", value: 400 },
            { name: "B", value: 300 },
            { name: "C", value: 300 },
            { name: "D", value: 200 },
        ],
    }),
    "simple-pie-2": () => ({
        data: [
            { name: "A", value: 120 },
            { name: "B", value: 220 },
            { name: "C", value: 180 },
            { name: "D", value: 140 },
        ],
    }),

    // 设备类型卡片
    "mobile-navigation": () => ({
        data: {
            title: "移动端导航",
            items: [
                { id: "home", label: "首页", icon: <Home className="w-4 h-4" />, href: "/", isActive: true },
                { id: "search", label: "搜索", icon: <Search className="w-4 h-4" />, href: "/search" },
                { id: "profile", label: "我的", icon: <User className="w-4 h-4" />, href: "/me" },
                { id: "settings", label: "设置", icon: <Settings className="w-4 h-4" />, href: "/settings" },
            ],
            showQuickActions: true,
        },
    }),

    "pc-toolbar": () => ({
        data: {
            title: "工具栏",
            showShortcuts: true,
            isCollapsed: false,
            items: [
                { id: "save", label: "保存", icon: <Save className="w-4 h-4" />, shortcut: "Ctrl+S", group: "file" },
                { id: "undo", label: "撤销", icon: <Undo className="w-4 h-4" />, shortcut: "Ctrl+Z", group: "edit" },
                { id: "redo", label: "重做", icon: <Redo className="w-4 h-4" />, shortcut: "Ctrl+Y", group: "edit" },
                { id: "copy", label: "复制", icon: <Copy className="w-4 h-4" />, shortcut: "Ctrl+C", group: "edit" },
                { id: "paste", label: "粘贴", icon: <Paste className="w-4 h-4" />, shortcut: "Ctrl+V", group: "edit" },
                { id: "cut", label: "剪切", icon: <Cut className="w-4 h-4" />, shortcut: "Ctrl+X", group: "edit" },
                { id: "search", label: "查找", icon: <Search className="w-4 h-4" />, shortcut: "Ctrl+F", group: "tools" },
                { id: "filter", label: "过滤", icon: <Filter className="w-4 h-4" />, group: "tools" },
                { id: "download", label: "下载", icon: <Download className="w-4 h-4" />, group: "file" },
                { id: "upload", label: "上传", icon: <Upload className="w-4 h-4" />, group: "file" },
            ],
        },
    }),

    "universal-info": () => ({
        data: {
            title: "关键指标",
            description: "一览关键信息与趋势",
            items: [
                { label: "活跃用户", value: 12800, type: "number", trend: "up" },
                { label: "转化率", value: 12.6, type: "percentage", trend: "up" },
                { label: "收入", value: 326000, type: "currency", trend: "down" },
                { label: "反馈数", value: 76, type: "number", trend: "stable" },
            ],
            showActions: true,
            source: "AINO Analytics",
        },
    }),
    // ===== 新增：招聘总览、职位详情、职位卡片、AI步骤容器 =====
    "job-overview-card": () => ({
        leftTitle: "新职业趋势",
        leftTrendList: ["1. 人工智能训练师", "2. 提示词工程师", "3. 人工智能应用师"],
        rightTopTitle: "岗位类型占比",
        rightMiddleTitle: "岗位类型占比",
        rightBottomTitle: "平均工资",
        avgSalary: "¥15,200",
        salaryGrowth: "+6%",
    }),
    "job-detail-card": () => ({
        jobData: {
            title: "高级前端工程师",
            company: "科技创新公司",
            location: "北京·朝阳区",
            salary: "20K-35K",
            salaryRange: "20K-35K",
            experience: "3-5年",
            education: "本科",
            jobType: "全职",
            publishTime: "2天前",
            description: "负责Web应用开发与性能优化，协作设计系统架构，推动工程实践落地。",
            skills: ["React", "TypeScript", "Node.js"],
        },
    }),
    "job-position-card": (ctx) => ({
        id: "fe-job-01",
        title: "AI 应用工程师",
        salary: "¥18,000-28,000",
        location: "上海·浦东新区",
        demandGrowth: "+12%",
        salaryGrowth: "+6%",
        locale: ctx?.locale || "zh",
    }),
<<<<<<< HEAD
=======
    // AI 卡片容器默认演示步骤
    "ai-card-container": () => ({
        title: "学习路径助手",
        avatar: "",
        steps: [
            { id: "t0", type: "text", content: "你好，我是你的AI学习助手。" },
            { id: "c1", type: "card", cardName: "learning-plan-summary", cardProps: {} },
            { id: "t1", type: "text", content: "我们为你推荐了以下课程模块：" },
            { id: "c2", type: "card", cardName: "course-module", cardProps: {} },
        ],
        autoStart: true,
        useStreamingMode: false,
    }),
>>>>>>> 17191d65f9bd796a277d77a3f93a21d3245a77eb
}

export function getMockProps(cardName: string, ctx?: CardMockContext): Record<string, any> {
    const provider = CardMockConfig[cardName]
    if (!provider) return {}
    try {
        return provider(ctx)
    } catch {
        return {}
    }
}


