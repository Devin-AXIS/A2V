import { Briefcase } from "lucide-react"
import { FieldConfig, DisplayConfig } from "./generic-form-card"

// 工作经历字段配置
export const workExperienceFields: FieldConfig[] = [
  {
    key: "company",
    label: "公司名称",
    type: "text",
    placeholder: "请输入公司名称",
    required: true,
    gridColumn: 2
  },
  {
    key: "position",
    label: "职位",
    type: "text",
    placeholder: "请输入职位名称",
    required: true,
    gridColumn: 2
  },
  {
    key: "department",
    label: "部门",
    type: "text",
    placeholder: "请输入部门",
    gridColumn: 2
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
    label: "目前在职",
    type: "switch"
  },
  {
    key: "salary",
    label: "薪资",
    type: "text",
    placeholder: "如：15K-20K",
    gridColumn: 2
  },
  {
    key: "description",
    label: "详细描述",
    type: "textarea",
    placeholder: "请详细描述工作内容、职责和成就...",
    rows: 4
  }
]

// 工作经历展示配置
export const workExperienceDisplay: DisplayConfig = {
  icon: <Briefcase className="w-5 h-5 mt-1" style={{ color: "var(--card-accent-color, #3b82f6)" }} />,
  titleField: "company",
  subtitleField: "position",
  descriptionField: "description",
  layout: "timeline",
  showActions: true
}
