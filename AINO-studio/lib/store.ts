"use client"

import type { FieldCategoryModel } from "./field-categories"

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "boolean"
  | "date"
  | "datetime"
  | "daterange"
  | "multidate"
  | "time"
  | "tags"
  | "image"
  | "profile"
  | "multiimage"
  | "video"
  | "multivideo"
  | "file"
  | "richtext"
  | "percent"
  | "progress"
  | "barcode"
  | "checkbox"
  | "cascader"
  | "relation_one"
  | "relation_many"
  | "experience"
  | "identity_verification"
  | "other_verification"

export type PresetKey =
  | "city"
  | "country"
  | "phone"
  | "email"
  | "url"
  | "map"
  | "currency"
  | "rating"
  | "percent"
  | "progress"
  | "user_select"
  | "constellation"
  | "skills"
  | "work_experience"
  | "education_experience"
  | "certificate_experience"
  | "custom_experience"
  | "identity_verification"
  | "other_verification"

export type RelationMeta = {
  targetDirId: string | null
  mode: "one" | "many"
  displayFieldKey?: string | null
  onDelete?: "cascade" | "restrict"
}

export type CascaderNode = { id: string; name: string; children?: CascaderNode[] }

export type FieldModel = {
  id: string
  key: string // 内部名（唯一，a-zA-Z_ 开头，含数字与下划线）
  label: string // 显示名
  type: FieldType
  required: boolean
  unique?: boolean
  locked: boolean
  enabled: boolean
  desc?: string
  placeholder?: string
  categoryId?: string // 字段分类ID，关联到字段分类管理
  // 数值
  min?: number
  max?: number
  step?: number
  unit?: string
  // 选择类
  options?: string[]
  default?: any
  // 可见性
  showInList?: boolean // 默认 true
  showInForm?: boolean // 默认 true
  showInDetail?: boolean // 默认 true
  // 布尔
  trueLabel?: string
  falseLabel?: string
  // 媒体
  accept?: string
  maxSizeMB?: number
  // 关联
  relation?: RelationMeta
  // 级联
  cascaderOptions?: CascaderNode[]
  // 日期/时间模式等（可扩展）
  dateMode?: "single" | "multiple" | "range"
  preset?: PresetKey
  // 技能字段特殊配置
  skillsConfig?: {
    allowedCategories?: string[] // 允许的技能分类
    maxSkills?: number // 最大技能数量
    showLevel?: boolean // 是否显示技能等级
    customCategories?: { id: string; name: string }[] // 自定义分类
    customSkills?: { id: string; name: string; category: string }[] // 自定义技能
  }
  // 进度字段特殊配置
  progressConfig?: {
    maxValue?: number // 最大值，默认100
    showPercentage?: boolean // 是否显示百分比
    showProgressBar?: boolean // 是否显示进度条
  }
  // 其他经历字段特殊配置
  customExperienceConfig?: {
    experienceName?: string // 经历名称
    eventName?: string // 事件名称
  }
  // 实名认证字段特殊配置
  identityVerificationConfig?: {
    requireName?: boolean // 是否需要姓名
    requireIdNumber?: boolean // 是否需要身份证号
    requireFrontPhoto?: boolean // 是否需要正面照片
    requireBackPhoto?: boolean // 是否需要反面照片
  }
  // 证书资质字段特殊配置
  certificateConfig?: {
    certificateNames?: string[] // 预设证书名称选项
    issuingAuthority?: string // 自定义颁发单位
    allowCustomCertificateName?: boolean // 是否允许用户自定义证书名称
    allowCustomIssuingAuthority?: boolean // 是否允许用户自定义颁发单位
  }
  // 其他认证字段特殊配置
  otherVerificationConfig?: {
    textFields?: { id: string; name: string; required: boolean }[] // 文字字段配置
    imageFields?: { id: string; name: string; required: boolean; multiple: boolean }[] // 图片字段配置，支持单图/多图
  }
  // 基础图片字段配置
  imageConfig?: {
    multiple?: boolean // 是否支持多图上传
    defaultImage?: string // 默认图片（base64格式）
  }
  // 基础视频字段配置
  videoConfig?: {
    multiple?: boolean // 是否支持多视频上传
    defaultVideo?: string // 默认视频（base64格式）
  }
}

export type RecordRow = { id: string; [key: string]: any }

export type DirectoryModel = {
  id: string
  name: string
  type: "table" | "category"
  supportsCategory: boolean
  fields: FieldModel[]
  records: RecordRow[]
  categories: Array<{ id: string; name: string; children?: any[] }>
  fieldCategories?: FieldCategoryModel[] // 独立的字段分类
}

export type ModuleModel = {
  id: string
  name: string
  type: "system" | "ecom" | "edu" | "content" | "project" | "custom"
  icon?: string
  directories: DirectoryModel[]
}

export type AppModel = {
  id: string
  name: string
  desc?: string
  modules: ModuleModel[]
}

type Store = {
  apps: AppModel[]
}

const LS_KEY = "nocode_builder_store_v1"

export const uid = () => Math.random().toString(36).slice(2, 10)

function safeGet(): string | null {
  try {
    return localStorage.getItem(LS_KEY)
  } catch {
    return null
  }
}
function safeSet(v: string) {
  try {
    localStorage.setItem(LS_KEY, v)
  } catch {}
}

export function getStore(): Store {
  const raw = typeof window !== "undefined" ? safeGet() : null
  if (!raw) return { apps: [] }
  try {
    return JSON.parse(raw)
  } catch {
    return { apps: [] }
  }
}
export function saveStore(s: Store) {
  safeSet(JSON.stringify(s))
}

/* ---------- TEMPLATES & DEMO DATA ---------- */

function f(
  key: string,
  label: string,
  type: FieldType,
  required = false,
  locked = false,
  extra: Partial<FieldModel> = {},
): FieldModel {
  return {
    id: uid(),
    key,
    label,
    type,
    required,
    locked,
    enabled: true,
    showInList: true,
    showInForm: true,
    showInDetail: true,
    ...extra,
  }
}

export const dirTemplates = {
  custom: (name = "自定义表"): DirectoryModel => ({
    id: uid(),
    name,
    type: "table",
    supportsCategory: true,
    fields: [
      f("title", "标题", "text", true, true, { placeholder: "请输入标题", unique: false }),
      f("desc", "描述", "textarea", false, true, { placeholder: "请输入描述" }),
      f("status", "状态", "select", true, true, { options: ["启用", "停用"], default: "启用" }),
      f("tags", "标签", "tags", false, true),
    ],
    records: [],
    categories: [],
    fieldCategories: [], // 自定义表不使用字段分类
  }),
  "common-people": (name = "人员表"): DirectoryModel => ({
    id: uid(),
    name,
    type: "table",
    supportsCategory: false,
    fields: [
      f("name", "姓名", "text", true, true),
      f("phone", "手机", "text", false, true, { placeholder: "请输入手机号" }),
      f("email", "邮箱", "text", false, true, { placeholder: "请输入邮箱" }),
      f("tags", "标签", "tags", false, true),
      f("status", "状态", "select", true, true, { options: ["启用", "禁用"], default: "启用" }),
    ],
    records: [],
    categories: [],
    fieldCategories: [], // 人员表不使用字段分类
  }),
}

// 导入模板
import { createUserModule } from "./templates/user-template"

export const builtinModules = {
  baseUser: createUserModule,
  baseConfig(): ModuleModel {
    return {
      id: uid(),
      name: "全局配置",
      type: "system",
      directories: [
        {
          id: uid(),
          name: "分类管理",
          type: "category",
          supportsCategory: true,
          fields: [f("name", "分类名", "text", true, true)],
          records: [],
          categories: [],
          fieldCategories: [], // 分类管理不使用字段分类
        },
      ],
    }
  },
  ecom(): ModuleModel {
    return {
      id: uid(),
      name: "电商模块",
      type: "ecom",
      directories: [
        {
          id: uid(),
          name: "商品管理",
          type: "table",
          supportsCategory: true,
          fields: [
            f("cover", "封面", "image", false, true, { accept: "image/*", maxSizeMB: 5 }),
            f("name", "商品名", "text", true, true, { placeholder: "如：某某盲盒", unique: true }),
            f("category", "分类", "select", false, true, { options: ["潮玩", "数码", "家居"] }),
            f("status", "上架状态", "select", true, true, { options: ["上架", "下架"], default: "上架" }),
            f("priceMin", "价格下限", "number", false, true, { min: 0, step: 0.01, unit: "¥" }),
            f("priceMax", "价格上限", "number", false, true, { min: 0, step: 0.01, unit: "¥" }),
            f("stock", "库存总量", "number", false, true, { min: 0, step: 1 }),
            f("tags", "标签", "tags", false, true),
          ],
          records: [],
          categories: [],
          fieldCategories: [], // 商品管理不使用字段分类
        },
      ],
    }
  },
  edu(): ModuleModel {
    return {
      id: uid(),
      name: "教育模块",
      type: "edu",
      directories: [
        {
          id: uid(),
          name: "课程管理",
          type: "table",
          supportsCategory: true,
          fields: [
            f("title", "课程名", "text", true, true),
            f("category", "类别", "select", false, true, { options: ["编程", "设计", "运营"] }),
            f("price", "价格", "number", false, true, { min: 0, step: 1, unit: "¥" }),
            f("status", "状态", "select", true, true, { options: ["上架", "下架"], default: "上架" }),
          ],
          records: [],
          categories: [],
          fieldCategories: [], // 课程管理不使用字段分类
        },
      ],
    }
  },
  content(): ModuleModel {
    return {
      id: uid(),
      name: "内容模块",
      type: "content",
      directories: [
        {
          id: uid(),
          name: "文章管理",
          type: "table",
          supportsCategory: true,
          fields: [
            f("title", "标题", "text", true, true),
            f("category", "分类", "select", false, true, { options: ["公告", "教程", "案例"] }),
            f("status", "状态", "select", true, true, { options: ["草稿", "发布"], default: "草稿" }),
            f("tags", "标签", "tags", false, true),
            f("publishedAt", "发布时间", "date", false, true),
          ],
          records: [],
          categories: [],
          fieldCategories: [], // 文章管理不使用字段分类
        },
      ],
    }
  },
  project(): ModuleModel {
    return {
      id: uid(),
      name: "项目展示模块",
      type: "project",
      directories: [
        {
          id: uid(),
          name: "项目列表",
          type: "table",
          supportsCategory: true,
          fields: [
            f("title", "项目名", "text", true, true),
            f("category", "分类", "select", false, true, { options: ["Web", "移动", "AI", "IoT"] }),
            f("status", "状态", "select", true, true, { options: ["进行中", "已完成"], default: "进行中" }),
          ],
          records: [],
          categories: [],
          fieldCategories: [], // 项目列表不使用字段分类
        },
      ],
    }
  },
  custom(): ModuleModel {
    return { id: uid(), name: "自定义模块", type: "custom", directories: [] }
  },
}

export function ensureDemoApp() {
  const s = getStore()
  if (s.apps.length > 0) return
  const demo: AppModel = {
    id: uid(),
    name: "示例应用",
    desc: "用户管理示例",
    modules: [builtinModules.baseUser(), builtinModules.baseConfig()],
  }
  s.apps.push(demo)
  saveStore(s)
}

export function allTables(app: AppModel) {
  const res: Array<{ id: string; name: string; module: string }> = []
  app.modules.forEach((m) =>
    m.directories.forEach((d) => {
      if (d.type === "table") res.push({ id: d.id, name: d.name, module: m.name })
    }),
  )
  return res
}

export function findNameField(dir: DirectoryModel) {
  const pref = ["name", "title", "username", "buyer", "orderNo", "client"]
  for (const k of pref) {
    const f = dir.fields.find((x) => x.key === k)
    if (f) return f
  }
  return dir.fields.find((x) => x.type === "text") || dir.fields[0] || null
}

export function getRecordName(dir: DirectoryModel, rec: RecordRow) {
  const nf = findNameField(dir)
  return nf ? String((rec as any)[nf.key] || "") : rec.id
}

export function createDefaultRecord(dir: DirectoryModel): RecordRow {
  const rec: RecordRow = { id: uid() }
  
  // 检查是否有内容分类
  const hasCategories = dir.categories && dir.categories.length > 0
  
  dir.fields.forEach((f) => {
    if (f.default !== undefined) {
      ;(rec as any)[f.key] = f.default
      return
    }
    switch (f.type) {
      case "select":
        // 如果是分类字段且有分类，不设置默认值，强制用户选择
        if (f.key === "category" && hasCategories) {
          ;(rec as any)[f.key] = ""
        } else {
          ;(rec as any)[f.key] = f.options?.[0] ?? ""
        }
        break
      case "multiselect":
      case "tags":
        ;(rec as any)[f.key] = []
        break
      case "boolean":
      case "checkbox":
        ;(rec as any)[f.key] = false
        break
      case "number":
      case "percent":
      case "progress":
        ;(rec as any)[f.key] = 0
        break
      case "image":
      case "file":
      case "text":
      case "textarea":
      case "richtext":
      case "date":
      case "time":
      case "barcode":
      case "cascader":
        ;(rec as any)[f.key] = ""
        break
      case "experience":
        ;(rec as any)[f.key] = []
        break
      case "relation_one":
      case "relation_many":
        ;(rec as any)[f.key] = f.type === "relation_many" ? [] : ""
        break
      default:
        ;(rec as any)[f.key] = ""
    }
  })
  const nf = findNameField(dir)
  if (nf && !(rec as any)[nf.key]) (rec as any)[nf.key] = nf.label + "#" + (dir.records.length + 1)
  return rec
}

export function isRelationType(t: FieldType) {
  return t === "relation_one" || t === "relation_many"
}

export function findDirByIdAcrossModules(app: AppModel | null, id: string) {
  if (!app || !app.modules) {
    return null
  }
  
  for (const m of app.modules) {
    const d = m.directories.find((x) => x.id === id)
    if (d) return d
  }
  return null
}
