import { GraduationCap } from "lucide-react"
import { FieldConfig, DisplayConfig } from "./generic-form-card"

// 教育经历字段配置
export const educationFields: FieldConfig[] = [
  {
    key: "school",
    label: "学校名称",
    type: "text",
    placeholder: "请输入学校名称",
    required: true,
    gridColumn: 2
  },
  {
    key: "major",
    label: "专业",
    type: "text",
    placeholder: "请输入专业名称",
    gridColumn: 2
  },
  {
    key: "degree",
    label: "学历",
    type: "select",
    placeholder: "请选择学历",
    required: true,
    gridColumn: 2,
    options: [
      { value: "博士", label: "博士" },
      { value: "硕士", label: "硕士" },
      { value: "本科", label: "本科" },
      { value: "专科", label: "专科" },
      { value: "高中", label: "高中" },
      { value: "初中及以下", label: "初中及以下" }
    ]
  },
  {
    key: "startDate",
    label: "开始时间",
    type: "yearMonth",
    placeholder: "开始时间",
    required: true,
    gridColumn: 2
  },
  {
    key: "endDate",
    label: "结束时间",
    type: "yearMonth",
    placeholder: "结束时间",
    gridColumn: 2,
    dependsOn: "isCurrently",
    hideWhen: true,
    replaceWith: "至今"
  },
  {
    key: "isCurrently",
    label: "目前在读",
    type: "switch"
  },
  {
    key: "description",
    label: "详细描述",
    type: "textarea",
    placeholder: "请详细描述学习经历、主要课程、获得荣誉等...",
    rows: 4
  }
]

// 教育经历展示配置
export const educationDisplay: DisplayConfig = {
  icon: <GraduationCap className="w-5 h-5 mt-1" style={{ color: "var(--card-accent-color, #3b82f6)" }} />,
  titleField: "school",
  subtitleField: "degree",
  descriptionField: "description",
  layout: "timeline",
  showActions: true
}
