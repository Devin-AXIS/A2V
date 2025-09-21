import { FolderOpen } from "lucide-react"
import { FieldConfig, DisplayConfig } from "./generic-form-card"

// 项目经历字段配置
export const projectFields: FieldConfig[] = [
  {
    key: "name",
    label: "项目名称",
    type: "text",
    placeholder: "请输入项目名称",
    required: true,
    gridColumn: 2
  },
  {
    key: "organization",
    label: "所属机构",
    type: "text",
    placeholder: "请输入机构名称",
    required: true,
    gridColumn: 2
  },
  {
    key: "role",
    label: "担任角色",
    type: "text",
    placeholder: "如：项目经理、技术负责人",
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
    dependsOn: "isOngoing",
    hideWhen: true,
    replaceWith: "进行中"
  },
  {
    key: "isOngoing",
    label: "进行中",
    type: "switch"
  },
  {
    key: "technologies",
    label: "技术栈",
    type: "tags",
    placeholder: "如：React, Node.js, MySQL（用逗号分隔）"
  },
  {
    key: "description",
    label: "详细描述",
    type: "textarea",
    placeholder: "请详细描述项目背景、主要功能、技术难点和个人贡献...",
    rows: 4
  }
]

// 项目经历展示配置
export const projectDisplay: DisplayConfig = {
  icon: <FolderOpen className="w-5 h-5 mt-1" style={{ color: "var(--card-accent-color, #3b82f6)" }} />,
  titleField: "name",
  subtitleField: "organization",
  descriptionField: "description",
  layout: "grid",
  showActions: true
}
