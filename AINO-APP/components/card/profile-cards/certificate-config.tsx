import { Award } from "lucide-react"
import { FieldConfig, DisplayConfig } from "./generic-form-card"

// 证书资质字段配置
export const certificateFields: FieldConfig[] = [
  {
    key: "name",
    label: "证书名称",
    type: "text",
    placeholder: "请输入证书名称",
    required: true,
    gridColumn: 2
  },
  {
    key: "issuer",
    label: "颁发机构",
    type: "text",
    placeholder: "请输入颁发机构",
    required: true,
    gridColumn: 2
  },
  {
    key: "credentialId",
    label: "证书编号",
    type: "text",
    placeholder: "请输入证书编号",
    gridColumn: 2
  },
  {
    key: "issueDate",
    label: "获得时间",
    type: "yearMonth",
    placeholder: "获得时间",
    gridColumn: 2
  },
  {
    key: "expiryDate",
    label: "有效期至",
    type: "yearMonth",
    placeholder: "有效期至",
    gridColumn: 2,
    dependsOn: "isNeverExpires",
    hideWhen: true,
    replaceWith: "永久有效"
  },
  {
    key: "isNeverExpires",
    label: "永久有效",
    type: "switch"
  },
  {
    key: "description",
    label: "详细描述",
    type: "textarea",
    placeholder: "请详细描述证书相关信息、考试难度、对职业发展的帮助等...",
    rows: 4
  }
]

// 证书资质展示配置
export const certificateDisplay: DisplayConfig = {
  icon: <Award className="w-5 h-5 mt-1" style={{ color: "var(--card-accent-color, #3b82f6)" }} />,
  titleField: "name",
  subtitleField: "issuer",
  descriptionField: "description",
  layout: "grid",
  showActions: true
}
