"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Locale = "zh" | "en"
type Dict = Record<string, string | ((params?: any) => string)>

const zh: Dict = {
  brand: "通用无代码构建平台",
  save: "保存",
  newApp: "新建应用",
  appsTitle: "应用构建页",
  appsSubtitle: "管理已创建的应用或新建",
  searchApp: "搜索应用...",
  emptyAppHint: "还没有应用。点击右上角「新建应用」开始吧。",
  noDesc: "电商+系统模块示例",
  modulesCount: ({ n }: any) => `模块 ${n}`,
  enter: "进入",
  clone: "克隆",
  delete: "删除",
  copySuffix: "（副本）",
  confirmDeleteApp: "确认删除该应用？",
  newAppNamePlaceholder: "请输入应用名称",
  toggleLang: "切换语言",
  appNotFound: "未找到应用",
  apps: "应用",
  directories: "目录（表）",
  rename: "重命名",
  addDir: "添加目录",
  typeCategory: "分类",
  typeTable: "表",
  emptyDirHint: "该模块暂无目录，请先添加。",
  moduleSettings: "模块设置",
  dirSettings: "目录设置",
  chooseDirHint: "请选择左侧目录开始操作",
  searchPlaceholder: "搜索 名称/品牌/标签...",
  filterByCategory: "按分类筛选",
  filterByStatus: "按上架状态",
  all: "全部",
  statusOn: "上架",
  statusOff: "下架",
  addRecord: "新增记录",
  tabList: "列表",
  tabFields: "字段管理",
  tabCategories: "分类",
  listHint: "提示：显示列由「字段管理」中的启用状态决定。单击一行打开右侧详情抽屉。",
  confirmDeleteRecord: "确认删除该记录？",
  addModule: "添加模块",
  module_ecom: "电商类通用模块",
  module_edu: "教育类通用模块",
  module_content: "通用内容模块",
  module_project: "通用项目展示模块",
  module_custom: "通用自定义模块",
  renameModule: "模块名",
  newDirNamePlaceholder: "目录名称",
  unnamedDir: "未命名目录",
  chooseTableTpl: "选择表模板（custom/ecom-product/...）",
  renameDir: "目录名",
  ft_text: "文本",
  ft_textarea: "多行文本",
  ft_number: "数字",
  ft_select: "单选",
  ft_multiselect: "多选",
  ft_boolean: "布尔",
  ft_date: "日期",
  ft_time: "时间",
  ft_tags: "标签",
  ft_image: "图片",
  ft_profile: "标识",
  ft_video: "视频",
  ft_file: "文件",
  ft_richtext: "富文本",
  ft_percent: "百分比",
  ft_progress: "进度",
  ft_barcode: "条码",
  ft_checkbox: "复选框",
  ft_cascader: "级联选项",
  ft_relation_one: "关联",
  ft_relation_many: "多关联",
  ft_experience: "经历",
  ft_multiimage: "多图片",
  ft_multivideo: "多视频",
  ft_identity_verification: "实名认证",
  ft_other_verification: "其他认证",
  // 字段管理相关
  fieldManagement: "字段管理",
  categoryManagement: "分类管理",
  allFields: "全部字段",
  uncategorized: "未分类",
  editField: "编辑字段",
  defaultField: "默认字段",
  deleteField: "删除",
  dragToSort: "拖动排序",
  confirmDeleteField: "确认删除该字段？",
  // 字段类型
  basicFields: "基础字段",
  businessFields: "业务字段",
  // 字段分类管理
  addCategory: "添加分类",
  addCategoryLoading: "添加中...",
  addCategoryFailed: "添加分类失败，请重试",
  categoryName: "分类名称",
  categoryDescription: "分类描述（可选）",
  categoryList: "分类列表",
  fieldList: "字段列表",
  enabled: "已启用",
  disabled: "已禁用",
  showFields: "显示",
  ofFields: "个字段",
  selectCategoryToView: "请选择一个字段分类查看详情",
  confirmDeleteCategory: "确认删除分类",
  confirmDeleteCategoryWithFields: "该分类包含",
  fieldsWillMoveToUncategorized: "个字段，删除后这些字段将移至「无分类」。",
  systemCategoryCannotDelete: "系统分类不能删除",
  previousPage: "上一页",
  nextPage: "下一页",
  fieldCategoryManagement: "字段分类管理",
  deleteCategory: "删除分类",
  typeChangeWarning: "更改字段类型会尝试转换已有数据，可能造成数据丢失，是否继续？",
  saveField: "保存字段",
  // 模块管理
  selfModule: "自主模块",
  thirdPartyModule: "第三方模块",
  searchModulePlaceholder: "搜索模块名称、提供商或描述...",
  allCategories: "所有类别",
  provider: "提供商",
  version: "版本",
  downloads: "下载",
  rating: "评分",
  install: "安装",
  noMatchingModules: "没有找到匹配的模块",
  // 列表管理
  noPermissionToDelete: "当前角色无权删除",
  noPermissionToBulkDelete: "当前角色无权批量删除",
  confirmDeleteRecord: "确认删除该记录？",
  confirmBulkDeleteRecords: "确认批量删除选中的",
  records: "条记录？",
  bulkDeleteCompleted: "批量删除完成",
  bulkDeleteSelected: "批量删除选中项",
  bulkDelete: "批量删除",
  clearSelection: "清除选择",
  selected: "已选择",
  items: "项",
  // 动态记录
  dynamicRecordAdded: "动态记录已添加",
  pleaseEnterDynamicContent: "请输入动态内容",
  userRecord: "用户记录",
  systemInfo: "系统信息",
  behaviorDynamic: "行为动态",
  other: "其他",
  addUserRecord: "添加用户记录",
  recordContent: "记录内容",
  enterUserRecordContent: "请输入用户记录内容...",
  addRecord: "添加记录",
  historyRecord: "历史记录",
  category: "分类",
  basicInfo: "基本资料",
  dynamicRecord: "动态记录",
  saveChanges: "保存更改",
  saved: "已保存",
}

const en: Dict = {
  brand: "Universal No-code Builder",
  save: "Save",
  newApp: "New App",
  appsTitle: "App Builder",
  appsSubtitle: "Manage existing apps or create a new one",
  searchApp: "Search apps...",
  emptyAppHint: "No app yet. Click New App to start.",
  noDesc: "E-commerce + system modules demo",
  modulesCount: ({ n }: any) => `Modules ${n}`,
  enter: "Enter",
  clone: "Clone",
  delete: "Delete",
  copySuffix: " (copy)",
  confirmDeleteApp: "Delete this app?",
  newAppNamePlaceholder: "Enter app name",
  toggleLang: "Toggle language",
  appNotFound: "App not found",
  apps: "Apps",
  directories: "Directories (Tables)",
  rename: "Rename",
  addDir: "Add Directory",
  typeCategory: "Category",
  typeTable: "Table",
  emptyDirHint: "No directory in this module. Add one first.",
  moduleSettings: "Module Settings",
  dirSettings: "Directory Settings",
  chooseDirHint: "Pick a directory from the left to start",
  searchPlaceholder: "Search name/brand/tags...",
  filterByCategory: "Filter by category",
  filterByStatus: "Filter by status",
  all: "All",
  statusOn: "Online",
  statusOff: "Offline",
  addRecord: "Add Record",
  tabList: "List",
  tabFields: "Fields",
  tabCategories: "Categories",
  listHint: "Columns are controlled in Fields tab. Click a row to open the right drawer.",
  confirmDeleteRecord: "Delete this record?",
  addModule: "Add Module",
  module_ecom: "E-commerce module",
  module_edu: "Education module",
  module_content: "Content module",
  module_project: "Project showcase module",
  module_custom: "Custom module",
  renameModule: "Module name",
  newDirNamePlaceholder: "Directory name",
  unnamedDir: "Untitled directory",
  chooseTableTpl: "Choose table template (custom/ecom-product/...)",
  renameDir: "Directory name",
  ft_text: "Text",
  ft_textarea: "Textarea",
  ft_number: "Number",
  ft_select: "Single Select",
  ft_multiselect: "Multi Select",
  ft_boolean: "Boolean",
  ft_date: "Date",
  ft_time: "Time",
  ft_tags: "Tags",
  ft_image: "Image",
  ft_profile: "Profile",
  ft_video: "Video",
  ft_file: "File",
  ft_richtext: "Rich Text",
  ft_percent: "Percent",
  ft_progress: "Progress",
  ft_barcode: "Barcode",
  ft_checkbox: "Checkbox",
  ft_cascader: "Cascader",
  ft_relation_one: "Relation",
  ft_relation_many: "Multi-relation",
  ft_experience: "Experience",
  ft_multiimage: "Multi Image",
  ft_multivideo: "Multi Video",
  ft_identity_verification: "Identity Verification",
  ft_other_verification: "Other Verification",
  // Field management related
  fieldManagement: "Field Management",
  categoryManagement: "Category Management",
  allFields: "All Fields",
  uncategorized: "Uncategorized",
  editField: "Edit Field",
  defaultField: "Default Field",
  deleteField: "Delete",
  dragToSort: "Drag to sort",
  confirmDeleteField: "Confirm delete this field?",
  // Field types
  basicFields: "Basic Fields",
  businessFields: "Business Fields",
  // Field Category Management
  addCategory: "Add Category",
  addCategoryLoading: "Adding...",
  addCategoryFailed: "Failed to add category, please try again",
  categoryName: "Category Name",
  categoryDescription: "Category Description (Optional)",
  categoryList: "Category List",
  fieldList: "Field List",
  enabled: "Enabled",
  disabled: "Disabled",
  showFields: "Showing",
  ofFields: "fields",
  selectCategoryToView: "Please select a field category to view details",
  confirmDeleteCategory: "Confirm delete category",
  confirmDeleteCategoryWithFields: "This category contains",
  fieldsWillMoveToUncategorized: "fields, they will be moved to 'Uncategorized' after deletion.",
  systemCategoryCannotDelete: "System categories cannot be deleted",
  previousPage: "Previous",
  nextPage: "Next",
  fieldCategoryManagement: "Field Category Management",
  deleteCategory: "Delete Category",
  typeChangeWarning: "Changing field type will attempt to convert existing data, which may cause data loss. Continue?",
  saveField: "Save Field",
  // Module Management
  selfModule: "Self Module",
  thirdPartyModule: "Third-party Module",
  searchModulePlaceholder: "Search module name, provider or description...",
  allCategories: "All Categories",
  provider: "Provider",
  version: "Version",
  downloads: "Downloads",
  rating: "Rating",
  install: "Install",
  noMatchingModules: "No matching modules found",
  // List Management
  noPermissionToDelete: "Current role has no permission to delete",
  noPermissionToBulkDelete: "Current role has no permission to bulk delete",
  confirmDeleteRecord: "Confirm delete this record?",
  confirmBulkDeleteRecords: "Confirm bulk delete selected",
  records: "records?",
  bulkDeleteCompleted: "Bulk delete completed",
  bulkDeleteSelected: "Bulk delete selected items",
  bulkDelete: "Bulk Delete",
  clearSelection: "Clear Selection",
  selected: "Selected",
  items: "items",
  // Dynamic Records
  dynamicRecordAdded: "Dynamic record added",
  pleaseEnterDynamicContent: "Please enter dynamic content",
  userRecord: "User Record",
  systemInfo: "System Info",
  behaviorDynamic: "Behavior Dynamic",
  other: "Other",
  addUserRecord: "Add User Record",
  recordContent: "Record Content",
  enterUserRecordContent: "Please enter user record content...",
  addRecord: "Add Record",
  historyRecord: "History Record",
  category: "Category",
  basicInfo: "Basic Info",
  dynamicRecord: "Dynamic Record",
  saveChanges: "Save Changes",
  saved: "Saved",
}

interface LocaleContextType {
  locale: Locale
  t: (key: keyof typeof zh, params?: any) => string
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh")
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const saved = (localStorage.getItem("nocode_locale") as Locale) || "zh"
    setLocale(saved)
  }, [])
  
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("nocode_locale", locale)
    }
  }, [locale, mounted])
  
  const dict = locale === "zh" ? zh : en
  
  function t(key: keyof typeof zh, params?: any): string {
    const v = (dict as any)[key]
    if (typeof v === "function") return v(params)
    return v ?? String(key)
  }
  
  function toggleLocale() {
    setLocale((l) => (l === "zh" ? "en" : "zh"))
  }
  
  return (
    <LocaleContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  
  // 为了确保服务器端和客户端渲染一致，我们使用默认的中文字典
  const defaultDict = zh
  const defaultT = (key: keyof typeof zh, params?: any): string => {
    const v = (defaultDict as any)[key]
    if (typeof v === "function") return v(params)
    return v ?? String(key)
  }
  
  // 如果context还没有准备好，返回默认值
  if (!context.locale) {
    return {
      locale: "zh" as Locale,
      t: defaultT,
      toggleLocale: () => {}
    }
  }
  
  return context
}
