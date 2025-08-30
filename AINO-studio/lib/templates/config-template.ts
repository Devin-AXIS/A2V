import { uid } from "../store"
import type { ModuleModel, FieldModel } from "../store"

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

export function createConfigModule(): ModuleModel {
  return {
    id: uid(),
    name: "全局配置",
    type: "system",
    directories: [
      {
        id: uid(),
        name: "站点设置",
        type: "table",
        supportsCategory: false,
        fields: [
          f("siteName", "站点名称", "text", true, true, { placeholder: "请输入站点名称" }),
          f("siteDescription", "站点描述", "textarea", false, false, { placeholder: "站点描述信息" }),
          f("siteKeywords", "站点关键词", "tags", false, false, { placeholder: "SEO关键词" }),
          f("siteLogo", "站点Logo", "image", false, false, { accept: "image/*", maxSizeMB: 2 }),
          f("favicon", "网站图标", "image", false, false, { accept: "image/*", maxSizeMB: 1 }),
          f("theme", "主题模式", "select", false, true, { options: ["浅色", "深色", "自动"], default: "自动" }),
          f("primaryColor", "主题色", "text", false, false, { placeholder: "#1976d2" }),
          f("language", "默认语言", "select", false, false, {
            options: ["中文", "English", "日本語", "한국어"],
            default: "中文",
          }),
          f("timezone", "时区", "select", false, false, {
            options: ["Asia/Shanghai", "UTC", "America/New_York", "Europe/London"],
            default: "Asia/Shanghai",
          }),
          f("i18n", "多语言支持", "boolean", false, true, { default: false, trueLabel: "开启", falseLabel: "关闭" }),
          f("maintenance", "维护模式", "boolean", false, false, { default: false, trueLabel: "开启", falseLabel: "关闭" }),
          f("maintenanceMessage", "维护提示", "textarea", false, false, { placeholder: "维护期间显示的提示信息" }),
          f("analyticsCode", "统计代码", "textarea", false, false, { placeholder: "Google Analytics等统计代码" }),
          f("customCSS", "自定义CSS", "richtext", false, false, { placeholder: "自定义样式代码" }),
          f("customJS", "自定义JS", "richtext", false, false, { placeholder: "自定义JavaScript代码" }),
          f("contactEmail", "联系邮箱", "text", false, false, { preset: "email" }),
          f("contactPhone", "联系电话", "text", false, false, { preset: "phone" }),
          f("socialLinks", "社交媒体", "richtext", false, false, { placeholder: "社交媒体链接配置" }),
          f("createdAt", "创建时间", "date", false, true, { locked: true }),
          f("updatedAt", "更新时间", "date", false, true, { locked: true }),
        ],
        records: [
          {
            id: uid(),
            siteName: "NoCode Builder",
            siteDescription: "强大的无代码平台构建工具",
            siteKeywords: ["无代码", "低代码", "平台构建", "数据管理"],
            theme: "自动",
            primaryColor: "#1976d2",
            language: "中文",
            timezone: "Asia/Shanghai",
            i18n: false,
            maintenance: false,
            contactEmail: "contact@nocodebuilder.com",
            contactPhone: "400-123-4567",
          },
        ],
        categories: [],
      },
      {
        id: uid(),
        name: "分类管理",
        type: "category",
        supportsCategory: true,
        fields: [
          f("name", "分类名称", "text", true, true, { placeholder: "请输入分类名称" }),
          f("description", "分类描述", "textarea", false, false, { placeholder: "分类描述信息" }),
          f("icon", "分类图标", "text", false, false, { placeholder: "图标名称或URL" }),
          f("color", "分类颜色", "text", false, false, { placeholder: "#1976d2" }),
          f("sort", "排序", "number", false, false, { min: 0, step: 1, default: 0 }),
          f("enabled", "启用状态", "boolean", false, false, { default: true, trueLabel: "启用", falseLabel: "禁用" }),
        ],
        records: [],
        categories: [
          {
            id: uid(),
            name: "系统分类",
            children: [
              { id: uid(), name: "用户管理", children: [] },
              { id: uid(), name: "权限管理", children: [] },
            ],
          },
          {
            id: uid(),
            name: "业务分类",
            children: [
              { id: uid(), name: "电商", children: [] },
              { id: uid(), name: "教育", children: [] },
              { id: uid(), name: "内容", children: [] },
            ],
          },
        ],
      },
    ],
  }
}
