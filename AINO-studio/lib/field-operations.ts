import type { FieldModel, DirectoryModel } from "@/lib/store"
import type { FieldCategoryModel } from "@/lib/field-categories"

// 字段分类相关操作
export function categorizeFields(fields: FieldModel[], fieldCategories: FieldCategoryModel[]) {
  const categories = new Map<string, { category: FieldCategoryModel; fields: FieldModel[] }>()
  const uncategorizedFields: FieldModel[] = []

  fields.forEach((field) => {
    const category = field.categoryId
      ? fieldCategories.find((cat) => cat.id === field.categoryId)
      : fieldCategories.find((cat) => cat.fields?.some((predefined: any) => predefined.key === field.key))

    if (category) {
      if (!categories.has(category.id)) {
        categories.set(category.id, { category, fields: [] })
      }
      categories.get(category.id)!.fields.push(field)
    } else {
      uncategorizedFields.push(field)
    }
  })

  return { categories: Array.from(categories.values()), uncategorizedFields }
}

// 过滤字段
export function filterFieldsByCategory(
  fields: FieldModel[], 
  selectedCategoryId: string | null, 
  categorizedFields: ReturnType<typeof categorizeFields>
) {
  if (!selectedCategoryId) return fields

  if (selectedCategoryId === "uncategorized") {
    return categorizedFields.uncategorizedFields
  }

  const categoryData = categorizedFields.categories.find((c) => c.category.id === selectedCategoryId)
  return categoryData ? categoryData.fields : []
}

// 创建新字段
export function createField(fieldData: any): FieldModel {
  return {
    id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    key: fieldData.key,
    label: fieldData.label,
    type: fieldData.type,
    required: fieldData.required,
    unique: fieldData.unique,
    locked: false,
    enabled: true,
    categoryId: fieldData.categoryId,
    desc: fieldData.desc,
    placeholder: fieldData.placeholder,
    min: fieldData.min,
    max: fieldData.max,
    step: fieldData.step,
    unit: fieldData.unit,
    options: fieldData.options,
    default: fieldData.default,
    showInList: fieldData.showInList,
    showInForm: fieldData.showInForm,
    showInDetail: fieldData.showInDetail,
    trueLabel: fieldData.trueLabel,
    falseLabel: fieldData.falseLabel,
    accept: fieldData.accept,
    maxSizeMB: fieldData.maxSizeMB,
    relation: fieldData.relation,
    cascaderOptions: fieldData.cascaderOptions,
    dateMode: fieldData.dateMode,
    preset: fieldData.preset,
    skillsConfig: fieldData.skillsConfig,
    progressConfig: fieldData.progressConfig,
    customExperienceConfig: fieldData.customExperienceConfig,
    identityVerificationConfig: fieldData.identityVerificationConfig,
    certificateConfig: fieldData.certificateConfig,
    otherVerificationConfig: fieldData.otherVerificationConfig,
    imageConfig: fieldData.imageConfig,
    videoConfig: fieldData.videoConfig,
  }
}

// 删除字段
export function removeFieldFromDirectory(dir: DirectoryModel, fieldId: string): DirectoryModel {
  const next = structuredClone(dir)
  next.fields = next.fields.filter((x) => x.id !== fieldId)
  
  // 同时删除记录中对应的字段数据
  next.records.forEach((r) => {
    const f = dir.fields.find((x) => x.id === fieldId)
    if (f && f.key in r) delete (r as any)[f.key]
  })
  
  return next
}

// 更新字段分类
export function updateFieldCategoriesInDirectory(
  dir: DirectoryModel, 
  categories: FieldCategoryModel[]
): DirectoryModel {
  const next = structuredClone(dir)
  next.fieldCategories = categories
  return next
}
