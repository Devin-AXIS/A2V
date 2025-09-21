export const skillsData = [
  // 技术类
  {
    id: "skill_1",
    name: "Vue.js",
    category: "技术",
    level: "中级",
    description: "渐进式JavaScript框架，用于构建用户界面",
    relatedSkills: ["skill_2", "skill_3"],
  },
  {
    id: "skill_2",
    name: "React",
    category: "技术",
    level: "中级",
    description: "用于构建用户界面的JavaScript库",
    relatedSkills: ["skill_1", "skill_3"],
  },
  {
    id: "skill_3",
    name: "JavaScript",
    category: "技术",
    level: "中级",
    description: "动态编程语言，主要用于Web开发",
    relatedSkills: ["skill_1", "skill_2"],
  },
  {
    id: "skill_4",
    name: "Python",
    category: "技术",
    level: "中级",
    description: "高级编程语言，广泛用于数据科学和Web开发",
    relatedSkills: [],
  },
  {
    id: "skill_5",
    name: "Java",
    category: "技术",
    level: "高级",
    description: "面向对象编程语言，企业级应用开发",
    relatedSkills: [],
  },
  {
    id: "skill_6",
    name: "Node.js",
    category: "技术",
    level: "中级",
    description: "基于Chrome V8引擎的JavaScript运行环境",
    relatedSkills: ["skill_3"],
  },
  // 设计类
  {
    id: "skill_7",
    name: "UI设计",
    category: "设计",
    level: "中级",
    description: "用户界面设计，关注视觉效果和用户体验",
    relatedSkills: ["skill_8"],
  },
  {
    id: "skill_8",
    name: "UX设计",
    category: "设计",
    level: "中级",
    description: "用户体验设计，关注用户需求和交互流程",
    relatedSkills: ["skill_7"],
  },
  {
    id: "skill_9",
    name: "Photoshop",
    category: "设计",
    level: "初级",
    description: "图像处理和编辑软件",
    relatedSkills: ["skill_10"],
  },
  {
    id: "skill_10",
    name: "Figma",
    category: "设计",
    level: "中级",
    description: "协作式界面设计工具",
    relatedSkills: ["skill_7", "skill_8"],
  },
  // 管理类
  {
    id: "skill_13",
    name: "项目管理",
    category: "管理",
    level: "高级",
    description: "规划、执行和监控项目的全过程管理",
    relatedSkills: ["skill_14"],
  },
  {
    id: "skill_14",
    name: "团队管理",
    category: "管理",
    level: "高级",
    description: "领导和管理团队，提升团队效率",
    relatedSkills: ["skill_13"],
  },
  // 语言类
  {
    id: "skill_15",
    name: "英语",
    category: "语言",
    level: "中级",
    description: "国际通用语言，商务和技术交流",
    relatedSkills: [],
  },
  {
    id: "skill_16",
    name: "日语",
    category: "语言",
    level: "初级",
    description: "日本语言，适用于日企工作",
    relatedSkills: [],
  },
]

export const skillCategories = [
  {
    id: "tech",
    name: "技术",
    children: [
      { id: "frontend", name: "前端" },
      { id: "backend", name: "后端" },
      { id: "mobile", name: "移动端" },
      { id: "database", name: "数据库" },
    ],
  },
  {
    id: "design",
    name: "设计",
    children: [
      { id: "ui", name: "UI设计" },
      { id: "ux", name: "UX设计" },
      { id: "graphic", name: "平面设计" },
    ],
  },
  {
    id: "management",
    name: "管理",
    children: [
      { id: "project", name: "项目管理" },
      { id: "team", name: "团队管理" },
      { id: "product", name: "产品管理" },
    ],
  },
]

export function getSkillById(id: string) {
  return skillsData.find((s) => s.id === id)
}

export function getSkillsByCategory(category: string) {
  return skillsData.filter((s) => s.category === category)
}

export function getSkillsByIds(ids: string[]) {
  return skillsData.filter((s) => ids.includes(s.id))
}
