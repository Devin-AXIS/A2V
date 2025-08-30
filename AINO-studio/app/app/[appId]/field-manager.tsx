"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, GripVertical, Settings, Plus } from "lucide-react"
import type { AppModel, DirectoryModel, FieldModel, FieldType } from "@/lib/store"
import { useLocale } from "@/hooks/use-locale"
import { FieldEditor } from "@/components/dialogs/field-editor"
import { FieldCategoryManager } from "@/components/dialogs/field-category-manager"
import { AddFieldDialog } from "@/components/dialogs/add-field-dialog"
import { FieldRow } from "@/components/field-manager/field-row"
import { fieldCategoriesApi, fieldsApi, api } from "@/lib/api"
import { getFieldTypeNames } from "@/lib/field-types"
import {
  categorizeFields,
  filterFieldsByCategory,
  createField,
  removeFieldFromDirectory,
  updateFieldCategoriesInDirectory
} from "@/lib/field-operations"
import { cn } from "@/lib/utils"
import type { FieldCategoryModel } from "@/lib/field-categories"

// API返回的字段分类类型
type ApiFieldCategoryModel = {
  id: string
  name: string
  description: string
  order: number
  enabled: boolean
  system?: boolean
  predefinedFields: any[]
  createdAt: string
  updatedAt: string
}

type Props = {
  app: AppModel
  dir: DirectoryModel
  onChange: (dir: DirectoryModel) => void
  onAddField?: () => void
}



export function FieldManager({ app, dir, onChange, onAddField }: Props) {
  const { t, locale } = useLocale()
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<FieldModel | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [fieldCategories, setFieldCategories] = useState<ApiFieldCategoryModel[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fieldDefs, setFieldDefs] = useState<any[]>([])
  const [fieldDefsLoading, setFieldDefsLoading] = useState(false)
  const [fieldCategoriesLoaded, setFieldCategoriesLoaded] = useState(false)

  // 从API获取字段分类数据
  const fetchFieldCategories = async () => {
    // ✅ 必须：API调用前检查必要参数
    if (!app?.id || !dir?.id) {
      console.warn("⚠️ 缺少必要参数，跳过字段分类获取:", { appId: app?.id, dirId: dir?.id })
      setFieldCategories([])
      return
    }

    try {
      setFieldCategoriesLoaded(false)
      setLoading(true)
      console.log("🔍 获取字段分类参数:", { appId: app.id, dirId: dir.id })

      const response = await fieldCategoriesApi.getFieldCategories({
        applicationId: app.id,
        directoryId: dir.id,
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
      setLoading(false)
      setFieldCategoriesLoaded(true)
    }
  }

  // 从API获取字段定义数据
  const fetchFieldDefs = async () => {
    // ✅ 必须：API调用前检查必要参数
    if (!app?.id || !dir?.id) {
      console.warn("⚠️ 缺少必要参数，跳过字段定义获取:", { appId: app?.id, dirId: dir?.id })
      setFieldDefs([])
      return
    }

    try {
      setFieldDefsLoading(true)
      console.log("🔍 获取字段定义参数:", { appId: app.id, dirId: dir.id })

      // 首先获取目录定义ID
      const dirDefResponse = await api.directoryDefs.getOrCreateDirectoryDefByDirectoryId(dir.id, app.id)

      if (!dirDefResponse.success || !dirDefResponse.data?.id) {
        console.error("获取目录定义失败:", dirDefResponse.error)
        setFieldDefs([])
        return
      }

      const directoryDefId = dirDefResponse.data.id
      console.log("📋 目录定义ID:", directoryDefId)

      // 获取字段定义列表
      const response = await api.fields.getFields({
        directoryId: directoryDefId,
        page: 1,
        limit: 100
      })

      console.log("📡 字段定义API响应:", response)

      if (response.success && response.data) {
        // 将API数据转换为前端期望的格式，并关联分类信息
        const apiFields = response.data.map((field: any) => {
          // 查找字段所属的分类
          let categoryId = null
          if (fieldCategories.length > 0) {
            for (const category of fieldCategories) {
              // 使用API返回的predefinedFields字段
              if (category.predefinedFields && Array.isArray(category.predefinedFields)) {
                const foundField = category.predefinedFields.find((pf: any) => pf.id === field.id)
                if (foundField) {
                  categoryId = category.id
                  break
                }
              }
            }
          }

          return {
            id: field.id,
            key: field.key,
            label: field.schema?.label || field.key,
            type: field.type,
            required: field.required || false,
            unique: false, // API中没有unique字段，默认为false
            showInList: field.schema?.showInList ?? true, // 使用API数据，默认为true
            showInForm: field.schema?.showInForm ?? true, // 使用API数据，默认为true
            showInDetail: field.schema?.showInDetail ?? true, // 使用API数据，默认为true
            placeholder: field.schema?.placeholder || '',
            desc: field.schema?.description || '',
            options: field.schema?.options || [],
            config: field.schema || {},
            validators: field.validators || {},
            enabled: true, // API中没有enabled字段，默认为true
            locked: false, // API中没有locked字段，默认为false
            categoryId: categoryId, // 根据predefinedFields确定分类
            // 提取字段配置信息
            cascaderOptions: field.schema?.cascaderOptions || undefined,
            customExperienceConfig: field.schema?.customExperienceConfig || undefined,
            certificateConfig: field.schema?.certificateConfig || undefined,
            skillsConfig: field.schema?.skillsConfig || undefined,
            progressConfig: field.schema?.progressConfig || undefined,
            identityVerificationConfig: field.schema?.identityVerificationConfig || undefined,
            otherVerificationConfig: field.schema?.otherVerificationConfig || undefined,
            imageConfig: field.schema?.imageConfig || undefined,
            videoConfig: field.schema?.videoConfig || undefined,
            booleanConfig: field.schema?.booleanConfig || undefined,
            multiselectConfig: field.schema?.multiselectConfig || undefined,
            preset: field.schema?.preset || undefined,
            // 添加关联字段配置
            relation: field.relation ? {
              targetDirId: field.relation.targetDirId || null,
              mode: field.relation.mode || (field.type === 'relation_one' ? 'one' : 'many'),
              displayFieldKey: field.relation.displayFieldKey || null,
            } : undefined,
          }
        })

        setFieldDefs(apiFields)
        console.log("✅ 使用API字段定义:", apiFields)
      } else {
        console.error("获取字段定义失败:", response.error)
        setFieldDefs([])
      }
    } catch (error) {
      // ✅ 必须：为所有API调用添加try-catch错误处理
      console.error("获取字段定义出错:", error)

      // ✅ 必须：错误信息要用户友好
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          console.warn("🌐 网络连接问题，使用默认字段定义")
        } else {
          console.error("❌ API调用失败:", error.message)
        }
      }

      // ✅ 必须：错误恢复机制 - 使用默认数据而不是空数组
      setFieldDefs([])
    } finally {
      setFieldDefsLoading(false)
    }
  }

  // 当应用或目录变化时，重新获取字段分类和字段定义
  useEffect(() => {
    // ✅ 必须：API调用前检查必要参数
    if (app?.id && dir?.id) {
      console.log("🔄 应用或目录变化，重新获取数据:", { appId: app.id, dirId: dir.id })
      fetchFieldCategories()
    } else {
      console.log("⏸️ 等待必要参数就绪:", { appId: app?.id, dirId: dir?.id })
    }
  }, [app?.id, dir?.id]) // 使用可选链确保依赖项稳定

  // 当字段分类加载完成后（即使没有分类），获取字段定义
  useEffect(() => {
    if (app?.id && dir?.id && fieldCategoriesLoaded) {
      console.log("🔄 字段分类加载完成，开始获取字段定义")
      fetchFieldDefs()
    }
  }, [app?.id, dir?.id, fieldCategoriesLoaded])

  const categorizedFields = useMemo(() => {
    // 将API数据转换为前端期望的格式
    const frontendCategories: FieldCategoryModel[] = fieldCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      order: cat.order,
      enabled: cat.enabled,
      system: cat.system,
      fields: cat.predefinedFields || []
    }))
    return categorizeFields(fieldDefs, frontendCategories)
  }, [fieldDefs, fieldCategories])

  const filteredFields = useMemo(() =>
    filterFieldsByCategory(fieldDefs, selectedCategoryId, categorizedFields),
    [fieldDefs, selectedCategoryId, categorizedFields]
  )

  function handleDragStart(i: number) {
    setDragIndex(i)
  }

  function handleDragEnter(i: number) {
    setDragIndex((from) => {
      if (from === null || from === i) return from

      // Update fieldDefs order by moving the field
      setFieldDefs((prevFieldDefs) => {
        const newFieldDefs = [...prevFieldDefs]
        const [moved] = newFieldDefs.splice(from, 1)
        newFieldDefs.splice(i, 0, moved)

        // Update order property for each field
        return newFieldDefs.map((field, index) => ({
          ...field,
          order: index
        }))
      })

      return i
    })
  }

  function handleDragEnd() {
    setDragIndex(null)
    // Save field order to backend
    saveFieldOrder()
  }

  // Save field order to backend
  const saveFieldOrder = async () => {
    try {
      if (!app?.id || !dir?.id) return

      // Get directory definition ID
      const dirDefResponse = await api.directoryDefs.getOrCreateDirectoryDefByDirectoryId(dir.id, app.id)
      if (!dirDefResponse.success || !dirDefResponse.data?.id) return

      const directoryDefId = dirDefResponse.data.id

      // Update each field's order
      for (let i = 0; i < fieldDefs.length; i++) {
        const field = fieldDefs[i]
        if (field.id) {
          await api.fields.updateField(field.id, {
            ...field,
            order: i
          })
        }
      }

      console.log("✅ Field order saved successfully")
    } catch (error) {
      console.error("❌ Failed to save field order:", error)
    }
  }

  const typeNames = useMemo(() => getFieldTypeNames(t), [t])

  function commit(patch: (d: DirectoryModel) => void) {
    const next = structuredClone(dir)
    patch(next)
    onChange(next)
  }

  function updateFieldCategories(categories: ApiFieldCategoryModel[]) {
    setFieldCategories(categories)
    // 将API数据转换为前端期望的格式
    const frontendCategories: FieldCategoryModel[] = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      order: cat.order,
      enabled: cat.enabled,
      system: cat.system,
      fields: cat.predefinedFields || []
    }))
    const updatedDir = updateFieldCategoriesInDirectory(dir, frontendCategories)
    onChange(updatedDir)
  }

  async function removeField(id: string) {
    if (!confirm(t("confirmDeleteField"))) return

    try {
      console.log("🔍 删除字段定义:", id)

      // 调用API删除字段定义
      const response = await api.fields.deleteField(id)

      if (response.success) {
        // 从本地状态中删除
        setFieldDefs(prev => prev.filter(field => field.id !== id))
        console.log("✅ 字段定义删除成功")
      } else {
        console.error("❌ 字段定义删除失败:", response.error)
      }
    } catch (error) {
      console.error("❌ 字段定义删除出错:", error)
      // 可以在这里添加用户提示
    }
  }

  async function addField(fieldData: any) {
    try {
      console.log("🔍 创建字段定义参数:", fieldData)

      // 首先获取目录定义ID
      const dirDefResponse = await api.directoryDefs.getOrCreateDirectoryDefByDirectoryId(dir.id, app.id)

      if (!dirDefResponse.success || !dirDefResponse.data?.id) {
        console.error("获取目录定义失败:", dirDefResponse.error)
        return
      }

      const directoryDefId = dirDefResponse.data.id

      // 调用API创建字段定义
      const response = await api.fields.createField({
        directoryId: directoryDefId,
        key: fieldData.key,
        kind: fieldData.type === 'relation_one' || fieldData.type === 'relation_many' ? 'relation' : 'primitive',
        type: fieldData.type,
        schema: {
          label: fieldData.label,
          placeholder: fieldData.placeholder || '',
          description: fieldData.desc || '',
          options: fieldData.options || [],
          required: fieldData.required || false,
          showInList: fieldData.showInList || true,
          showInForm: fieldData.showInForm || true,
          showInDetail: fieldData.showInDetail || true,
          preset: fieldData.preset || undefined,
          cascaderOptions: fieldData.cascaderOptions || undefined,
          customExperienceConfig: fieldData.customExperienceConfig || undefined,
          certificateConfig: fieldData.certificateConfig || undefined,
          skillsConfig: fieldData.skillsConfig || undefined,
          progressConfig: fieldData.progressConfig || undefined,
          identityVerificationConfig: fieldData.identityVerificationConfig || undefined,
          otherVerificationConfig: fieldData.otherVerificationConfig || undefined,
          imageConfig: fieldData.imageConfig || undefined,
          videoConfig: fieldData.videoConfig || undefined,
          booleanConfig: fieldData.booleanConfig || undefined,
          multiselectConfig: fieldData.multiselectConfig || undefined,
        },
        // 添加关联字段配置
        relation: (fieldData.type === 'relation_one' || fieldData.type === 'relation_many') ? {
          targetDirId: fieldData.relationTargetId || null,
          mode: fieldData.type === 'relation_one' ? 'one' : 'many',
          displayFieldKey: fieldData.relationDisplayFieldKey || null,
        } : undefined,
        validators: fieldData.validators || {},
        required: fieldData.required || false,
      })

      if (response.success && response.data) {
        // 将API返回的数据转换为前端格式并添加到本地状态
        const newField = {
          id: response.data.id,
          key: response.data.key,
          label: response.data.schema?.label || response.data.key,
          type: response.data.type,
          required: response.data.required || false,
          unique: false,
          showInList: response.data.schema?.showInList || true,
          showInForm: response.data.schema?.showInForm || true,
          showInDetail: response.data.schema?.showInDetail || true,
          placeholder: response.data.schema?.placeholder || '',
          desc: response.data.schema?.description || '',
          options: response.data.schema?.options || [],
          config: response.data.schema || {},
          validators: response.data.validators || {},
          enabled: true,
          locked: false,
          categoryId: fieldData.categoryId || null,
          // 提取字段配置信息
          cascaderOptions: response.data.schema?.cascaderOptions || undefined,
          customExperienceConfig: response.data.schema?.customExperienceConfig || undefined,
          certificateConfig: response.data.schema?.certificateConfig || undefined,
          skillsConfig: response.data.schema?.skillsConfig || undefined,
          progressConfig: response.data.schema?.progressConfig || undefined,
          identityVerificationConfig: response.data.schema?.identityVerificationConfig || undefined,
          otherVerificationConfig: response.data.schema?.otherVerificationConfig || undefined,
          imageConfig: response.data.schema?.imageConfig || undefined,
          videoConfig: response.data.schema?.videoConfig || undefined,
          booleanConfig: response.data.schema?.booleanConfig || undefined,
          multiselectConfig: response.data.schema?.multiselectConfig || undefined,
          preset: response.data.schema?.preset || undefined,
        }

        setFieldDefs(prev => [...prev, newField])

        // 如果选择了分类，将字段添加到分类的fields中
        if (fieldData.categoryId) {
          try {
            const categoryToUpdate = fieldCategories.find(cat => cat.id === fieldData.categoryId)
            if (categoryToUpdate) {
              // 更新分类的predefinedFields
              const updatedFields = [
                ...(categoryToUpdate.predefinedFields || []),
                {
                  id: response.data.id,
                  key: response.data.key,
                  label: response.data.schema?.label || response.data.key,
                  type: response.data.type,
                  description: response.data.schema?.description || '',
                  visibility: "visible" as const,
                  sensitive: false,
                  editable: "user" as const,
                  required: response.data.required || false,
                  options: response.data.schema?.options || [],
                }
              ]

              // 调用API更新字段分类
              const categoryUpdateResponse = await api.fieldCategories.updateFieldCategory(fieldData.categoryId, {
                predefinedFields: updatedFields
              })

              if (categoryUpdateResponse.success) {
                console.log("✅ 字段已成功归类到分类:", selectedCategoryId)
                // 刷新字段分类数据
                fetchFieldCategories()
              } else {
                console.error("❌ 字段归类失败:", categoryUpdateResponse.error)
              }
            }
          } catch (error) {
            console.error("❌ 字段归类出错:", error)
          }
        }

        // 通知父组件字段已添加
        onAddField?.()

        console.log("✅ 字段定义创建成功:", newField)
      } else {
        console.error("❌ 字段定义创建失败:", response.error)
      }
    } catch (error) {
      console.error("❌ 字段创建出错:", error)
      throw error
    }
  }

  async function updateField(id: string, fieldData: any) {
    try {
      console.log("🔍 更新字段定义参数:", { id, fieldData })

      // 调用API更新字段定义
      const response = await api.fields.updateField(id, {
        key: fieldData.key,
        type: fieldData.type,
        kind: fieldData.type === 'relation_one' || fieldData.type === 'relation_many' ? 'relation' : 'primitive',
        schema: {
          label: fieldData.label,
          placeholder: fieldData.placeholder || '',
          description: fieldData.desc || '',
          options: fieldData.options || [],
          required: fieldData.required || false,
          showInList: fieldData.showInList || true,
          showInForm: fieldData.showInForm || true,
          showInDetail: fieldData.showInDetail || true,
          preset: fieldData.preset || undefined,
          cascaderOptions: fieldData.cascaderOptions || undefined,
          customExperienceConfig: fieldData.customExperienceConfig || undefined,
          certificateConfig: fieldData.certificateConfig || undefined,
          skillsConfig: fieldData.skillsConfig || undefined,
          progressConfig: fieldData.progressConfig || undefined,
          identityVerificationConfig: fieldData.identityVerificationConfig || undefined,
          otherVerificationConfig: fieldData.otherVerificationConfig || undefined,
          imageConfig: fieldData.imageConfig || undefined,
          videoConfig: fieldData.videoConfig || undefined,
          booleanConfig: fieldData.booleanConfig || undefined,
          multiselectConfig: fieldData.multiselectConfig || undefined,
        },
        // 添加关联字段配置
        relation: (fieldData.type === 'relation_one' || fieldData.type === 'relation_many') ? {
          targetDirId: fieldData.relationTargetId || null,
          mode: fieldData.type === 'relation_one' ? 'one' : 'many',
          displayFieldKey: fieldData.relationDisplayFieldKey || null,
        } : undefined,
        validators: fieldData.validators || {},
        required: fieldData.required || false,
      })

      if (response.success && response.data) {
        // 更新本地状态
        setFieldDefs(prev => prev.map(field =>
          field.id === id
            ? {
              ...field,
              key: response.data.key,
              label: response.data.schema?.label || response.data.key,
              type: response.data.type,
              required: response.data.required || false,
              unique: false,
              showInList: response.data.schema?.showInList || true,
              showInForm: response.data.schema?.showInForm || true,
              showInDetail: response.data.schema?.showInDetail || true,
              placeholder: response.data.schema?.placeholder || '',
              desc: response.data.schema?.description || '',
              options: response.data.schema?.options || [],
              config: response.data.schema || {},
              validators: response.data.validators || {},
              // 更新字段配置信息
              cascaderOptions: response.data.schema?.cascaderOptions || undefined,
              customExperienceConfig: response.data.schema?.customExperienceConfig || undefined,
              certificateConfig: response.data.schema?.certificateConfig || undefined,
              skillsConfig: response.data.schema?.skillsConfig || undefined,
              progressConfig: response.data.schema?.progressConfig || undefined,
              identityVerificationConfig: response.data.schema?.identityVerificationConfig || undefined,
              otherVerificationConfig: response.data.schema?.otherVerificationConfig || undefined,
              imageConfig: response.data.schema?.imageConfig || undefined,
              videoConfig: response.data.schema?.videoConfig || undefined,
              booleanConfig: response.data.schema?.booleanConfig || undefined,
              multiselectConfig: response.data.schema?.multiselectConfig || undefined,
              preset: response.data.schema?.preset || undefined,
            }
            : field
        ))

        console.log("✅ 字段定义更新成功")
      } else {
        console.error("❌ 字段定义更新失败:", response.error)
      }
    } catch (error) {
      console.error("❌ 字段定义更新出错:", error)
      // 可以在这里添加用户提示
    }
  }

  // 字段状态切换函数
  async function toggleFieldEnabled(id: string, enabled: boolean) {
    try {
      console.log("🔍 切换字段启用状态:", { id, enabled })

      // 临时解决方案：直接更新本地状态，跳过API调用
      setFieldDefs(prev => prev.map(field =>
        field.id === id ? { ...field, enabled } : field
      ))

      console.log("✅ 字段启用状态切换成功（本地）")
    } catch (error) {
      console.error("❌ 字段启用状态切换出错:", error)
    }
  }

  async function toggleFieldRequired(id: string, required: boolean) {
    try {
      console.log("🔍 切换字段必填状态:", { id, required })

      // 临时解决方案：直接更新本地状态，跳过API调用
      setFieldDefs(prev => prev.map(field =>
        field.id === id ? { ...field, required } : field
      ))

      console.log("✅ 字段必填状态切换成功（本地）")
    } catch (error) {
      console.error("❌ 字段必填状态切换出错:", error)
    }
  }

  async function toggleFieldShowInList(id: string, showInList: boolean) {
    try {
      console.log("🔍 切换字段列表显示状态:", { id, showInList })

      // 临时解决方案：直接更新本地状态，跳过API调用
      setFieldDefs(prev => prev.map(field =>
        field.id === id ? { ...field, showInList } : field
      ))

      console.log("✅ 字段列表显示状态切换成功（本地）")
    } catch (error) {
      console.error("❌ 字段列表显示状态切换出错:", error)
    }
  }

  const i18n = useMemo(
    () =>
      locale === "zh"
        ? {
          title: "添加字段",
          displayName: "显示名",
          displayNamePh: "如：商品名",
          key: "内部名（唯一）",
          keyPh: "如：product_name",
          keyInvalid: "需以字母或下划线开头，仅含字母数字下划线，≤40字符",
          keyDuplicate: "内部名已存在",
          dataType: "数据类型",
          required: "必填",
          requiredHint: "表单校验时要求必填",
          unique: "唯一",
          uniqueHint: "该字段值不可重复",
          showInList: "显示在列表",
          showInListHint: "控制列表是否展示",
          default: "默认值",
          none: "无",
          true: "是",
          false: "否",
          optionLabel: "选项",
          optionPlaceholder: "选项",
          addOption: "添加选项",
          optionsHint: "提示：默认值会根据当前选项生成；修改选项后请重新确认默认值。",
          relationTarget: "关联目标表",
          cancel: "取消",
          submit: "添加字段",
          dateModeLabel: "日期模式",
          dateModeSingle: "单个日期",
          dateModeMultiple: "多个日期",
          dateModeRange: "日期区间",
          basicFieldsLabel: t("basicFields"),
          businessFieldsLabel: t("businessFields"),
        }
        : {
          title: "Add Field",
          displayName: "Label",
          displayNamePh: "e.g. Product Name",
          key: "Key (unique)",
          keyPh: "e.g. product_name",
          keyInvalid: "Must start with a letter/underscore, only letters/digits/underscore, ≤ 40 chars",
          keyDuplicate: "Key already exists",
          dataType: "Data Type",
          required: "Required",
          requiredHint: "Enforce required in forms",
          unique: "Unique",
          uniqueHint: "Value cannot be duplicated",
          showInList: "Show in List",
          showInListHint: "Control visibility in list",
          default: "Default",
          none: "None",
          true: "True",
          false: "False",
          optionLabel: "Options",
          optionPlaceholder: "Option",
          addOption: "Add option",
          optionsHint: "Tip: default value depends on options; re-verify after changes.",
          relationTarget: "Relation Target Table",
          cancel: "Cancel",
          submit: "Add Field",
          dateModeLabel: "Date Mode",
          dateModeSingle: "Single",
          dateModeMultiple: "Multiple",
          dateModeRange: "Range",
          basicFieldsLabel: t("basicFields"),
          businessFieldsLabel: t("businessFields"),
        },
    [locale, t],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{t("fieldManagement")}</div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddFieldOpen(true)} className="rounded-xl">
            <Plus className="mr-1 size-4" />
            {locale === "zh" ? "添加字段" : "Add Field"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCategoryManagerOpen(true)} className="rounded-xl">
            <Settings className="mr-1 size-4" />
            {t("categoryManagement")}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategoryId(null)}
          className="rounded-xl whitespace-nowrap flex-shrink-0"
        >
          {t("allFields")} ({fieldDefs.length})
        </Button>
        {fieldCategories
          .filter((category) => category.enabled)
          .map((category) => {
            const categoryData = categorizedFields.categories.find((c) => c.category.id === category.id)
            const fieldCount = categoryData ? categoryData.fields.length : 0
            return (
              <Button
                key={`category-${category.id}`}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId(category.id)}
                className="rounded-xl whitespace-nowrap flex-shrink-0"
              >
                {category.name} ({fieldCount})
              </Button>
            )
          })}
        {categorizedFields.uncategorizedFields.length > 0 && (
          <Button
            variant={selectedCategoryId === "uncategorized" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoryId("uncategorized")}
            className="rounded-xl whitespace-nowrap flex-shrink-0"
          >
            {t("uncategorized")} ({categorizedFields.uncategorizedFields.length})
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {filteredFields.map((f, idx) => {
          const category = f.categoryId
            ? fieldCategories.find((cat) => cat.id === f.categoryId)
            : fieldCategories.find((cat) => cat.predefinedFields?.some((predefined: any) => predefined.key === f.key))

          return (
            <div
              key={`field-${f.id}-${idx}`}
              className={"rounded-xl " + (dragIndex === idx ? "ring-2 ring-blue-200" : "")}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => handleDragEnter(idx)}
            >
              <FieldRow
                field={f}
                idx={idx}
                total={filteredFields.length}
                typeNames={typeNames}
                category={category ? {
                  id: category.id,
                  name: category.name,
                  description: category.description,
                  order: category.order,
                  enabled: category.enabled,
                  system: category.system,
                  fields: category.predefinedFields || []
                } : undefined}
                onToggleEnabled={(v) => toggleFieldEnabled(f.id, v)}
                onToggleRequired={(v) => toggleFieldRequired(f.id, v)}
                onToggleList={(v) => toggleFieldShowInList(f.id, v)}
                onEdit={() => {
                  setEditing(f)
                  setEditOpen(true)
                }}
                onRemove={() => removeField(f.id)}
                onDragStart={() => handleDragStart(idx)}
                onDragEnd={handleDragEnd}
              />
            </div>
          )
        })}
        {filteredFields.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-8">
            {selectedCategoryId ? (locale === "zh" ? "该分类暂无字段" : "No fields in this category") : (locale === "zh" ? "暂无字段" : "No fields")}
          </div>
        )}
      </div>

      {editing && (
        <FieldEditor
          open={editOpen}
          onOpenChange={setEditOpen}
          app={app}
          dir={dir}
          field={editing}
          typeNames={typeNames}
          i18n={i18n}
          onSubmit={async (fieldData) => {
            await updateField(editing.id, fieldData)
            setEditOpen(false)
            setEditing(null)
          }}
        />
      )}

      <AddFieldDialog
        open={addFieldOpen}
        onOpenChange={setAddFieldOpen}
        app={app}
        currentDir={dir}
        typeNames={typeNames}
        onSubmit={(fieldData) => {
          addField(fieldData)
          setAddFieldOpen(false)
        }}
        i18n={i18n}
      />

      <FieldCategoryManager
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        categories={fieldCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          order: cat.order,
          enabled: cat.enabled,
          system: cat.system,
          fields: cat.predefinedFields || []
        }))}
        onCategoriesChange={(categories) => {
          // 将前端格式转换回API格式
          const apiCategories: ApiFieldCategoryModel[] = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            order: cat.order,
            enabled: cat.enabled,
            system: cat.system,
            predefinedFields: cat.fields || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
          updateFieldCategories(apiCategories)
        }}
        applicationId={app.id}
        directoryId={dir.id}
        onFieldAdded={() => {
          // 当字段被添加时，刷新字段列表
          fetchFieldCategories()
        }}
      />
    </div>
  )
}
