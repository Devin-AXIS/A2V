"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Eye, EyeOff, Lock, User, Shield, Edit } from "lucide-react"
import type { FieldCategoryModel } from "@/lib/field-categories"
import { useLocale } from "@/hooks/use-locale"
import { api } from "@/lib/api"
import { FieldEditor } from "@/components/dialogs/field-editor"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: FieldCategoryModel[]
  onCategoriesChange: (categories: FieldCategoryModel[]) => void
  applicationId: string
  directoryId: string
  onFieldAdded?: () => void
}

function AddCategoryForm({
  onAddCategory,
  isAdding,
  error,
}: {
  onAddCategory: (name: string, description: string) => Promise<void>
  isAdding: boolean
  error: string
}) {
  const { t, locale } = useLocale()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async () => {
    await onAddCategory(name, description)
    setName("")
    setDescription("")
  }

  return (
    <div className="flex-shrink-0 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
      <h3 className="font-semibold text-gray-800 mb-3">{locale === "zh" ? "添加新分类" : "Add New Category"}</h3>
      <div className="space-y-3">
        <Input
          placeholder={t("categoryName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10"
          disabled={isAdding}
        />
        <Input
          placeholder={t("categoryDescription")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-10"
          disabled={isAdding}
        />
        <Button onClick={handleSubmit} className="w-full h-10" disabled={isAdding || !name.trim()}>
          <Plus className="mr-2 size-4" />
          {isAdding ? t("addCategoryLoading") : t("addCategory")}
        </Button>
      </div>
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</div>
      )}
    </div>
  )
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const { t } = useLocale()
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        {t("previousPage")}
      </Button>
      <span className="text-sm text-muted-foreground px-2">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        {t("nextPage")}
      </Button>
    </div>
  )
}

function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
  onToggleCategory,
  onDeleteCategory,
}: {
  categories: FieldCategoryModel[]
  selectedCategory: FieldCategoryModel | null
  onSelectCategory: (category: FieldCategoryModel) => void
  onToggleCategory: (categoryId: string, enabled: boolean) => void
  onDeleteCategory: (categoryId: string) => void
}) {
  const { t } = useLocale()
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-3 pr-2">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`p-4 cursor-pointer transition-all duration-200 ${
              selectedCategory?.id === category.id
                ? "bg-blue-50 border-blue-300 shadow-md"
                : "bg-white hover:bg-gray-50 hover:shadow-sm"
            }`}
            onClick={() => onSelectCategory(category)}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  {category.system && (
                    <Badge variant="secondary" className="text-xs">
                      系统
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2 mb-2">{category.description}</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{(category.fields?.length || (category as any).predefinedFields?.length || 0)} 个字段</span>
                  <Badge variant={category.enabled ? "default" : "secondary"} className="text-xs">
                    {category.enabled ? "已启用" : "已禁用"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <Switch
                  checked={category.enabled}
                  onCheckedChange={(enabled) => onToggleCategory(category.id, enabled)}
                  onClick={(e) => e.stopPropagation()}
                />
                {!category.system && category.id !== "uncategorized" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteCategory(category.id)
                    }}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title={t("deleteCategory")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}

function FieldDetails({ 
  category, 
  applicationId, 
  directoryId, 
  onFieldAdded 
}: { 
  category: FieldCategoryModel | null
  applicationId: string
  directoryId: string
  onFieldAdded?: () => void
}) {
  const { t, locale } = useLocale()
  const [fieldPage, setFieldPage] = useState(1)
  const [fields, setFields] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false)
  const [editingField, setEditingField] = useState<any>(null)
  const fieldsPerPage = 6

  // 获取分类下的字段
  const fetchFields = async () => {
    if (!category) return
    
    setLoading(true)
    try {
      // ✅ 必须：从字段分类的predefinedFields中获取字段，而不是调用不存在的API
      const predefinedFields = (category as any).predefinedFields || []
      console.log("📋 从字段分类获取预定义字段:", predefinedFields)
      
      // 将predefinedFields转换为前端期望的格式
      const fields = Array.isArray(predefinedFields) ? predefinedFields.map((field: any, index: number) => ({
        id: field.id || `field_${index}`,
        label: field.name || field.label || field.key || `字段${index + 1}`,
        key: field.key || field.name || `field_${index}`,
        type: field.type || 'text',
        required: field.required || false,
        locked: field.locked || false,
        desc: field.description || field.desc || '',
        ...field
      })) : []
      
      setFields(fields)
    } catch (error) {
      console.error("获取字段失败:", error)
      setFields([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFields()
  }, [category?.id, applicationId, directoryId])

  const handleAddField = () => {
    setEditingField(null)
    setFieldEditorOpen(true)
  }

  const handleEditField = (field: any) => {
    setEditingField(field)
    setFieldEditorOpen(true)
  }

  const handleFieldSaved = async (fieldData: any) => {
    try {
      if (editingField) {
        // 更新字段
        await api.fields.updateField(editingField.id, {
          ...fieldData,
          categoryId: category?.id
        })
      } else {
        // 创建字段 - 使用PATCH方法，参数放在body中
        await api.fields.createField({
          ...fieldData,
          categoryId: category?.id,
          directoryId // 后端期望directoryId在body中
        })
      }
      
      // 刷新字段列表
      fetchFields()
      onFieldAdded?.()
      setFieldEditorOpen(false)
    } catch (error) {
      console.error("保存字段失败:", error)
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm(locale === "zh" ? "确定要删除这个字段吗？" : "Are you sure you want to delete this field?")) {
      return
    }
    
    try {
      await api.fields.deleteField(fieldId)
      fetchFields()
      onFieldAdded?.()
    } catch (error) {
      console.error("删除字段失败:", error)
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "visible":
        return <Eye className="size-3" />
      case "hidden":
        return <EyeOff className="size-3" />
      case "system_only":
        return <Lock className="size-3" />
      default:
        return <Eye className="size-3" />
    }
  }

  const getEditableIcon = (editable: string) => {
    switch (editable) {
      case "user":
        return <User className="size-3" />
      case "admin":
        return <Shield className="size-3" />
      case "readonly":
        return <Lock className="size-3" />
      default:
        return <User className="size-3" />
    }
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">{t("selectCategoryToView")}</div>
    )
  }

  const totalFieldPages = Math.ceil(fields.length / fieldsPerPage)
  const fieldStartIndex = (fieldPage - 1) * fieldsPerPage
  const paginatedFields = fields.slice(fieldStartIndex, fieldStartIndex + fieldsPerPage)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{category.name} - {t("fieldList")}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={category.enabled ? "default" : "secondary"}>
            {category.enabled ? t("enabled") : t("disabled")}
          </Badge>
          <Button size="sm" onClick={handleAddField} className="h-8">
            <Plus className="mr-1 size-3" />
            {locale === "zh" ? "添加字段" : "Add Field"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">{locale === "zh" ? "加载中..." : "Loading..."}</div>
        </div>
      ) : (
        <>
          {fields.length > fieldsPerPage && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {t("showFields")} {fieldStartIndex + 1}-{Math.min(fieldStartIndex + fieldsPerPage, fields.length)} /{" "}
                {fields.length} {t("ofFields")}
              </span>
              <PaginationControls currentPage={fieldPage} totalPages={totalFieldPages} onPageChange={setFieldPage} />
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-2">
              {paginatedFields.map((field) => (
                <Card key={field.id} className="p-3 bg-white/60">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{field.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            必填
                          </Badge>
                        )}
                        {field.locked && (
                          <Badge variant="secondary" className="text-xs">
                            锁定
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Key: {field.key}</div>
                      {field.desc && (
                        <div className="text-xs text-muted-foreground">{field.desc}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditField(field)}
                        className="h-6 w-6 p-0"
                        title={locale === "zh" ? "编辑字段" : "Edit Field"}
                      >
                        <Edit className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteField(field.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        title={locale === "zh" ? "删除字段" : "Delete Field"}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {fields.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  {locale === "zh" ? "该分类暂无字段" : "No fields in this category"}
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}

      {/* 字段编辑器对话框 */}
      <SimpleFieldEditor
        open={fieldEditorOpen}
        onOpenChange={setFieldEditorOpen}
        field={editingField}
        onSave={handleFieldSaved}
        applicationId={applicationId}
        directoryId={directoryId}
      />
    </div>
  )
}

function FieldCategoryManagerContent({
  categories,
  onCategoriesChange,
  applicationId,
  directoryId,
  onFieldAdded,
}: {
  categories: FieldCategoryModel[]
  onCategoriesChange: (categories: FieldCategoryModel[]) => void
  applicationId: string
  directoryId: string
  onFieldAdded: () => void
}) {
  const { t, locale } = useLocale()
  const [selectedCategory, setSelectedCategory] = useState<FieldCategoryModel | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState("")
  const [loading, setLoading] = useState(false)
  const categoriesPerPage = 3

  // 获取字段分类列表
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await api.fieldCategories.getFieldCategories({
        applicationId,
        directoryId,
        page: 1,
        limit: 100
      })
      
      if (response.success && response.data) {
        const apiCategories = response.data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || "",
          order: cat.order,
          enabled: cat.enabled,
          system: cat.system,
          fields: cat.predefinedFields || []
        }))
        onCategoriesChange(apiCategories)
      }
    } catch (error) {
      console.error("获取字段分类失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [applicationId, directoryId])

  const handleAddCategory = async (name: string, description: string) => {
    if (!name.trim()) {
      setAddError(locale === "zh" ? "请输入分类名称" : "Please enter category name")
      return
    }

    const existingCategory = categories.find((cat) => cat.name.toLowerCase() === name.trim().toLowerCase())
    if (existingCategory) {
      setAddError(locale === "zh" ? "该分类名称已存在" : "Category name already exists")
      return
    }

    setIsAdding(true)
    setAddError("")

    try {
      const response = await api.fieldCategories.createFieldCategory({
        name: name.trim(),
        description: description.trim() || `自定义分类：${name.trim()}`,
        order: categories.length + 1,
        enabled: true,
        system: false,
        predefinedFields: []
      }, {
        applicationId,
        directoryId
      })

      if (response.success && response.data) {
        const newCategory: FieldCategoryModel = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description || "",
          order: response.data.order,
          enabled: response.data.enabled,
          system: response.data.system,
          fields: response.data.predefinedFields || []
        }

        onCategoriesChange([...categories, newCategory])
        setSelectedCategory(newCategory)

        const newTotalPages = Math.ceil((categories.length + 1) / categoriesPerPage)
        setCurrentPage(newTotalPages)
      }
    } catch (error) {
      console.error("创建分类失败:", error)
      setAddError(t("addCategoryFailed"))
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryToDelete = categories.find((cat) => cat.id === categoryId)
    if (!categoryToDelete) return

    if (categoryToDelete.system || categoryId === "uncategorized") {
      alert(t("systemCategoryCannotDelete"))
      return
    }

    const hasFields = categoryToDelete.fields.length > 0
    const confirmMessage = hasFields
      ? `${t("confirmDeleteCategory")}"${categoryToDelete.name}"？\n${t("confirmDeleteCategoryWithFields")} ${categoryToDelete.fields.length} ${t("fieldsWillMoveToUncategorized")}`
      : `${t("confirmDeleteCategory")}"${categoryToDelete.name}"？`

    if (!confirm(confirmMessage)) return

    try {
      await api.fieldCategories.deleteFieldCategory(categoryId)
      
      const updated = categories.filter((cat) => cat.id !== categoryId)
      onCategoriesChange(updated)

      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null)
      }

      const newTotalPages = Math.ceil(updated.length / categoriesPerPage)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error) {
      console.error("删除分类失败:", error)
    }
  }

  const handleToggleCategory = async (categoryId: string, enabled: boolean) => {
    try {
      await api.fieldCategories.updateFieldCategory(categoryId, { enabled })
      const updated = categories.map((cat) => (cat.id === categoryId ? { ...cat, enabled } : cat))
      onCategoriesChange(updated)
    } catch (error) {
      console.error("更新分类状态失败:", error)
    }
  }

  const totalPages = Math.ceil(categories.length / categoriesPerPage)
  const startIndex = (currentPage - 1) * categoriesPerPage
  const paginatedCategories = categories.slice(startIndex, startIndex + categoriesPerPage)

  return (
    <div className="flex gap-6 flex-1 min-h-0">
      <div className="w-1/2 flex flex-col gap-4">
        <AddCategoryForm onAddCategory={handleAddCategory} isAdding={isAdding} error={addError} />

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("categoryList")} ({categories.length})
              {loading && <span className="text-sm text-muted-foreground ml-2">加载中...</span>}
            </h3>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>

          <CategoryList
            categories={paginatedCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onToggleCategory={handleToggleCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </div>
      </div>

      <div className="w-1/2 flex flex-col min-h-0">
        <div className="bg-gray-50 rounded-xl p-6 flex-1 min-h-0">
          <FieldDetails 
            category={selectedCategory} 
            applicationId={applicationId}
            directoryId={directoryId}
            onFieldAdded={onFieldAdded || (() => {})}
          />
        </div>
      </div>
    </div>
  )
}

export function FieldCategoryManager({ 
  open, 
  onOpenChange, 
  categories, 
  onCategoriesChange,
  applicationId,
  directoryId,
  onFieldAdded
}: Props) {
  const { t } = useLocale()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[1200px] sm:max-w-[1200px] max-h-[90vh] bg-white/95 backdrop-blur-xl border-white/60">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-xl">{t("fieldCategoryManagement")}</DialogTitle>
        </DialogHeader>
        <FieldCategoryManagerContent 
          categories={categories} 
          onCategoriesChange={onCategoriesChange}
          applicationId={applicationId}
          directoryId={directoryId}
          onFieldAdded={onFieldAdded || (() => {})}
        />
      </DialogContent>
    </Dialog>
  )
}

// 简化的字段编辑器组件
function SimpleFieldEditor({
  open,
  onOpenChange,
  field,
  onSave,
  applicationId,
  directoryId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  field: any
  onSave: (fieldData: any) => Promise<void>
  applicationId: string
  directoryId: string
}) {
  const { t, locale } = useLocale()
  const [label, setLabel] = useState("")
  const [key, setKey] = useState("")
  const [type, setType] = useState("text")
  const [required, setRequired] = useState(false)
  const [desc, setDesc] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (field) {
      setLabel(field.label || "")
      setKey(field.key || "")
      setType(field.type || "text")
      setRequired(field.required || false)
      setDesc(field.desc || "")
      setPlaceholder(field.placeholder || "")
    } else {
      setLabel("")
      setKey("")
      setType("text")
      setRequired(false)
      setDesc("")
      setPlaceholder("")
    }
  }, [field])

  const handleSave = async () => {
    if (!label.trim() || !key.trim()) {
      alert(locale === "zh" ? "请填写字段名称和标识符" : "Please fill in field name and key")
      return
    }

    setSaving(true)
    try {
      await onSave({
        label: label.trim(),
        key: key.trim(),
        type,
        required,
        desc: desc.trim() || undefined,
        placeholder: placeholder.trim() || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            {field ? (locale === "zh" ? "编辑字段" : "Edit Field") : (locale === "zh" ? "添加字段" : "Add Field")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{locale === "zh" ? "字段名称" : "Field Name"}</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={locale === "zh" ? "请输入字段名称" : "Enter field name"}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{locale === "zh" ? "字段标识符" : "Field Key"}</label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={locale === "zh" ? "请输入字段标识符" : "Enter field key"}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{locale === "zh" ? "字段类型" : "Field Type"}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="text">{locale === "zh" ? "文本" : "Text"}</option>
              <option value="textarea">{locale === "zh" ? "多行文本" : "Textarea"}</option>
              <option value="number">{locale === "zh" ? "数字" : "Number"}</option>
              <option value="select">{locale === "zh" ? "选择" : "Select"}</option>
              <option value="boolean">{locale === "zh" ? "布尔" : "Boolean"}</option>
              <option value="date">{locale === "zh" ? "日期" : "Date"}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">{locale === "zh" ? "字段描述" : "Field Description"}</label>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={locale === "zh" ? "请输入字段描述" : "Enter field description"}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{locale === "zh" ? "占位符" : "Placeholder"}</label>
            <Input
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder={locale === "zh" ? "请输入占位符" : "Enter placeholder"}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={required}
              onCheckedChange={setRequired}
            />
            <label className="text-sm">{locale === "zh" ? "必填字段" : "Required Field"}</label>
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (locale === "zh" ? "保存中..." : "Saving...") : (locale === "zh" ? "保存" : "Save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
