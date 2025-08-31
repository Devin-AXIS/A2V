// 模板系统类型定义

export interface ModuleTemplate {
  name: string
  description: string
  directories: DirectoryTemplate[]
}

export interface DirectoryTemplate {
  name: string
  type: 'table' | 'form' | 'category'
  supportsCategory: boolean
  fields: FieldTemplate[]
  categories: CategoryTemplate[]
}

export interface FieldTemplate {
  key: string
  label: string
  type: string
  required: boolean
  showInList: boolean
  showInForm: boolean
  options?: string[]
  category: string // 关联到分类名称
}

export interface CategoryTemplate {
  name: string
  description: string
  order: number
  system: boolean
}

export interface TemplateResult {
  success: boolean
  message: string
  data?: {
    directoryId: string
    categoryIds: Record<string, string>
    fieldIds: string[]
  }
}
