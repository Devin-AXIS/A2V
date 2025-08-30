"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { ExperienceItem, ExperienceType } from "@/lib/data/experience-data"
import { EXPERIENCE_TYPES, createEmptyExperience } from "@/lib/data/experience-data"
import { ExperienceSection } from "./experience-section"
import { useLocale } from "@/hooks/use-locale"

interface ExperienceEditorProps {
  value: ExperienceItem[]
  onChange: (experiences: ExperienceItem[]) => void
  className?: string
  field?: any // 添加字段配置参数
}

export function ExperienceEditor({ value = [], onChange, className, field }: ExperienceEditorProps) {
  const { locale } = useLocale()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const addExperience = (type: ExperienceType) => {
    const newExp = createEmptyExperience(type)
    onChange([...value, newExp])
    setExpandedId(newExp.id)
  }

  const updateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    onChange(value.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)))
  }

  const removeExperience = (id: string) => {
    onChange(value.filter((exp) => exp.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const addSkill = (id: string, skill: string) => {
    if (!skill.trim()) return
    const exp = value.find((e) => e.id === id)
    if (exp && !exp.skills?.includes(skill)) {
      updateExperience(id, { skills: [...(exp.skills || []), skill] })
    }
  }

  const removeSkill = (id: string, skillToRemove: string) => {
    const exp = value.find((e) => e.id === id)
    if (exp) {
      updateExperience(id, { skills: exp.skills?.filter((s) => s !== skillToRemove) || [] })
    }
  }

  // 根据字段配置决定显示哪些类型的经历
  const getExperienceTypes = () => {
    // 调试日志
    console.log("🔍 ExperienceEditor - Field config:", field);
    console.log("🔍 ExperienceEditor - Field preset:", field?.preset);
    console.log("🔍 ExperienceEditor - CustomExperienceConfig:", field?.customExperienceConfig);
    
    if (!field) {
      // 默认只显示教育经历，避免重复标题
      return ["education"]
    }
    
    // 如果是自定义经历字段，使用通用类型但会通过配置自定义标签
    if (field.preset === "custom_experience") {
      console.log("🔍 ExperienceEditor - Using custom_experience type");
      return ["project"] // 使用项目类型作为通用经历类型，但标签会被自定义
    }
    
    // 根据字段标签或配置来决定显示的类型
    const label = field.label || ""
    if (label.includes("教育") || label.includes("学历")) {
      return ["education"]
    } else if (label.includes("工作")) {
      return ["work"]
    } else if (label.includes("项目")) {
      return ["project"]
    } else if (label.includes("证书") || label.includes("荣誉")) {
      return ["certificate"]
    } else {
      // 默认只显示教育经历
      return ["education"]
    }
  }

  const experienceTypes = getExperienceTypes()

  return (
    <div className={className}>
      <div className="space-y-8">
        {/* 经历列表 */}
        {experienceTypes.includes("education") && (
          <ExperienceSection 
            title={field?.customExperienceConfig?.experienceName || (locale === "zh" ? "教育经历" : "Education")} 
            type="education" 
            experiences={value} 
            onChange={onChange}
            field={field}
          />
        )}

        {experienceTypes.includes("work") && (
          <ExperienceSection 
            title={field?.customExperienceConfig?.experienceName || (locale === "zh" ? "工作经历" : "Work Experience")} 
            type="work" 
            experiences={value} 
            onChange={onChange}
            field={field}
          />
        )}

        {experienceTypes.includes("project") && (
          <ExperienceSection 
            title={field?.customExperienceConfig?.experienceName || (locale === "zh" ? "项目经历" : "Project Experience")} 
            type="project" 
            experiences={value} 
            onChange={onChange}
            field={field}
          />
        )}

        {experienceTypes.includes("certificate") && (
          <ExperienceSection 
            title={field?.customExperienceConfig?.experienceName || (locale === "zh" ? "证书资质" : "Certificates")} 
            type="certificate" 
            experiences={value} 
            onChange={onChange}
            field={field}
          />
        )}
      </div>
    </div>
  )
}
