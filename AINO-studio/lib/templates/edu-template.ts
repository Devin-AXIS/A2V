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

export function createEduModule(): ModuleModel {
  return {
    id: uid(),
    name: "教育模块",
    type: "edu",
    directories: [
      {
        id: uid(),
        name: "课程管理",
        type: "table",
        supportsCategory: true,
        fields: [
          f("cover", "课程封面", "image", false, false, { accept: "image/*", maxSizeMB: 5 }),
          f("title", "课程标题", "text", true, false, { placeholder: "请输入课程标题" }),
          f("category", "课程分类", "select", false, false, { options: ["编程", "设计", "语言", "商业"] }),
          f("teacher", "授课老师", "relation_one", false, false, { relation: { targetDirId: null, mode: "one" } }),
          f("price", "课程价格", "number", false, false, { min: 0, step: 0.01, unit: "¥" }),
          f("duration", "课程时长", "number", false, false, { min: 0, step: 1, unit: "小时" }),
          f("level", "难度等级", "select", false, false, { options: ["初级", "中级", "高级"], default: "初级" }),
          f("description", "课程描述", "richtext", false, false, { placeholder: "请输入课程详细描述" }),
          f("status", "状态", "select", true, false, { options: ["草稿", "发布", "下架"], default: "草稿" }),
        ],
        records: [],
        categories: [
          {
            id: uid(),
            name: "编程",
            children: [
              { id: uid(), name: "前端开发", children: [] },
              { id: uid(), name: "后端开发", children: [] },
            ],
          },
          {
            id: uid(),
            name: "设计",
            children: [
              { id: uid(), name: "UI设计", children: [] },
              { id: uid(), name: "平面设计", children: [] },
            ],
          },
        ],
      },
      {
        id: uid(),
        name: "学员管理",
        type: "table",
        supportsCategory: false,
        fields: [
          f("avatar", "头像", "image", false, false, { accept: "image/*", maxSizeMB: 2 }),
          f("name", "姓名", "text", true, false, { placeholder: "请输入学员姓名" }),
          f("phone", "手机号", "text", false, false, { preset: "phone" }),
          f("email", "邮箱", "text", false, false, { preset: "email" }),
          f("enrolledCourses", "已报课程", "relation_many", false, false, {
            relation: { targetDirId: null, mode: "many" },
          }),
          f("level", "学习等级", "select", false, false, { options: ["新手", "进阶", "专家"], default: "新手" }),
          f("joinDate", "加入时间", "date", false, true, { locked: true }),
        ],
        records: [],
        categories: [],
      },
      {
        id: uid(),
        name: "老师管理",
        type: "table",
        supportsCategory: false,
        fields: [
          f("avatar", "头像", "image", false, false, { accept: "image/*", maxSizeMB: 2 }),
          f("name", "姓名", "text", true, false, { placeholder: "请输入老师姓名" }),
          f("title", "职称", "text", false, false, { placeholder: "如：高级讲师" }),
          f("specialty", "专业领域", "tags", false, false, { placeholder: "添加专业领域标签" }),
          f("experience", "教学经验", "number", false, false, { min: 0, step: 1, unit: "年" }),
          f("bio", "个人简介", "textarea", false, false, { placeholder: "请输入个人简介" }),
          f("status", "状态", "select", true, false, { options: ["在职", "离职"], default: "在职" }),
        ],
        records: [],
        categories: [],
      },
    ],
  }
}
