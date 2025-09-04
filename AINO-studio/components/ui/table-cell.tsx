"use client"

import { cn } from "@/lib/utils"
import type { FieldModel } from "@/lib/store"
import { getSkillById } from "@/lib/data/skills-data"

interface TableCellProps {
  type: string
  value: any
  field?: FieldModel
  className?: string
}

export function TableCell({ type, value, field, className }: TableCellProps) {
  const valueStr = String(value ?? "")

  const renderContent = () => {
    if (type === "tags" && Array.isArray(value) && value.length > 0) {
      const visibleTags = value.slice(0, 2)
      const hiddenCount = value.length - visibleTags.length
      return (
        <div className="flex flex-wrap gap-1 items-center" title={value.join(", ")}>
          {visibleTags.map((x: string, i: number) => (
            <span
              key={i}
              className="text-xs px-1.5 py-0.5 rounded-full border border-white/60 bg-white/70 backdrop-blur shadow-sm"
            >
              {x}
            </span>
          ))}
          {hiddenCount > 0 && <span className="text-xs text-muted-foreground ml-1">+{hiddenCount}</span>}
        </div>
      )
    }

    if (type === "select" && String(value ?? "") === "上架") {
      return <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{value}</span>
    }

    if (type === "boolean" || type === "checkbox") {
      const label = value ? field?.trueLabel || "是" : field?.falseLabel || "否"
      return (
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-full",
            value ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700",
          )}
        >
          {label}
        </span>
      )
    }

    if (type === "image" && value) {
      return (
        <img
          src={typeof value === "string" ? value : "/placeholder.svg?height=32&width=48&query=image-preview"}
          alt="封面"
          className="h-8 w-12 object-cover rounded border border-white/60"
          crossOrigin="anonymous"
        />
      )
    }

    if (type === "percent") {
      const n = Number(value ?? 0)
      return (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
          {Number.isFinite(n) ? `${n}%` : ""}
        </span>
      )
    }

    if (type === "progress" && field?.progressConfig) {
      const progressValue = Number(value ?? 0)
      const maxValue = field.progressConfig.maxValue || 100
      const percentage = Math.round((progressValue / maxValue) * 100)
      
      return (
        <div className="flex items-center gap-2">
          {field.progressConfig.showProgressBar && (
            <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
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
      )
    }

    if ((type === "skills" || (type === "multiselect" && field?.preset === "skills")) && Array.isArray(value) && value.length > 0) {
      // 获取技能名称
      const skillNames = value.map((skillId: string) => {
        // 先从预定义技能中查找
        const predefinedSkill = getSkillById(skillId)
        if (predefinedSkill) return predefinedSkill.name
        
        // 再从自定义技能中查找
        const customSkill = field?.skillsConfig?.customSkills?.find((s: any) => s.id === skillId)
        if (customSkill) return customSkill.name
        
        return skillId // 如果都找不到，显示ID
      }).filter(Boolean)
      
      const visibleSkills = skillNames.slice(0, 2)
      const hiddenCount = skillNames.length - visibleSkills.length
      
      return (
        <div className="flex flex-wrap gap-1 items-center" title={skillNames.join(", ")}>
          {visibleSkills.map((skillName: string, i: number) => (
            <span
              key={i}
              className="text-xs px-1.5 py-0.5 rounded-full border border-white/60 bg-white/70 backdrop-blur shadow-sm"
            >
              {skillName}
            </span>
          ))}
          {hiddenCount > 0 && <span className="text-xs text-muted-foreground ml-1">+{hiddenCount}</span>}
        </div>
      )
    }

    if (type === "file") {
      return value ? (
        <div className="text-xs truncate" title={valueStr}>
          {valueStr}
        </div>
      ) : (
        ""
      )
    }

    // Default text-like fields
    return (
      <div className="truncate" title={valueStr}>
        {valueStr}
      </div>
    )
  }

  return <div className={className}>{renderContent()}</div>
}
