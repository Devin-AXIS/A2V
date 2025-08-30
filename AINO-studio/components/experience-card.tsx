"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Calendar, MapPin, Building2, GraduationCap, Briefcase, Award } from "lucide-react"
import type { ExperienceItem } from "@/lib/data/experience-data"

interface ExperienceCardProps {
  experience: ExperienceItem
  onClick?: () => void
  field?: any // 添加字段配置参数
}

export function ExperienceCard({ experience, onClick, field }: ExperienceCardProps) {
  const getIcon = () => {
    switch (experience.type) {
      case "education":
        return <GraduationCap className="h-4 w-4" />
      case "work":
        return <Briefcase className="h-4 w-4" />
      case "project":
        return <Building2 className="h-4 w-4" />
      case "certificate":
        return <Award className="h-4 w-4" />
      default:
        return <Briefcase className="h-4 w-4" />
    }
  }

  const formatDateRange = () => {
    if (!experience.startDate) return ""
    const start = new Date(experience.startDate).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
    })

    if (experience.isCurrent) {
      return `${start} - 至今`
    }

    if (experience.endDate) {
      const end = new Date(experience.endDate).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
      })
      return `${start} - ${end}`
    }

    return start
  }

  return (
    <Card className="bg-white/70 border-gray-200 hover:bg-white/90 transition-colors cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* 标题行 */}
            <div className="flex items-center gap-2">
              {getIcon()}
              <h3 className="font-medium text-gray-900">{experience.title || "请输入标题"}</h3>
            </div>

            {/* 机构/公司 */}
            <div className="text-sm text-gray-600">
              {field?.preset === "custom_experience" && field?.customExperienceConfig?.eventName ? (
                `${field.customExperienceConfig.eventName}：`
              ) : field?.preset === "certificate_experience" && field?.certificateConfig?.issuingAuthority ? (
                `${field.certificateConfig.issuingAuthority}：`
              ) : (
                experience.type === "education" ? "学校：" :
                experience.type === "work" ? "公司：" :
                experience.type === "project" ? "机构：" :
                experience.type === "certificate" ? "颁发机构：" : "机构："
              )}
              <span className="text-gray-500">
                {experience.organization ||
                  (field?.preset === "custom_experience" && field?.customExperienceConfig?.eventName ? 
                    `请输入${field.customExperienceConfig.eventName}名称` :
                    field?.preset === "certificate_experience" && field?.certificateConfig?.issuingAuthority ? 
                    `请输入${field.certificateConfig.issuingAuthority}名称` :
                    `请输入${field?.customExperienceConfig?.eventName || (
                      experience.type === "education" ? "学校" :
                      experience.type === "work" ? "公司" :
                      experience.type === "project" ? "机构" : "颁发机构"
                    )}名称`)
                }
              </span>
            </div>

            {/* 专业/职位 */}
            {experience.type === "education" && (
              <div className="text-sm text-gray-600">
                专业：<span className="text-gray-500">{experience.major || "请输入专业名称"}</span>
              </div>
            )}

            {experience.type === "work" && experience.department && (
              <div className="text-sm text-gray-600">
                部门：<span className="text-gray-500">{experience.department}</span>
              </div>
            )}

            {/* 学历 */}
            {experience.type === "education" && experience.degree && (
              <div className="text-sm text-gray-600">
                学历：<span className="text-gray-500">{experience.degree}</span>
              </div>
            )}

            {/* 时间范围 */}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-3 w-3" />
              {formatDateRange()}
            </div>

            {/* 地点 */}
            {experience.location && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                {experience.location}
              </div>
            )}

            {/* 技能标签 */}
            {experience.skills && experience.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {experience.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {experience.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{experience.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
        </div>
      </CardContent>
    </Card>
  )
}
