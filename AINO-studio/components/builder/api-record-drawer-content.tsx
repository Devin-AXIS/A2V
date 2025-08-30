"use client"

import type React from "react"

import { useMemo, useState, useEffect } from "react"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { FormField } from "@/components/form-field"
import { RelationManyTab } from "@/components/relation-tabs/relation-many-tab"
import { RelationOneTab } from "@/components/relation-tabs/relation-one-tab"
import { DynamicRecords } from "./dynamic-records"
import { useLocale } from "@/hooks/use-locale"
import { getSkillById } from "@/lib/data/skills-data"

interface DirectoryModel {
  id: string
  name: string
  fields: any[]
  categories?: any[]
}

interface RecordData {
  id: string
  [key: string]: any
}

interface Props {
  dir: DirectoryModel
  rec: RecordData
  app?: any // 应用对象，可选
  onClose: () => void
  onSave: (dirId: string, recordId: string, props: Record<string, any>) => Promise<void>
}

export function ApiRecordDrawerContent({ dir, rec, app, onClose, onSave }: Props) {
  const { toast } = useToast()
  const { t, locale } = useLocale()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // 从记录中提取属性数据（排除元数据字段）
    const { id, directoryId, version, createdAt, updatedAt, createdBy, updatedBy, ...props } = rec
    console.log('🔍 初始化表单数据:', { rec, props })
    return props
  })

  // 监听记录数据变化，更新表单数据
  useEffect(() => {
    const { id, directoryId, version, createdAt, updatedAt, createdBy, updatedBy, ...props } = rec
    console.log('🔍 记录数据变化，更新表单数据:', { rec, props })
    setFormData(props)
  }, [rec])

  const nameField = dir.fields.find(f => f.key === "name" || f.key === "title")
  const title = nameField ? formData[nameField.key] || "(未命名)" : "(未命名)"

  const basicFields = useMemo(
    () =>
      dir.fields.filter(
        (f) =>
          (f.enabled && f.type !== "relation_many" && f.type !== "relation_one") ||
          (f.preset && ["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "constellation", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(f.preset)),
      ),
    [dir.fields],
  )

  const relationFields = useMemo(
    () =>
      dir.fields.filter(
        (f) =>
          f.enabled &&
          (f.type === "relation_many" || f.type === "relation_one") &&
          (!f.preset || !["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "constellation", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(f.preset)),
      ),
    [dir.fields],
  )

  const [activeTab, setActiveTab] = useState("basic")

  function updateField(key: string, value: any) {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
    setIsEditing(true)
  }

  function validateRequired(): { ok: boolean; firstMissing?: string } {
    for (const field of basicFields) {
      if (!field.required) continue
      
      const value = formData[field.key]
      const isEmpty = 
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "object" && Object.keys(value).length === 0)
      
      if (field.type === "number" || field.type === "percent") {
        if (value === null || value === undefined || Number.isNaN(Number(value))) {
          return { ok: false, firstMissing: field.label || field.key }
        }
      } else if (field.type === "boolean" || field.type === "checkbox") {
        // booleans are always valid as required
      } else if (isEmpty) {
        return { ok: false, firstMissing: field.label || field.key }
      }
    }
    return { ok: true }
  }

  async function handleSave() {
    const validation = validateRequired()
    if (!validation.ok) {
      toast({
        description: locale === "zh" 
          ? `请填写必填字段: ${validation.firstMissing}` 
          : `Please fill required field: ${validation.firstMissing}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      await onSave(dir.id, rec.id, formData)
      setIsEditing(false)
      toast({
        description: locale === "zh" ? "保存成功" : "Saved successfully",
      })
    } catch (error) {
      console.error("保存记录失败:", error)
      toast({
        description: locale === "zh" 
          ? `保存失败: ${error instanceof Error ? error.message : "未知错误"}` 
          : `Save failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SheetContent
      side="right"
      className="w-[min(958px,100vw)] max-w-[100vw] p-0 bg-white border-l border-gray-200 flex flex-col !w-[min(958px,100vw)] !max-w-[100vw]"
    >
      <SheetTitle className="sr-only">{title || "Record Details"}</SheetTitle>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center font-medium text-sm text-white shadow-sm">
              {String(title || "NA")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {String((rec as any).category || "") && (
                <span className="text-sm text-gray-500">{t("category")}：{String((rec as any).category)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-600"
                  onClick={() => {
                    setIsEditing(false)
                    // 重置表单数据到原始状态
                    const { id, directoryId, version, createdAt, updatedAt, createdBy, updatedBy, ...props } = rec
                    setFormData(props)
                  }}
                >
                  {locale === "zh" ? "取消" : "Cancel"}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (locale === "zh" ? "保存中..." : "Saving...") : (locale === "zh" ? "保存" : "Save")}
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-600"
                onClick={() => setIsEditing(true)}
              >
                {locale === "zh" ? "编辑" : "Edit"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-4">
          <TabsList className="bg-gray-50 rounded-lg p-1">
            <TabsTrigger
              value="basic"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
            >
              {t("basicInfo")}
            </TabsTrigger>
            {relationFields.map((f) => (
              <TabsTrigger
                key={f.id}
                value={f.id}
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
              >
                {f.label}
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="dynamics"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
            >
              {t("dynamicRecord")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto bg-white min-h-0">
          <TabsContent value="basic" className="p-6 mt-0 flex-none">
            {isEditing ? (
              <form
                id="record-form"
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSave()
                }}
              >
                {(() => {
                  // 将字段分为单排和双排布局
                  const singleRowFields = basicFields.filter(f => 
                    f.type === "textarea" || 
                    f.type === "rich_text" || 
                    f.type === "markdown" ||
                    f.type === "json" ||
                    f.type === "experience" ||
                    f.type === "identity_verification" ||
                    f.type === "other_verification"
                  )
                  const doubleRowFields = basicFields.filter(f => 
                    !singleRowFields.includes(f)
                  )
                  
                  return (
                    <>
                      {/* 双排布局字段 */}
                      <div className="grid grid-cols-2 gap-6">
                        {doubleRowFields.map((field) => (
                          <FormField
                            key={field.id}
                            field={field}
                            record={{ ...rec, ...formData }}
                            app={app}
                            onChange={(value) => updateField(field.key, value)}
                            showValidation={isEditing}
                          />
                        ))}
                      </div>
                      
                      {/* 单排布局字段 */}
                      {singleRowFields.map((field) => (
                        <FormField
                          key={field.id}
                          field={field}
                          record={{ ...rec, ...formData }}
                          app={app}
                          onChange={(value) => updateField(field.key, value)}
                          showValidation={isEditing}
                        />
                      ))}
                    </>
                  )
                })()}
              </form>
            ) : (
              <div className="space-y-6">
                {(() => {
                  // 将字段分为单排和双排布局
                  const singleRowFields = basicFields.filter(f => 
                    f.type === "textarea" || 
                    f.type === "rich_text" || 
                    f.type === "markdown" ||
                    f.type === "json" ||
                    f.type === "experience" ||
                    f.type === "identity_verification" ||
                    f.type === "other_verification"
                  )
                  const doubleRowFields = basicFields.filter(f => 
                    !singleRowFields.includes(f)
                  )
                  
                  return (
                    <>
                      {/* 双排布局字段 */}
                      <div className="grid grid-cols-2 gap-6">
                        {doubleRowFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">
                              {field.label}
                              {field.required && <span className="ml-1 text-red-500">*</span>}
                            </div>
                            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                              {renderDisplayValue(field, formData[field.key])}
                            </div>
                            {field.desc && (
                              <div className="text-xs text-gray-500">{field.desc}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* 单排布局字段 */}
                      {singleRowFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                          </div>
                          <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                            {renderDisplayValue(field, formData[field.key])}
                          </div>
                          {field.desc && (
                            <div className="text-xs text-gray-500">{field.desc}</div>
                          )}
                        </div>
                      ))}
                    </>
                  )
                })()}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dynamics" className="p-6 mt-0 flex-none">
            <DynamicRecords recordId={rec.id} />
          </TabsContent>

          {relationFields.map((field) => (
            <TabsContent key={field.id} value={field.id} className="p-6 mt-0 flex-none">
              {field.type === "relation_many" ? (
                <RelationManyTab
                  app={app}
                  field={field}
                  rec={rec}
                  onChange={(newIds) => updateField(field.key, newIds)}
                />
              ) : (
                <RelationOneTab
                  app={app}
                  field={field}
                  rec={rec}
                  onChange={(newId) => updateField(field.key, newId)}
                />
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>


    </SheetContent>
  )
}

// Helper function to get skill name by ID
function getSkillNameById(skillId: string): string {
  // Import skills data
  const { skillsData } = require('@/lib/data/skills-data')
  
  // Find skill in predefined skills
  const predefinedSkill = skillsData.find((skill: any) => skill.id === skillId)
  if (predefinedSkill) {
    return predefinedSkill.name
  }
  
  // If not found in predefined skills, return the ID as fallback
  return skillId
}

// Helper function to get constellation name by ID
function getConstellationNameById(constellationId: string): string {
  // Import constellation data
  const { constellationData } = require('@/lib/data/constellation-data')
  
  // Find constellation in data
  const constellation = constellationData.find((item: any) => item.id === constellationId)
  if (constellation) {
    return constellation.name
  }
  
  // If not found, return the ID as fallback
  return constellationId
}

// Helper function to render display values for read-only mode
function renderDisplayValue(field: any, value: any) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-gray-400 italic">未填写</span>
  }

  switch (field.type) {
    case "boolean":
    case "checkbox":
      return value ? "是" : "否"
    case "tags":
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "未填写"
      }
      return "未填写"
    case "multiselect":
      if (Array.isArray(value)) {
        if (field.preset === "skills") {
          // Handle skills display - convert IDs to names
          if (value.length > 0) {
            const skillNames = value.map((skillId: string) => {
              // First try to get from predefined skills
              const predefinedSkill = getSkillNameById(skillId)
              if (predefinedSkill !== skillId) {
                return predefinedSkill
              }
              
              // Then try to get from custom skills
              const customSkill = field.skillsConfig?.customSkills?.find((s: any) => s.id === skillId)
              if (customSkill) {
                return customSkill.name
              }
              
              // If not found, return the ID
              return skillId
            })
            
            return (
              <div className="flex flex-wrap gap-1">
                {skillNames.map((skillName: string, index: number) => (
                  <span 
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {skillName}
                  </span>
                ))}
              </div>
            )
          }
          return "未填写"
        }
        return value.length > 0 ? value.join(", ") : "未填写"
      }
      return "未填写"
    case "select":
      if (field.preset === "constellation") {
        // Handle constellation display - convert ID to name
        return value ? getConstellationNameById(value) : "未选择"
      }
      return value || "未选择"
    case "number":
    case "percent":
      return value !== null && value !== undefined ? String(value) : "未填写"
    case "date":
    case "datetime":
      return value || "未填写"
    case "image":
      if (value) {
        return (
          <div className="flex items-center gap-2">
            <img src={value} alt="Image" className="w-8 h-8 rounded object-cover" />
            <span className="text-xs text-gray-500">图片</span>
          </div>
        )
      }
      return "未上传"
    case "profile":
      if (value) {
        const images = Array.isArray(value) ? value : [value]
        const validImages = images.filter(Boolean)
        
        if (validImages.length === 0) return "未上传"
        
        return (
          <div className="flex items-center gap-2">
            <img src={validImages[0]} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">标识</span>
              {validImages.length > 1 && (
                <span className="text-xs text-gray-400">+{validImages.length - 1} 更多</span>
              )}
            </div>
          </div>
        )
      }
      return "未上传"
    case "video":
      if (value) {
        return (
          <div className="flex items-center gap-2">
            <video src={value} className="w-8 h-8 rounded object-cover" />
            <span className="text-xs text-gray-500">视频</span>
          </div>
        )
      }
      return "未上传"
    case "experience":
      if (Array.isArray(value) && value.length > 0) {
        return (
          <div className="space-y-3">
            {value.map((exp: any, index: number) => {
              // Format date range
              const formatDateRange = () => {
                if (!exp.startDate) return ""
                const startDate = new Date(exp.startDate).toLocaleDateString('zh-CN')
                if (exp.isCurrent || !exp.endDate) {
                  return `${startDate} - 至今`
                }
                const endDate = new Date(exp.endDate).toLocaleDateString('zh-CN')
                return `${startDate} - ${endDate}`
              }

              // Get experience type label
              const getTypeLabel = () => {
                switch (exp.type) {
                  case "work": return "工作经历"
                  case "education": return "教育经历"
                  case "project": return "项目经历"
                  case "certificate": return "证书经历"
                  default: return "经历"
                }
              }

              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  {/* Header with type and date range */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        {getTypeLabel()}
                      </span>
                      {exp.isCurrent && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          进行中
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {formatDateRange()}
                    </span>
                  </div>

                  {/* Core information */}
                  <div className="space-y-2">
                    {/* Title/Position */}
                    <div className="text-base font-semibold text-gray-900">
                      {exp.title || exp.name || `经历 ${index + 1}`}
                    </div>
                    
                    {/* Organization/Company */}
                    {exp.organization && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">机构:</span> {exp.organization}
                      </div>
                    )}

                    {/* Additional fields based on type */}
                    {exp.type === "work" && exp.department && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">部门:</span> {exp.department}
                      </div>
                    )}

                    {exp.type === "education" && (
                      <>
                        {exp.degree && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">学历:</span> {exp.degree}
                          </div>
                        )}
                        {exp.major && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">专业:</span> {exp.major}
                          </div>
                        )}
                        {exp.gpa && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">GPA:</span> {exp.gpa}
                          </div>
                        )}
                      </>
                    )}

                    {exp.type === "project" && exp.teamSize && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">团队规模:</span> {exp.teamSize}人
                      </div>
                    )}

                    {exp.type === "certificate" && exp.issuer && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">颁发机构:</span> {exp.issuer}
                      </div>
                    )}

                    {/* Location */}
                    {exp.location && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">地点:</span> {exp.location}
                      </div>
                    )}

                    {/* Description */}
                    {exp.description && (
                      <div className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                        {exp.description.length > 150 
                          ? `${exp.description.substring(0, 150)}...` 
                          : exp.description
                        }
                      </div>
                    )}

                    {/* Skills */}
                    {exp.skills && Array.isArray(exp.skills) && exp.skills.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">相关技能:</div>
                        <div className="flex flex-wrap gap-1">
                          {exp.skills.slice(0, 6).map((skill: string, skillIndex: number) => (
                            <span 
                              key={skillIndex}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {exp.skills.length > 6 && (
                            <span className="text-xs text-gray-500">
                              +{exp.skills.length - 6} 更多
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">成就/荣誉:</div>
                        <div className="flex flex-wrap gap-1">
                          {exp.achievements.slice(0, 3).map((achievement: string, achievementIndex: number) => (
                            <span 
                              key={achievementIndex}
                              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                            >
                              {achievement}
                            </span>
                          ))}
                          {exp.achievements.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{exp.achievements.length - 3} 更多
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
      return "未填写"
    case "text":
      // Handle preset-based text fields
      if (field.preset === "identity_verification") {
        if (value && typeof value === "object") {
          const hasData = value.name || value.idNumber || value.frontPhoto || value.backPhoto
          if (hasData) {
            return (
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-medium">✓ 已认证</span>
              </div>
            )
          }
        }
        return <span className="text-gray-400">未认证</span>
      }
      
      if (field.preset === "other_verification") {
        if (value && typeof value === "object") {
          const hasData = Object.keys(value).length > 0
          if (hasData) {
            // Get the first text field value
            const textFields = Object.entries(value).filter(([key, val]) => 
              typeof val === "string" && val.trim() !== ""
            )
            
            if (textFields.length > 0) {
              const firstTextValue = textFields[0][1]
              return (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{firstTextValue}</span>
                  <span className="text-green-600 font-medium">✓ 已认证</span>
                </div>
              )
            } else {
              return (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">✓ 已认证</span>
                </div>
              )
            }
          }
        }
        return <span className="text-gray-400">未认证</span>
      }
      
      // Default text field
      return String(value)
    default:
      return String(value)
  }
}
