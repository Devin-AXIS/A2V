"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowUp, Trash2, Sparkles } from "lucide-react"
import type { ExperienceItem } from "@/lib/data/experience-data"
import { DEGREE_OPTIONS } from "@/lib/data/experience-data"

interface ExperienceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experience: ExperienceItem | null
  onSave: (experience: ExperienceItem) => void
  onDelete?: () => void
}

export function ExperienceDialog({ open, onOpenChange, experience, onSave, onDelete }: ExperienceDialogProps) {
  const [formData, setFormData] = useState<ExperienceItem | null>(null)
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    if (open) {
      if (experience) {
        setFormData({ ...experience })
      } else {
        // 当弹窗打开但没有experience时，初始化一个空的formData
        setFormData(experience)
      }
    } else {
      // 如果弹窗关闭，清空formData
      setFormData(null)
    }
  }, [experience, open])

  // 如果弹窗没有打开，不渲染
  if (!open) return null

  const handleSave = () => {
    if (formData) {
      onSave(formData)
    }
  }

  const updateField = (field: keyof ExperienceItem, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    const skills = formData.skills || []
    if (!skills.includes(newSkill.trim())) {
      updateField("skills", [...skills, newSkill.trim()])
    }
    setNewSkill("")
  }

  const removeSkill = (skillToRemove: string) => {
    const skills = formData.skills || []
    updateField(
      "skills",
      skills.filter((skill) => skill !== skillToRemove),
    )
  }

  const getTitle = () => {
    if (!formData) return "添加经历"
    switch (formData.type) {
      case "education":
        return "教育经历"
      case "work":
        return "工作经历"
      case "project":
        return "项目经历"
      case "certificate":
        return "证书资质"
      default:
        return "经历"
    }
  }

  const getFieldLabels = () => {
    if (!formData) {
      return {
        title: "标题",
        organization: "机构",
        titlePlaceholder: "请输入标题",
        organizationPlaceholder: "请输入机构",
      }
    }
    switch (formData.type) {
      case "education":
        return {
          title: "学校",
          organization: "专业",
          titlePlaceholder: "请输入学校名称",
          organizationPlaceholder: "请输入专业名称",
        }
      case "work":
        return {
          title: "职位",
          organization: "公司",
          titlePlaceholder: "请输入职位名称",
          organizationPlaceholder: "请输入公司名称",
        }
      case "project":
        return {
          title: "项目名称",
          organization: "所属机构",
          titlePlaceholder: "请输入项目名称",
          organizationPlaceholder: "请输入机构名称",
        }
      case "certificate":
        return {
          title: "证书名称",
          organization: "颁发机构",
          titlePlaceholder: "请输入证书名称",
          organizationPlaceholder: "请输入颁发机构",
        }
      default:
        return {
          title: "标题",
          organization: "机构",
          titlePlaceholder: "请输入标题",
          organizationPlaceholder: "请输入机构",
        }
    }
  }

  const labels = getFieldLabels()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTitle()}
            <Button variant="ghost" size="sm" className="ml-auto text-blue-600 hover:text-blue-700">
              <Sparkles className="h-4 w-4 mr-1" />
              粘贴内容识别
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">{labels.title}</Label>
              <Input
                value={formData?.title || ""}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={labels.titlePlaceholder}
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{labels.organization}</Label>
              <Input
                value={formData?.organization || ""}
                onChange={(e) => updateField("organization", e.target.value)}
                placeholder={labels.organizationPlaceholder}
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* 教育经历特有字段 */}
          {formData?.type === "education" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">学历</Label>
                <Select value={formData.degree || ""} onValueChange={(value) => updateField("degree", value)}>
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue placeholder="请选择学历" />
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
              <div>
                <Label className="text-sm font-medium">GPA</Label>
                <Input
                  value={formData.gpa || ""}
                  onChange={(e) => updateField("gpa", e.target.value)}
                  placeholder="如：3.8/4.0"
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* 工作经历特有字段 */}
          {formData?.type === "work" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">部门</Label>
                <Input
                  value={formData.department || ""}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="请输入部门"
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">薪资</Label>
                <Input
                  value={formData?.salary || ""}
                  onChange={(e) => updateField("salary", e.target.value)}
                  placeholder="如：15K-20K"
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* 时间范围 */}
          <div>
            <Label className="text-sm font-medium mb-3 block">时间</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  value={formData?.startDate || ""}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  className="bg-gray-50"
                />
                <div className="text-xs text-gray-500 mt-1">开始时间</div>
              </div>
              <div>
                <Input
                  type="date"
                  value={formData?.endDate || ""}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  disabled={formData?.isCurrent || false}
                  className="bg-gray-50"
                />
                <div className="text-xs text-gray-500 mt-1">结束时间</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <Switch
                checked={formData?.isCurrent || false}
                onCheckedChange={(checked) => {
                  updateField("isCurrent", checked)
                  if (checked) updateField("endDate", undefined)
                }}
              />
              <Label className="text-sm">
                {formData?.type === "work" ? "目前在职" : formData?.type === "education" ? "目前在读" : "进行中"}
              </Label>
            </div>
          </div>

          {/* 工作描述 */}
          <div>
            <Label className="text-sm font-medium">
              {formData?.type === "work" ? "工作描述" : formData?.type === "education" ? "学习描述" : "描述"}
            </Label>
            <Textarea
              value={formData?.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder={
                formData?.type === "work"
                  ? "可填写企业经历、创业经历、政府或机构经历、非营利组织工作经历等；主要简述工作内容、岗位职责及取得的工作成果。如果不填则由AI根据职位自动撰写。"
                  : "详细描述相关内容..."
              }
              rows={4}
              className="bg-gray-50"
            />
          </div>

          {/* 技能标签 */}
          <div>
            <Label className="text-sm font-medium">相关技能</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {formData?.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="添加技能标签"
                  className="bg-gray-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button variant="outline" onClick={addSkill}>
                  添加
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* 底部按钮 */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            {onDelete && (
              <>
                <Button variant="outline" size="sm">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  前移
                </Button>
                <Button variant="outline" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  删除
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
