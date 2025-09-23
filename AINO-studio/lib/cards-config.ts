// Types and unified cards config for Studio usage
// Note: This file aggregates card field/display configs originally defined in AINO-APP.
// All symbols here use English naming and comments per project conventions.

import type { ReactNode } from "react"
import { Target, GraduationCap, Briefcase, FolderOpen, Award, Shield, Lock, Smartphone } from "lucide-react"

// Basic option type for select fields
export interface FieldOption {
    value: string
    label: string
}

// Validation helper type (loose to accommodate current usages)
export interface FieldValidationConfig {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    message?: string
}

// Image config (used by identity verification)
export interface ImageFieldConfig {
    shape?: "rectangle" | "circle"
    size?: "sm" | "md" | "lg"
    enableCrop?: boolean
    cropAspectRatio?: number
    maxSize?: number
    accept?: string
}

// Field configuration (superset of what APP uses so Studio can consume safely)
export interface FieldConfig {
    key: string
    label: string
    type: "text" | "textarea" | "select" | "yearMonth" | "date" | "city" | "switch" | "tags" | "image"
    placeholder?: string
    required?: boolean
    readonly?: boolean
    options?: FieldOption[]
    rows?: number
    gridColumn?: 1 | 2
    dependsOn?: string
    hideWhen?: any
    showWhen?: any
    disableWhen?: any
    replaceWith?: string
    validation?: FieldValidationConfig
    imageConfig?: ImageFieldConfig
}

export interface DisplayConfig {
    icon: ReactNode
    titleField: string
    subtitleField?: string
    descriptionField?: string
    layout: "timeline" | "grid" | "simple" | "detailed"
    showActions?: boolean
    // Optional UX strings used by some cards
    emptyTitle?: string
    emptySubtitle?: string
    addButtonText?: string
    editButtonText?: string
    deleteButtonText?: string
    confirmDeleteMessage?: string
}

// ---------- Job Expectation ----------
export const jobExpectationFields: FieldConfig[] = [
    { key: "position", label: "期望职位", type: "text", placeholder: "请输入期望职位", required: true, gridColumn: 2 },
    {
        key: "industry", label: "期望行业", type: "select", placeholder: "请选择行业", gridColumn: 2,
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
        key: "workType", label: "工作类型", type: "select", placeholder: "请选择工作类型", gridColumn: 2,
        options: [
            { value: "全职", label: "全职" },
            { value: "兼职", label: "兼职" },
            { value: "实习", label: "实习" },
            { value: "远程", label: "远程" },
            { value: "自由职业", label: "自由职业" }
        ]
    },
    { key: "workLocation", label: "工作地点", type: "city", placeholder: "请选择工作地点", gridColumn: 2 },
    { key: "salaryMin", label: "期望薪资（最低）", type: "text", placeholder: "如：10K", gridColumn: 2 },
    { key: "salaryMax", label: "期望薪资（最高）", type: "text", placeholder: "如：15K", gridColumn: 2 },
    { key: "availableDate", label: "到岗时间", type: "date", placeholder: "请选择到岗时间", gridColumn: 2, dependsOn: "immediatelyAvailable", hideWhen: true, replaceWith: "随时到岗" },
    { key: "immediatelyAvailable", label: "随时到岗", type: "switch", gridColumn: 2 },
    { key: "expectations", label: "其他期望", type: "textarea", placeholder: "请描述其他工作期望，如福利待遇、工作环境、发展空间等...", rows: 3 }
]

export const jobExpectationDisplay: DisplayConfig = {
    icon: <Target className="w-5 h-5 mt-1" style = {{ color: "var(--card-accent-color, #3b82f6)" }} />,
titleField: "position",
    subtitleField: "industry",
        descriptionField: "expectations",
            layout: "simple",
                showActions: true
}

// ---------- Education ----------
export const educationFields: FieldConfig[] = [
    { key: "title", label: "学校名称", type: "text", placeholder: "请输入学校名称", required: true, gridColumn: 2 },
    { key: "organization", label: "专业", type: "text", placeholder: "请输入专业名称", gridColumn: 2 },
    {
        key: "degree", label: "学历", type: "select", placeholder: "请选择学历", required: true, gridColumn: 2,
        options: [
            { value: "博士", label: "博士" },
            { value: "硕士", label: "硕士" },
            { value: "本科", label: "本科" },
            { value: "专科", label: "专科" },
            { value: "高中", label: "高中" },
            { value: "初中及以下", label: "初中及以下" }
        ]
    },
    { key: "startDate", label: "开始时间", type: "yearMonth", placeholder: "开始时间", required: true, gridColumn: 2 },
    { key: "endDate", label: "结束时间", type: "yearMonth", placeholder: "结束时间", gridColumn: 2, dependsOn: "isCurrently", hideWhen: true, replaceWith: "至今" },
    { key: "isCurrently", label: "目前在读", type: "switch" },
    { key: "description", label: "详细描述", type: "textarea", placeholder: "请详细描述学习经历、主要课程、获得荣誉等...", rows: 4 }
]

export const educationDisplay: DisplayConfig = {
    icon: <GraduationCap className="w-5 h-5 mt-1" style = {{ color: "var(--card-accent-color, #3b82f6)" }} />,
titleField: "title",
    subtitleField: "organization",
        descriptionField: "degree",
            layout: "timeline",
                showActions: true
}

// ---------- Work Experience ----------
export const workExperienceFields: FieldConfig[] = [
    { key: "title", label: "公司名称", type: "text", placeholder: "请输入公司名称", required: true, gridColumn: 2 },
    { key: "organization", label: "职位", type: "text", placeholder: "请输入职位名称", required: true, gridColumn: 2 },
    { key: "department", label: "部门", type: "text", placeholder: "请输入部门", gridColumn: 2 },
    { key: "startDate", label: "开始时间", type: "yearMonth", placeholder: "开始时间", required: true, gridColumn: 2 },
    { key: "endDate", label: "结束时间", type: "yearMonth", placeholder: "结束时间", gridColumn: 2, dependsOn: "isCurrently", hideWhen: true, replaceWith: "至今" },
    { key: "isCurrently", label: "目前在职", type: "switch" },
    { key: "salary", label: "薪资", type: "text", placeholder: "如：15K-20K", gridColumn: 2 },
    { key: "description", label: "详细描述", type: "textarea", placeholder: "请详细描述工作内容、职责和成就...", rows: 4 }
]

export const workExperienceDisplay: DisplayConfig = {
    icon: <Briefcase className="w-5 h-5 mt-1" style = {{ color: "var(--card-accent-color, #3b82f6)" }} />,
titleField: "title",
    subtitleField: "organization",
        descriptionField: "description",
            layout: "timeline",
                showActions: true
}

// ---------- Project ----------
export const projectFields: FieldConfig[] = [
    { key: "title", label: "项目名称", type: "text", placeholder: "请输入项目名称", required: true, gridColumn: 2 },
    { key: "organization", label: "所属机构", type: "text", placeholder: "请输入机构名称", required: true, gridColumn: 2 },
    { key: "role", label: "担任角色", type: "text", placeholder: "如：项目经理、技术负责人", gridColumn: 2 },
    { key: "startDate", label: "开始时间", type: "yearMonth", placeholder: "开始时间", required: true, gridColumn: 2 },
    { key: "endDate", label: "结束时间", type: "yearMonth", placeholder: "结束时间", gridColumn: 2, dependsOn: "isOngoing", hideWhen: true, replaceWith: "进行中" },
    { key: "isOngoing", label: "进行中", type: "switch" },
    { key: "technologies", label: "技术栈", type: "tags", placeholder: "如：React, Node.js, MySQL（用逗号分隔）" },
    { key: "description", label: "详细描述", type: "textarea", placeholder: "请详细描述项目背景、主要功能、技术难点和个人贡献...", rows: 4 }
]

export const projectDisplay: DisplayConfig = {
    icon: <FolderOpen className="w-5 h-5 mt-1" style = {{ color: "var(--card-accent-color, #3b82f6)" }} />,
titleField: "title",
    subtitleField: "organization",
        descriptionField: "description",
            layout: "grid",
                showActions: true
}

// ---------- Certificate ----------
export const certificateFields: FieldConfig[] = [
    { key: "title", label: "证书名称", type: "text", placeholder: "请输入证书名称", required: true, gridColumn: 2 },
    { key: "organization", label: "颁发机构", type: "text", placeholder: "请输入颁发机构", required: true, gridColumn: 2 },
    { key: "credentialId", label: "证书编号", type: "text", placeholder: "请输入证书编号", gridColumn: 2 },
    { key: "issueDate", label: "获得时间", type: "yearMonth", placeholder: "获得时间", gridColumn: 2 },
    { key: "expiryDate", label: "有效期至", type: "yearMonth", placeholder: "有效期至", gridColumn: 2, dependsOn: "isNeverExpires", hideWhen: true, replaceWith: "永久有效" },
    { key: "isNeverExpires", label: "永久有效", type: "switch" },
    { key: "description", label: "详细描述", type: "textarea", placeholder: "请详细描述证书相关信息、考试难度、对职业发展的帮助等...", rows: 4 }
]

export const certificateDisplay: DisplayConfig = {
    icon: <Award className="w-5 h-5 mt-1" style = {{ color: "var(--card-accent-color, #3b82f6)" }} />,
titleField: "title",
    subtitleField: "organization",
        descriptionField: "description",
            layout: "grid",
                showActions: true
}

// ---------- Identity Verification ----------
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

export const identityVerificationFields: FieldConfig[] = [
    { key: "realName", label: "姓名", type: "text", placeholder: "请输入真实姓名", required: true, gridColumn: 2, validation: { minLength: 2, maxLength: 20, pattern: /^[\u4e00-\u9fa5·]{2,20}$/, message: "请输入2-20位中文姓名" } },
    { key: "idNumber", label: "身份证号", type: "text", placeholder: "请输入18位身份证号", required: true, gridColumn: 2, validation: { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: "请输入正确的18位身份证号" } },
    { key: "idCardFront", label: "身份证正面照片", type: "image", placeholder: "上传正面照片", required: true, gridColumn: 2, imageConfig: { shape: "rectangle", size: "lg", enableCrop: true, cropAspectRatio: 16 / 10, maxSize: 5, accept: "image/*" } },
    { key: "idCardBack", label: "身份证反面照片", type: "image", placeholder: "上传反面照片", required: true, gridColumn: 2, imageConfig: { shape: "rectangle", size: "lg", enableCrop: true, cropAspectRatio: 16 / 10, maxSize: 5, accept: "image/*" } },
    { key: "verificationStatus", label: "认证状态", type: "select", placeholder: "认证状态", gridColumn: 2, readonly: true, options: [{ value: "pending", label: "待审核" }, { value: "approved", label: "已认证" }, { value: "rejected", label: "认证失败" }, { value: "not_submitted", label: "未提交" }] },
    { key: "submitTime", label: "提交时间", type: "text", placeholder: "提交时间", readonly: true, gridColumn: 2 },
    { key: "reviewTime", label: "审核时间", type: "text", placeholder: "审核时间", readonly: true, gridColumn: 2 },
    { key: "rejectReason", label: "拒绝原因", type: "textarea", placeholder: "审核拒绝原因", readonly: true, rows: 3, dependsOn: "verificationStatus", showWhen: "rejected" }
]

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

export const defaultIdentityVerificationData: IdentityVerificationData = {
    realName: "",
    idNumber: "",
    idCardFront: "",
    idCardBack: "",
    verificationStatus: "not_submitted"
}

// ---------- Password Change ----------
export interface PasswordChangeData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
    lastChangeTime?: string
    changeReason?: string
}

export const passwordChangeFields: FieldConfig[] = [
    { key: "currentPassword", label: "当前密码", type: "text", placeholder: "请输入当前密码", required: true, gridColumn: 2, validation: { minLength: 6, message: "密码长度至少6位" } },
    { key: "newPassword", label: "新密码", type: "text", placeholder: "请输入新密码", required: true, gridColumn: 2, validation: { minLength: 8, maxLength: 20, pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, message: "密码需8-20位，包含大小写字母和数字" } },
    { key: "confirmPassword", label: "确认新密码", type: "text", placeholder: "请再次输入新密码", required: true, gridColumn: 2, validation: { minLength: 8, message: "请确认新密码" } },
    { key: "lastChangeTime", label: "上次修改时间", type: "text", placeholder: "上次修改时间", readonly: true, gridColumn: 2 },
    {
        key: "changeReason", label: "修改原因", type: "select", placeholder: "请选择修改原因", gridColumn: 2,
        options: [
            { value: "security", label: "安全考虑" },
            { value: "forgot", label: "忘记密码" },
            { value: "regular", label: "定期更换" },
            { value: "leaked", label: "密码泄露" },
            { value: "other", label: "其他原因" }
        ]
    }
]

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

export const defaultPasswordChangeData: PasswordChangeData = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
}

// ---------- Phone Binding ----------
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

export const phoneBindingFields: FieldConfig[] = [
    { key: "currentPhone", label: "当前手机号", type: "text", placeholder: "当前绑定的手机号", readonly: true, gridColumn: 2 },
    { key: "newPhone", label: "新手机号", type: "text", placeholder: "请输入新手机号", required: true, gridColumn: 2, validation: { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码" } },
    { key: "verificationCode", label: "验证码", type: "text", placeholder: "请输入6位验证码", required: true, gridColumn: 2, validation: { pattern: /^\d{6}$/, message: "请输入6位数字验证码" } },
    { key: "bindingTime", label: "绑定时间", type: "text", placeholder: "绑定时间", readonly: true, gridColumn: 2 },
    { key: "bindingStatus", label: "绑定状态", type: "select", placeholder: "绑定状态", readonly: true, gridColumn: 2, options: [{ value: "bound", label: "已绑定" }, { value: "unbound", label: "未绑定" }, { value: "pending", label: "待验证" }] },
    { key: "useFor2FA", label: "用于双重验证", type: "switch", gridColumn: 2 },
    { key: "useForLogin", label: "用于快捷登录", type: "switch", gridColumn: 2 },
    { key: "useForRecovery", label: "用于账号找回", type: "switch", gridColumn: 2 }
]

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

export const defaultPhoneBindingData: PhoneBindingData = {
    newPhone: "",
    verificationCode: "",
    bindingStatus: "unbound",
    useFor2FA: true,
    useForLogin: true,
    useForRecovery: true
}

// ---------- Aggregated map ----------
export interface CardConfigEntry {
    fields: FieldConfig[]
    display: DisplayConfig
}

export const cardsConfigMap: Record<string, CardConfigEntry> = {
    jobExpectation: { fields: jobExpectationFields, display: jobExpectationDisplay },
    education: { fields: educationFields, display: educationDisplay },
    workExperience: { fields: workExperienceFields, display: workExperienceDisplay },
    project: { fields: projectFields, display: projectDisplay },
    certificate: { fields: certificateFields, display: certificateDisplay },
    identityVerification: { fields: identityVerificationFields, display: identityVerificationDisplay },
    passwordChange: { fields: passwordChangeFields, display: passwordChangeDisplay },
    phoneBinding: { fields: phoneBindingFields, display: phoneBindingDisplay }
}

export type { FieldConfig as StudioFieldConfig, DisplayConfig as StudioDisplayConfig }
export default cardsConfigMap


