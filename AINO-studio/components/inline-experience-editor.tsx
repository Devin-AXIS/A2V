"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, Save, Edit2 } from "lucide-react"
import type { ExperienceItem, ExperienceType } from "@/lib/data/experience-data"
import { DEGREE_OPTIONS } from "@/lib/data/experience-data"
import { useLocale } from "@/hooks/use-locale"
import { CertificateSelect } from "@/components/form-inputs/certificate-select"

interface InlineExperienceEditorProps {
  experience: ExperienceItem | null
  type: ExperienceType // 添加类型参数
  onSave: (experience: ExperienceItem) => void
  onCancel: () => void
  onDelete?: () => void
  field?: any // 添加字段配置参数
}

export function InlineExperienceEditor({ 
  experience, 
  type,
  onSave, 
  onCancel, 
  onDelete,
  field
}: InlineExperienceEditorProps) {
  const { locale } = useLocale()
  const [formData, setFormData] = useState<ExperienceItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (experience) {
      setFormData({ ...experience })
      setIsEditing(false)
    } else {
      // 新建经历
      setFormData({
        id: Math.random().toString(36).slice(2),
        type: type, // 使用传入的类型
        title: "",
        organization: "",
        startDate: "",
        isCurrent: false,
        description: "",
        skills: [],
      })
      setIsEditing(true)
    }
  }, [experience])

  if (!formData) return null

  const getFieldLabels = () => {
    // 调试日志
    console.log("🔍 InlineExperienceEditor - Field config:", field);
    console.log("🔍 InlineExperienceEditor - FormData type:", formData.type);
    console.log("🔍 InlineExperienceEditor - Field preset:", field?.preset);
    console.log("🔍 InlineExperienceEditor - CustomExperienceConfig:", field?.customExperienceConfig);
    
    // 如果是自定义经历字段，使用配置的标签
    if (field?.preset === "custom_experience" && field?.customExperienceConfig) {
      const experienceName = field.customExperienceConfig.experienceName || (locale === "zh" ? "经历" : "Experience")
      const eventName = field.customExperienceConfig.eventName || (locale === "zh" ? "事件" : "Event")
      
      return {
        title: experienceName,
        organization: eventName,
        titlePlaceholder: locale === "zh" ? `请输入${experienceName}` : `Enter ${experienceName}`,
        organizationPlaceholder: locale === "zh" ? `请输入${eventName}` : `Enter ${eventName}`,
      }
    }
    
    // 如果是证书资质字段，使用配置的标签
    if (field?.preset === "certificate_experience" && field?.certificateConfig) {
      const certificateName = (locale === "zh" ? "证书" : "Certificate")
      const issuingAuthority = field.certificateConfig.issuingAuthority || (locale === "zh" ? "颁发机构" : "Issuing Authority")
      
      return {
        title: certificateName,
        organization: issuingAuthority,
        titlePlaceholder: field.certificateConfig.allowCustomCertificateName 
          ? (locale === "zh" ? "请输入证书名称" : "Enter certificate name")
          : (locale === "zh" ? "请选择证书" : "Select certificate"),
        organizationPlaceholder: field.certificateConfig.allowCustomIssuingAuthority 
          ? (locale === "zh" ? "请输入颁发单位" : "Enter issuing authority")
          : (locale === "zh" ? `请输入${issuingAuthority}` : `Enter ${issuingAuthority}`),
      }
    }
    
    // 传统经历字段的标签
    switch (formData.type) {
      case "education":
        return {
          title: locale === "zh" ? "学校名称" : "School Name",
          organization: locale === "zh" ? "学院/系" : "College/Department",
          titlePlaceholder: locale === "zh" ? "请输入学校名称" : "Enter school name",
          organizationPlaceholder: locale === "zh" ? "请输入学院或系" : "Enter college or department",
        }
      case "work":
        return {
          title: locale === "zh" ? "公司名称" : "Company Name",
          organization: locale === "zh" ? "职位" : "Position",
          titlePlaceholder: locale === "zh" ? "请输入公司名称" : "Enter company name",
          organizationPlaceholder: locale === "zh" ? "请输入职位名称" : "Enter position",
        }
      case "project":
        // 如果是自定义经历字段，使用配置的标签
        if (field?.preset === "custom_experience" && field?.customExperienceConfig) {
          const experienceName = field.customExperienceConfig.experienceName || (locale === "zh" ? "经历" : "Experience")
          const eventName = field.customExperienceConfig.eventName || (locale === "zh" ? "事件" : "Event")
          
          return {
            title: experienceName,
            organization: eventName,
            titlePlaceholder: locale === "zh" ? `请输入${experienceName}` : `Enter ${experienceName}`,
            organizationPlaceholder: locale === "zh" ? `请输入${eventName}` : `Enter ${eventName}`,
          }
        }
        // 默认项目标签
        return {
          title: locale === "zh" ? "项目名称" : "Project Name",
          organization: locale === "zh" ? "所属机构" : "Organization",
          titlePlaceholder: locale === "zh" ? "请输入项目名称" : "Enter project name",
          organizationPlaceholder: locale === "zh" ? "请输入机构名称" : "Enter organization",
        }
      case "certificate":
        return {
          title: locale === "zh" ? "证书名称" : "Certificate Name",
          organization: locale === "zh" ? "颁发机构" : "Issuing Organization",
          titlePlaceholder: locale === "zh" ? "请输入证书名称" : "Enter certificate name",
          organizationPlaceholder: locale === "zh" ? "请输入颁发机构" : "Enter issuing organization",
        }
      default:
        return {
          title: locale === "zh" ? "名称" : "Name",
          organization: locale === "zh" ? "副标题" : "Subtitle",
          titlePlaceholder: locale === "zh" ? "请输入名称" : "Enter name",
          organizationPlaceholder: locale === "zh" ? "请输入副标题" : "Enter subtitle",
        }
    }
  }

  const labels = getFieldLabels()

  const handleSave = () => {
    if (formData) {
      onSave(formData)
    }
  }

  const updateField = (field: keyof ExperienceItem, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  if (!isEditing) {
    // 显示模式
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{formData.title || (locale === "zh" ? "未填写" : "Not filled")}</h3>
            <p className="text-sm text-gray-600 mt-1">{formData.organization || (locale === "zh" ? "未填写" : "Not filled")}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : (locale === "zh" ? "未设置" : "Not set")} - 
              {formData.isCurrent ? (locale === "zh" ? "至今" : "Present") : (formData.endDate ? new Date(formData.endDate).toLocaleDateString() : (locale === "zh" ? "未设置" : "Not set"))}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {formData.description && (
          <p className="text-sm text-gray-700 mt-2">{formData.description}</p>
        )}
      </div>
    )
  }

  // 编辑模式
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="space-y-4">

        {/* 名称和副标题 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">{labels.title}</Label>
            {/* 如果是证书资质字段且有预设选项，使用证书选择组件 */}
            {field?.preset === "certificate_experience" && 
             field?.certificateConfig && 
             !field.certificateConfig.allowCustomCertificateName && 
             field.certificateConfig.certificateNames?.length > 0 ? (
              <CertificateSelect
                value={formData.title}
                onChange={(value) => updateField("title", value)}
                certificateNames={field.certificateConfig.certificateNames}
                allowCustom={field.certificateConfig.allowCustomCertificateName}
                placeholder={labels.titlePlaceholder}
              />
            ) : (
              <Input
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={labels.titlePlaceholder}
                className="bg-gray-50"
              />
            )}
          </div>
          <div>
            <Label className="text-sm font-medium">{labels.organization}</Label>
            <Input
              value={formData.organization}
              onChange={(e) => updateField("organization", e.target.value)}
              placeholder={labels.organizationPlaceholder}
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* 时间范围 - 证书资质字段不显示时间范围 */}
        {formData.type !== "certificate" && (
          <div>
            <Label className="text-sm font-medium mb-2 block">{locale === "zh" ? "时间范围" : "Time Period"}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  className="bg-gray-50"
                />
                <div className="text-xs text-gray-500 mt-1">{locale === "zh" ? "开始时间" : "Start Date"}</div>
              </div>
              <div>
                <Input
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  disabled={formData.isCurrent}
                  className="bg-gray-50"
                />
                <div className="text-xs text-gray-500 mt-1">{locale === "zh" ? "结束时间" : "End Date"}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <Switch
                checked={formData.isCurrent}
                onCheckedChange={(checked) => {
                  updateField("isCurrent", checked)
                  if (checked) updateField("endDate", undefined)
                }}
              />
              <Label className="text-sm">
                {field?.preset === "custom_experience" 
                  ? (locale === "zh" ? "进行中" : "In progress")
                  : formData.type === "work" 
                  ? (locale === "zh" ? "目前在职" : "Currently employed")
                  : formData.type === "education" 
                  ? (locale === "zh" ? "目前在读" : "Currently studying")
                  : (locale === "zh" ? "进行中" : "In progress")
                }
              </Label>
            </div>
          </div>
        )}

        {/* 描述 */}
        <div>
          <Label className="text-sm font-medium">{locale === "zh" ? "详细描述" : "Description"}</Label>
          <Textarea
            value={formData.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder={locale === "zh" ? "请详细描述相关内容..." : "Please describe the details..."}
            rows={3}
            className="bg-gray-50"
          />
        </div>

        {/* 教育经历特有字段 - 只在非自定义经历字段时显示 */}
        {formData.type === "education" && field?.preset !== "custom_experience" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">{locale === "zh" ? "学历" : "Degree"}</Label>
              <Select value={formData.degree || ""} onValueChange={(value) => updateField("degree", value)}>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder={locale === "zh" ? "请选择学历" : "Select degree"} />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_OPTIONS.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* 只有本科及以上学历才显示专业字段 */}
            {formData.degree && ["本科", "硕士", "博士", "博士后"].includes(formData.degree) && (
              <div>
                <Label className="text-sm font-medium">{locale === "zh" ? "专业" : "Major"}</Label>
                <Input
                  value={formData.major || ""}
                  onChange={(e) => updateField("major", e.target.value)}
                  placeholder={locale === "zh" ? "请输入专业" : "Enter major"}
                  className="bg-gray-50"
                />
              </div>
            )}
          </div>
        )}

        {/* 工作经历特有字段 - 只在非自定义经历字段时显示 */}
        {formData.type === "work" && field?.preset !== "custom_experience" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">{locale === "zh" ? "部门" : "Department"}</Label>
              <Input
                value={formData.department || ""}
                onChange={(e) => updateField("department", e.target.value)}
                placeholder={locale === "zh" ? "请输入部门" : "Enter department"}
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{locale === "zh" ? "薪资" : "Salary"}</Label>
              <Input
                value={formData.salary || ""}
                onChange={(e) => updateField("salary", e.target.value)}
                placeholder={locale === "zh" ? "如：15K-20K" : "e.g. 15K-20K"}
                className="bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800">
            <Save className="h-4 w-4 mr-1" />
            {locale === "zh" ? "保存" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
