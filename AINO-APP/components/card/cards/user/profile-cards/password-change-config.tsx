import { Lock } from "lucide-react"
import type { FieldConfig, DisplayConfig } from "./generic-form-card"

// 修改密码字段配置
export const passwordChangeFields: FieldConfig[] = [
  {
    key: "currentPassword",
    label: "当前密码",
    type: "text",
    placeholder: "请输入当前密码",
    required: true,
    gridColumn: 2,
    validation: {
      minLength: 6,
      message: "密码长度至少6位"
    }
  },
  {
    key: "newPassword",
    label: "新密码",
    type: "text",
    placeholder: "请输入新密码",
    required: true,
    gridColumn: 2,
    validation: {
      minLength: 8,
      maxLength: 20,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/,
      message: "密码需8-20位，包含大小写字母和数字"
    }
  },
  {
    key: "confirmPassword",
    label: "确认新密码",
    type: "text",
    placeholder: "请再次输入新密码",
    required: true,
    gridColumn: 2,
    validation: {
      minLength: 8,
      message: "请确认新密码"
    }
  },
  {
    key: "lastChangeTime",
    label: "上次修改时间",
    type: "text",
    placeholder: "上次修改时间",
    readonly: true,
    gridColumn: 2
  },
  {
    key: "changeReason",
    label: "修改原因",
    type: "select",
    placeholder: "请选择修改原因",
    gridColumn: 2,
    options: [
      { value: "security", label: "安全考虑" },
      { value: "forgot", label: "忘记密码" },
      { value: "regular", label: "定期更换" },
      { value: "leaked", label: "密码泄露" },
      { value: "other", label: "其他原因" }
    ]
  }
]

// 修改密码显示配置
export const passwordChangeDisplay: DisplayConfig = {
  icon: <Lock className="w-5 h-5 text-orange-500" />,
  titleField: "lastChangeTime",
  subtitleField: "changeReason",
  layout: "simple",
  showActions: true,
  emptyTitle: "修改密码",
  emptySubtitle: "定期修改密码，保护账号安全",
  addButtonText: "修改密码",
  editButtonText: "重新修改",
  deleteButtonText: "取消修改",
  confirmDeleteMessage: "确定要取消密码修改吗？"
}

// 默认数据结构
export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  lastChangeTime?: string
  changeReason?: string
}

// 默认空数据
export const defaultPasswordChangeData: PasswordChangeData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
}
