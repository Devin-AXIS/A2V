import { Shield } from "lucide-react"
import type { FieldConfig, DisplayConfig } from "./generic-form-card"

// 实名认证字段配置
export const identityVerificationFields: FieldConfig[] = [
  {
    key: "realName",
    label: "姓名",
    type: "text",
    placeholder: "请输入真实姓名",
    required: true,
    gridColumn: 2,
    validation: {
      minLength: 2,
      maxLength: 20,
      pattern: /^[\u4e00-\u9fa5·]{2,20}$/,
      message: "请输入2-20位中文姓名"
    }
  },
  {
    key: "idNumber",
    label: "身份证号",
    type: "text",
    placeholder: "请输入18位身份证号",
    required: true,
    gridColumn: 2,
    validation: {
      pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
      message: "请输入正确的18位身份证号"
    }
  },
  {
    key: "idCardFront",
    label: "身份证正面照片",
    type: "image",
    placeholder: "上传正面照片",
    required: true,
    gridColumn: 2,
    imageConfig: {
      shape: "rectangle",
      size: "lg",
      enableCrop: true,
      cropAspectRatio: 16/10,
      maxSize: 5,
      accept: "image/*"
    }
  },
  {
    key: "idCardBack",
    label: "身份证反面照片",
    type: "image",
    placeholder: "上传反面照片",
    required: true,
    gridColumn: 2,
    imageConfig: {
      shape: "rectangle",
      size: "lg",
      enableCrop: true,
      cropAspectRatio: 16/10,
      maxSize: 5,
      accept: "image/*"
    }
  },
  {
    key: "verificationStatus",
    label: "认证状态",
    type: "select",
    placeholder: "认证状态",
    required: false,
    gridColumn: 2,
    readonly: true,
    options: [
      { value: "pending", label: "待审核" },
      { value: "approved", label: "已认证" },
      { value: "rejected", label: "认证失败" },
      { value: "not_submitted", label: "未提交" }
    ]
  },
  {
    key: "submitTime",
    label: "提交时间",
    type: "text",
    placeholder: "提交时间",
    readonly: true,
    gridColumn: 2
  },
  {
    key: "reviewTime",
    label: "审核时间",
    type: "text",
    placeholder: "审核时间",
    readonly: true,
    gridColumn: 2
  },
  {
    key: "rejectReason",
    label: "拒绝原因",
    type: "textarea",
    placeholder: "审核拒绝原因",
    readonly: true,
    rows: 3,
    dependsOn: "verificationStatus",
    showWhen: "rejected"
  }
]

// 实名认证显示配置
export const identityVerificationDisplay: DisplayConfig = {
  icon: <Shield className="w-5 h-5 text-blue-500" />,
  titleField: "realName",
  subtitleField: "verificationStatus",
  layout: "detailed",
  showActions: true,
  emptyTitle: "实名认证",
  emptySubtitle: "完成实名认证，提升账号安全性",
  addButtonText: "开始认证",
  editButtonText: "修改信息",
  deleteButtonText: "删除认证",
  confirmDeleteMessage: "确定要删除实名认证信息吗？"
}

// 默认数据结构
export interface IdentityVerificationData {
  realName: string
  idNumber: string
  idCardFront: string
  idCardBack: string
  verificationStatus: "not_submitted" | "pending" | "approved" | "rejected"
  submitTime?: string
  reviewTime?: string
  rejectReason?: string
}

// 默认空数据
export const defaultIdentityVerificationData: IdentityVerificationData = {
  realName: "",
  idNumber: "",
  idCardFront: "",
  idCardBack: "",
  verificationStatus: "not_submitted"
}
