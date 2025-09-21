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

export function createContentModule(): ModuleModel {
  return {
    id: uid(),
    name: "内容模块",
    type: "content",
    directories: [
      {
        id: uid(),
        name: "文章管理",
        type: "table",
        supportsCategory: true,
        fields: [
          f("cover", "封面图", "image", false, false, { accept: "image/*", maxSizeMB: 5 }),
          f("title", "文章标题", "text", true, false, { placeholder: "请输入文章标题" }),
          f("summary", "文章摘要", "textarea", false, false, { placeholder: "请输入文章摘要" }),
          f("content", "文章内容", "richtext", true, false, { placeholder: "请输入文章内容" }),
          f("author", "作者", "text", false, false, { placeholder: "请输入作者姓名" }),
          f("tags", "标签", "tags", false, false, { placeholder: "添加文章标签" }),
          f("status", "发布状态", "select", true, false, { options: ["草稿", "已发布", "已下架"], default: "草稿" }),
          f("publishDate", "发布时间", "date", false, false, { dateMode: "single" }),
          f("viewCount", "阅读量", "number", false, true, { min: 0, step: 1, default: 0 }),
          f("likeCount", "点赞数", "number", false, true, { min: 0, step: 1, default: 0 }),
        ],
        records: [],
        categories: [
          {
            id: uid(),
            name: "技术",
            children: [
              { id: uid(), name: "前端", children: [] },
              { id: uid(), name: "后端", children: [] },
            ],
          },
          {
            id: uid(),
            name: "生活",
            children: [
              { id: uid(), name: "旅行", children: [] },
              { id: uid(), name: "美食", children: [] },
            ],
          },
        ],
      },
      {
        id: uid(),
        name: "媒体库",
        type: "table",
        supportsCategory: true,
        fields: [
          f("file", "文件", "image", true, false, { accept: "*/*", maxSizeMB: 50 }),
          f("name", "文件名", "text", true, false, { placeholder: "请输入文件名" }),
          f("type", "文件类型", "select", false, true, { options: ["图片", "视频", "音频", "文档"], locked: true }),
          f("size", "文件大小", "text", false, true, { locked: true }),
          f("uploadDate", "上传时间", "date", false, true, { locked: true }),
          f("description", "描述", "textarea", false, false, { placeholder: "请输入文件描述" }),
        ],
        records: [],
        categories: [
          {
            id: uid(),
            name: "图片",
            children: [
              { id: uid(), name: "封面图", children: [] },
              { id: uid(), name: "内容图", children: [] },
            ],
          },
          {
            id: uid(),
            name: "视频",
            children: [
              { id: uid(), name: "教程视频", children: [] },
              { id: uid(), name: "宣传视频", children: [] },
            ],
          },
        ],
      },
    ],
  }
}
