import { uid, type DirectoryModel, type FieldModel } from "../store"

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

export const dirTemplates: DirectoryModel[] = [
  {
    id: uid(),
    name: "基础表格",
    type: "table",
    supportsCategory: false,
    fields: [
      f("name", "名称", "text", true, false, { placeholder: "请输入名称" }),
      f("description", "描述", "textarea", false, false, { placeholder: "请输入描述" }),
      f("status", "状态", "select", true, false, { options: ["启用", "禁用"], default: "启用" }),
      f("createdAt", "创建时间", "date", false, true, { locked: true }),
    ],
    records: [],
    categories: [],
  },
  {
    id: uid(),
    name: "产品目录",
    type: "table",
    supportsCategory: true,
    fields: [
      f("cover", "封面", "image", false, false, { accept: "image/*", maxSizeMB: 5 }),
      f("name", "产品名称", "text", true, false, { placeholder: "请输入产品名称" }),
      f("price", "价格", "number", false, false, { min: 0, step: 0.01, unit: "¥" }),
      f("description", "产品描述", "richtext", false, false, { placeholder: "请输入产品描述" }),
      f("tags", "标签", "tags", false, false, { placeholder: "添加产品标签" }),
      f("status", "状态", "select", true, false, { options: ["上架", "下架"], default: "上架" }),
    ],
    records: [],
    categories: [
      {
        id: uid(),
        name: "电子产品",
        children: [
          { id: uid(), name: "手机", children: [] },
          { id: uid(), name: "电脑", children: [] },
        ],
      },
    ],
  },
  {
    id: uid(),
    name: "人员管理",
    type: "table",
    supportsCategory: false,
    fields: [
      f("avatar", "头像", "image", false, false, { accept: "image/*", maxSizeMB: 2 }),
      f("name", "姓名", "text", true, false, { placeholder: "请输入姓名" }),
      f("position", "职位", "text", false, false, { placeholder: "请输入职位" }),
      f("department", "部门", "select", false, false, { options: ["技术部", "市场部", "人事部", "财务部"] }),
      f("phone", "手机号", "text", false, false, { preset: "phone" }),
      f("email", "邮箱", "text", false, false, { preset: "email" }),
      f("joinDate", "入职时间", "date", false, false, { dateMode: "single" }),
      f("status", "状态", "select", true, false, { options: ["在职", "离职"], default: "在职" }),
    ],
    records: [],
    categories: [],
  },
  {
    id: uid(),
    name: "文档库",
    type: "table",
    supportsCategory: true,
    fields: [
      f("title", "标题", "text", true, false, { placeholder: "请输入文档标题" }),
      f("content", "内容", "richtext", true, false, { placeholder: "请输入文档内容" }),
      f("author", "作者", "text", false, false, { placeholder: "请输入作者" }),
      f("tags", "标签", "tags", false, false, { placeholder: "添加文档标签" }),
      f("version", "版本", "text", false, false, { placeholder: "如：v1.0" }),
      f("lastModified", "最后修改", "date", false, true, { locked: true }),
      f("status", "状态", "select", true, false, { options: ["草稿", "已发布"], default: "草稿" }),
    ],
    records: [],
    categories: [
      {
        id: uid(),
        name: "技术文档",
        children: [
          { id: uid(), name: "API文档", children: [] },
          { id: uid(), name: "开发指南", children: [] },
        ],
      },
    ],
  },
]
