import { uid, type ModuleModel, type FieldModel } from "../store"

function f(
  key: string,
  label: string,
  type: any,
  required = false,
  locked = false,
  extra: Partial<FieldModel> = {},
): FieldModel {
  return {
    id: uid(),
    key,
    label,
    type,
    required,
    locked,
    enabled: true,
    showInList: true,
    showInForm: true,
    showInDetail: true,
    ...extra,
  }
}

export function createProjectModule(): ModuleModel {
  return {
    id: uid(),
    name: "项目展示",
    type: "project",
    directories: [
      {
        id: uid(),
        name: "项目管理",
        type: "table",
        supportsCategory: true,
        fields: [
          f("cover", "项目封面", "image", false, false, { accept: "image/*", maxSizeMB: 5 }),
          f("name", "项目名称", "text", true, false, { placeholder: "请输入项目名称" }),
          f("client", "客户", "relation_one", false, false, { relation: { targetDirId: null, mode: "one" } }),
          f("description", "项目描述", "richtext", false, false, { placeholder: "请输入项目描述" }),
          f("technologies", "技术栈", "tags", false, false, { placeholder: "添加技术标签" }),
          f("startDate", "开始时间", "date", false, false, { dateMode: "single" }),
          f("endDate", "结束时间", "date", false, false, { dateMode: "single" }),
          f("status", "项目状态", "select", true, false, {
            options: ["进行中", "已完成", "已暂停"],
            default: "进行中",
          }),
          f("budget", "项目预算", "number", false, false, { min: 0, step: 0.01, unit: "¥" }),
          f("url", "项目链接", "text", false, false, { preset: "url", placeholder: "https://" }),
        ],
        records: [],
        categories: [
          {
            id: uid(),
            name: "Web开发",
            children: [
              { id: uid(), name: "企业官网", children: [] },
              { id: uid(), name: "电商平台", children: [] },
            ],
          },
          {
            id: uid(),
            name: "移动应用",
            children: [
              { id: uid(), name: "iOS应用", children: [] },
              { id: uid(), name: "Android应用", children: [] },
            ],
          },
        ],
      },
      {
        id: uid(),
        name: "客户管理",
        type: "table",
        supportsCategory: false,
        fields: [
          f("logo", "客户Logo", "image", false, false, { accept: "image/*", maxSizeMB: 2 }),
          f("name", "客户名称", "text", true, false, { placeholder: "请输入客户名称" }),
          f("industry", "所属行业", "select", false, false, { options: ["科技", "金融", "教育", "医疗", "零售"] }),
          f("contact", "联系人", "text", false, false, { placeholder: "请输入联系人姓名" }),
          f("phone", "联系电话", "text", false, false, { preset: "phone" }),
          f("email", "邮箱", "text", false, false, { preset: "email" }),
          f("address", "地址", "textarea", false, false, { placeholder: "请输入客户地址" }),
          f("website", "官网", "text", false, false, { preset: "url", placeholder: "https://" }),
          f("status", "合作状态", "select", true, false, {
            options: ["潜在客户", "合作中", "已完成"],
            default: "潜在客户",
          }),
        ],
        records: [],
        categories: [],
      },
    ],
  }
}
