import { Smartphone } from "lucide-react"
import type { FieldConfig, DisplayConfig } from "./generic-form-card"

// 手机绑定字段配置
export const phoneBindingFields: FieldConfig[] = [
  {
    key: "currentPhone",
    label: "当前手机号",
    type: "text",
    placeholder: "当前绑定的手机号",
    readonly: true,
    gridColumn: 2
  },
  {
    key: "newPhone",
    label: "新手机号",
    type: "text",
    placeholder: "请输入新手机号",
    required: true,
    gridColumn: 2,
    validation: {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码"
    }
  },
  {
    key: "verificationCode",
    label: "验证码",
    type: "text",
    placeholder: "请输入6位验证码",
    required: true,
    gridColumn: 2,
    validation: {
      pattern: /^\d{6}$/,
      message: "请输入6位数字验证码"
    }
  },
  {
    key: "bindingTime",
    label: "绑定时间",
    type: "text",
    placeholder: "绑定时间",
    readonly: true,
    gridColumn: 2
  },
  {
    key: "bindingStatus",
    label: "绑定状态",
    type: "select",
    placeholder: "绑定状态",
    readonly: true,
    gridColumn: 2,
    options: [
      { value: "bound", label: "已绑定" },
      { value: "unbound", label: "未绑定" },
      { value: "pending", label: "待验证" }
    ]
  },
  {
    key: "useFor2FA",
    label: "用于双重验证",
    type: "switch",
    gridColumn: 2
  },
  {
    key: "useForLogin",
    label: "用于快捷登录",
    type: "switch",
    gridColumn: 2
  },
  {
    key: "useForRecovery",
    label: "用于账号找回",
    type: "switch",
    gridColumn: 2
  }
]

// 手机绑定显示配置
export const phoneBindingDisplay: DisplayConfig = {
  icon: <Smartphone className="w-5 h-5 text-green-500" />,
  titleField: "newPhone",
  subtitleField: "bindingStatus",
  layout: "simple",
  showActions: true,
  emptyTitle: "手机绑定",
  emptySubtitle: "绑定手机号码，用于账号安全验证",
  addButtonText: "绑定手机",
  editButtonText: "更换手机",
  deleteButtonText: "解绑手机",
  confirmDeleteMessage: "确定要解绑手机号吗？这可能会影响账号安全。"
}

// 默认数据结构
export interface PhoneBindingData {
  currentPhone?: string
  newPhone: string
  verificationCode: string
  bindingTime?: string
  bindingStatus: "bound" | "unbound" | "pending"
  useFor2FA?: boolean
  useForLogin?: boolean
  useForRecovery?: boolean
}

// 默认空数据
export const defaultPhoneBindingData: PhoneBindingData = {
  newPhone: "",
  verificationCode: "",
  bindingStatus: "unbound",
  useFor2FA: true,
  useForLogin: true,
  useForRecovery: true
}
