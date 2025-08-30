"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import type { AppModel, FieldModel, RecordRow } from "@/lib/store"
import { CascaderSelect } from "@/components/cascader-select"
import { CitySelect } from "@/components/city-select"
import { CountrySelect } from "@/components/country-select"
import { RatingInput } from "@/components/rating-input"
import { CurrencyInput } from "@/components/currency-input"
import { UserSelect } from "@/components/user-select"
import { ExperienceEditor } from "@/components/experience-editor"
import { ConstellationSelect } from "@/components/constellation-select"
import { SkillsSelect } from "@/components/skills-select"
import { IdentityVerificationInput } from "@/components/form-inputs/identity-verification-input"
import { OtherVerificationInput } from "@/components/form-inputs/other-verification-input"
import { ImageInput } from "@/components/form-inputs/image-input"
import { AvatarInput } from "@/components/form-inputs/avatar-input"
import { VideoInput } from "@/components/form-inputs/video-input"

import { ModernDateInput } from "@/components/form-inputs/modern-date-input"
import { TimeInput } from "@/components/form-inputs/time-input"
import { MultiSelectInput } from "@/components/form-inputs/multi-select-input"
import { TagInput } from "@/components/form-inputs/tag-input"
import { RelationInput } from "@/components/form-inputs/relation-input"
import { PhoneInput } from "@/components/form-inputs/phone-input"
import { ProgressInput } from "@/components/form-inputs/progress-input"

function renderInput(field: FieldModel, record: RecordRow, onChange: (v: any) => void, app: AppModel) {
  const value = (record as any)[field.key]

  // Handle presets first
  if (field.preset) {
    switch (field.preset) {
      case "user_select":
        return <UserSelect app={app} value={value} onChange={onChange} isMulti={field.type === "relation_many"} />
      case "city":
        return <CitySelect value={value || ""} onChange={onChange} />
      case "country":
        return <CountrySelect value={value || ""} onChange={onChange} />
      case "rating":
        return <RatingInput value={value || 0} onChange={onChange} />
      case "currency":
        return <CurrencyInput value={value} onChange={onChange} />
      case "constellation":
        return <ConstellationSelect value={value || ""} onChange={onChange} />
      case "progress":
        return (
          <ProgressInput
            value={value || 0}
            onChange={onChange}
            maxValue={field.progressConfig?.maxValue || 100}
            showProgressBar={field.progressConfig?.showProgressBar !== false}
            showPercentage={field.progressConfig?.showPercentage !== false}
            placeholder={field.placeholder}
          />
        )
      case "phone":
        return (
          <PhoneInput
            value={value || ""}
            onChange={onChange}
            placeholder="请输入手机号"
          />
        )
      case "email":
        return (
          <Input
            type="email"
            className="bg-white"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请输入邮箱"
          />
        )
      case "url":
        return (
          <Input
            type="url"
            className="bg-white"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com"
          />
        )
      case "map":
        return (
          <div className="space-y-2">
            <Input
              className="bg-white"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="请输入地址或坐标"
            />
            <div className="text-xs text-gray-500">
              支持地址搜索或经纬度坐标（如：39.9042, 116.4074）
            </div>
          </div>
        )
      case "skills":
        return (
          <SkillsSelect
            value={value || []}
            onChange={onChange}
            allowedCategories={field.skillsConfig?.allowedCategories}
            maxSkills={field.skillsConfig?.maxSkills}
            showLevel={field.skillsConfig?.showLevel}
            customCategories={field.skillsConfig?.customCategories}
            customSkills={field.skillsConfig?.customSkills}
          />
        )
      case "identity_verification":
        return (
          <IdentityVerificationInput
            value={value || {}}
            onChange={onChange}
            config={field.identityVerificationConfig}
          />
        )
      case "other_verification":
        return (
          <OtherVerificationInput
            value={value || {}}
            onChange={onChange}
            config={field.otherVerificationConfig}
          />
        )
      case "work_experience":
      case "education_experience":
      case "certificate_experience":
      case "custom_experience":
        return <ExperienceEditor value={value || []} onChange={onChange} className="bg-white rounded-md p-2" field={field} />
      default:
        break
    }
  }

  switch (field.type) {
    case "richtext":
    case "textarea":
      return <Textarea className="bg-white" rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    case "number":
      return (
        <Input
          type="number"
          className="bg-white"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )
    case "percent":
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            step={1}
            className="bg-white"
            value={value ?? ""}
            onChange={(e) => {
              const n = e.target.value === "" ? null : Math.max(0, Math.min(100, Number(e.target.value)))
              onChange(n)
            }}
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      )
    case "checkbox":
    case "boolean":
      return (
        <div className="flex items-center space-x-2 pt-2">
          <Switch id={`switch-${field.id}`} checked={!!value} onCheckedChange={onChange} />
          <Label htmlFor={`switch-${field.id}`}>{value ? field.trueLabel || "是" : field.falseLabel || "否"}</Label>
        </div>
      )
    case "select":
      return (
        <Select value={value || ""} onValueChange={(x) => onChange(x)}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="请选择..." />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "multiselect":
      return <MultiSelectInput field={field} value={value} onChange={onChange} />
    case "tags":
      return <TagInput value={value} onChange={onChange} />
    case "date":
      return <ModernDateInput field={field} value={value} onChange={onChange} />
    case "datetime":
      return (
        <div className="flex gap-2">
          <Input
            type="date"
            className="bg-white flex-1"
            value={value ? new Date(value).toISOString().split('T')[0] : ""}
            onChange={(e) => {
              const date = e.target.value
              const time = value ? new Date(value).toTimeString().slice(0, 5) : "00:00"
              onChange(new Date(`${date}T${time}`).toISOString())
            }}
          />
          <Input
            type="time"
            className="bg-white flex-1"
            value={value ? new Date(value).toTimeString().slice(0, 5) : ""}
            onChange={(e) => {
              const time = e.target.value
              const date = value ? new Date(value).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
              onChange(new Date(`${date}T${time}`).toISOString())
            }}
          />
        </div>
      )
    case "daterange":
      return <ModernDateInput field={{...field, dateMode: "range"}} value={value} onChange={onChange} />
    case "multidate":
      return <ModernDateInput field={{...field, dateMode: "multiple"}} value={value} onChange={onChange} />
    case "time":
      return <TimeInput value={value} onChange={onChange} />
    case "file":
      return (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            className="bg-white"
            accept={field.accept || "*/*"}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              onChange(file.name)
            }}
          />
          {value && (
            <span className="text-xs rounded-full border bg-white px-2 py-0.5" title="文件名">
              {String(value)}
            </span>
          )}
        </div>
      )
    case "image":
      return (
        <ImageInput
          value={value}
          onChange={onChange}
          multiple={field.imageConfig?.multiple || false}
          defaultImage={field.imageConfig?.defaultImage || ""}
        />
      )
    case "profile":
      return (
        <AvatarInput
          value={value}
          onChange={onChange}
          multiple={field.imageConfig?.multiple || false}
          defaultImage={field.imageConfig?.defaultImage || ""}
          size="md"
        />
      )
    case "multiimage":
      return (
        <ImageInput
          value={value}
          onChange={onChange}
          multiple={true}
          defaultImage={field.imageConfig?.defaultImage || ""}
        />
      )
    case "video":
      return (
        <VideoInput
          value={value}
          onChange={onChange}
          multiple={field.videoConfig?.multiple || false}
          defaultVideo={field.videoConfig?.defaultVideo || ""}
        />
      )
    case "multivideo":
      return (
        <VideoInput
          value={value}
          onChange={onChange}
          multiple={true}
          defaultVideo={field.videoConfig?.defaultVideo || ""}
        />
      )
    case "identity_verification":
      return (
        <IdentityVerificationInput
          value={value || {}}
          onChange={onChange}
          config={field.identityVerificationConfig}
        />
      )
    case "other_verification":
      return (
        <OtherVerificationInput
          value={value || {}}
          onChange={onChange}
          config={field.otherVerificationConfig}
        />
      )
    case "barcode":
      return <Input className="bg-white" value={value || ""} onChange={(e) => onChange(e.target.value)} />
    case "cascader":
      // 调试日志
      console.log("🔍 FormField - Cascader field:", field);
      console.log("🔍 FormField - CascaderOptions:", field.cascaderOptions);
      console.log("🔍 FormField - CascaderOptions length:", field.cascaderOptions?.length || 0);
      return (
        <CascaderSelect
          tree={field.cascaderOptions || []}
          value={value || "all"}
          onChange={onChange}
          placeholder="请选择..."
          clearText="清除选择"
        />
      )
    case "relation_one":
    case "relation_many":
      return <RelationInput app={app} field={field} value={value} onChange={onChange} />
    case "experience":
      return <ExperienceEditor value={value || []} onChange={onChange} className="bg-white rounded-md p-2" field={field} />

    default:
      return <Input className="bg-white" value={value || ""} onChange={(e) => onChange(e.target.value)} />
  }
}

interface FormFieldProps {
  field: FieldModel
  record: RecordRow
  app: AppModel
  onChange: (value: any) => void
  showValidation?: boolean
}

export function FormField({ field, record, app, onChange, showValidation = false }: FormFieldProps) {
  const value = (record as any)[field.key]
  
  // 验证字段值
  const getValidationError = () => {
    if (!showValidation || !field.required) return null
    
    const isEmpty = 
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" && Object.keys(value).length === 0)
    
    if (field.type === "number" || field.type === "percent") {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "请输入有效的数字"
      }
    } else if (field.type === "boolean" || field.type === "checkbox") {
      // booleans are always valid as required
    } else if (isEmpty) {
      return "此字段为必填项"
    }
    
    return null
  }
  
  const validationError = getValidationError()
  
  // 对于experience类型的字段，不显示外层标签，避免重复标题
  if (field.type === "experience") {
    return (
      <div className="space-y-2">
        {renderInput(field, record, onChange, app)}
        {validationError && (
          <div className="text-sm text-red-500">{validationError}</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </div>
      <div className={validationError ? "border-red-300 rounded-md" : ""}>
        {renderInput(field, record, onChange, app)}
      </div>
      {validationError && (
        <div className="text-sm text-red-500">{validationError}</div>
      )}
      {field.desc && (
        <div className="text-xs text-gray-500">{field.desc}</div>
      )}
    </div>
  )
}
