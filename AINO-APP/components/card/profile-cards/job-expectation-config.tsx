import { Target } from "lucide-react"
import { FieldConfig, DisplayConfig } from "./generic-form-card"

// 求职期望字段配置
export const jobExpectationFields: FieldConfig[] = [
  {
    key: "position",
    label: "期望职位",
    type: "text",
    placeholder: "请输入期望职位",
    required: true,
    gridColumn: 2
  },
  {
    key: "industry",
    label: "期望行业",
    type: "select",
    placeholder: "请选择行业",
    gridColumn: 2,
    options: [
      { value: "互联网", label: "互联网" },
      { value: "金融", label: "金融" },
      { value: "教育", label: "教育" },
      { value: "医疗", label: "医疗" },
      { value: "制造业", label: "制造业" },
      { value: "房地产", label: "房地产" },
      { value: "零售", label: "零售" },
      { value: "咨询", label: "咨询" },
      { value: "媒体", label: "媒体" },
      { value: "其他", label: "其他" }
    ]
  },
  {
    key: "workType",
    label: "工作类型",
    type: "select",
    placeholder: "请选择工作类型",
    gridColumn: 2,
    options: [
      { value: "全职", label: "全职" },
      { value: "兼职", label: "兼职" },
      { value: "实习", label: "实习" },
      { value: "远程", label: "远程" },
      { value: "自由职业", label: "自由职业" }
    ]
  },
  {
    key: "workLocation",
    label: "工作地点",
    type: "city",
    placeholder: "请选择工作地点",
    gridColumn: 2
  },
  {
    key: "salaryMin",
    label: "期望薪资（最低）",
    type: "text",
    placeholder: "如：10K",
    gridColumn: 2
  },
  {
    key: "salaryMax", 
    label: "期望薪资（最高）",
    type: "text",
    placeholder: "如：15K",
    gridColumn: 2
  },
  {
    key: "availableDate",
    label: "到岗时间",
    type: "date",
    placeholder: "请选择到岗时间",
    gridColumn: 2,
    dependsOn: "immediatelyAvailable",
    hideWhen: true,
    replaceWith: "随时到岗"
  },
  {
    key: "immediatelyAvailable",
    label: "随时到岗",
    type: "switch",
    gridColumn: 2
  },
  {
    key: "expectations",
    label: "其他期望",
    type: "textarea",
    placeholder: "请描述其他工作期望，如福利待遇、工作环境、发展空间等...",
    rows: 3
  }
]

// 求职期望展示配置
export const jobExpectationDisplay: DisplayConfig = {
  icon: <Target className="w-5 h-5 mt-1" style={{ color: "var(--card-accent-color, #3b82f6)" }} />,
  titleField: "position",
  subtitleField: "industry", 
  descriptionField: "expectations",
  layout: "simple",
  showActions: true
}
