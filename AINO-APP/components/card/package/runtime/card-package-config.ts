// 卡片包配置系统
export interface CardPackageConfig {
  packageId: string
  packageName: string
  packageCategory: string
  mainCard: {
    cardId: string
    displayName: string
    component: React.ComponentType<any>
  }
  subCards: Array<{
    cardId: string
    displayName: string
    component: React.ComponentType<any>
    category?: string
    type?: string
  }>
  businessFlow: {
    description: string
    hasDetailPage?: boolean
    hasModal?: boolean
    actions?: string[]
    dataSource?: "static" | "api" | "user-input"
  }

  // 内页配置
  detailPage?: {
    enabled: boolean
    route: string // 如: "/cards/[cardName]/detail/[id]"
    component?: React.ComponentType<any>
  }

  // 弹窗配置
  modal?: {
    enabled: boolean
    component?: React.ComponentType<any>
  }
  developer: {
    name: string
    version: string
    description: string
  }
}

// 招聘卡片包配置
export const RECRUITMENT_PACKAGE: CardPackageConfig = {
  packageId: "recruitment-package",
  packageName: "招聘管理",
  packageCategory: "招聘",
  mainCard: {
    cardId: "job-position",
    displayName: "职位概览",
    component: null, // 将在注册时设置
  },
  subCards: [
    // 职业数据类子卡片
    {
      cardId: "job-salary-overview",
      packageId: "recruitment-package-sub",
      displayName: "薪资概览",
      type: "chart",
      category: "data"
    },
    {
      cardId: "education-salary-requirements",
      packageId: "recruitment-package-sub",
      displayName: "学历收入要求",
      type: "list",
      category: "data"
    },
    {
      cardId: "job-experience-ratio",
      packageId: "recruitment-package-sub",
      displayName: "工作年限占比分析",
      type: "chart",
      category: "data"
    },
    {
      cardId: "job-prospect-trend",
      packageId: "recruitment-package-sub",
      displayName: "就业前景趋势",
      type: "chart",
      category: "data"
    },
    {
      cardId: "monthly-job-growth",
      packageId: "recruitment-package-sub",
      displayName: "月度职位增长",
      type: "chart",
      category: "data"
    },
    {
      cardId: "job-city-ranking",
      packageId: "recruitment-package-sub",
      displayName: "城市排名",
      type: "chart",
      category: "data"
    },
    {
      cardId: "company-ranking",
      packageId: "recruitment-package-sub",
      displayName: "公司排名",
      type: "chart",
      category: "data"
    },

    // 具备能力类子卡片
    {
      cardId: "ability-requirements-radar",
      packageId: "recruitment-package-sub",
      displayName: "能力要求雷达图",
      type: "chart",
      category: "ability"
    },
    {
      cardId: "core-skills-mastery",
      packageId: "recruitment-package-sub",
      displayName: "核心技能掌握",
      type: "chart",
      category: "ability"
    },
    {
      cardId: "basic-ability-requirements",
      packageId: "recruitment-package-sub",
      displayName: "基础能力要求",
      type: "list",
      category: "ability"
    },
    {
      cardId: "education-background",
      packageId: "recruitment-package-sub",
      displayName: "教育背景分布",
      type: "chart",
      category: "ability"
    },

    // 相关岗位类子卡片
    {
      cardId: "related-jobs-list",
      packageId: "recruitment-package-sub",
      displayName: "相关岗位列表",
      type: "list",
      category: "related"
    },

    // 其他功能子卡片
    {
      cardId: "job-detail-intro",
      packageId: "recruitment-package-sub",
      displayName: "职位详情介绍",
      type: "display",
      category: "info"
    },
    {
      cardId: "job-posting",
      packageId: "recruitment-package-sub",
      displayName: "职位发布",
      type: "form",
      category: "action"
    },
    {
      cardId: "job-header",
      packageId: "recruitment-package-sub",
      displayName: "职位头部",
      type: "display"
    },
    {
      cardId: "job-requirements",
      packageId: "recruitment-package-sub",
      displayName: "职位要求",
      type: "display"
    },
    {
      cardId: "job-benefits",
      packageId: "recruitment-package-sub",
      displayName: "职位福利",
      type: "display"
    },
    {
      cardId: "company-info",
      packageId: "recruitment-package-sub",
      displayName: "公司信息",
      type: "display"
    },
    {
      cardId: "apply-resume",
      packageId: "recruitment-package-sub",
      displayName: "投递简历",
      type: "form"
    }
  ],
  businessFlow: {
    description: "完整的招聘管理解决方案，从职位发布到人才分析的全流程支持",
    hasDetailPage: true,
    hasModal: true,
    actions: ["publish", "analyze", "manage"],
    dataSource: "api"
  },

  detailPage: {
    enabled: true,
    route: "/cards/[cardName]/detail/[id]"
  },

  modal: {
    enabled: true
  },
  developer: {
    name: "HR Management System",
    version: "2.0.0",
    description: "集成化招聘管理卡片包，提供完整的人力资源解决方案"
  }
}

// 教育卡片包配置
export const EDUCATION_PACKAGE: CardPackageConfig = {
  packageId: "education-package",
  packageName: "教育管理",
  packageCategory: "教育",
  mainCard: {
    cardId: "instructor-courses-list",
    displayName: "导师课程列表",
    component: null, // 将在注册时设置
    belongs: "edu",
  },
  subCards: [
    // 目前只有一个教育卡片，未来可以扩展
    // {
    //   cardId: "course-detail",
    //   displayName: "课程详情",
    //   type: "display"
    // },
    // {
    //   cardId: "student-progress",
    //   displayName: "学生进度",
    //   type: "chart"
    // }
  ],
  businessFlow: {
    description: "教育管理解决方案，支持课程管理和学习跟踪",
    hasDetailPage: true,
    hasModal: false,
    actions: ["manage", "track"],
    dataSource: "api"
  },

  detailPage: {
    enabled: true,
    route: "/cards/[cardName]/detail/[id]"
  },

  modal: {
    enabled: false
  },
  developer: {
    name: "Education Management System",
    version: "2.0.0",
    description: "集成化教育管理卡片包，提供完整的教育解决方案"
  }
}

// 所有卡片包配置
export const CARD_PACKAGES = {
  recruitment: RECRUITMENT_PACKAGE,
  education: EDUCATION_PACKAGE
}
