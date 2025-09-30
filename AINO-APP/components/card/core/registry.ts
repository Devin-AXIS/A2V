import type { CardConfig, CardAction } from "@/types"
import { http } from "@/lib/request"
import JobExperienceRatioCard from "../cards/recruitment/job-experience-ratio-card"
import JobProspectTrendCard from "../cards/analytics/job-prospect-trend-card"
import MonthlyJobGrowthCard from "../cards/analytics/monthly-job-growth-card"
import JobPostingCard from "../cards/recruitment/job-posting-card"
import RelatedJobsListCard from "../cards/recruitment/related-jobs-list-card"
import InstructorCoursesListCard from "../cards/education/instructor-courses-list-card"
import ExperienceCard from "../cards/utils/experience-card"
import SimplePieCard from "../cards/analytics/simple-pie-card"
// 新增设备类型卡片
import { PCToolbarCard } from "../cards/utils/pc-toolbar-card"
import { UniversalInfoCard } from "../cards/utils/universal-info-card"
import { JobPositionCard } from "../cards/recruitment/job-position-card"
import { JobListingCard } from "../cards/recruitment/job-listing-card"
// 招聘详情页封装卡片（新）
import JobDetailIntroCard from "../cards/recruitment/jobs/job-detail-intro-card"
import JobSalaryOverviewCard from "../cards/recruitment/jobs/job-salary-overview-card"
import EducationSalaryRequirementsCard from "../cards/recruitment/jobs/education-salary-requirements-card"
import JobCityRankingCard from "../cards/recruitment/jobs/job-city-ranking-card"
import CompanyRankingCard from "../cards/recruitment/jobs/company-ranking-card"
import AbilityRequirementsRadarCard from "../cards/recruitment/jobs/ability-requirements-radar-card"
import CoreSkillsMasteryCard from "../cards/recruitment/jobs/core-skills-mastery-card"
import BasicAbilityRequirementsCard from "../cards/recruitment/jobs/basic-ability-requirements-card"
import EducationBackgroundCard from "../cards/recruitment/jobs/education-background-card"

// 招聘信息内页卡片
import { JobHeaderCard } from "../cards/recruitment/jobs/job-header-card"
import { JobRequirementsCard } from "../cards/recruitment/jobs/job-requirements-card"
import { JobBenefitsCard } from "../cards/recruitment/jobs/job-benefits-card"
import { CompanyInfoCard } from "../cards/recruitment/jobs/company-info-card"
import { ApplyResumeCard } from "../cards/recruitment/jobs/apply-resume-card"

// 用户相关卡片
import { BasicInfoCard } from "../cards/user/profile-cards/basic-info-card"
import { GenericFormCard } from "../cards/user/profile-cards/generic-form-card"

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
    listens[name]?.(name, data, realData);
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
      listens[name]?.(name, datas[name]);
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
    listens[name]?.(name, filtedDatas[name]);
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


// 内容类卡片


// 媒体类卡片



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

// CardRegistry.register({
//   name: "job-prospect-trend",
//   displayName: "就业前景趋势",
//   category: "招聘",
//   type: "chart", // 添加卡片类型
//   component: JobProspectTrendCard,
//   businessFlow: "就业前景趋势分析，展示月度新增职位和排名变化",
//   developer: {
//     name: "HR Analytics System",
//     version: "1.0.0",
//     description: "就业前景趋势卡片，显示职位增长趋势和市场排名",
//   },
// })

// CardRegistry.register({
//   name: "monthly-job-growth",
//   displayName: "月度职位增长",
//   category: "招聘",
//   type: "chart", // 添加卡片类型
//   component: MonthlyJobGrowthCard,
//   businessFlow: "月度职位增长统计，展示职位数量的时间变化趋势",
//   developer: {
//     name: "HR Analytics System",
//     version: "1.0.0",
//     description: "月度职位增长卡片，显示职位增长的时间序列数据",
//   },
// })

CardRegistry.register({
  name: "job-posting",
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
  name: "job-listing",
  displayName: "岗位卡片",
  category: "招聘",
  type: "display",
  component: JobListingCard,
  businessFlow: "单个职位信息展示，包含职位标题、薪资、地点、要求等基本信息",
  developer: {
    name: "HR System",
    version: "1.0.0",
    description: "职位信息卡片，支持点击跳转到职位详情页",
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

// CardRegistry.register({
//   name: "company-ranking",
//   displayName: "企业排行",
//   category: "招聘",
//   type: "list",
//   component: CompanyRankingCard,
//   businessFlow: "新兴业务领域相关企业排行展示",
//   developer: {
//     name: "HR Analytics System",
//     version: "1.0.0",
//     description: "企业排行卡片",
//   },
// })

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

// CardRegistry.register({
//   name: "core-skills-mastery",
//   displayName: "核心技能掌握度",
//   category: "招聘",
//   type: "chart",
//   component: CoreSkillsMasteryCard,
//   businessFlow: "核心技能掌握程度可视化展示",
//   developer: {
//     name: "HR Analytics System",
//     version: "1.0.0",
//     description: "核心技能掌握度包装卡片",
//   },
// })

// CardRegistry.register({
//   name: "basic-ability-requirements",
//   displayName: "基础能力要求",
//   category: "招聘",
//   type: "list",
//   component: BasicAbilityRequirementsCard,
//   businessFlow: "基础能力要求清单展示",
//   developer: {
//     name: "HR Analytics System",
//     version: "1.0.0",
//     description: "基础能力要求包装卡片",
//   },
// })

// CardRegistry.register({
//   name: "education-background",
//   displayName: "教育背景分布",
//   category: "招聘",
//   type: "chart",
//   component: EducationBackgroundCard,
//   businessFlow: "岗位教育背景分布展示",
//   developer: {
//     name: "HR Analytics System",
//     version: "1.0.0",
//     description: "教育背景分布包装卡片",
//   },
// })



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

// ===== 用户相关卡片注册 =====
CardRegistry.register({
  name: 'basic-info',
  displayName: '基础信息卡片',
  type: "form",
  category: "用户",
  component: BasicInfoCard,
  businessFlow: "用户基础信息展示和编辑，包含头像、姓名、联系方式等",
  developer: {
    name: "User System",
    version: "1.0.0",
    description: "用户基础信息管理卡片",
  },
})

CardRegistry.register({
  name: 'generic-form',
  displayName: '通用表单卡片',
  type: "form",
  category: "用户",
  component: GenericFormCard,
  businessFlow: "高度可配置的通用表单组件，支持多种字段类型和联动逻辑",
  developer: {
    name: "User System",
    version: "1.0.0",
    description: "通用可配置表单卡片，支持动态字段配置",
  },
})

export { CardRegistry }
