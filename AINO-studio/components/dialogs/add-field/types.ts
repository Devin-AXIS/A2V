import type { AppModel, FieldType } from "@/lib/store"

export type CatNode = { id: string; name: string; children?: CatNode[] }

export type PresetKey = 
  | "phone" 
  | "email" 
  | "url" 
  | "city" 
  | "country"
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

export type PresetDef = {
  key: PresetKey
  label: string
  desc: string
  baseType: FieldType
}

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
  // certificate preset extras
  certificateConfig?: {
    defaultNames?: string[] // 默认证书名称列表
  }
  // identity verification preset extras
  identityVerificationConfig?: {
    requireName?: boolean
    requireIdNumber?: boolean
    requirePhotos?: boolean
  }
  // other verification preset extras
  otherVerificationConfig?: {
    textFields?: { name: string; required: boolean }[]
    imageFields?: { name: string; required: boolean; multiple: boolean }[]
  }
  // image field extras
  imageConfig?: {
    multiple?: boolean // 是否支持多图片上传
    defaultImage?: string // 默认图片（base64格式）
  }
  // video field extras
  videoConfig?: {
    multiple?: boolean // 是否支持多视频上传
    defaultVideo?: string // 默认视频（base64格式）
  }
}

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

export type RelationConfigValue = {
  moduleId: string
  targetDirId: string
  displayFieldKey: string
  allowMultiple: boolean
  bidirectional: boolean
  allowDuplicate: boolean
  filterExpr: string
  hiddenFieldKeys: string[]
}
