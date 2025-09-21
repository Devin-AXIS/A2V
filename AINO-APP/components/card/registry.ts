import type { CardConfig, CardAction } from "@/types"
import axios from 'axios';
import MediaEditorCard from "./business-cards/media-editor-card"
import JobExperienceRatioCard from "./business-cards/job-experience-ratio-card"
import JobProspectTrendCard from "./business-cards/job-prospect-trend-card"
import MonthlyJobGrowthCard from "./business-cards/monthly-job-growth-card"
import JobPostingCard from "./business-cards/job-posting-card"
import RelatedJobsListCard from "./business-cards/related-jobs-list-card"
import InstructorCoursesListCard from "./business-cards/instructor-courses-list-card"
import ExperienceCard from "./business-cards/experience-card"
import SimplePieCard from "./business-cards/simple-pie-card"
// 新增设备类型卡片
import { PCToolbarCard } from "./business-cards/pc-toolbar-card"
import { UniversalInfoCard } from "./business-cards/universal-info-card"
import { JobPositionCard } from "@/components/card/job-position-card"
// 招聘详情页封装卡片（新）
import JobDetailIntroCard from "./jobs/job-detail-intro-card"
import JobSalaryOverviewCard from "./jobs/job-salary-overview-card"
import EducationSalaryRequirementsCard from "./jobs/education-salary-requirements-card"
import JobCityRankingCard from "./jobs/job-city-ranking-card"
import CompanyRankingCard from "./jobs/company-ranking-card"
import AbilityRequirementsRadarCard from "./jobs/ability-requirements-radar-card"
import CoreSkillsMasteryCard from "./jobs/core-skills-mastery-card"
import BasicAbilityRequirementsCard from "./jobs/basic-ability-requirements-card"
import EducationBackgroundCard from "./jobs/education-background-card"

// 招聘信息内页卡片
import { JobHeaderCard } from "@/components/card/jobs/job-header-card"
import { JobRequirementsCard } from "@/components/card/jobs/job-requirements-card"
import { JobBenefitsCard } from "@/components/card/jobs/job-benefits-card"
import { CompanyInfoCard } from "@/components/card/jobs/company-info-card"
import { ApplyResumeCard } from "@/components/card/jobs/apply-resume-card"

const datas = {};
const realDatas = {};
const filters = {};
const filtedDatas = {};
const listens = {};

class CardRegistry {
  private static cards = new Map<string, CardConfig>()
  private static actionHandlers = new Map<string, (action: CardAction) => void>()

  static register(config: CardConfig) {
    this.cards.set(config.name, config)
  }

  static registerActionHandler(cardName: string, handler: (action: CardAction) => void) {
    this.actionHandlers.set(cardName, handler)
  }

  static executeAction(cardName: string, action: CardAction) {
    const handler = this.actionHandlers.get(cardName)
    if (handler) {
      handler(action)
    }
  }

  static get(name: string) {
    return this.cards.get(name)
  }

  static getConfig(name: string) {
    return this.cards.get(name)
  }

  static getAll() {
    return Array.from(this.cards.values())
  }

  static getByCategory(category: string) {
    return Array.from(this.cards.values()).filter((card) => card.category === category)
  }

  static getByType(type: string) {
    return Array.from(this.cards.values()).filter((card) => card.type === type)
  }

  static getByCategoryAndType(category: string, type: string) {
    return Array.from(this.cards.values()).filter((card) => card.category === category && card.type === type)
  }

  static getAllTypes() {
    const types = new Set<string>()
    Array.from(this.cards.values()).forEach((card) => types.add(card.type))
    return Array.from(types)
  }

  static getTypesByCategory(category: string) {
    const types = new Set<string>()
    Array.from(this.cards.values())
      .filter((card) => card.category === category)
      .forEach((card) => types.add(card.type))
    return Array.from(types)
  }

  static unregister(name: string) {
    this.cards.delete(name)
    this.actionHandlers.delete(name)
  }

  static setData(name, data, realData) {
    datas[name] = data;
    realDatas[name] = realData;
    listens[name](name, data);
    // this.listens.forEach(cb => cb(name, data));
  }

  static getData(name) {
    return datas[name];
  }

  static getRealData(name) {
    return realDatas[name];
  }

  static getAllData() {
    return datas;
  }

  static getAllRealData() {
    return realDatas;
  }

  static selectFilter(name, filter) {
    if (filter.value === 'none') {
      listens[name](name, datas[name]);
      return;
    }
    filters[name] = filter;
    const currentRealData = realDatas[name];
    const currentData = datas[name];
    filtedDatas[name] = [];
    currentRealData.forEach((item, index) => {
      if (`${item[filter.fieldId]}` === filter.value) {
        filtedDatas[name].push(currentData[index]);
      }
    });
    listens[name](name, filtedDatas[name]);
  }

  static getFilter(name) {
    return filters[name];
  }

  static listens = [];

  static listen(name, cb) {
    listens[name] = cb;
  }
}

// 教育类卡片

CardRegistry.register({
  name: "instructor-courses-list",
  displayName: "导师课程列表",
  category: "教育",
  type: "list", // 添加卡片类型
  component: InstructorCoursesListCard,
  businessFlow: "导师授课课程列表展示，包含课程信息、学习人数、证书信息和详情跳转功能",
  developer: {
    name: "Education System",
    version: "1.0.0",
    description: "导师课程列表卡片，支持课程详情跳转和统一设计风格",
  },
})

// 功能类卡片
CardRegistry.register({
  name: "notification-center",
  displayName: "通知中心",
  category: "功能",
  type: "widget", // 添加卡片类型
  component: null,
  businessFlow: "消息通知管理，支持分类查看和批量操作",
  developer: {
    name: "System Core",
    version: "1.0.0",
    description: "统一的消息通知管理中心",
  },
})

CardRegistry.register({
  name: "search-widget",
  displayName: "搜索组件",
  category: "功能",
  type: "widget", // 添加卡片类型
  component: null,
  businessFlow: "全局搜索功能，支持智能联想和历史记录",
  developer: {
    name: "System Core",
    version: "1.0.0",
    description: "智能搜索组件，提供快速检索能力",
  },
})

// 内容类卡片
CardRegistry.register({
  name: "article-editor",
  displayName: "文章编辑器",
  category: "内容",
  type: "form", // 添加卡片类型
  component: null,
  businessFlow: "富文本编辑器，支持markdown和所见即所得模式",
  developer: {
    name: "Content System",
    version: "1.0.0",
    description: "专业的文章编辑和发布工具",
  },
})

CardRegistry.register({
  name: "content-library",
  displayName: "内容库",
  category: "内容",
  type: "list", // 添加卡片类型
  component: null,
  businessFlow: "内容资源管理，支持分类、标签和搜索",
  developer: {
    name: "Content System",
    version: "1.0.0",
    description: "统一的内容资源管理平台",
  },
})

// 媒体类卡片
CardRegistry.register({
  name: "media-editor",
  displayName: "媒体编辑器",
  category: "媒体",
  type: "form", // 添加卡片类型
  component: MediaEditorCard,
  businessFlow: "媒体内容编辑，支持封面选择、主演设置和提示词编辑",
  developer: {
    name: "Media System",
    version: "1.0.0",
    description: "专业的媒体内容编辑和配置工具",
  },
})

CardRegistry.register({
  name: "image-gallery",
  displayName: "图片画廊",
  category: "媒体",
  type: "list", // 添加卡片类型
  component: null,
  businessFlow: "图片展示和管理，支持批量上传和编辑",
  developer: {
    name: "Media System",
    version: "1.0.0",
    description: "专业的图片管理和展示组件",
  },
})

CardRegistry.register({
  name: "video-player",
  displayName: "视频播放器",
  category: "媒体",
  type: "single", // 添加卡片类型
  component: null,
  businessFlow: "多格式视频播放，支持字幕和播放控制",
  developer: {
    name: "Media System",
    version: "1.0.0",
    description: "高性能的视频播放解决方案",
  },
})

// 数据类卡片
CardRegistry.register({
  name: "analytics-dashboard",
  displayName: "数据分析",
  category: "数据",
  type: "chart", // 添加卡片类型
  component: null,
  businessFlow: "数据可视化分析，支持多维度图表展示",
  developer: {
    name: "Analytics System",
    version: "1.0.0",
    description: "专业的数据分析和可视化工具",
  },
})

CardRegistry.register({
  name: "report-generator",
  displayName: "报表生成器",
  category: "数据",
  type: "form", // 添加卡片类型
  component: null,
  businessFlow: "自动化报表生成，支持定时任务和导出",
  developer: {
    name: "Analytics System",
    version: "1.0.0",
    description: "智能报表生成和管理系统",
  },
})

// 社交类卡片
CardRegistry.register({
  name: "user-profile",
  displayName: "用户档案",
  category: "社交",
  type: "detail", // 添加卡片类型
  component: null,
  businessFlow: "用户信息展示，包含社交关系和动态",
  developer: {
    name: "Social System",
    version: "1.0.0",
    description: "完整的用户档案管理系统",
  },
})

CardRegistry.register({
  name: "chat-widget",
  displayName: "聊天组件",
  category: "社交",
  type: "widget", // 添加卡片类型
  component: null,
  businessFlow: "实时聊天功能，支持群聊和文件传输",
  developer: {
    name: "Social System",
    version: "1.0.0",
    description: "实时通讯和社交互动平台",
  },
})

// 电商类卡片
CardRegistry.register({
  name: "product-showcase",
  displayName: "商品展示",
  category: "电商",
  type: "single", // 添加卡片类型
  component: null,
  businessFlow: "商品信息展示，包含价格、评价和购买功能",
  developer: {
    name: "E-commerce System",
    version: "1.0.0",
    description: "专业的商品展示和销售组件",
  },
})

CardRegistry.register({
  name: "shopping-cart",
  displayName: "购物车",
  category: "电商",
  type: "list", // 添加卡片类型
  component: null,
  businessFlow: "购物车管理，支持商品增减和结算",
  developer: {
    name: "E-commerce System",
    version: "1.0.0",
    description: "完整的购物车和结算系统",
  },
})

// 招聘类卡片
CardRegistry.register({
  name: "job-experience-ratio",
  displayName: "工作年限占比分析",
  category: "招聘",
  type: "chart", // 添加卡片类型
  component: JobExperienceRatioCard,
  businessFlow: "不同工作年限的工作机会占比分析，包含数据表格和可视化图表",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "工作年限占比分析卡片，展示不同经验要求的职位分布",
  },
})

CardRegistry.register({
  name: "job-prospect-trend",
  displayName: "就业前景趋势",
  category: "招聘",
  type: "chart", // 添加卡片类型
  component: JobProspectTrendCard,
  businessFlow: "就业前景趋势分析，展示月度新增职位和排名变化",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "就业前景趋势卡片，显示职位增长趋势和市场排名",
  },
})

CardRegistry.register({
  name: "monthly-job-growth",
  displayName: "月度职位增长",
  category: "招聘",
  type: "chart", // 添加卡片类型
  component: MonthlyJobGrowthCard,
  businessFlow: "月度职位增长统计，展示职位数量的时间变化趋势",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "月度职位增长卡片，显示职位增长的时间序列数据",
  },
})

CardRegistry.register({
  name: "job-posting",
  data: { a: 'aaa' },
  displayName: "职位发布",
  category: "招聘",
  type: "form", // 添加卡片类型
  component: JobPostingCard,
  businessFlow: "职位信息发布和管理，支持筛选和搜索",
  developer: {
    name: "HR System",
    version: "1.0.0",
    description: "专业的职位发布和管理平台",
  },
})

CardRegistry.register({
  name: "job-position",
  displayName: "职位概览",
  category: "招聘",
  type: "display",
  component: JobPositionCard,
  businessFlow: "职位概览信息展示，支持从注册中心数据驱动",
  developer: {
    name: "HR System",
    version: "1.0.0",
    description: "职位概览卡片，可配置并与详情联动",
  },
})

CardRegistry.register({
  name: "related-jobs-list",
  displayName: "相关岗位列表",
  category: "招聘",
  type: "list", // 添加卡片类型
  component: RelatedJobsListCard,
  businessFlow: "相关岗位推荐列表，包含岗位信息、薪资范围和详情跳转功能",
  developer: {
    name: "HR System",
    version: "1.0.0",
    description: "相关岗位推荐卡片，支持自定义岗位数据和自动跳转到详情页",
  },
})

// ===== 招聘详情页——新增封装卡片注册 =====
CardRegistry.register({
  name: "job-detail-intro",
  displayName: "职位简介",
  category: "招聘",
  type: "display",
  component: JobDetailIntroCard,
  businessFlow: "职位详情顶部简介信息展示，包含平均薪资和数据来源",
  developer: {
    name: "HR System",
    version: "1.0.0",
    description: "职位详情页顶部简介卡片",
  },
})

CardRegistry.register({
  name: "job-salary-overview",
  displayName: "收入分布概览",
  category: "招聘",
  type: "chart",
  component: JobSalaryOverviewCard,
  businessFlow: "职位收入分布概览，可视化展示薪资区间与占比",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "职位收入分布概览卡片",
  },
})

CardRegistry.register({
  name: "education-salary-requirements",
  displayName: "学历收入要求",
  category: "招聘",
  type: "list",
  component: EducationSalaryRequirementsCard,
  businessFlow: "不同学历维度下的平均薪资与占比展示",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "学历与收入要求卡片",
  },
})

CardRegistry.register({
  name: "job-city-ranking",
  displayName: "城市职位排名",
  category: "招聘",
  type: "list",
  component: JobCityRankingCard,
  businessFlow: "不同城市的职位数量与占比展示",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "工作城市排名卡片",
  },
})

CardRegistry.register({
  name: "company-ranking",
  displayName: "企业排行",
  category: "招聘",
  type: "list",
  component: CompanyRankingCard,
  businessFlow: "新兴业务领域相关企业排行展示",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "企业排行卡片",
  },
})

CardRegistry.register({
  name: "ability-requirements-radar",
  displayName: "能力要求雷达图",
  category: "招聘",
  type: "chart",
  component: AbilityRequirementsRadarCard,
  businessFlow: "岗位关键能力要求雷达图展示",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "能力要求雷达图包装卡片",
  },
})

CardRegistry.register({
  name: "core-skills-mastery",
  displayName: "核心技能掌握度",
  category: "招聘",
  type: "chart",
  component: CoreSkillsMasteryCard,
  businessFlow: "核心技能掌握程度可视化展示",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "核心技能掌握度包装卡片",
  },
})

CardRegistry.register({
  name: "basic-ability-requirements",
  displayName: "基础能力要求",
  category: "招聘",
  type: "list",
  component: BasicAbilityRequirementsCard,
  businessFlow: "基础能力要求清单展示",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "基础能力要求包装卡片",
  },
})

CardRegistry.register({
  name: "education-background",
  displayName: "教育背景分布",
  category: "招聘",
  type: "chart",
  component: EducationBackgroundCard,
  businessFlow: "岗位教育背景分布展示",
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "教育背景分布包装卡片",
  },
})

// 零售类卡片
CardRegistry.register({
  name: "inventory-management",
  displayName: "库存管理",
  category: "零售",
  type: "list", // 添加卡片类型
  component: null,
  businessFlow: "库存监控和管理，支持预警和补货提醒",
  developer: {
    name: "Retail System",
    version: "1.0.0",
    description: "智能库存管理和监控系统",
  },
})

CardRegistry.register({
  name: "pos-terminal",
  displayName: "收银终端",
  category: "零售",
  type: "widget", // 添加卡片类型
  component: null,
  businessFlow: "销售收银功能，支持多种支付方式",
  developer: {
    name: "Retail System",
    version: "1.0.0",
    description: "专业的收银和支付处理系统",
  },
})

// 旅行类卡片
CardRegistry.register({
  name: "trip-planner",
  displayName: "行程规划",
  category: "旅行",
  type: "form", // 添加卡片类型
  component: null,
  businessFlow: "旅行行程规划，包含路线推荐和预算管理",
  developer: {
    name: "Travel System",
    version: "1.0.0",
    description: "智能旅行规划和管理工具",
  },
})

CardRegistry.register({
  name: "hotel-booking",
  displayName: "酒店预订",
  category: "旅行",
  type: "list", // 添加卡片类型
  component: null,
  businessFlow: "酒店查询和预订，支持价格比较和评价查看",
  developer: {
    name: "Travel System",
    version: "1.0.0",
    description: "便捷的酒店预订和管理平台",
  },
})

// 基础类卡片
CardRegistry.register({
  name: "experience-card",
  displayName: "经历卡片",
  category: "基础",
  type: "form", // 添加卡片类型
  component: ExperienceCard,
  businessFlow: "通用经历卡片，支持教育经历、工作经验、项目经验等多种经历类型的录入和管理",
  developer: {
    name: "Base System",
    version: "1.0.0",
    description: "通用经历卡片组件，可配置字段类型和验证规则，适用于各种经历信息的收集",
  },
})

// 新增：简单饼图卡片（占半屏高度）
CardRegistry.register({
  name: "simple-pie",
  displayName: "简单饼图",
  category: "数据",
  type: "chart",
  width: "half",
  component: SimplePieCard,
  businessFlow: "用于展示单一饼状图的简洁卡片，占用半屏高度，适合仪表板布局",
  developer: {
    name: "Analytics System",
    version: "1.0.0",
    description: "简洁的饼状图展示卡片，可在任意页面直接引入使用",
  },
})

// 新增：简单饼图卡片（占半屏高度）
CardRegistry.register({
  name: "simple-pie-2",
  displayName: "简单饼图-2",
  category: "数据",
  type: "chart",
  width: "half",
  component: SimplePieCard,
  businessFlow: "用于展示单一饼状图的简洁卡片，占用半屏高度，适合仪表板布局",
  developer: {
    name: "Analytics System",
    version: "1.0.0",
    description: "简洁的饼状图展示卡片，可在任意页面直接引入使用",
  },
})

// ===== 设备类型卡片 =====

// （已移除）移动端专用导航卡片

// PC端专用工具栏卡片
CardRegistry.register({
  name: "pc-toolbar",
  displayName: "PC端工具栏卡片",
  category: "工具",
  type: "toolbar",
  component: PCToolbarCard,
  businessFlow: "专为PC端设计的工具栏卡片，支持键盘快捷键和鼠标交互",
  developer: {
    name: "Desktop System",
    version: "1.0.0",
    description: "PC端专用工具栏卡片，支持键盘快捷键和悬停效果",
  },
})

// 通用信息展示卡片
CardRegistry.register({
  name: "universal-info",
  displayName: "通用信息卡片",
  category: "信息",
  type: "display",
  component: UniversalInfoCard,
  businessFlow: "跨平台的信息展示卡片，适用于所有设备类型",
  developer: {
    name: "Universal System",
    version: "1.0.0",
    description: "通用信息展示卡片，在所有设备上都能正常显示",
  },
})

CardRegistry.register({
  name: 'job-header',
  displayName: '职位信息卡片',
  type: "display",
  category: "招聘",
  component: JobHeaderCard,
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "招聘职位信息卡片",
  },
})
CardRegistry.register({
  name: 'job-requirements',
  displayName: '职位要求卡片',
  type: "display",
  category: "招聘",
  component: JobRequirementsCard,
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "招聘职位要求卡片",
  },
})
CardRegistry.register({
  name: 'job-benefits',
  displayName: '职位福利卡片',
  type: "display",
  category: "招聘",
  component: JobBenefitsCard,
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "招聘职位福利卡片",
  },
})
CardRegistry.register({
  name: 'company-info',
  displayName: '公司信息卡片',
  type: "display",
  category: "招聘",
  component: CompanyInfoCard,
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "招聘公司信息卡片",
  },
})
CardRegistry.register({
  name: 'apply-resume',
  displayName: '投递简历卡片',
  type: "display",
  category: "招聘",
  component: ApplyResumeCard,
  developer: {
    name: "HR Analytics System",
    version: "1.0.0",
    description: "招聘投递简历卡片",
  },
})

export { CardRegistry }
