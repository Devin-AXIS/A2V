"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { AppModel, FieldType } from "@/lib/store"
import {
  Type,
  FileTextIcon,
  Hash,
  CheckSquare,
  ListChecks,
  ToggleLeft,
  Calendar,
  Tag,
  ImageIcon,
  LinkIcon,
  Link2,
  Plus,
  Trash2,
  GripVertical,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  PercentIcon,
  DollarSign,
  Clock,
  Paperclip,
  ScanLine,
  Boxes,
  Users,
  User,
  SettingsIcon,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Target,
  TrendingUp,
  IdCard,
  Shield,
  X,
  Upload,
  Video,
  Flag,
} from "lucide-react"
import type { JSX } from "react/jsx-runtime"
import { CategoryDialog } from "@/components/dialogs/category-dialog"
import { RelationConfig, type RelationConfigValue } from "@/components/dialogs/relation-config"
import { skillCategories, skillsData } from "@/lib/data/skills-data"
import { DEFAULT_FIELD_CATEGORIES, getCategoryName } from "@/lib/field-categories"
import { useLocale } from "@/hooks/use-locale"
import { fieldCategoriesApi } from "@/lib/api"

type CatNode = { id: string; name: string; children?: CatNode[] }

export type FieldDraft = {
  label: string
  key: string
  type: FieldType
  required: boolean
  unique: boolean
  showInList: boolean
  categoryId?: string
  options?: string[]
  defaultRaw?: string
  relationTargetId?: string | null
  // Relation advanced
  relationModuleId?: string | null
  relationDisplayFieldKey?: string | null
  relationBidirectional?: boolean
  relationAllowDuplicate?: boolean
  // extra configs
  preset?: PresetKey
  dateMode?: "single" | "multiple" | "range"
  cascaderOptions?: CatNode[]
  // user-select preset extras
  userAllowMultiple?: boolean
  userNotifyNew?: boolean
  // skills preset extras
  skillsConfig?: {
    allowedCategories: string[]
    maxSkills?: number
    showLevel: boolean
    customCategories?: { id: string; name: string }[]
    customSkills?: { id: string; name: string; category: string }[]
  }
  // progress preset extras
  progressConfig?: {
    maxValue?: number
    showPercentage?: boolean
    showProgressBar?: boolean
  }
  // custom experience preset extras
  customExperienceConfig?: {
    experienceName?: string // 经历名称
    eventName?: string // 事件名称
  }
  // identity verification preset extras
  identityVerificationConfig?: {
    requireName?: boolean // 是否需要姓名
    requireIdNumber?: boolean // 是否需要身份证号
    requireFrontPhoto?: boolean // 是否需要正面照片
    requireBackPhoto?: boolean // 是否需要反面照片
  }
  // certificate preset extras
  certificateConfig?: {
    certificateNames?: string[] // 预设证书名称选项
    issuingAuthority?: string // 自定义颁发单位
    allowCustomCertificateName?: boolean // 是否允许用户自定义证书名称
    allowCustomIssuingAuthority?: boolean // 是否允许用户自定义颁发单位
  }
  // other verification preset extras
  otherVerificationConfig?: {
    textFields?: { id: string; name: string; required: boolean }[] // 文字字段配置
    imageFields?: { id: string; name: string; required: boolean; multiple: boolean }[] // 图片字段配置，支持单图/多图
  }
  // image field extras
  imageConfig?: {
    multiple?: boolean // 是否支持多图上传
    defaultImage?: string // 默认图片（base64格式）
  }
  // video field extras
  videoConfig?: {
    multiple?: boolean // 是否支持多视频上传
    defaultVideo?: string // 默认视频（base64格式）
  }
  // boolean field extras
  booleanConfig?: {
    checkedLabel?: string // 选中状态标签
    uncheckedLabel?: string // 未选中状态标签
    style?: "switch" | "checkbox" | "radio" // 显示样式
  }
  // multiselect field extras
  multiselectConfig?: {
    minSelection?: number // 最小选择数量
    maxSelection?: number // 最大选择数量
  }
}

/* i18n shape */
export type AddFieldI18n = {
  title: string
  displayName: string
  displayNamePh: string
  key: string
  keyPh: string
  keyInvalid: string
  keyDuplicate: string
  dataType: string
  required: string
  requiredHint: string
  unique: string
  uniqueHint: string
  showInList: string
  showInListHint: string
  default: string
  none: string
  true: string
  false: string
  optionLabel: string
  optionPlaceholder: string
  addOption: string
  optionsHint: string
  relationTarget: string
  cancel: string
  submit: string
  // optional additions
  dateModeLabel?: string
  dateModeSingle?: string
  dateModeMultiple?: string
  dateModeRange?: string
  basicFieldsLabel?: string
  businessFieldsLabel?: string
}

const KEY_RULE = /^[a-zA-Z_][a-zA-Z0-9_]{0,39}$/

const TYPE_ICON: Record<FieldType, JSX.Element> = {
  text: <Type className="size-4" />,
  textarea: <FileTextIcon className="size-4" />,
  number: <Hash className="size-4" />,
  select: <CheckSquare className="size-4" />,
  multiselect: <ListChecks className="size-4" />,
  boolean: <ToggleLeft className="size-4" />,
  date: <Calendar className="size-4" />,
  time: <Clock className="size-4" />,
  tags: <Tag className="size-4" />,
  image: <ImageIcon className="size-4" />,
  profile: <User className="size-4" />,
  video: <Video className="size-4" />,
  file: <Paperclip className="size-4" />,
  richtext: <FileTextIcon className="size-4" />,
  percent: <PercentIcon className="size-4" />,
  barcode: <ScanLine className="size-4" />,
  checkbox: <CheckSquare className="size-4" />,
  cascader: <Boxes className="size-4" />,
  relation_one: <LinkIcon className="size-4" />,
  relation_many: <Link2 className="size-4" />,
  experience: <Briefcase className="size-4" />,
}

const TYPE_TO_DTYPE: Record<FieldType, string> = {
  text: "String",
  textarea: "String",
  number: "Number",
  select: "String",
  multiselect: "String[]",
  boolean: "Boolean",
  date: "Date",
  time: "Time",
  tags: "String[]",
  image: "Image",
  profile: "Profile",
  video: "Video",
  file: "File",
  richtext: "RichText",
  percent: "Number",
  barcode: "String",
  checkbox: "Boolean",
  cascader: "String",
  relation_one: "Relation(one)",
  relation_many: "Relation(many)",
  experience: "Experience[]",
}

function toKey(label: string) {
  return (
    label
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w\u4e00-\u9fa5]/g, "") +
    "_" +
    Math.random().toString(36).slice(2, 6)
  )
}

/* ---------- 业务字段（预设） ---------- */

type PresetKey =
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
  | "barcode"
  | "cascader"
  | "relation"

const PRESET_ICON: Record<PresetKey, JSX.Element> = {
  city: <MapPin className="size-4" />,
  country: <Flag className="size-4" />,
  phone: <Phone className="size-4" />,
  email: <Mail className="size-4" />,
  url: <Globe className="size-4" />,
  map: <MapPin className="size-4" />,
  currency: <DollarSign className="size-4" />,
  rating: <Star className="size-4" />,
  percent: <PercentIcon className="size-4" />,
  progress: <TrendingUp className="size-4" />,
  user_select: <Users className="size-4" />,
  constellation: <Sparkles className="size-4" />,
  skills: <Target className="size-4" />,
  work_experience: <Briefcase className="size-4" />,
  education_experience: <GraduationCap className="size-4" />,
  certificate_experience: <Award className="size-4" />,
  custom_experience: <Target className="size-4" />,
  identity_verification: <IdCard className="size-4" />,
  other_verification: <Shield className="size-4" />,
  barcode: <ScanLine className="size-4" />,
  cascader: <Boxes className="size-4" />,
  relation: <LinkIcon className="size-4" />,
}

type PresetDef = {
  key: PresetKey
  label: string
  desc?: string
  baseType: FieldType
}

const PRESETS: PresetDef[] = [
  { key: "user_select", label: "选择用户", desc: "关联至用户列表", baseType: "relation_one" },
  { key: "city", label: "城市（省/市/区）", desc: "支持是否显示区县", baseType: "text" },
  { key: "country", label: "国家/地区", desc: "全球国家选择", baseType: "select" },
  { key: "phone", label: "手机", desc: "格式校验", baseType: "text" },
  { key: "email", label: "邮箱", desc: "格式校验", baseType: "text" },
  { key: "url", label: "URL 链接", desc: "格式校验", baseType: "text" },
  { key: "map", label: "地图位置", desc: "坐标/手动输入", baseType: "text" },
  { key: "currency", label: "货币金额", desc: "币种选择", baseType: "number" },
  { key: "rating", label: "评分（星级）", desc: "最大星数", baseType: "number" },
  { key: "percent", label: "百分比", desc: "0-100", baseType: "percent" },
  { key: "progress", label: "进度", desc: "进度条显示", baseType: "number" },
  { key: "constellation", label: "星座", desc: "12星座选择", baseType: "select" },
  { key: "skills", label: "技能", desc: "多技能选择", baseType: "multiselect" },
  { key: "work_experience", label: "工作经历", desc: "职位、公司、时间等", baseType: "experience" },
  { key: "education_experience", label: "教育经历", desc: "学校、专业、学历等", baseType: "experience" },
  { key: "certificate_experience", label: "证书资质", desc: "证书、颁发机构等", baseType: "experience" },
  { key: "custom_experience", label: "其他经历", desc: "自定义经历名称和事件", baseType: "experience" },
  { key: "identity_verification", label: "实名认证", desc: "姓名、身份证号、身份证照片", baseType: "text" },
  { key: "other_verification", label: "其他认证", desc: "自定义认证内容，支持文字和图片", baseType: "text" },
  { key: "barcode", label: "条码", desc: "二维码、条形码等", baseType: "text" },
  { key: "cascader", label: "级联选项", desc: "多级分类选择", baseType: "cascader" },
  { key: "relation", label: "关联", desc: "关联其他表的数据", baseType: "relation_one" },
]

// 获取本地化的预设数据
function getLocalizedPresets(locale: string): PresetDef[] {
  if (locale === "zh") {
    return PRESETS
  }
  
  return [
    { key: "user_select", label: "User Selection", desc: "Link to user list", baseType: "relation_one" },
    { key: "city", label: "City (Province/City/District)", desc: "Support district display", baseType: "text" },
    { key: "country", label: "Country/Region", desc: "Global country selection", baseType: "select" },
    { key: "phone", label: "Phone", desc: "Format validation", baseType: "text" },
    { key: "email", label: "Email", desc: "Format validation", baseType: "text" },
    { key: "url", label: "URL Link", desc: "Format validation", baseType: "text" },
    { key: "map", label: "Map Location", desc: "Coordinates/manual input", baseType: "text" },
    { key: "currency", label: "Currency Amount", desc: "Currency selection", baseType: "number" },
    { key: "rating", label: "Rating (Stars)", desc: "Maximum stars", baseType: "number" },
    { key: "percent", label: "Percentage", desc: "0-100", baseType: "percent" },
    { key: "progress", label: "Progress", desc: "Progress bar display", baseType: "number" },
    { key: "constellation", label: "Constellation", desc: "12 zodiac signs", baseType: "select" },
    { key: "skills", label: "Skills", desc: "Multiple skills selection", baseType: "multiselect" },
    { key: "work_experience", label: "Work Experience", desc: "Position, company, time, etc.", baseType: "experience" },
    { key: "education_experience", label: "Education Experience", desc: "School, major, degree, etc.", baseType: "experience" },
    { key: "certificate_experience", label: "Certificates", desc: "Certificate, issuing authority, etc.", baseType: "experience" },
    { key: "custom_experience", label: "Custom Experience", desc: "Custom experience name and events", baseType: "experience" },
    { key: "identity_verification", label: "Identity Verification", desc: "Name, ID number, ID card photos", baseType: "text" },
    { key: "other_verification", label: "Other Verification", desc: "Custom verification content, supports text and images", baseType: "text" },
    { key: "barcode", label: "Barcode", desc: "QR code, barcode, etc.", baseType: "text" },
    { key: "cascader", label: "Cascader", desc: "Multi-level category selection", baseType: "cascader" },
    { key: "relation", label: "Relation", desc: "Link to other table data", baseType: "relation_one" },
  ]
}

export function AddFieldDialog({
  open = false,
  onOpenChange,
  app,
  canEdit = true,
  existingKeys = [],
  onSubmit,
  i18n,
  typeNames,
  // 新增：支持编辑模式与初始草稿
  mode = "create",
  initialDraft,
  submitText,
  currentDir,
}: {
  open?: boolean
  onOpenChange: (v: boolean) => void
  app?: AppModel | null
  canEdit?: boolean
  existingKeys?: string[]
  onSubmit: (draft: FieldDraft) => void
  i18n: AddFieldI18n
  typeNames: Record<FieldType, string>
  mode?: "create" | "edit"
  initialDraft?: Partial<FieldDraft>
  submitText?: string
  currentDir?: any
}) {
  const { locale } = useLocale()
  const [label, setLabel] = useState("")
  const [key, setKey] = useState("")
  const [type, setType] = useState<FieldType>("text")
  const [required, setRequired] = useState(false)
  const [unique, setUnique] = useState(false)
  const [showInList, setShowInList] = useState(true)
  const [categoryId, setCategoryId] = useState<string>("")
  const [relationTargetId, setRelationTargetId] = useState<string>("")
  const [defaultRaw, setDefaultRaw] = useState<string>("")
  const [options, setOptions] = useState<string[]>([])
  const [cascaderOptions, setCascaderOptions] = useState<CatNode[]>([])
  const [openCategory, setOpenCategory] = useState(false)
  const [openSkillsConfig, setOpenSkillsConfig] = useState(false)
  
  // 字段分类相关状态
  const [fieldCategories, setFieldCategories] = useState<any[]>([])
  const [fieldCategoriesLoading, setFieldCategoriesLoading] = useState(false)

  // advanced relation state
  const [rel, setRel] = useState<RelationConfigValue>({
    moduleId: "",
    targetDirId: "",
    displayFieldKey: "",
    allowMultiple: false,
    bidirectional: false,
    allowDuplicate: false,
    filterExpr: "",
    hiddenFieldKeys: [],
  })

  // Sorting (drag)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // Preset + config
  const [preset, setPreset] = useState<PresetKey | null>(null)
  const [dateMode, setDateMode] = useState<"single" | "multiple" | "range">("single")

  // 用户选择预设（业务字段）
  const [userAllowMultiple, setUserAllowMultiple] = useState<boolean>(false)
  const [userNotifyNew, setUserNotifyNew] = useState<boolean>(false)

  // Add skills configuration state
  const [skillsConfig, setSkillsConfig] = useState({
    allowedCategories: ["技术", "运营", "管理"] as string[],
    maxSkills: undefined as number | undefined,
    showLevel: false,
    customCategories: [
      { id: "default_tech", name: "技术" },
      { id: "default_operation", name: "运营" },
      { id: "default_management", name: "管理" }
    ] as { id: string; name: string }[],
    customSkills: [] as { id: string; name: string; category: string }[],
  })

  // Add progress configuration state
  const [progressConfig, setProgressConfig] = useState({
    maxValue: 100,
    showPercentage: true,
    showProgressBar: true,
  })

  // Add custom experience configuration state
  const [customExperienceConfig, setCustomExperienceConfig] = useState({
    experienceName: "",
    eventName: "",
  })

  // Add identity verification configuration state
  const [identityVerificationConfig, setIdentityVerificationConfig] = useState({
    requireName: true,
    requireIdNumber: true,
    requireFrontPhoto: true,
    requireBackPhoto: true,
  })

  // Add other verification configuration state
  const [otherVerificationConfig, setOtherVerificationConfig] = useState({
    textFields: [] as { id: string; name: string; required: boolean }[],
    imageFields: [] as { id: string; name: string; required: boolean; multiple: boolean }[],
  })

  // Add certificate configuration state
  const [certificateConfig, setCertificateConfig] = useState({
    certificateNames: [] as string[],
    issuingAuthority: "",
    allowCustomCertificateName: false,
    allowCustomIssuingAuthority: false,
  })

  // Add image configuration state
  const [imageConfig, setImageConfig] = useState({
    multiple: false,
    defaultImage: "",
  })

  // Add video configuration state
  const [videoConfig, setVideoConfig] = useState({
    multiple: false,
    defaultVideo: "",
  })

  // Add boolean configuration state
  const [booleanConfig, setBooleanConfig] = useState({
    checkedLabel: "是",
    uncheckedLabel: "否",
    style: "switch" as "switch" | "checkbox" | "radio",
  })

  // Add multiselect configuration state
  const [multiselectConfig, setMultiselectConfig] = useState({
    minSelection: undefined as number | undefined,
    maxSelection: undefined as number | undefined,
  })

  // 获取字段分类数据
  const fetchFieldCategories = async () => {
    // ✅ 必须：API调用前检查必要参数
    if (!app?.id || !currentDir?.id) {
      console.warn("⚠️ 缺少必要参数，跳过字段分类获取:", { appId: app?.id, dirId: currentDir?.id })
      setFieldCategories([])
      return
    }

    try {
      setFieldCategoriesLoading(true)
      console.log("🔍 获取字段分类参数:", { appId: app.id, dirId: currentDir.id })
      
      const response = await fieldCategoriesApi.getFieldCategories({
        applicationId: app.id,
        directoryId: currentDir.id,
        enabled: true,
      })
      
      console.log("📡 字段分类API响应:", response)
      
      if (response.success && response.data?.categories) {
        setFieldCategories(response.data.categories)
      } else {
        console.error("获取字段分类失败:", response.error)
        setFieldCategories([])
      }
    } catch (error) {
      // ✅ 必须：为所有API调用添加try-catch错误处理
      console.error("获取字段分类出错:", error)
      
      // ✅ 必须：错误信息要用户友好
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          console.warn("🌐 网络连接问题，使用默认字段分类")
        } else {
          console.error("❌ API调用失败:", error.message)
        }
      }
      
      // ✅ 必须：错误恢复机制 - 使用默认数据而不是空数组
      setFieldCategories([])
    } finally {
      setFieldCategoriesLoading(false)
    }
  }

  // 初始化（支持编辑模式）
  useEffect(() => {
    if (!open) return
    
    // 获取字段分类数据
    fetchFieldCategories()
    
    if (mode === "edit" && initialDraft) {
      setLabel(initialDraft.label ?? "")
      setKey(initialDraft.key ?? "")
      setType((initialDraft.type as FieldType) ?? "text")
      setRequired(!!initialDraft.required)
      setUnique(!!initialDraft.unique)
      setShowInList(initialDraft.showInList !== false)
      setCategoryId(initialDraft.categoryId ?? "")
      setOptions(initialDraft.options ? [...initialDraft.options] : [])
      setDefaultRaw(initialDraft.defaultRaw || "")
      setRelationTargetId(initialDraft.relationTargetId || "")
      setRel((r) => ({
        ...r,
        moduleId: initialDraft.relationModuleId || "",
        targetDirId: initialDraft.relationTargetId || "",
        displayFieldKey: initialDraft.relationDisplayFieldKey || "",
        allowMultiple: initialDraft.type === "relation_many",
        bidirectional: !!initialDraft.relationBidirectional,
        allowDuplicate: !!initialDraft.relationAllowDuplicate,
      }))
      setPreset(initialDraft.preset ?? null)
      setDateMode((initialDraft.dateMode as any) || "single")
      setCascaderOptions(initialDraft.cascaderOptions ? JSON.parse(JSON.stringify(initialDraft.cascaderOptions)) : [])
      setUserAllowMultiple(!!initialDraft.userAllowMultiple)
      setUserNotifyNew(!!initialDraft.userNotifyNew)
      setOpenCategory(false)
      setDragIndex(null)
      const defaultSkillsConfig = {
        allowedCategories: ["技术", "运营", "管理"],
        maxSkills: undefined,
        showLevel: false,
        customCategories: [
          { id: "default_tech", name: "技术" },
          { id: "default_operation", name: "运营" },
          { id: "default_management", name: "管理" }
        ],
        customSkills: [],
      }
      setSkillsConfig(
        initialDraft.skillsConfig ? {
          ...defaultSkillsConfig,
          ...initialDraft.skillsConfig,
        } : defaultSkillsConfig,
      )
      const defaultProgressConfig = {
        maxValue: 100,
        showPercentage: true,
        showProgressBar: true,
      }
      setProgressConfig(
        initialDraft.progressConfig ? {
          ...defaultProgressConfig,
          ...initialDraft.progressConfig,
        } : defaultProgressConfig,
      )
      const defaultCustomExperienceConfig = {
        experienceName: "",
        eventName: "",
      }
      setCustomExperienceConfig(
        initialDraft.customExperienceConfig ? {
          ...defaultCustomExperienceConfig,
          ...initialDraft.customExperienceConfig,
        } : defaultCustomExperienceConfig,
      )
      const defaultIdentityVerificationConfig = {
        requireName: true,
        requireIdNumber: true,
        requireFrontPhoto: true,
        requireBackPhoto: true,
      }
      setIdentityVerificationConfig(
        initialDraft.identityVerificationConfig ? {
          ...defaultIdentityVerificationConfig,
          ...initialDraft.identityVerificationConfig,
        } : defaultIdentityVerificationConfig,
      )
      const defaultCertificateConfig = {
        certificateNames: [],
        issuingAuthority: "",
        allowCustomCertificateName: false,
        allowCustomIssuingAuthority: false,
      }
      setCertificateConfig(
        initialDraft.certificateConfig ? {
          ...defaultCertificateConfig,
          ...initialDraft.certificateConfig,
        } : defaultCertificateConfig,
      )
      const defaultOtherVerificationConfig = {
        textFields: [],
        imageFields: [],
      }
      setOtherVerificationConfig(
        initialDraft.otherVerificationConfig ? {
          ...defaultOtherVerificationConfig,
          ...initialDraft.otherVerificationConfig,
        } : defaultOtherVerificationConfig,
      )
      const defaultImageConfig = {
        multiple: false,
        defaultImage: "",
      }
      setImageConfig(
        initialDraft.imageConfig ? {
          ...defaultImageConfig,
          ...initialDraft.imageConfig,
        } : defaultImageConfig,
      )
      const defaultVideoConfig = {
        multiple: false,
        defaultVideo: "",
      }
      setVideoConfig(
        initialDraft.videoConfig ? {
          ...defaultVideoConfig,
          ...initialDraft.videoConfig,
        } : defaultVideoConfig,
      )
      const defaultBooleanConfig = {
        checkedLabel: "是",
        uncheckedLabel: "否",
        style: "switch" as "switch" | "checkbox" | "radio",
      }
      setBooleanConfig(
        initialDraft.booleanConfig ? {
          ...defaultBooleanConfig,
          ...initialDraft.booleanConfig,
        } : defaultBooleanConfig,
      )
      const defaultMultiselectConfig = {
        minSelection: undefined as number | undefined,
        maxSelection: undefined as number | undefined,
      }
      setMultiselectConfig(
        initialDraft.multiselectConfig ? {
          ...defaultMultiselectConfig,
          ...initialDraft.multiselectConfig,
        } : defaultMultiselectConfig,
      )
      return
    }
    // create 模式默认
    setLabel("")
    setKey("")
    setType("text")
    setRequired(false)
    setUnique(false)
    setShowInList(true)
    setCategoryId("")
    setRelationTargetId("")
    setDefaultRaw("")
    setOptions([])
    setCascaderOptions([])
    setOpenCategory(false)
    // reset preset configs
    setPreset(null)
    setDateMode("single")
    setUserAllowMultiple(false)
    setUserNotifyNew(false)
    setRel({
      moduleId: "",
      targetDirId: "",
      displayFieldKey: "",
      allowMultiple: false,
      bidirectional: false,
      allowDuplicate: false,
      filterExpr: "",
      hiddenFieldKeys: [],
    })
    setSkillsConfig({
      allowedCategories: ["技术", "运营", "管理"],
      maxSkills: undefined,
      showLevel: false,
      customCategories: [
        { id: "default_tech", name: "技术" },
        { id: "default_operation", name: "运营" },
        { id: "default_management", name: "管理" }
      ],
      customSkills: [],
    })
    setCertificateConfig({
      certificateNames: [],
      issuingAuthority: "",
      allowCustomCertificateName: false,
      allowCustomIssuingAuthority: false,
    })
    setOtherVerificationConfig({
      textFields: [],
      imageFields: [],
    })
    setImageConfig({
      multiple: false,
      defaultImage: "",
    })
    setVideoConfig({
      multiple: false,
      defaultVideo: "",
    })
    setBooleanConfig({
      checkedLabel: "是",
      uncheckedLabel: "否",
      style: "switch",
    })
    setMultiselectConfig({
      minSelection: undefined,
      maxSelection: undefined,
    })
  }, [open, mode, initialDraft])

  // Image upload helper
  const handleDefaultImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImageConfig(prev => ({ ...prev, defaultImage: result }))
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const removeDefaultImage = () => {
    setImageConfig(prev => ({ ...prev, defaultImage: "" }))
  }

  // Video upload helper
  const handleDefaultVideoUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "video/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setVideoConfig(prev => ({ ...prev, defaultVideo: result }))
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const removeDefaultVideo = () => {
    setVideoConfig(prev => ({ ...prev, defaultVideo: "" }))
  }

  // options helpers
  function addOption() {
    setOptions((arr) => [...arr, ""])
  }
  function updateOption(i: number, v: string) {
    setOptions((arr) => {
      const next = [...arr]
      next[i] = v
      return next
    })
  }
  function removeOption(i: number) {
    setOptions((arr) => arr.filter((_, idx) => idx !== i))
  }
  function handleDragStart(i: number) {
    setDragIndex(i)
  }
  function handleDragEnter(i: number) {
    setOptions((arr) => {
      if (dragIndex === null || dragIndex === i) return arr
      const next = [...arr]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(i, 0, moved)
      setDragIndex(i)
      return next
    })
  }
  function handleDragEnd() {
    setDragIndex(null)
  }

  useEffect(() => {
    if (!label) return
    if (!key) setKey(toKey(label))
  }, [label])

  const keyError = useMemo(() => {
    if (!KEY_RULE.test(key)) return i18n.keyInvalid
    if (existingKeys.includes(key)) return i18n.keyDuplicate
    return ""
  }, [key, existingKeys, i18n.keyInvalid, i18n.keyDuplicate])

  const canSubmit = useMemo(() => {
    if (!label.trim()) return false
    if (!!keyError) return false
    // For generic relation fields (not user_select), require target table
    if ((type === "relation_one" || type === "relation_many") && preset !== "user_select") {
      if (!rel.targetDirId) return false
    }
    if (type === "cascader" && (cascaderOptions?.length || 0) === 0) return false
    return canEdit
  }, [label, keyError, type, canEdit, cascaderOptions, preset, rel.targetDirId])

  const BASIC_TYPES: FieldType[] = [
    "text",
    "textarea",
    "number",
    "select",
    "multiselect",
    "boolean",
    "checkbox",
    "date",
    "time",
    "tags",
    "image",
    "video",
    "file",
    "richtext",
  ]

  const BUSINESS_TYPES: FieldType[] = [
    "profile",
  ]

  const asideWrapCls =
    "rounded-xl border border-white/60 bg-white/60 p-2 max-h-[70vh] overflow-auto scrollbar-thin scrollbar-thumb-slate-200"

  const tOr = (val: string | undefined, fallback: string) => (val && val.trim() ? val : fallback)

  // 自动为"选择用户"预设定位用户列表
  useEffect(() => {
    if (!app) return
    if (preset === "user_select") {
      const t =
        app.modules
          .flatMap((m) => m.directories.map((d) => ({ m: m.name, d })))
          .find((x) => x.d.type === "table" && /用户列表/.test(x.d.name))?.d.id || ""
      setRelationTargetId(t)
      setRel((r) => ({
        ...r,
        moduleId: app.modules.find((m) => m.directories.some((d) => d.id === t))?.id || "",
        targetDirId: t,
      }))
    }
  }, [preset, app])

  useEffect(() => {
    if (preset === "user_select") {
      setType(userAllowMultiple ? "relation_many" : "relation_one")
    }
  }, [preset, userAllowMultiple])

  // 处理经历类预设
  useEffect(() => {
    if (
      preset &&
      ["work_experience", "education_experience", "project_experience", "certificate_experience"].includes(preset)
    ) {
      setType("experience")
    }
  }, [preset])

  // 处理星座预设
  useEffect(() => {
    if (preset === "constellation") {
      setType("select")
      setOptions([
        "白羊座",
        "金牛座",
        "双子座",
        "巨蟹座",
        "狮子座",
        "处女座",
        "天秤座",
        "天蝎座",
        "射手座",
        "摩羯座",
        "水瓶座",
        "双鱼座",
      ])
    }
  }, [preset])

  // Update the skills preset handling:
  useEffect(() => {
    if (preset === "skills") {
      setType("multiselect")
      // Don't set static options anymore, use dynamic skills data
      setOptions([])
    }
  }, [preset])

  // Handle new presets
  useEffect(() => {
    if (preset === "barcode") {
      setType("text")
    }
    if (preset === "cascader") {
      setType("cascader")
    }
    if (preset === "relation") {
      setType("relation_one")
    }
  }, [preset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[1040px] bg-white/70 backdrop-blur border-white/60"
        aria-describedby="add-field-description"
      >
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? (locale === "zh" ? "编辑字段" : "Edit Field") : i18n.title}</DialogTitle>
        </DialogHeader>
        <div id="add-field-description" className="sr-only">
          {mode === "edit"
            ? "Modify field properties and configuration"
            : "Create a new field by selecting a type and configuring its properties"}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
          {/* Left: 类型选择（可滚动） */}
          <aside className={asideWrapCls}>
            <div className="space-y-3">
              <div>
                <div className="px-2 pb-1 text-xs text-slate-500">{locale === "zh" ? "基础字段" : "Basic Fields"}</div>
                <div className="space-y-2">
                  {BASIC_TYPES.map((tp) => (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => {
                        setType(tp)
                        setPreset(null)
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left bg-white/70 hover:bg-white/90 transition",
                        type === tp && !preset
                          ? "outline outline-2 outline-blue-200 border-blue-200"
                          : "border-white/60",
                      )}
                      title={typeNames[tp] || tp}
                    >
                      {TYPE_ICON[tp]}
                      <span className="text-sm">{typeNames[tp] || tp}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="px-2 pb-1 text-xs text-slate-500">{locale === "zh" ? "业务字段" : "Business Fields"}</div>
                <div className="space-y-2">
                  {BUSINESS_TYPES.map((tp) => (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => {
                        setType(tp)
                        setPreset(null)
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left bg-white/70 hover:bg-white/90 transition",
                        type === tp && !preset
                          ? "outline outline-2 outline-blue-200 border-blue-200"
                          : "border-white/60",
                      )}
                      title={typeNames[tp] || tp}
                    >
                      {TYPE_ICON[tp]}
                      <span className="text-sm">{typeNames[tp] || tp}</span>
                    </button>
                  ))}
                  {getLocalizedPresets(locale).map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => {
                        setPreset(p.key)
                        setType(p.baseType)
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left bg-white/70 hover:bg-white/90 transition",
                        preset === p.key ? "outline outline-2 outline-blue-200 border-blue-200" : "border-white/60",
                      )}
                      title={p.label}
                    >
                      {PRESET_ICON[p.key]}
                      <div className="flex-1 text-left">
                        <div className="text-sm">{p.label}</div>
                        {p.desc && <div className="text-xs text-slate-500">{p.desc}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right: 设置表单 */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-3">
              <div className="text-sm text-slate-700">{i18n.displayName}</div>
              <div className="flex items-center gap-2">
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={i18n.displayNamePh}
                  className="bg-white/80"
                />
                {type === "cascader" && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-1"
                    onClick={() => setOpenCategory(true)}
                    title={locale === "zh" ? "配置级联选项" : "Configure Cascader Options"}
                  >
                    <SettingsIcon className="size-4" />
                    {locale === "zh" ? "配置级联选项" : "Configure Cascader"}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-3">
              <div className="text-sm text-slate-700">{i18n.key}</div>
              <div className="space-y-1">
                <Input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={i18n.keyPh}
                  className={cn("bg-white/80", keyError && "border-red-300")}
                />
                {keyError && <div className="text-xs text-red-600">{keyError}</div>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-3">
              <div className="text-sm text-slate-700">{locale === "zh" ? "字段分类" : "Field Category"}</div>
              <Select value={categoryId || "none"} onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}>
                <SelectTrigger className="bg-white/80">
                  <SelectValue placeholder={locale === "zh" ? "选择字段分类" : "Select field category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无分类</SelectItem>
                  {fieldCategoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      {locale === "zh" ? "加载中..." : "Loading..."}
                    </SelectItem>
                  ) : fieldCategories.length > 0 ? (
                    fieldCategories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    DEFAULT_FIELD_CATEGORIES.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-3">
              <div className="text-sm text-slate-700">{i18n.dataType}</div>
              <div className="inline-flex items-center gap-2">
                <span className="text-sm rounded-full border border-white/60 bg-white/80 px-2 py-0.5">
                  {TYPE_TO_DTYPE[type]}
                </span>
                {preset && (
                  <span className="text-xs rounded-full border border-blue-200 bg-blue-50 text-blue-700 px-2 py-0.5">
                    {locale === "zh" ? "预设：" : "Preset: "}{getLocalizedPresets(locale).find((p) => p.key === preset)?.label}
                  </span>
                )}
                {categoryId && (
                  <span className="text-xs rounded-full border border-green-200 bg-green-50 text-green-700 px-2 py-0.5">
                    {(() => {
                      // 优先从API数据中查找分类名称
                      const apiCategory = fieldCategories.find((cat: any) => cat.id === categoryId)
                      if (apiCategory) {
                        return apiCategory.name
                      }
                      // 如果API数据中没有，则从默认数据中查找
                      return getCategoryName(categoryId)
                    })()}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
                <div className="space-y-0.5">
                  <div className="text-sm">{i18n.required}</div>
                  <div className="text-xs text-muted-foreground">{i18n.requiredHint}</div>
                </div>
                <Switch checked={required} onCheckedChange={setRequired} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
                <div className="space-y-0.5">
                  <div className="text-sm">{i18n.unique}</div>
                  <div className="text-xs text-muted-foreground">{i18n.uniqueHint}</div>
                </div>
                <Switch checked={unique} onCheckedChange={setUnique} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
                <div className="space-y-0.5">
                  <div className="text-sm">{i18n.showInList}</div>
                  <div className="text-xs text-muted-foreground">{i18n.showInListHint}</div>
                </div>
                <Switch checked={showInList} onCheckedChange={setShowInList} />
              </div>
            </div>

            {/* 日期模式 */}
            {type === "date" && (
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-3">
                <div className="text-sm text-slate-700">{locale === "zh" ? "日期模式" : "Date Mode"}</div>
                <Select value={dateMode} onValueChange={(v) => setDateMode(v as any)}>
                  <SelectTrigger className="bg-white/80">
                    <SelectValue placeholder={locale === "zh" ? "选择模式" : "Select Mode"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">{locale === "zh" ? "单个日期" : "Single Date"}</SelectItem>
                    <SelectItem value="multiple">{locale === "zh" ? "多个日期" : "Multiple Dates"}</SelectItem>
                    <SelectItem value="range">{locale === "zh" ? "日期区间" : "Date Range"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 图片字段配置 */}
            {type === "image" && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
                <div className="text-sm font-medium text-gray-800">{locale === "zh" ? "图片字段配置" : "Image Field Configuration"}</div>
                
                {/* 单图/多图选项 */}
                <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
                  <div className="space-y-0.5">
                    <div className="text-sm">{locale === "zh" ? "多图上传" : "Multiple Images"}</div>
                    <div className="text-xs text-muted-foreground">{locale === "zh" ? "开启后支持上传多张图片" : "Enable to allow multiple image uploads"}</div>
                  </div>
                  <Switch 
                    checked={imageConfig.multiple} 
                    onCheckedChange={(v) => setImageConfig(prev => ({ ...prev, multiple: v }))} 
                  />
                </div>

                {/* 默认图片 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">{locale === "zh" ? "默认图片" : "Default Image"}</div>
                  <div className="text-xs text-gray-500 mb-2">{locale === "zh" ? "可选：为字段设置一个默认图片" : "Optional: Set a default image for this field"}</div>
                  
                  {imageConfig.defaultImage ? (
                    <div className="relative inline-block">
                      <img
                        src={imageConfig.defaultImage}
                        alt={locale === "zh" ? "默认图片" : "Default image"}
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={removeDefaultImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-gray-300 rounded">
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDefaultImageUpload}
                        className="gap-1 text-xs"
                      >
                        <Upload className="h-3 w-3" />
                        {locale === "zh" ? "上传" : "Upload"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* 预览 */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-xs text-gray-700 mb-2">{locale === "zh" ? "预览" : "Preview"}</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      {locale === "zh" ? "上传模式：" : "Upload Mode: "}
                      <span className={imageConfig.multiple ? "text-blue-600" : "text-green-600"}>
                        {imageConfig.multiple 
                          ? (locale === "zh" ? "多图" : "Multiple") 
                          : (locale === "zh" ? "单图" : "Single")
                        }
                      </span>
                    </div>
                    <div>
                      {locale === "zh" ? "默认图片：" : "Default Image: "}
                      <span className={imageConfig.defaultImage ? "text-green-600" : "text-gray-400"}>
                        {imageConfig.defaultImage 
                          ? (locale === "zh" ? "已设置" : "Set") 
                          : (locale === "zh" ? "未设置" : "Not set")
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 标识字段配置 */}
            {type === "profile" && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
                <div className="text-sm font-medium text-gray-800">{locale === "zh" ? "标识字段配置" : "Profile Field Configuration"}</div>
                
                {/* 单图/多图选项 */}
                <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
                  <div className="space-y-0.5">
                    <div className="text-sm">{locale === "zh" ? "多图上传" : "Multiple Images"}</div>
                    <div className="text-xs text-muted-foreground">{locale === "zh" ? "开启后支持上传多张标识图片" : "Enable to allow multiple profile image uploads"}</div>
                  </div>
                  <Switch 
                    checked={imageConfig.multiple} 
                    onCheckedChange={(v) => setImageConfig(prev => ({ ...prev, multiple: v }))} 
                  />
                </div>
                
                {/* 默认图片 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">{locale === "zh" ? "默认标识" : "Default Profile"}</div>
                  <div className="text-xs text-gray-500 mb-2">{locale === "zh" ? "可选：为字段设置一个默认标识图片" : "Optional: Set a default profile image for this field"}</div>
                  
                  {imageConfig.defaultImage ? (
                    <div className="relative inline-block">
                      <img
                        src={imageConfig.defaultImage}
                        alt={locale === "zh" ? "默认标识" : "Default profile"}
                        className="w-16 h-16 object-cover rounded-full border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                        onClick={removeDefaultImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-16 w-16 border-2 border-dashed border-gray-300 rounded-full">
                      <User className="h-6 w-6 text-gray-400 mb-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDefaultImageUpload}
                        className="gap-1 text-xs"
                      >
                        <Upload className="h-3 w-3" />
                        {locale === "zh" ? "上传" : "Upload"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* 预览 */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-xs text-gray-700 mb-2">{locale === "zh" ? "预览" : "Preview"}</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      {locale === "zh" ? "上传模式：" : "Upload Mode: "}
                      <span className={imageConfig.multiple ? "text-blue-600" : "text-green-600"}>
                        {imageConfig.multiple 
                          ? (locale === "zh" ? "多图" : "Multiple") 
                          : (locale === "zh" ? "单图" : "Single")
                        }
                      </span>
                    </div>
                    <div>
                      {locale === "zh" ? "显示样式：" : "Display Style: "}
                      <span className="text-blue-600">
                        {locale === "zh" ? "圆形标识" : "Circular Profile"}
                      </span>
                    </div>
                    <div>
                      {locale === "zh" ? "默认标识：" : "Default Profile: "}
                      <span className={imageConfig.defaultImage ? "text-green-600" : "text-gray-400"}>
                        {imageConfig.defaultImage 
                          ? (locale === "zh" ? "已设置" : "Set") 
                          : (locale === "zh" ? "未设置" : "Not set")
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 视频字段配置 */}
            {type === "video" && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
                <div className="text-sm font-medium text-gray-800">{locale === "zh" ? "视频字段配置" : "Video Field Configuration"}</div>
                
                {/* 单视频/多视频选项 */}
                <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
                  <div className="space-y-0.5">
                    <div className="text-sm">{locale === "zh" ? "多视频上传" : "Multiple Videos"}</div>
                    <div className="text-xs text-muted-foreground">{locale === "zh" ? "开启后支持上传多个视频" : "Enable to allow multiple video uploads"}</div>
                  </div>
                  <Switch 
                    checked={videoConfig.multiple} 
                    onCheckedChange={(v) => setVideoConfig(prev => ({ ...prev, multiple: v }))} 
                  />
                </div>

                {/* 默认视频 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">{locale === "zh" ? "默认视频" : "Default Video"}</div>
                  <div className="text-xs text-gray-500 mb-2">{locale === "zh" ? "可选：为字段设置一个默认视频" : "Optional: Set a default video for this field"}</div>
                  
                  {videoConfig.defaultVideo ? (
                    <div className="relative inline-block">
                      <video
                        src={videoConfig.defaultVideo}
                        className="w-32 h-24 object-cover rounded border"
                        controls
                        preload="metadata"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={removeDefaultVideo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 w-32 border-2 border-dashed border-gray-300 rounded">
                      <Video className="h-8 w-8 text-gray-400 mb-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDefaultVideoUpload}
                        className="gap-1 text-xs"
                      >
                        <Upload className="h-3 w-3" />
                        {locale === "zh" ? "上传" : "Upload"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* 预览 */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-xs text-gray-700 mb-2">{locale === "zh" ? "预览" : "Preview"}</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      {locale === "zh" ? "上传模式：" : "Upload Mode: "}
                      <span className={videoConfig.multiple ? "text-blue-600" : "text-green-600"}>
                        {videoConfig.multiple 
                          ? (locale === "zh" ? "多视频" : "Multiple") 
                          : (locale === "zh" ? "单视频" : "Single")
                        }
                      </span>
                    </div>
                    <div>
                      {locale === "zh" ? "默认视频：" : "Default Video: "}
                      <span className={videoConfig.defaultVideo ? "text-green-600" : "text-gray-400"}>
                        {videoConfig.defaultVideo 
                          ? (locale === "zh" ? "已设置" : "Set") 
                          : (locale === "zh" ? "未设置" : "Not set")
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 通用关联字段的高级配置（模块→表→列 + 开关） */}
            {(type === "relation_one" || type === "relation_many") && app && preset !== "user_select" && (
              <div className="space-y-2">
                <RelationConfig
                  app={app}
                  value={rel}
                  onChange={(patch) => {
                    setRel((r) => ({ ...r, ...patch }))
                    if (patch.targetDirId !== undefined) {
                      setRelationTargetId(patch.targetDirId || "")
                    }
                  }}
                  onToggleMultiple={(allow) => {
                    setType(allow ? "relation_many" : "relation_one")
                  }}
                />
              </div>
            )}

            {/* 选择用户预设 */}
            {preset === "user_select" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
                  <div className="space-y-0.5">
                    <div className="text-sm">{locale === "zh" ? "允许选择多个联系人" : "Allow Multiple Contacts"}</div>
                    <div className="text-xs text-muted-foreground">{locale === "zh" ? "开启后可选择多个系统用户" : "Enable to select multiple system users"}</div>
                  </div>
                  <Switch checked={userAllowMultiple} onCheckedChange={(v) => setUserAllowMultiple(v)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/60 bg-white/70 px-3 py-2">
                  <div className="space-y-0.5">
                    <div className="text-sm">{locale === "zh" ? "允许向新插入的联系人发送通知" : "Allow Notifications to New Contacts"}</div>
                    <div className="text-xs text-muted-foreground">{locale === "zh" ? "新增联系人后发送通知（示意）" : "Send notification after adding new contact (demo)"}</div>
                  </div>
                  <Switch checked={userNotifyNew} onCheckedChange={(v) => setUserNotifyNew(v)} />
                </div>
              </div>
            )}

            {preset === "skills" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-blue-800">{locale === "zh" ? "技能字段配置" : "Skills Field Configuration"}</div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => setOpenSkillsConfig(true)}
                    >
                      <SettingsIcon className="size-3" />
                      {locale === "zh" ? "高级配置" : "Advanced Config"}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-blue-700 mb-1 block">{locale === "zh" ? "允许的技能分类" : "Allowed Skill Categories"}</label>
                      <div className="flex flex-wrap gap-2">
                        {skillsConfig.customCategories.map((category) => (
                          <label key={category.id} className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={skillsConfig.allowedCategories.includes(category.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSkillsConfig((prev) => ({
                                    ...prev,
                                    allowedCategories: [...prev.allowedCategories, category.name],
                                  }))
                                } else {
                                  setSkillsConfig((prev) => ({
                                    ...prev,
                                    allowedCategories: prev.allowedCategories.filter((c) => c !== category.name),
                                  }))
                                }
                              }}
                              className="rounded"
                            />
                            {category.name}
                          </label>
                        ))}
                      </div>
                      {skillsConfig.allowedCategories.length === 0 && (
                        <div className="text-xs text-blue-600 mt-1">{locale === "zh" ? "未选择时允许所有分类" : "Allow all categories when none selected"}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-blue-700 mb-1 block">{locale === "zh" ? "最大技能数量" : "Maximum Skills Count"}</label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={skillsConfig.maxSkills || ""}
                          onChange={(e) =>
                            setSkillsConfig((prev) => ({
                              ...prev,
                              maxSkills: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                          placeholder={locale === "zh" ? "不限制" : "No limit"}
                          className="h-8 text-xs bg-white/80"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={skillsConfig.showLevel}
                          onCheckedChange={(checked) =>
                            setSkillsConfig((prev) => ({
                              ...prev,
                              showLevel: checked,
                            }))
                          }
                        />
                        <label className="text-xs text-blue-700">{locale === "zh" ? "显示技能等级" : "Show Skill Level"}</label>
                      </div>
                    </div>

                    {/* 自定义分类和技能预览 */}
                    {(skillsConfig.customCategories.length > 0 || skillsConfig.customSkills.length > 0) && (
                      <div className="border-t border-blue-200 pt-2">
                        <div className="text-xs text-blue-700 mb-1">{locale === "zh" ? "自定义配置" : "Custom Configuration"}</div>
                        <div className="text-xs text-blue-600">
                          {skillsConfig.customCategories.length > 0 && (
                            <div>{locale === "zh" ? `自定义分类：${skillsConfig.customCategories.length} 个` : `Custom Categories: ${skillsConfig.customCategories.length}`}</div>
                          )}
                          {skillsConfig.customSkills.length > 0 && (
                            <div>{locale === "zh" ? `自定义技能：${skillsConfig.customSkills.length} 个` : `Custom Skills: ${skillsConfig.customSkills.length}`}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 进度字段配置 */}
            {preset === "progress" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <div className="text-sm font-medium text-blue-800 mb-3">{locale === "zh" ? "进度字段配置" : "Progress Field Configuration"}</div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-blue-700 mb-1 block">{locale === "zh" ? "最大值" : "Maximum Value"}</label>
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      value={progressConfig.maxValue || 100}
                      onChange={(e) =>
                        setProgressConfig((prev) => ({
                          ...prev,
                          maxValue: e.target.value ? Number(e.target.value) : 100,
                        }))
                      }
                      placeholder="100"
                      className="h-8 text-xs bg-white/80"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={progressConfig.showPercentage}
                        onCheckedChange={(checked) =>
                          setProgressConfig((prev) => ({
                            ...prev,
                            showPercentage: checked,
                          }))
                        }
                      />
                      <label className="text-xs text-blue-700">{locale === "zh" ? "显示百分比" : "Show Percentage"}</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={progressConfig.showProgressBar}
                        onCheckedChange={(checked) =>
                          setProgressConfig((prev) => ({
                            ...prev,
                            showProgressBar: checked,
                          }))
                        }
                      />
                      <label className="text-xs text-blue-700">{locale === "zh" ? "显示进度条" : "Show Progress Bar"}</label>
                    </div>
                  </div>

                  {/* 进度字段预览 */}
                  <div className="border-t border-blue-200 pt-2">
                    <div className="text-xs text-blue-700 mb-2">{locale === "zh" ? "预览" : "Preview"}</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                            style={{
                              width: `${Math.min(75, progressConfig.maxValue || 100)}%`
                            }}
                          />
                        </div>
                        {progressConfig.showPercentage && (
                          <span className="text-xs text-blue-700 w-12 text-right">75%</span>
                        )}
                      </div>
                      <div className="text-xs text-blue-600">
                        {locale === "zh" ? `当前值：75 / ${progressConfig.maxValue || 100}` : `Current: 75 / ${progressConfig.maxValue || 100}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 经历字段说明 */}
            {type === "experience" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <div className="text-sm font-medium text-blue-800 mb-1">{locale === "zh" ? "经历字段说明" : "Experience Field Description"}</div>
                <div className="text-xs text-blue-600">
                  {locale === "zh" ? "经历字段支持添加工作经历、教育经历、项目经历和证书资质等信息，包含时间范围、描述、技能标签等详细内容。" : "Experience fields support adding work experience, education experience, project experience and certificates, including time range, description, skill tags and other detailed content."}
                </div>
              </div>
            )}

            {/* 证书资质配置 */}
            {preset === "certificate_experience" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <div className="text-sm font-medium text-blue-800 mb-3">{locale === "zh" ? "证书资质配置" : "Certificate Configuration"}</div>

                <div className="space-y-4">
                  {/* 证书名称配置 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={certificateConfig.allowCustomCertificateName}
                        onCheckedChange={(checked) =>
                          setCertificateConfig((prev) => ({
                            ...prev,
                            allowCustomCertificateName: checked,
                          }))
                        }
                      />
                      <label className="text-xs text-blue-700">{locale === "zh" ? "允许用户自定义证书名称" : "Allow users to customize certificate name"}</label>
                    </div>
                    {!certificateConfig.allowCustomCertificateName && (
                      <div className="space-y-2">
                        <label className="text-xs text-blue-700 mb-1 block">{locale === "zh" ? "预设证书名称选项" : "Preset Certificate Name Options"}</label>
                        <div className="space-y-2">
                          {certificateConfig.certificateNames.map((name, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={name}
                                onChange={(e) => {
                                  const newNames = [...certificateConfig.certificateNames]
                                  newNames[index] = e.target.value
                                  setCertificateConfig((prev) => ({
                                    ...prev,
                                    certificateNames: newNames,
                                  }))
                                }}
                                placeholder={locale === "zh" ? "证书名称" : "Certificate name"}
                                className="flex-1 h-8 text-xs bg-white/80"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newNames = certificateConfig.certificateNames.filter((_, i) => i !== index)
                                  setCertificateConfig((prev) => ({
                                    ...prev,
                                    certificateNames: newNames,
                                  }))
                                }}
                                className="h-8 w-8 p-0 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCertificateConfig((prev) => ({
                                ...prev,
                                certificateNames: [...prev.certificateNames, ""],
                              }))
                            }}
                            className="h-8 text-xs"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {locale === "zh" ? "添加证书选项" : "Add Certificate Option"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 颁发单位配置 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={certificateConfig.allowCustomIssuingAuthority}
                        onCheckedChange={(checked) =>
                          setCertificateConfig((prev) => ({
                            ...prev,
                            allowCustomIssuingAuthority: checked,
                          }))
                        }
                      />
                      <label className="text-xs text-blue-700">{locale === "zh" ? "允许用户自定义颁发单位" : "Allow users to customize issuing authority"}</label>
                    </div>
                    {!certificateConfig.allowCustomIssuingAuthority && (
                      <div>
                        <label className="text-xs text-blue-700 mb-1 block">{locale === "zh" ? "默认颁发单位" : "Default Issuing Authority"}</label>
                        <Input
                          value={certificateConfig.issuingAuthority}
                          onChange={(e) =>
                            setCertificateConfig((prev) => ({
                              ...prev,
                              issuingAuthority: e.target.value,
                            }))
                          }
                          placeholder={locale === "zh" ? "例如：教育部考试中心" : "e.g. Ministry of Education Examination Center"}
                          className="h-8 text-xs bg-white/80"
                        />
                      </div>
                    )}
                  </div>

                  {/* 证书资质预览 */}
                  <div className="border-t border-blue-200 pt-2">
                    <div className="text-xs text-blue-700 mb-2">{locale === "zh" ? "预览" : "Preview"}</div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>
                        {locale === "zh" ? "证书名称：" : "Certificate Name: "}
                        {certificateConfig.allowCustomCertificateName 
                          ? (locale === "zh" ? "用户自定义" : "User customizable")
                          : certificateConfig.certificateNames.length > 0
                            ? `${certificateConfig.certificateNames.length} ${locale === "zh" ? "个选项" : "options"}`
                            : (locale === "zh" ? "未设置" : "Not set")
                        }
                      </div>
                      <div>
                        {locale === "zh" ? "颁发单位：" : "Issuing Authority: "}
                        {certificateConfig.allowCustomIssuingAuthority 
                          ? (locale === "zh" ? "用户自定义" : "User customizable")
                          : (certificateConfig.issuingAuthority || (locale === "zh" ? "未设置" : "Not set"))
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 其他认证配置 */}
            {preset === "other_verification" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <div className="text-sm font-medium text-blue-800 mb-3">{locale === "zh" ? "其他认证配置" : "Other Verification Configuration"}</div>

                <div className="space-y-4">
                  {/* 文字字段配置 */}
                  <div className="space-y-2">
                    <div className="text-xs text-blue-700 font-medium">{locale === "zh" ? "文字字段" : "Text Fields"}</div>
                    <div className="space-y-2">
                      {otherVerificationConfig.textFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                          <Input
                            value={field.name}
                            onChange={(e) => {
                              const newFields = [...otherVerificationConfig.textFields]
                              newFields[index] = { ...newFields[index], name: e.target.value }
                              setOtherVerificationConfig((prev) => ({
                                ...prev,
                                textFields: newFields,
                              }))
                            }}
                            placeholder={locale === "zh" ? "字段名称" : "Field name"}
                            className="flex-1 h-8 text-xs bg-white/80"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => {
                                const newFields = [...otherVerificationConfig.textFields]
                                newFields[index] = { ...newFields[index], required: e.target.checked }
                                setOtherVerificationConfig((prev) => ({
                                  ...prev,
                                  textFields: newFields,
                                }))
                              }}
                              className="rounded"
                            />
                            <span className="text-xs text-blue-700">{locale === "zh" ? "必填" : "Required"}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFields = otherVerificationConfig.textFields.filter((_, i) => i !== index)
                              setOtherVerificationConfig((prev) => ({
                                ...prev,
                                textFields: newFields,
                              }))
                            }}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOtherVerificationConfig((prev) => ({
                            ...prev,
                            textFields: [...prev.textFields, {
                              id: `text_${Date.now()}`,
                              name: "",
                              required: false,
                            }],
                          }))
                        }}
                        className="h-8 text-xs"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {locale === "zh" ? "添加文字字段" : "Add Text Field"}
                      </Button>
                    </div>
                  </div>

                  {/* 图片字段配置 */}
                  <div className="space-y-2">
                    <div className="text-xs text-blue-700 font-medium">{locale === "zh" ? "图片字段" : "Image Fields"}</div>
                    <div className="space-y-2">
                      {otherVerificationConfig.imageFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                          <Input
                            value={field.name}
                            onChange={(e) => {
                              const newFields = [...otherVerificationConfig.imageFields]
                              newFields[index] = { ...newFields[index], name: e.target.value }
                              setOtherVerificationConfig((prev) => ({
                                ...prev,
                                imageFields: newFields,
                              }))
                            }}
                            placeholder={locale === "zh" ? "字段名称" : "Field name"}
                            className="flex-1 h-8 text-xs bg-white/80"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => {
                                const newFields = [...otherVerificationConfig.imageFields]
                                newFields[index] = { ...newFields[index], required: e.target.checked }
                                setOtherVerificationConfig((prev) => ({
                                  ...prev,
                                  imageFields: newFields,
                                }))
                              }}
                              className="rounded"
                            />
                            <span className="text-xs text-blue-700">{locale === "zh" ? "必填" : "Required"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={field.multiple}
                              onChange={(e) => {
                                const newFields = [...otherVerificationConfig.imageFields]
                                newFields[index] = { ...newFields[index], multiple: e.target.checked }
                                setOtherVerificationConfig((prev) => ({
                                  ...prev,
                                  imageFields: newFields,
                                }))
                              }}
                              className="rounded"
                            />
                            <span className="text-xs text-blue-700">{locale === "zh" ? "多图" : "Multiple"}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFields = otherVerificationConfig.imageFields.filter((_, i) => i !== index)
                              setOtherVerificationConfig((prev) => ({
                                ...prev,
                                imageFields: newFields,
                              }))
                            }}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOtherVerificationConfig((prev) => ({
                            ...prev,
                            imageFields: [...prev.imageFields, {
                              id: `image_${Date.now()}`,
                              name: "",
                              required: false,
                              multiple: false,
                            }],
                          }))
                        }}
                        className="h-8 text-xs"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {locale === "zh" ? "添加图片字段" : "Add Image Field"}
                      </Button>
                    </div>
                  </div>

                  {/* 其他认证预览 */}
                  <div className="border-t border-blue-200 pt-2">
                    <div className="text-xs text-blue-700 mb-2">{locale === "zh" ? "预览" : "Preview"}</div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>
                        {locale === "zh" ? "文字字段：" : "Text Fields: "}
                        {otherVerificationConfig.textFields.length > 0 
                          ? `${otherVerificationConfig.textFields.length} ${locale === "zh" ? "个" : ""}`
                          : (locale === "zh" ? "无" : "None")
                        }
                      </div>
                      <div>
                        {locale === "zh" ? "图片字段：" : "Image Fields: "}
                        {otherVerificationConfig.imageFields.length > 0 
                          ? `${otherVerificationConfig.imageFields.length} ${locale === "zh" ? "个" : ""}`
                          : (locale === "zh" ? "无" : "None")
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 实名认证配置 */}
            {preset === "identity_verification" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <div className="text-sm font-medium text-blue-800 mb-3">{locale === "zh" ? "实名认证配置" : "Identity Verification Configuration"}</div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={identityVerificationConfig.requireName}
                        onCheckedChange={(checked) =>
                          setIdentityVerificationConfig((prev) => ({
                            ...prev,
                            requireName: checked,
                          }))
                        }
                      />
                      <label className="text-xs text-blue-700">{locale === "zh" ? "需要姓名" : "Require Name"}</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={identityVerificationConfig.requireIdNumber}
                        onCheckedChange={(checked) =>
                          setIdentityVerificationConfig((prev) => ({
                            ...prev,
                            requireIdNumber: checked,
                          }))
                        }
                      />
                      <label className="text-xs text-blue-700">{locale === "zh" ? "需要身份证号" : "Require ID Number"}</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={identityVerificationConfig.requireFrontPhoto}
                        onCheckedChange={(checked) =>
                          setIdentityVerificationConfig((prev) => ({
                            ...prev,
                            requireFrontPhoto: checked,
                          }))
                        }
                      />
                      <label className="text-xs text-blue-700">{locale === "zh" ? "需要正面照片" : "Require Front Photo"}</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={identityVerificationConfig.requireBackPhoto}
                        onCheckedChange={(checked) =>
                          setIdentityVerificationConfig((prev) => ({
                            ...prev,
                            requireBackPhoto: checked,
                          }))
                        }
                      />
                      <label className="text-xs text-blue-700">{locale === "zh" ? "需要反面照片" : "Require Back Photo"}</label>
                    </div>
                  </div>

                  {/* 实名认证预览 */}
                  <div className="border-t border-blue-200 pt-2">
                    <div className="text-xs text-blue-700 mb-2">{locale === "zh" ? "预览" : "Preview"}</div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>{locale === "zh" ? "姓名：" : "Name: "}{identityVerificationConfig.requireName ? (locale === "zh" ? "必填" : "Required") : (locale === "zh" ? "可选" : "Optional")}</div>
                      <div>{locale === "zh" ? "身份证号：" : "ID Number: "}{identityVerificationConfig.requireIdNumber ? (locale === "zh" ? "必填" : "Required") : (locale === "zh" ? "可选" : "Optional")}</div>
                      <div>{locale === "zh" ? "正面照片：" : "Front Photo: "}{identityVerificationConfig.requireFrontPhoto ? (locale === "zh" ? "必填" : "Required") : (locale === "zh" ? "可选" : "Optional")}</div>
                      <div>{locale === "zh" ? "反面照片：" : "Back Photo: "}{identityVerificationConfig.requireBackPhoto ? (locale === "zh" ? "必填" : "Required") : (locale === "zh" ? "可选" : "Optional")}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 其他经历配置 */}
            {preset === "custom_experience" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <div className="text-sm font-medium text-blue-800 mb-3">{locale === "zh" ? "其他经历配置" : "Custom Experience Configuration"}</div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-blue-700 mb-1 block">{locale === "zh" ? "经历名称" : "Experience Name"}</label>
                    <Input
                      value={customExperienceConfig.experienceName}
                      onChange={(e) =>
                        setCustomExperienceConfig((prev) => ({
                          ...prev,
                          experienceName: e.target.value,
                        }))
                      }
                      placeholder={locale === "zh" ? "例如：志愿服务、竞赛获奖、培训经历" : "e.g. Volunteer Service, Competition Awards, Training Experience"}
                      className="h-8 text-xs bg-white/80"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-blue-700 mb-1 block">{locale === "zh" ? "事件名称" : "Event Name"}</label>
                    <Input
                      value={customExperienceConfig.eventName}
                      onChange={(e) =>
                        setCustomExperienceConfig((prev) => ({
                          ...prev,
                          eventName: e.target.value,
                        }))
                      }
                      placeholder={locale === "zh" ? "例如：活动名称、项目名称、证书名称" : "e.g. Activity Name, Project Name, Certificate Name"}
                      className="h-8 text-xs bg-white/80"
                    />
                  </div>

                  {/* 其他经历预览 */}
                  <div className="border-t border-blue-200 pt-2">
                    <div className="text-xs text-blue-700 mb-2">{locale === "zh" ? "预览" : "Preview"}</div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>{locale === "zh" ? "经历名称：" : "Experience Name: "}{customExperienceConfig.experienceName || (locale === "zh" ? "未设置" : "Not set")}</div>
                      <div>{locale === "zh" ? "事件名称：" : "Event Name: "}{customExperienceConfig.eventName || (locale === "zh" ? "未设置" : "Not set")}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* boolean/checkbox 配置 */}
            {(type === "boolean" || type === "checkbox") && (
              <div className="space-y-4">
                {/* 布尔字段标签配置 */}
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <div className="text-sm font-medium text-blue-800 mb-3">
                    {locale === "zh" ? "布尔字段配置" : "Boolean Field Configuration"}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-blue-700">
                        {locale === "zh" ? "选中状态标签" : "Checked State Label"}
                      </label>
                      <Input
                        value={booleanConfig?.checkedLabel || (locale === "zh" ? "是" : "Yes")}
                        onChange={(e) => setBooleanConfig(prev => ({ ...prev, checkedLabel: e.target.value }))}
                        placeholder={locale === "zh" ? "例如：是、启用、同意" : "e.g. Yes, Enabled, Agree"}
                        className="h-9 bg-white/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-blue-700">
                        {locale === "zh" ? "未选中状态标签" : "Unchecked State Label"}
                      </label>
                      <Input
                        value={booleanConfig?.uncheckedLabel || (locale === "zh" ? "否" : "No")}
                        onChange={(e) => setBooleanConfig(prev => ({ ...prev, uncheckedLabel: e.target.value }))}
                        placeholder={locale === "zh" ? "例如：否、禁用、不同意" : "e.g. No, Disabled, Disagree"}
                        className="h-9 bg-white/80"
                      />
                    </div>
                  </div>
                  
                  {/* 显示样式配置 */}
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-medium text-blue-700">
                      {locale === "zh" ? "显示样式" : "Display Style"}
                    </label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="booleanStyle"
                          value="switch"
                          checked={booleanConfig?.style === "switch"}
                          onChange={(e) => setBooleanConfig(prev => ({ ...prev, style: e.target.value as "switch" | "checkbox" | "radio" }))}
                          className="text-blue-600"
                        />
                        <span className="text-xs text-blue-700">{locale === "zh" ? "开关" : "Switch"}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="booleanStyle"
                          value="checkbox"
                          checked={booleanConfig?.style === "checkbox"}
                          onChange={(e) => setBooleanConfig(prev => ({ ...prev, style: e.target.value as "switch" | "checkbox" | "radio" }))}
                          className="text-blue-600"
                        />
                        <span className="text-xs text-blue-700">{locale === "zh" ? "复选框" : "Checkbox"}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="booleanStyle"
                          value="radio"
                          checked={booleanConfig?.style === "radio"}
                          onChange={(e) => setBooleanConfig(prev => ({ ...prev, style: e.target.value as "switch" | "checkbox" | "radio" }))}
                          className="text-blue-600"
                        />
                        <span className="text-xs text-blue-700">{locale === "zh" ? "单选按钮" : "Radio"}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 默认值配置 */}
                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-3">
                  <div className="text-sm text-slate-700">{i18n.default}</div>
                  <Select value={defaultRaw || "none"} onValueChange={(v) => setDefaultRaw(v === "none" ? "" : v)}>
                    <SelectTrigger className="bg-white/80">
                      <SelectValue placeholder={i18n.none} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{i18n.none}</SelectItem>
                      <SelectItem value="true">{booleanConfig?.checkedLabel || i18n.true}</SelectItem>
                      <SelectItem value="false">{booleanConfig?.uncheckedLabel || i18n.false}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* select 配置 */}
            {type === "select" && !preset && (
              <div className="space-y-4">
                {/* 单选字段配置 */}
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <div className="text-sm font-medium text-blue-800 mb-3">
                    {locale === "zh" ? "单选字段配置" : "Single Select Configuration"}
                  </div>
                  
                  {/* 选项配置 */}
                  <div className="space-y-3">
                    <div className="text-sm text-blue-700">{i18n.optionLabel}</div>
                    <div className="space-y-2">
                      {options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={
                            "grid grid-cols-[auto_1fr_auto] gap-2 items-center rounded-md " +
                            (dragIndex === idx ? "ring-2 ring-blue-200 bg-white/90" : "bg-white/70")
                          }
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragEnter={() => handleDragEnter(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={handleDragEnd}
                        >
                          <button
                            type="button"
                            className="h-8 w-8 inline-flex items-center justify-center text-slate-500 cursor-grab"
                            aria-label={locale === "zh" ? "拖动以排序" : "Drag to sort"}
                            title={locale === "zh" ? "拖动以排序" : "Drag to sort"}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`${i18n.optionPlaceholder} ${idx + 1}`}
                            className="bg-transparent"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => removeOption(idx)}
                            aria-label={locale === "zh" ? "删除选项" : "Delete option"}
                            title={locale === "zh" ? "删除" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="secondary" onClick={addOption}>
                        <Plus className="mr-1 size-4" />
                        {i18n.addOption}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">{i18n.optionsHint}</div>
                  </div>
                </div>

                {/* 默认值配置 */}
                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3">
                  <div className="text-sm text-slate-700">{i18n.default}</div>
                  {(() => {
                    const safeOptions = options.filter((o) => o.trim() !== "")
                    const selected = safeOptions.includes(defaultRaw || "") ? (defaultRaw as string) : ""
                    return (
                      <Select value={selected || "none"} onValueChange={(v) => setDefaultRaw(v === "none" ? "" : v)}>
                        <SelectTrigger className="bg-white/80">
                          <SelectValue placeholder={i18n.none} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{i18n.none}</SelectItem>
                          {safeOptions.map((o, i) => (
                            <SelectItem key={i} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* multiselect 配置 */}
            {type === "multiselect" && !preset && (
              <div className="space-y-4">
                {/* 多选字段配置 */}
                <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                  <div className="text-sm font-medium text-green-800 mb-3">
                    {locale === "zh" ? "多选字段配置" : "Multi Select Configuration"}
                  </div>
                  
                  {/* 多选限制配置 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-green-700">
                        {locale === "zh" ? "最小选择数量" : "Minimum Selection"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={multiselectConfig?.minSelection || ""}
                        onChange={(e) => setMultiselectConfig(prev => ({ 
                          ...prev, 
                          minSelection: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        placeholder={locale === "zh" ? "不限制" : "No limit"}
                        className="h-9 bg-white/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-green-700">
                        {locale === "zh" ? "最大选择数量" : "Maximum Selection"}
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={multiselectConfig?.maxSelection || ""}
                        onChange={(e) => setMultiselectConfig(prev => ({ 
                          ...prev, 
                          maxSelection: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        placeholder={locale === "zh" ? "不限制" : "No limit"}
                        className="h-9 bg-white/80"
                      />
                    </div>
                  </div>
                  
                  {/* 选项配置 */}
                  <div className="space-y-3">
                    <div className="text-sm text-green-700">{i18n.optionLabel}</div>
                    <div className="space-y-2">
                      {options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={
                            "grid grid-cols-[auto_1fr_auto] gap-2 items-center rounded-md " +
                            (dragIndex === idx ? "ring-2 ring-green-200 bg-white/90" : "bg-white/70")
                          }
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragEnter={() => handleDragEnter(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={handleDragEnd}
                        >
                          <button
                            type="button"
                            className="h-8 w-8 inline-flex items-center justify-center text-slate-500 cursor-grab"
                            aria-label={locale === "zh" ? "拖动以排序" : "Drag to sort"}
                            title={locale === "zh" ? "拖动以排序" : "Drag to sort"}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`${i18n.optionPlaceholder} ${idx + 1}`}
                            className="bg-transparent"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => removeOption(idx)}
                            aria-label={locale === "zh" ? "删除选项" : "Delete option"}
                            title={locale === "zh" ? "删除" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="secondary" onClick={addOption}>
                        <Plus className="mr-1 size-4" />
                        {i18n.addOption}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">{i18n.optionsHint}</div>
                  </div>
                </div>

                {/* 默认值配置 */}
                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3">
                  <div className="text-sm text-slate-700">{i18n.default}</div>
                  <Input
                    placeholder={locale === "zh" ? "多个默认值用逗号分隔" : "Multiple default values separated by commas"}
                    value={defaultRaw}
                    onChange={(e) => setDefaultRaw(e.target.value)}
                    className="bg-white/80"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {i18n.cancel}
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                label: label.trim(),
                key: key.trim(),
                type,
                required,
                unique,
                showInList,
                categoryId: categoryId || undefined,
                options:
                  type === "select" || type === "multiselect" ? options.filter((o) => o.trim() !== "") : undefined,
                defaultRaw,
                // generic relation
                relationModuleId: rel.moduleId || null,
                relationTargetId:
                  type === "relation_one" || type === "relation_many" || preset === "user_select"
                    ? rel.targetDirId || relationTargetId || null
                    : undefined,
                relationDisplayFieldKey: rel.displayFieldKey || null,
                relationBidirectional: rel.bidirectional,
                relationAllowDuplicate: rel.allowDuplicate,
                preset: preset || undefined,
                ...(type === "date" ? { dateMode } : {}),
                ...(type === "cascader" ? { cascaderOptions } : {}),
                ...(preset === "user_select" ? { userAllowMultiple, userNotifyNew } : {}),
                ...(preset === "skills" ? { skillsConfig } : {}),
                ...(preset === "progress" ? { progressConfig } : {}),
                ...(preset === "custom_experience" ? { customExperienceConfig } : {}),
                ...(preset === "certificate_experience" ? { certificateConfig } : {}),
                ...(preset === "identity_verification" ? { identityVerificationConfig } : {}),
                ...(preset === "other_verification" ? { otherVerificationConfig } : {}),
                ...(type === "image" ? { imageConfig } : {}),
                ...(type === "profile" ? { imageConfig } : {}),
                ...(type === "video" ? { videoConfig } : {}),
                ...(type === "boolean" || type === "checkbox" ? { booleanConfig } : {}),
                ...(type === "multiselect" ? { multiselectConfig } : {}),
              })
            }
          >
            {submitText || i18n.submit}
          </Button>
        </DialogFooter>

        <CategoryDialog
          open={openCategory}
          onOpenChange={setOpenCategory}
          initialCats={cascaderOptions as any}
          canEdit={canEdit}
          onSave={(cats) => {
            setCascaderOptions(cats as any)
            setOpenCategory(false)
          }}
          i18n={{
            title: locale === "zh" ? "配置级联选项" : "Configure Cascader Options",
            l1: locale === "zh" ? "一级分类" : "Level 1 Category",
            l2: locale === "zh" ? "二级分类" : "Level 2 Category",
            l3: locale === "zh" ? "三级分类" : "Level 3 Category",
            selectL1: locale === "zh" ? "选择一级分类" : "Select Level 1 Category",
            selectL2: locale === "zh" ? "选择二级分类" : "Select Level 2 Category",
            selectL3: locale === "zh" ? "选择三级分类（可选）" : "Select Level 3 Category (Optional)",
            none: locale === "zh" ? "未选择" : "None Selected",
            add: locale === "zh" ? "添加" : "Add",
            save: locale === "zh" ? "保存" : "Save",
            cancel: locale === "zh" ? "取消" : "Cancel",
            preview: locale === "zh" ? "预览：" : "Preview: ",
          }}
        />

        {/* 技能配置对话框 */}
        <Dialog open={openSkillsConfig} onOpenChange={setOpenSkillsConfig}>
          <DialogContent className="sm:max-w-[800px] bg-white/70 backdrop-blur border-white/60">
            <DialogHeader>
              <DialogTitle>{locale === "zh" ? "技能字段高级配置" : "Skills Field Advanced Configuration"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* 自定义分类配置 */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900">{locale === "zh" ? "自定义分类" : "Custom Categories"}</div>
                <div className="space-y-2">
                  {skillsConfig.customCategories.map((category, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={category.name}
                        onChange={(e) => {
                          const oldCategoryName = skillsConfig.customCategories[index].name
                          const newCategoryName = e.target.value
                          const newCategories = [...skillsConfig.customCategories]
                          newCategories[index] = { ...newCategories[index], name: newCategoryName }
                          
                          // 同步更新 allowedCategories
                          const newAllowedCategories = skillsConfig.allowedCategories.map(c => 
                            c === oldCategoryName ? newCategoryName : c
                          )
                          
                          setSkillsConfig(prev => ({ 
                            ...prev, 
                            customCategories: newCategories,
                            allowedCategories: newAllowedCategories
                          }))
                        }}
                        className="flex-1 bg-white/80"
                        placeholder={locale === "zh" ? "分类名称" : "Category name"}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const categoryToRemove = skillsConfig.customCategories[index]
                          const newCategories = skillsConfig.customCategories.filter((_, i) => i !== index)
                          // 同时从 allowedCategories 中移除
                          const newAllowedCategories = skillsConfig.allowedCategories.filter(c => c !== categoryToRemove.name)
                          setSkillsConfig(prev => ({ 
                            ...prev, 
                            customCategories: newCategories,
                            allowedCategories: newAllowedCategories
                          }))
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newCategoryName = locale === "zh" ? "新分类" : "New Category"
                      setSkillsConfig(prev => ({
                        ...prev,
                        customCategories: [...prev.customCategories, {
                          id: `cat_${Date.now()}`,
                          name: newCategoryName
                        }],
                        allowedCategories: [...prev.allowedCategories, newCategoryName]
                      }))
                    }}
                  >
                    <Plus className="size-4 mr-1" />
                    {locale === "zh" ? "添加分类" : "Add Category"}
                  </Button>
                </div>
              </div>

              {/* 预定义技能显示 */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900">{locale === "zh" ? "预定义技能" : "Predefined Skills"}</div>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {skillsData.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-gray-500 text-xs">({skill.category})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 自定义技能配置 */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900">{locale === "zh" ? "自定义技能" : "Custom Skills"}</div>
                <div className="space-y-2">
                  {skillsConfig.customSkills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={skill.name}
                        onChange={(e) => {
                          const newSkills = [...skillsConfig.customSkills]
                          newSkills[index] = { ...newSkills[index], name: e.target.value }
                          setSkillsConfig(prev => ({ ...prev, customSkills: newSkills }))
                        }}
                        className="flex-1 bg-white/80"
                        placeholder={locale === "zh" ? "技能名称" : "Skill name"}
                      />
                      <Select
                        value={skill.category}
                        onValueChange={(value) => {
                          const newSkills = [...skillsConfig.customSkills]
                          newSkills[index] = { ...newSkills[index], category: value }
                          setSkillsConfig(prev => ({ ...prev, customSkills: newSkills }))
                        }}
                      >
                        <SelectTrigger className="w-32 bg-white/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {skillsConfig.customCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSkills = skillsConfig.customSkills.filter((_, i) => i !== index)
                          setSkillsConfig(prev => ({ ...prev, customSkills: newSkills }))
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSkillsConfig(prev => ({
                        ...prev,
                        customSkills: [...prev.customSkills, {
                          id: `skill_${Date.now()}`,
                          name: locale === "zh" ? "新技能" : "New Skill",
                          category: skillCategories.filter(Boolean)[0]?.name || ""
                        }]
                      }))
                    }}
                  >
                    <Plus className="size-4 mr-1" />
                    {locale === "zh" ? "添加技能" : "Add Skill"}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpenSkillsConfig(false)}>
                {locale === "zh" ? "取消" : "Cancel"}
              </Button>
              <Button 
                onClick={() => {
                  // 保存配置并关闭对话框
                  setOpenSkillsConfig(false)
                }}
              >
                {locale === "zh" ? "保存" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 级联选项预览 */}
        {type === "cascader" && (
          <div className="rounded-lg border border-white/60 bg-white/70 px-3 py-2">
            <div className="text-sm mb-1">{locale === "zh" ? "当前选项" : "Current Options"}</div>
            {cascaderOptions.length === 0 ? (
              <div className="text-xs text-muted-foreground">{locale === "zh" ? "未配置" : "Not configured"}</div>
            ) : (
              <div className="text-xs text-muted-foreground">{locale === "zh" ? `共 ${cascaderOptions.length} 个一级项` : `${cascaderOptions.length} first-level items`}</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
