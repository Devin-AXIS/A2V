"use client"

import { useState } from "react"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { Input } from "@/components/ui/input"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"
import { YearMonthPicker } from "@/components/input/year-month-picker"
import { DatePickerWithValue } from "@/components/input/date-picker-with-value"
import { CitySelectMobile } from "@/components/input/city-select-mobile"
import { BottomDrawerSelect } from "@/components/input/bottom-drawer-select"
import { ImageUpload } from "@/components/input/image-upload"
import { SwitchControl } from "@/components/input/switch-control"
import { Plus, Edit, X } from "lucide-react"

// 字段类型定义
export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'yearMonth' | 'date' | 'city' | 'switch' | 'tags' | 'image'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  rows?: number
  gridColumn?: 1 | 2 // 1=全宽, 2=半宽
  // 字段联动配置
  dependsOn?: string // 依赖的字段key
  hideWhen?: any // 当依赖字段为此值时隐藏
  showWhen?: any // 当依赖字段为此值时显示
  disableWhen?: any // 当依赖字段为此值时禁用
  replaceWith?: string // 当隐藏时显示的替代文本
}

// 数据项类型
export interface DataItem {
  id: number
  [key: string]: any
}

// 展示配置
export interface DisplayConfig {
  icon: React.ReactNode
  titleField: string
  subtitleField?: string
  descriptionField?: string
  layout: 'timeline' | 'grid' | 'simple'
  showActions?: boolean
}

// 通用表单卡片组件属性
interface GenericFormCardProps {
  title: string
  data: DataItem[]
  onUpdate: (data: DataItem[]) => void
  fields: FieldConfig[]
  displayConfig?: DisplayConfig
  allowMultiple?: boolean
  emptyText?: string
  addButtonText?: string
}

export function GenericFormCard({
  title,
  data,
  onUpdate,
  fields,
  displayConfig,
  allowMultiple = true,
  emptyText = "暂无数据",
  addButtonText = "添加"
}: GenericFormCardProps) {
  // 默认显示配置
  const defaultDisplayConfig: DisplayConfig = {
    icon: <div className="w-5 h-5 bg-gray-400 rounded" />,
    titleField: (fields && fields[0]?.key) || 'title',
    subtitleField: (fields && fields[1]?.key) || undefined,
    layout: 'simple',
    showActions: true
  }

  // 使用传入的配置或默认配置
  const finalDisplayConfig = displayConfig || defaultDisplayConfig
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  // 初始化表单数据
  const initFormData = () => {
    const initialData: Record<string, any> = {}
    fields.forEach(field => {
      initialData[field.key] = field.type === 'switch' ? false : ""
    })
    return initialData
  }

  // 添加数据
  const handleAdd = () => {
    setFormData(initFormData())
    setEditingId(null)
    setShowForm(true)
  }

  // 编辑数据
  const handleEdit = (item: DataItem) => {
    const editData: Record<string, any> = {}
    fields.forEach(field => {
      editData[field.key] = item[field.key] || (field.type === 'switch' ? false : "")
    })
    setFormData(editData)
    setEditingId(item.id)
    setShowForm(true)
  }

  // 保存数据
  const handleSave = () => {
    // 验证必填字段
    const requiredFields = fields.filter(f => f.required)
    for (const field of requiredFields) {
      if (!formData[field.key]) {
        alert(`请填写${field.label}`)
        return
      }
    }

    if (editingId) {
      // 编辑现有数据
      const updatedData = data.map(item => 
        item.id === editingId ? { ...item, ...formData } : item
      )
      onUpdate(updatedData)
    } else {
      // 添加新数据
      const newItem: DataItem = {
        id: Date.now(),
        ...formData
      }
      onUpdate(allowMultiple ? [...data, newItem] : [newItem])
    }

    setShowForm(false)
  }

  // 删除数据
  const handleDelete = (id: number) => {
    if (confirm("确定要删除这条记录吗？")) {
      onUpdate(data.filter(item => item.id !== id))
    }
  }

  // 更新表单字段
  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // 检查字段是否应该隐藏
  const isFieldHidden = (field: FieldConfig) => {
    if (!field.dependsOn) return false
    const dependentValue = formData[field.dependsOn]
    
    if (field.hideWhen !== undefined) {
      return dependentValue === field.hideWhen
    }
    if (field.showWhen !== undefined) {
      return dependentValue !== field.showWhen
    }
    return false
  }

  // 检查字段是否应该禁用
  const isFieldDisabled = (field: FieldConfig) => {
    if (!field.dependsOn || !field.disableWhen) return false
    const dependentValue = formData[field.dependsOn]
    return dependentValue === field.disableWhen
  }

  // 渲染表单字段
  const renderField = (field: FieldConfig) => {
    const value = formData[field.key] || ""
    const isHidden = isFieldHidden(field)
    const isDisabled = isFieldDisabled(field)

    // 如果字段被隐藏且有替代文本，显示替代文本
    if (isHidden && field.replaceWith) {
      return (
        <div className="flex items-center justify-center h-10 px-3.5 py-2.5 bg-gray-100 rounded-xl">
          <span className="text-sm" style={{ color: "var(--card-text-color)" }}>{field.replaceWith}</span>
        </div>
      )
    }

    // 如果字段被隐藏且没有替代文本，返回null
    if (isHidden) {
      return null
    }

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="rounded-xl"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3.5 py-2.5 bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 resize-none"
            rows={field.rows || 3}
            style={{ color: "var(--card-text-color)" }}
          />
        )

      case 'select':
        return (
          <BottomDrawerSelect
            placeholder={field.placeholder}
            value={value}
            onChange={(val) => updateField(field.key, val)}
            options={field.options || []}
            title={field.label}
          />
        )

      case 'yearMonth':
        return (
          <YearMonthPicker
            placeholder={field.placeholder}
            value={value}
            onChange={(val) => updateField(field.key, val)}
          />
        )

      case 'date':
        return (
          <DatePickerWithValue
            placeholder={field.placeholder}
            value={value}
            onChange={(val) => updateField(field.key, val)}
          />
        )

      case 'city':
        return (
          <CitySelectMobile
            value={value}
            onChange={(val) => updateField(field.key, val)}
            placeholder={field.placeholder}
          />
        )

      case 'switch':
        return (
          <SwitchControl
            checked={!!value}
            onCheckedChange={(checked) => updateField(field.key, checked)}
          />
        )

      case 'tags':
        return (
          <div className="space-y-2">
            <Input
              value={value}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="rounded-xl"
            />
            <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
              多个标签请用逗号分隔
            </p>
          </div>
        )

      case 'image':
        return (
          <ImageUpload
            value={value}
            onChange={(val) => updateField(field.key, val)}
            placeholder={field.placeholder || "点击上传图片"}
            shape="circle"
            size="md"
          />
        )

      default:
        return null
    }
  }

  // 渲染数据展示
  const renderDataDisplay = (item: DataItem) => {
    if (finalDisplayConfig.layout === 'timeline') {
      return (
        <div className="border-l-2 pl-4 pb-4 mb-4" style={{ borderColor: "var(--card-accent-color, #3b82f6)" }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {finalDisplayConfig.icon}
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
                  {item[finalDisplayConfig.titleField]}
                </p>
                {finalDisplayConfig.subtitleField && item[finalDisplayConfig.subtitleField] && (
                  <p className="text-sm" style={{ color: "var(--card-text-color)" }}>
                    {item[finalDisplayConfig.subtitleField]}
                  </p>
                )}
                {finalDisplayConfig.descriptionField && item[finalDisplayConfig.descriptionField] && (
                  <p className="text-xs mt-2" style={{ color: "var(--card-text-color)" }}>
                    {item[finalDisplayConfig.descriptionField]}
                  </p>
                )}
              </div>
            </div>
            {finalDisplayConfig.showActions && (
              <div className="flex items-center gap-2 ml-2">
                <button 
                  onClick={() => handleEdit(item)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit className="w-4 h-4" style={{ color: "var(--card-accent-color, #3b82f6)" }} />
                </button>
                {allowMultiple && (
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" style={{ color: "var(--card-warning-color, #f59e0b)" }} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (finalDisplayConfig.layout === 'grid') {
      return (
        <div 
          key={item.id} 
          className="p-3 rounded-lg border-l-4"
          style={{ 
            backgroundColor: "var(--card-background-secondary, #f8fafc)",
            borderLeftColor: "var(--card-accent-color, #3b82f6)"
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {finalDisplayConfig.icon}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
                      {fields.find(f => f.key === finalDisplayConfig.titleField)?.label}
                    </p>
                    <p className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
                      {item[finalDisplayConfig.titleField]}
                    </p>
                  </div>
                  {finalDisplayConfig.subtitleField && (
                    <div>
                      <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
                        {fields.find(f => f.key === finalDisplayConfig.subtitleField)?.label}
                      </p>
                      <p className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
                        {item[finalDisplayConfig.subtitleField]}
                      </p>
                    </div>
                  )}
                </div>
                {finalDisplayConfig.descriptionField && item[finalDisplayConfig.descriptionField] && (
                  <p className="text-xs mt-2" style={{ color: "var(--card-text-color)" }}>
                    {item[finalDisplayConfig.descriptionField]}
                  </p>
                )}
              </div>
            </div>
            {finalDisplayConfig.showActions && (
              <div className="flex items-center gap-2 ml-2">
                <button 
                  onClick={() => handleEdit(item)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit className="w-4 h-4" style={{ color: "var(--card-accent-color, #3b82f6)" }} />
                </button>
                {allowMultiple && (
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" style={{ color: "var(--card-warning-color, #f59e0b)" }} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    // simple layout
    return (
      <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--card-background-secondary, #f8fafc)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {finalDisplayConfig.icon}
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
                {item[finalDisplayConfig.titleField]}
              </p>
              {finalDisplayConfig.subtitleField && item[finalDisplayConfig.subtitleField] && (
                <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
                  {item[finalDisplayConfig.subtitleField]}
                </p>
              )}
            </div>
          </div>
          {finalDisplayConfig.showActions && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleEdit(item)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Edit className="w-4 h-4" style={{ color: "var(--card-accent-color, #3b82f6)" }} />
              </button>
              {allowMultiple && (
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" style={{ color: "var(--card-warning-color, #f59e0b)" }} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <AppCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold" style={{ color: "var(--card-title-color)" }}>{title}</h3>
            {(allowMultiple || data.length === 0) && (
              <button onClick={handleAdd}>
                <Plus className="w-4 h-4" style={{ color: "var(--card-accent-color, #3b82f6)" }} />
              </button>
            )}
          </div>
          
          {data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "var(--card-text-color)" }}>{emptyText}</p>
              <PillButton 
                variant="default" 
                onClick={handleAdd}
                className="mt-3"
              >
                {addButtonText}
              </PillButton>
            </div>
          ) : (
            <div className={finalDisplayConfig.layout === 'timeline' ? "space-y-0" : "space-y-3"}>
              {data.map((item) => renderDataDisplay(item))}
            </div>
          )}
        </div>
      </AppCard>

      {/* 通用表单弹窗 */}
      <BottomDrawer
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setFormData(initFormData())
          setEditingId(null)
        }}
        title={editingId ? `编辑${title}` : `添加${title}`}
      >
        <div className="p-4 space-y-4">
          {/* 全宽字段 */}
          {fields.filter(f => !f.gridColumn || f.gridColumn === 1).map((field) => {
            const fieldElement = renderField(field)
            if (!fieldElement) return null // 隐藏的字段
            
            return (
              <div key={field.key}>
                {field.type === 'switch' ? (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
                      {field.label} {field.required && "*"}
                    </label>
                    {fieldElement}
                  </div>
                ) : (
                  <>
                    <label className="text-sm font-medium mb-2 block" style={{ color: "var(--card-title-color)" }}>
                      {field.label} {field.required && "*"}
                    </label>
                    {fieldElement}
                  </>
                )}
              </div>
            )
          })}

          {/* 网格布局字段 */}
          {fields.filter(f => f.gridColumn === 2).length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {fields.filter(f => f.gridColumn === 2).map((field) => {
                const fieldElement = renderField(field)
                if (!fieldElement) return null // 隐藏的字段
                
                return (
                  <div key={field.key}>
                    {field.type === 'switch' ? (
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
                          {field.label} {field.required && "*"}
                        </label>
                        {fieldElement}
                      </div>
                    ) : (
                      <>
                        <label className="text-sm font-medium mb-2 block" style={{ color: "var(--card-title-color)" }}>
                          {field.label} {field.required && "*"}
                        </label>
                        {fieldElement}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <PillButton
              variant="default"
              onClick={() => {
                setShowForm(false)
                setFormData(initFormData())
                setEditingId(null)
              }}
              className="flex-1"
            >
              取消
            </PillButton>
            <PillButton
              onClick={handleSave}
              className="flex-1"
            >
              {editingId ? "保存修改" : "添加"}
            </PillButton>
          </div>
        </div>
      </BottomDrawer>
    </>
  )
}
