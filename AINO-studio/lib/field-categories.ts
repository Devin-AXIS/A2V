export interface FieldCategoryModel {
  id: string
  name: string
  description: string
  order: number
  enabled: boolean
  system?: boolean // 是否为系统分类
  fields: PredefinedFieldModel[]
}

export interface PredefinedFieldModel {
  id: string
  label: string
  key: string
  type: string
  description: string
  visibility: "visible" | "hidden" | "system_only"
  sensitive: boolean
  editable: "user" | "admin" | "readonly"
  required?: boolean
  defaultValue?: any
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

// 基础字段分类
export const BASIC_FIELDS_CATEGORY: FieldCategoryModel = {
  id: "basic",
  name: "基础字段",
  description: "默认字段，业务每天会用到",
  order: 1,
  enabled: true,
  fields: [
    {
      id: "user_id",
      label: "用户ID",
      key: "user_id",
      type: "text",
      description: "系统唯一标识",
      visibility: "visible",
      sensitive: false,
      editable: "readonly",
    },
    {
      id: "avatar",
      label: "头像",
      key: "avatar",
      type: "profile",
      description: "用户头像图片",
      visibility: "visible",
      sensitive: false,
      editable: "user",
    },
    {
      id: "display_name",
      label: "姓名（显示名）",
      key: "display_name",
      type: "text",
      description: "用户显示名称",
      visibility: "visible",
      sensitive: false,
      editable: "user",
      required: true,
    },
    {
      id: "gender",
      label: "性别",
      key: "gender",
      type: "select",
      description: "用户性别",
      visibility: "visible",
      sensitive: true,
      editable: "user",
      options: ["女", "男", "其他", "不透露"],
    },
    {
      id: "nationality",
      label: "国籍/地区",
      key: "nationality",
      type: "text",
      preset: "country",
      description: "用户国籍或地区",
      visibility: "visible",
      sensitive: true,
      editable: "user",
    },
    {
      id: "phone",
      label: "手机号",
      key: "phone",
      type: "text",
      preset: "phone",
      description: "手机号码（E.164格式）",
      visibility: "visible",
      sensitive: true,
      editable: "admin",
      validation: { pattern: "^\\+?[1-9]\\d{1,14}$" },
    },
    {
      id: "email",
      label: "邮箱号",
      key: "email",
      type: "text",
      preset: "email",
      description: "电子邮箱地址",
      visibility: "visible",
      sensitive: true,
      editable: "admin",
      validation: { pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
    },
  ],
}

// 可开启字段分类
export const OPTIONAL_FIELDS_CATEGORY: FieldCategoryModel = {
  id: "optional",
  name: "可开启字段",
  description: "按业务需要打开的字段",
  order: 2,
  enabled: true,
  fields: [
    {
      id: "birthday",
      label: "生日",
      key: "birthday",
      type: "date",
      description: "用户生日",
      visibility: "hidden",
      sensitive: true,
      editable: "user",
    },
    {
      id: "city",
      label: "居住城市",
      key: "city",
      type: "text",
      preset: "city",
      description: "当前居住城市",
      visibility: "hidden",
      sensitive: false,
      editable: "user",
    },
    {
      id: "zodiac",
      label: "星座",
      key: "zodiac",
      type: "select",
      description: "星座信息",
      visibility: "hidden",
      sensitive: false,
      editable: "user",
      options: [
        "白羊座",
        "金牛座",
        "双子座",
        "巨蟹座",
        "狮子座",
        "处女座",
        "天秤座",
        "天蝎座",
        "射手座",
        "摩羯座",
        "水瓶座",
        "双鱼座",
      ],
    },
    {
      id: "industry",
      label: "行业",
      key: "industry",
      type: "text",
      description: "所属行业",
      visibility: "hidden",
      sensitive: false,
      editable: "user",
    },
    {
      id: "occupation",
      label: "职业",
      key: "occupation",
      type: "text",
      description: "职业信息",
      visibility: "hidden",
      sensitive: false,
      editable: "user",
    },
    {
      id: "skills",
      label: "技能",
      key: "skills",
      type: "tags",
      description: "技能标签",
      visibility: "hidden",
      sensitive: false,
      editable: "user",
    },
    {
      id: "address",
      label: "收件地址",
      key: "address",
      type: "textarea",
      description: "详细收件地址",
      visibility: "hidden",
      sensitive: true,
      editable: "user",
    },
    {
      id: "interests",
      label: "兴趣爱好",
      key: "interests",
      type: "tags",
      description: "兴趣爱好标签",
      visibility: "hidden",
      sensitive: false,
      editable: "user",
    },
    {
      id: "marital_status",
      label: "婚姻状况",
      key: "marital_status",
      type: "select",
      description: "婚姻状况",
      visibility: "hidden",
      sensitive: true,
      editable: "user",
      options: ["未婚", "已婚", "离异", "丧偶", "不便透露"],
    },
    {
      id: "bio",
      label: "个人介绍",
      key: "bio",
      type: "richtext",
      description: "个人介绍",
      visibility: "hidden",
      sensitive: false,
      editable: "user",
    },
    {
      id: "signature",
      label: "个人签名",
      key: "signature",
      type: "text",
      description: "个人签名",
      visibility: "hidden",
      sensitive: false,
      editable: "user",
    },
    {
      id: "job_title",
      label: "职称",
      key: "job_title",
      type: "text",
      description: "职称信息",
      visibility: "hidden",
      sensitive: false,
      editable: "user",
    },
  ],
}

// 个人经历字段分类
export const EXPERIENCE_FIELDS_CATEGORY: FieldCategoryModel = {
  id: "experience",
  name: "个人经历字段",
  description: "支持自定义类型的经历信息",
  order: 3,
  enabled: true,
  fields: [
    {
      id: "work_experience",
      label: "工作经历",
      key: "work_experience",
      type: "experience",
      description: "工作经历信息",
      visibility: "visible",
      sensitive: false,
      editable: "user",
    },
    {
      id: "education_experience",
      label: "学历经历",
      key: "education_experience",
      type: "experience",
      description: "教育经历信息",
      visibility: "visible",
      sensitive: false,
      editable: "user",
    },
    {
      id: "project_experience",
      label: "项目经历",
      key: "project_experience",
      type: "experience",
      description: "项目经历信息",
      visibility: "visible",
      sensitive: false,
      editable: "user",
    },
  ],
}

// 教育扩展字段分类
export const EDUCATION_FIELDS_CATEGORY: FieldCategoryModel = {
  id: "education",
  name: "教育扩展",
  description: "面向教育/培训/继续教育场景",
  order: 4,
  enabled: false,
  fields: [
    {
      id: "student_id",
      label: "学号",
      key: "student_id",
      type: "text",
      description: "学生学号",
      visibility: "visible",
      sensitive: false,
      editable: "admin",
    },
    {
      id: "campus_grade_class",
      label: "校区/年级/班级",
      key: "campus_grade_class",
      type: "text",
      description: "校区年级班级信息",
      visibility: "visible",
      sensitive: false,
      editable: "admin",
    },
    {
      id: "enrollment_status",
      label: "学籍状态",
      key: "enrollment_status",
      type: "select",
      description: "当前学籍状态",
      visibility: "visible",
      sensitive: false,
      editable: "admin",
      options: ["在读", "休学", "毕业", "退学"],
    },
    {
      id: "advisor",
      label: "导师/班主任",
      key: "advisor",
      type: "text",
      description: "指导老师信息",
      visibility: "visible",
      sensitive: false,
      editable: "admin",
    },
    {
      id: "guardian",
      label: "监护人",
      key: "guardian",
      type: "textarea",
      description: "监护人信息",
      visibility: "hidden",
      sensitive: true,
      editable: "admin",
    },
    {
      id: "learning_goal",
      label: "学习目标",
      key: "learning_goal",
      type: "textarea",
      description: "学习目标描述",
      visibility: "visible",
      sensitive: false,
      editable: "user",
    },
  ],
}

// 社交绑定字段分类
export const SOCIAL_BINDING_CATEGORY: FieldCategoryModel = {
  id: "social_binding",
  name: "社交绑定",
  description: "第三方账号绑定",
  order: 5,
  enabled: true,
  fields: [
    {
      id: "wechat_openid",
      label: "微信",
      key: "wechat_openid",
      type: "text",
      description: "微信OpenID/UnionID",
      visibility: "hidden",
      sensitive: true,
      editable: "readonly",
    },
    {
      id: "weibo_userid",
      label: "微博",
      key: "weibo_userid",
      type: "text",
      description: "微博用户ID",
      visibility: "hidden",
      sensitive: true,
      editable: "readonly",
    },
  ],
}

// 用户动态字段分类
export const USER_DYNAMICS_CATEGORY: FieldCategoryModel = {
  id: "user_dynamics",
  name: "用户动态",
  description: "用户行为和系统动态记录",
  order: 6,
  enabled: true,
  fields: [
    {
      id: "dynamic_id",
      label: "动态ID",
      key: "dynamic_id",
      type: "text",
      description: "动态记录唯一标识",
      visibility: "system_only",
      sensitive: false,
      editable: "readonly",
    },
    {
      id: "dynamic_type",
      label: "动态类型",
      key: "dynamic_type",
      type: "select",
      description: "动态分类",
      visibility: "visible",
      sensitive: false,
      editable: "readonly",
      options: ["系统", "行为", "记录"],
    },
  ],
}

// 事件记录字段分类
export const EVENT_RECORDS_CATEGORY: FieldCategoryModel = {
  id: "event_records",
  name: "事件记录",
  description: "与外部AI系统联动的事件记录",
  order: 7,
  enabled: true,
  fields: [
    {
      id: "event_id",
      label: "事件ID",
      key: "event_id",
      type: "text",
      description: "事件唯一标识",
      visibility: "system_only",
      sensitive: false,
      editable: "readonly",
    },
    {
      id: "event_type",
      label: "事件类型",
      key: "event_type",
      type: "select",
      description: "事件分类",
      visibility: "visible",
      sensitive: false,
      editable: "readonly",
      options: ["定时", "触发"],
    },
  ],
}

// 标签画像字段分类
export const TAGS_PROFILE_CATEGORY: FieldCategoryModel = {
  id: "tags_profile",
  name: "标签画像",
  description: "等级/偏好/奖章管理",
  order: 8,
  enabled: true,
  fields: [
    {
      id: "current_level",
      label: "当前等级",
      key: "current_level",
      type: "select",
      description: "用户等级",
      visibility: "visible",
      sensitive: false,
      editable: "admin",
      options: ["青铜", "白银", "黄金", "铂金", "钻石"],
    },
    {
      id: "preference_tags",
      label: "偏好标签",
      key: "preference_tags",
      type: "tags",
      description: "用户偏好标签",
      visibility: "hidden",
      sensitive: false,
      editable: "admin",
    },
  ],
}

// 实名认证字段分类
export const IDENTITY_VERIFICATION_CATEGORY: FieldCategoryModel = {
  id: "identity_verification",
  name: "实名认证",
  description: "身份认证相关字段",
  order: 9,
  enabled: true,
  fields: [
    {
      id: "id_card_auth",
      label: "身份证认证",
      key: "id_card_auth",
      type: "identity_verification",
      description: "身份证认证状态",
      visibility: "hidden",
      sensitive: true,
      editable: "admin",
    },
    {
      id: "face_auth",
      label: "人脸认证",
      key: "face_auth",
      type: "identity_verification",
      description: "人脸认证状态",
      visibility: "hidden",
      sensitive: true,
      editable: "admin",
    },
  ],
}

// 积分消费字段分类
export const POINTS_CONSUMPTION_CATEGORY: FieldCategoryModel = {
  id: "points_consumption",
  name: "积分消费",
  description: "积分和虚拟货币管理",
  order: 10,
  enabled: true,
  fields: [
    {
      id: "current_points",
      label: "当前积分",
      key: "current_points",
      type: "number",
      description: "用户当前积分",
      visibility: "visible",
      sensitive: false,
      editable: "readonly",
    },
    {
      id: "current_balance",
      label: "当前余额",
      key: "current_balance",
      type: "number",
      description: "虚拟钱包余额",
      visibility: "hidden",
      sensitive: true,
      editable: "readonly",
    },
  ],
}

// 默认字段分类列表
export const DEFAULT_FIELD_CATEGORIES: FieldCategoryModel[] = [
  BASIC_FIELDS_CATEGORY,
  OPTIONAL_FIELDS_CATEGORY,
  EXPERIENCE_FIELDS_CATEGORY,
  EDUCATION_FIELDS_CATEGORY,
  SOCIAL_BINDING_CATEGORY,
  USER_DYNAMICS_CATEGORY,
  EVENT_RECORDS_CATEGORY,
  TAGS_PROFILE_CATEGORY,
  IDENTITY_VERIFICATION_CATEGORY,
  POINTS_CONSUMPTION_CATEGORY,
]

// 辅助函数：根据ID获取字段分类
export function getCategoryById(id: string): FieldCategoryModel | undefined {
  return DEFAULT_FIELD_CATEGORIES.find((cat) => cat.id === id)
}

// 辅助函数：根据ID获取字段分类名称
export function getCategoryName(id: string): string {
  const category = getCategoryById(id)
  return category ? category.name : "未分类"
}
