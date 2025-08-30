"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DirectoryModel, RecordRow, Props } from "@/lib/store"
import { findDirByIdAcrossModules, findNameField } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { FormField } from "@/components/form-field"
import { RelationManyTab } from "@/components/relation-tabs/relation-many-tab"
import { RelationOneTab } from "@/components/relation-tabs/relation-one-tab"
import { DynamicRecords } from "./dynamic-records"
import { useLocale } from "@/hooks/use-locale"
import { getSkillById } from "@/lib/data/skills-data"

export function RecordDrawerContent({ app, dir, rec, onClose, onChange }: Props) {
  const { toast } = useToast()
  const { t, locale } = useLocale()
  const [isEditing, setIsEditing] = useState(false)

  const nameField = findNameField(dir)
  const title = nameField ? (rec as any)[nameField.key] || "(未命名)" : "(未命名)"

  const basicFields = useMemo(
    () =>
      dir.fields.filter(
        (f) =>
          (f.enabled && f.type !== "relation_many" && f.type !== "relation_one") ||
          (f.preset && ["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(f.preset)),
      ),
    [dir.fields],
  )

  const relationFields = useMemo(
    () =>
      dir.fields.filter(
        (f) =>
          f.enabled &&
          (f.type === "relation_many" || f.type === "relation_one") &&
          (!f.preset || !["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(f.preset)),
      ),
    [dir.fields],
  )

  const [activeTab, setActiveTab] = useState("basic")

  function mutate(patch: (d: DirectoryModel, r: RecordRow) => void) {
    const next = structuredClone(app)
    const dd = findDirByIdAcrossModules(next, dir.id)!
    const rr = dd.records.find((x) => x.id === rec.id)!
    patch(dd, rr)
    onChange(next)
  }

  function validateRequired(): { ok: boolean; firstMissing?: string } {
    if (!dir || !rec) return { ok: true }
    for (const f of dir.fields) {
      if (f.enabled === false || !f.required) continue
      const v = (rec as any)[f.key]
      const isEmpty =
        v === null ||
        v === undefined ||
        (typeof v === "string" && v.trim() === "") ||
        (Array.isArray(v) && v.length === 0)
      if (f.type === "number" || f.type === "percent") {
        if (v === null || v === undefined || Number.isNaN(Number(v))) return { ok: false, firstMissing: f.label }
      } else if (f.type === "boolean" || f.type === "checkbox") {
        // booleans are always valid as required
      } else if (isEmpty) {
        return { ok: false, firstMissing: f.label }
      }
    }
    return { ok: true }
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const res = validateRequired()
    if (!res.ok) {
      toast({ description: locale === "zh" ? `请填写必填项：${res.firstMissing}` : `Please fill in required field: ${res.firstMissing}`, variant: "destructive" as any })
      return
    }
    toast({ description: t("saved") })
    setIsEditing(false)
  }

  function renderFieldValue(field: any, record: RecordRow) {
    const value = (record as any)[field.key]
    
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400">{locale === "zh" ? "暂无数据" : "No data"}</span>
    }

    switch (field.type) {
      case "textarea":
      case "rich_text":
      case "markdown":
        return <div className="whitespace-pre-wrap">{value}</div>
      case "boolean":
      case "checkbox":
        return <span>{value ? (locale === "zh" ? "是" : "Yes") : (locale === "zh" ? "否" : "No")}</span>
      case "select":
        return <span>{value}</span>
      case "multiselect":
      case "tags":
        // 如果是技能字段，特殊处理 - 检查多个条件
        if (field.preset === "skills" || (field.type === "multiselect" && field.skillsConfig)) {
          return Array.isArray(value) && value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((skillId: string, index: number) => {
                // 先从预定义技能中查找
                const predefinedSkill = getSkillById(skillId)
                if (predefinedSkill) {
                  return (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                      {predefinedSkill.name}
                      {field.skillsConfig?.showLevel && predefinedSkill.level && (
                        <span className="ml-1 opacity-75">({predefinedSkill.level})</span>
                      )}
                    </span>
                  )
                }
                
                // 再从自定义技能中查找
                const customSkill = field.skillsConfig?.customSkills?.find((s: any) => s.id === skillId)
                if (customSkill) {
                  return (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                      {customSkill.name}
                    </span>
                  )
                }
                
                return (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                    {skillId}
                  </span>
                )
              })}
            </div>
          ) : <span className="text-gray-400">{locale === "zh" ? "暂无技能" : "No skills"}</span>
        }
        // 普通的多选字段
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((item: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                {item}
              </span>
            ))}
          </div>
        ) : <span>{value}</span>
      case "date":
        return <span>{new Date(value).toLocaleDateString()}</span>
      case "datetime":
        return <span>{new Date(value).toLocaleString()}</span>
      case "number":
        return <span>{value}</span>
      case "percent":
        return <span>{value}%</span>
      case "progress":
        if (field.progressConfig) {
          const progressValue = Number(value ?? 0)
          const maxValue = field.progressConfig.maxValue || 100
          const percentage = Math.round((progressValue / maxValue) * 100)
          
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {field.progressConfig.showProgressBar && (
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`
                      }}
                    />
                  </div>
                )}
                {field.progressConfig.showPercentage ? (
                  <span className="text-xs text-gray-600 w-12 text-right">{percentage}%</span>
                ) : (
                  <span className="text-xs text-gray-600">{progressValue}/{maxValue}</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {field.progressConfig.showPercentage ? `${progressValue}/${maxValue}` : `${percentage}%`}
              </div>
            </div>
          )
        }
        return <span className="text-sm">{value}</span>
      case "currency":
        return <span>¥{value}</span>
      case "image":
        if (!value) {
          return <span className="text-gray-400">{locale === "zh" ? "暂无图片" : "No image"}</span>
        }
        
        // 处理单图/多图模式
        const images = Array.isArray(value) ? value : [value]
        const validImages = images.filter(Boolean)
        
        if (validImages.length === 0) {
          return <span className="text-gray-400">{locale === "zh" ? "暂无图片" : "No image"}</span>
        }
        
        return (
          <div className="space-y-2">
            <div className={`grid gap-2 ${validImages.length > 1 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 max-w-xs"}`}>
              {validImages.map((img, index) => (
                <div key={index} className="relative">
                  <img 
                    src={img} 
                    alt={`${locale === "zh" ? "图片" : "Image"} ${index + 1}`} 
                    className="w-full h-24 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const errorDiv = e.currentTarget.nextElementSibling as HTMLElement
                      if (errorDiv) errorDiv.style.display = 'block'
                    }}
                  />
                  <div className="text-xs text-gray-500 hidden bg-gray-100 p-2 rounded border text-center">
                    {locale === "zh" ? "图片加载失败" : "Image failed to load"}
                  </div>
                </div>
              ))}
            </div>
            {validImages.length > 1 && (
              <div className="text-xs text-gray-500">
                {locale === "zh" ? `共 ${validImages.length} 张图片` : `${validImages.length} images total`}
              </div>
            )}
          </div>
        )
      case "video":
        if (!value) {
          return <span className="text-gray-400">{locale === "zh" ? "暂无视频" : "No video"}</span>
        }
        
        // 处理单视频/多视频模式
        const videos = Array.isArray(value) ? value : [value]
        const validVideos = videos.filter(Boolean)
        
        if (validVideos.length === 0) {
          return <span className="text-gray-400">{locale === "zh" ? "暂无视频" : "No video"}</span>
        }
        
        return (
          <div className="space-y-2">
            <div className={`grid gap-3 ${validVideos.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-md"}`}>
              {validVideos.map((video, index) => (
                <div key={index} className="relative">
                  <video
                    src={video}
                    className="w-full h-48 rounded-lg border border-gray-200"
                    controls
                    preload="metadata"
                  />
                </div>
              ))}
            </div>
            {validVideos.length > 1 && (
              <div className="text-xs text-gray-500">
                {locale === "zh" ? `共 ${validVideos.length} 个视频` : `${validVideos.length} videos total`}
              </div>
            )}
          </div>
        )
      case "file":
        return value ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm text-blue-600 hover:underline cursor-pointer" onClick={() => window.open(value, '_blank')}>
              {locale === "zh" ? "查看文件" : "View file"}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">{locale === "zh" ? "暂无文件" : "No file"}</span>
        )
      case "experience":
        return Array.isArray(value) && value.length > 0 ? (
          <div className="space-y-2">
            {value.slice(0, 3).map((exp: any, index: number) => {
              // 根据字段配置显示不同的标签
              let titleLabel = "标题"
              let organizationLabel = "机构"
              
              if (field.preset === "custom_experience" && field.customExperienceConfig) {
                titleLabel = field.customExperienceConfig.experienceName || "经历"
                organizationLabel = field.customExperienceConfig.eventName || "事件"
              } else {
                // 根据经历类型显示默认标签
                switch (exp.type) {
                  case "education":
                    titleLabel = "专业"
                    organizationLabel = "学校"
                    break
                  case "work":
                    titleLabel = "职位"
                    organizationLabel = "公司"
                    break
                  case "project":
                    // 如果是自定义经历字段，使用配置的标签
                    if (field?.preset === "custom_experience" && field?.customExperienceConfig) {
                      titleLabel = field.customExperienceConfig.experienceName || "经历"
                      organizationLabel = field.customExperienceConfig.eventName || "事件"
                    } else {
                      titleLabel = "项目"
                      organizationLabel = "机构"
                    }
                    break
                  case "certificate":
                    titleLabel = "证书"
                    organizationLabel = "颁发机构"
                    break
                }
              }
              
              return (
                <div key={index} className="text-sm">
                  <div className="font-medium">{exp.title || `请输入${titleLabel}`}</div>
                  <div className="text-gray-600">{exp.organization || `请输入${organizationLabel}`}</div>
                  {/* 证书资质字段不显示时间信息 */}
                  {exp.type !== "certificate" && exp.startDate && (
                    <div className="text-xs text-gray-500">
                      {new Date(exp.startDate).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit" })}
                      {exp.isCurrent ? " - 至今" : exp.endDate ? ` - ${new Date(exp.endDate).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit" })}` : ""}
                    </div>
                  )}
                </div>
              )
            })}
            {value.length > 3 && (
              <div className="text-sm text-gray-500">
                {locale === "zh" ? `还有 ${value.length - 3} 条记录` : `And ${value.length - 3} more records`}
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">
            {field.preset === "custom_experience" && field.customExperienceConfig?.experienceName 
              ? `暂无${field.customExperienceConfig.experienceName}` 
              : (locale === "zh" ? "暂无经历" : "No experience")
            }
          </span>
        )
      case "identity_verification":
        if (!value || typeof value !== "object") {
          return <span className="text-gray-400">{locale === "zh" ? "未填写" : "Not filled"}</span>
        }
        const hasData = value.name || value.idNumber || value.frontPhoto || value.backPhoto
        if (!hasData) {
          return <span className="text-gray-400">{locale === "zh" ? "未填写" : "Not filled"}</span>
        }
        return (
          <div className="space-y-3">
            {value.name && (
              <div>
                <div className="text-sm font-medium text-gray-700">{locale === "zh" ? "姓名" : "Name"}</div>
                <div className="text-sm">{value.name}</div>
              </div>
            )}
            {value.idNumber && (
              <div>
                <div className="text-sm font-medium text-gray-700">{locale === "zh" ? "身份证号" : "ID Number"}</div>
                <div className="text-sm font-mono">{value.idNumber}</div>
              </div>
            )}
            {(value.frontPhoto || value.backPhoto) && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">{locale === "zh" ? "身份证照片" : "ID Card Photos"}</div>
                <div className="grid grid-cols-2 gap-3">
                  {value.frontPhoto && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{locale === "zh" ? "正面" : "Front"}</div>
                      <img
                        src={value.frontPhoto}
                        alt={locale === "zh" ? "身份证正面" : "ID Card Front"}
                        className="w-full h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                  {value.backPhoto && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{locale === "zh" ? "反面" : "Back"}</div>
                      <img
                        src={value.backPhoto}
                        alt={locale === "zh" ? "身份证反面" : "ID Card Back"}
                        className="w-full h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      case "other_verification":
        if (!value || typeof value !== "object") {
          return <span className="text-gray-400">{locale === "zh" ? "未填写" : "Not filled"}</span>
        }
        const otherVerificationHasData = Object.keys(value).length > 0
        if (!otherVerificationHasData) {
          return <span className="text-gray-400">{locale === "zh" ? "未填写" : "Not filled"}</span>
        }
        
        const textFields = Object.entries(value).filter(([key, val]) => 
          typeof val === "string" && val.trim() !== ""
        )
        const imageFields = Object.entries(value).filter(([key, val]) => 
          Array.isArray(val) && val.length > 0
        )
        
        return (
          <div className="space-y-4">
            {/* 文字信息 */}
            {textFields.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">{locale === "zh" ? "文字信息" : "Text Information"}</div>
                <div className="space-y-2">
                  {textFields.map(([key, val]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-600">{key}: </span>
                      <span>{val as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 图片信息 */}
            {imageFields.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">{locale === "zh" ? "图片信息" : "Image Information"}</div>
                <div className="grid grid-cols-2 gap-3">
                  {imageFields.map(([key, images]) => (
                    <div key={key}>
                      <div className="text-xs text-gray-500 mb-1">{key}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {(images as string[]).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${key} ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      default:
        return <span>{String(value)}</span>
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
                  onClick={() => setIsEditing(false)}
                >
                  {locale === "zh" ? "取消" : "Cancel"}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={handleSubmit}
                >
                  {locale === "zh" ? "保存" : "Save"}
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
            <TabsTrigger
              value="dynamics"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2"
            >
              {t("dynamicRecord")}
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
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto bg-white min-h-0">
          <TabsContent value="basic" className="p-6 mt-0 flex-none">
            {isEditing ? (
              <form id="record-form" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {(() => {
                    const singleRowFields = basicFields.filter(f => 
                      f.type === "textarea" || 
                      f.type === "rich_text" || 
                      f.type === "markdown" ||
                      f.type === "json" ||
                      f.type === "relation_many" ||
                      f.type === "relation_one" ||
                      f.type === "experience"
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
                              <FormField
                                field={field}
                                record={rec}
                                app={app}
                                onChange={(val) =>
                                  mutate((_, r) => {
                                    ;(r as any)[field.key] = val
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* 单排布局字段 */}
                        {singleRowFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <FormField
                              field={field}
                              record={rec}
                              app={app}
                              onChange={(val) =>
                                mutate((_, r) => {
                                  ;(r as any)[field.key] = val
                                })
                              }
                            />
                          </div>
                        ))}
                      </>
                    )
                  })()}
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const singleRowFields = basicFields.filter(f => 
                    f.type === "textarea" || 
                    f.type === "rich_text" || 
                    f.type === "markdown" ||
                    f.type === "json" ||
                    f.type === "relation_many" ||
                    f.type === "relation_one" ||
                    f.type === "experience"
                  )
                  const doubleRowFields = basicFields.filter(f => 
                    !singleRowFields.includes(f)
                  )
                  
                  return (
                    <>
                      {/* 双排布局字段 - 只读显示 */}
                      <div className="grid grid-cols-2 gap-6">
                        {doubleRowFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">{field.label}</div>
                            <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 min-h-[40px] flex items-center">
                              {renderFieldValue(field, rec)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* 单排布局字段 - 只读显示 */}
                      {singleRowFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">{field.label}</div>
                          <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 min-h-[40px]">
                            {renderFieldValue(field, rec)}
                          </div>
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
                  onChange={(newIds) =>
                    mutate((_, r) => {
                      ;(r as any)[field.key] = newIds
                    })
                  }
                />
              ) : (
                <RelationOneTab
                  app={app}
                  field={field}
                  rec={rec}
                  onChange={(newId) =>
                    mutate((_, r) => {
                      ;(r as any)[field.key] = newId
                    })
                  }
                />
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {isEditing && (
        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-end">
          <Button type="submit" form="record-form" className="rounded-lg px-6 bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md transition-all duration-200">
            {t("saveChanges")}
          </Button>
        </div>
      )}
    </SheetContent>
  )
}
