export type ExperienceType = "work" | "education" | "project" | "certificate"

export type ExperienceItem = {
  id: string
  type: ExperienceType
  title: string // 职位/学校/项目名称
  organization: string // 公司/学校/机构
  startDate: string
  endDate?: string // 可选，表示"至今"
  isCurrent: boolean // 是否当前在职/在读
  description?: string
  location?: string
  skills?: string[] // 相关技能
  achievements?: string[] // 成就/荣誉
  // 教育经历特有
  degree?: string // 学历
  major?: string // 专业
  gpa?: string
  // 工作经历特有
  department?: string // 部门
  salary?: string // 薪资
  // 项目经历特有
  projectUrl?: string
  teamSize?: number
  // 证书特有
  issuer?: string // 颁发机构
  credentialId?: string // 证书编号
  expiryDate?: string // 过期时间
}

export const EXPERIENCE_TYPES = {
  work: { label: "工作经历", icon: "💼" },
  education: { label: "教育经历", icon: "🎓" },
  project: { label: "项目经历", icon: "🚀" },
  certificate: { label: "证书资质", icon: "🏆" },
}

export const DEGREE_OPTIONS = ["高中", "中专", "大专", "本科", "硕士", "博士", "博士后"]

export const createEmptyExperience = (type: ExperienceType): ExperienceItem => ({
  id: Math.random().toString(36).slice(2),
  type,
  title: "",
  organization: "",
  startDate: "",
  isCurrent: false,
  description: "",
  location: "",
  skills: [],
  achievements: [],
})

export const formatExperienceDuration = (startDate: string, endDate?: string, isCurrent?: boolean) => {
  if (!startDate) return ""

  const start = new Date(startDate)
  const end = isCurrent ? new Date() : endDate ? new Date(endDate) : new Date()

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  let duration = ""
  if (years > 0) duration += `${years}年`
  if (remainingMonths > 0) duration += `${remainingMonths}个月`

  return duration || "不足1个月"
}
