"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocale } from "@/hooks/use-locale"
import { useApplicationModules } from "@/hooks/use-application-modules"
import { type ApplicationModule } from "@/lib/api"
import { api } from "@/lib/api"

type DrawerState = {
  open: boolean
  dirId: string | null
  recordId: string | null
  tab: string
}

export type Filters = { kw: string; status: string; category: string }

// 目录模型
export interface DirectoryModel {
  id: string
  name: string
  type: "table" | "category"
  fields: any[]
  categories?: any[]
  records?: any[]
}

// 模块模型，适配API数据
export interface ModuleModel {
  id: string
  name: string
  type: string
  icon: string
  directories: DirectoryModel[]
}

// 目录模板
const dirTemplates = {
  custom: (name?: string): DirectoryModel => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name: name || "新目录",
    type: "table",
    fields: [],
    categories: [],
    records: [],
  }),
  "ecom-product": (name?: string): DirectoryModel => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name: name || "商品管理",
    type: "table",
    fields: [
      { id: "1", key: "name", label: "商品名称", type: "text", required: true, showInList: true },
      { id: "2", key: "price", label: "价格", type: "number", required: true, showInList: true },
      { id: "3", key: "category", label: "分类", type: "select", required: false, showInList: true },
    ],
    categories: [],
    records: [],
  }),
  "ecom-order": (name?: string): DirectoryModel => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name: name || "订单管理",
    type: "table",
    fields: [
      { id: "1", key: "orderNo", label: "订单号", type: "text", required: true, showInList: true },
      { id: "2", key: "customer", label: "客户", type: "text", required: true, showInList: true },
      { id: "3", key: "amount", label: "金额", type: "number", required: true, showInList: true },
    ],
    categories: [],
    records: [],
  }),
}

export function useApiBuilderController({
  appId,
  can,
  toast,
}: {
  appId: string
  can: (action: "view" | "edit" | "delete" | "bulkDelete" | "managePermissions") => boolean
  toast: (opts: { description: string; variant?: any }) => void
}) {
  const { t, locale } = useLocale()
  
  // 使用API获取应用和模块数据
  const {
    data,
    application,
    modules,
    isLoading,
    error,
    fetchModules,
  } = useApplicationModules(appId)

  const [moduleId, setModuleId] = useState<string | null>(null)
  const [dirId, setDirId] = useState<string | null>(null)

  const [filters, setFilters] = useState<Filters>({ kw: "", status: "all", category: "all" })
  const [tab, setTab] = useState<"list" | "fields">("list")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [drawer, setDrawer] = useState<DrawerState>({ open: false, dirId: null, recordId: null, tab: "basic" })

  // Dialog states
  const [openAddModule, setOpenAddModule] = useState(false)
  const [openAddDir, setOpenAddDir] = useState(false)
  const [openAddField, setOpenAddField] = useState(false)

  const [renameModuleOpen, setRenameModuleOpen] = useState(false)
  const [renameModuleName, setRenameModuleName] = useState("")
  const [renameDirOpen, setRenameDirOpen] = useState(false)
  const [renameDirName, setRenameDirName] = useState("")
  const [renameDirTargetId, setRenameDirTargetId] = useState<string | null>(null)

  const [openCategory, setOpenCategory] = useState(false)
  const [openCategorySelection, setOpenCategorySelection] = useState(false)

  // 目录数据状态
  const [directoriesData, setDirectoriesData] = useState<Record<string, DirectoryModel[]>>({})
  const [directoriesLoading, setDirectoriesLoading] = useState<Record<string, boolean>>({})
  
  // 记录数据状态
  const [recordsData, setRecordsData] = useState<Record<string, any[]>>({})
  const [recordsLoading, setRecordsLoading] = useState<Record<string, boolean>>({})

  // 获取目录数据的函数
  const fetchDirectories = async (moduleId: string) => {
    if (directoriesLoading[moduleId]) return
    
    setDirectoriesLoading(prev => ({ ...prev, [moduleId]: true }))
    
    try {
      const response = await api.directories.getDirectories({
        applicationId: appId,
        moduleId: moduleId,
      })
      
      if (response.success && response.data) {
        // 将API数据转换为前端需要的格式，并获取完整的字段定义
        const directories = await Promise.all(
          response.data.directories.map(async (dir: any) => {
            // 获取目录定义ID
            const dirDefResponse = await api.directoryDefs.getOrCreateDirectoryDefByDirectoryId(dir.id, appId)
            
            let fields = dir.config?.fields || []
            
            if (dirDefResponse.success && dirDefResponse.data?.id) {
              // 获取完整的字段定义
              const fieldsResponse = await api.fields.getFields({
                directoryId: dirDefResponse.data.id,
                page: 1,
                limit: 100
              })
              
              if (fieldsResponse.success && fieldsResponse.data) {
                // 将API字段定义转换为前端格式
                fields = fieldsResponse.data.map((field: any) => ({
                  id: field.id,
                  key: field.key,
                  label: field.schema?.label || field.key,
                  type: field.type,
                  required: field.required || false,
                  unique: false,
                  showInList: field.schema?.showInList ?? true,
                  showInForm: field.schema?.showInForm ?? true,
                  showInDetail: field.schema?.showInDetail ?? true,
                  placeholder: field.schema?.placeholder || '',
                  desc: field.schema?.description || '',
                  options: field.schema?.options || [],
                  config: field.schema || {},
                  validators: field.validators || {},
                  enabled: true,
                  locked: false,
                  // 提取字段配置信息
                  cascaderOptions: field.schema?.cascaderOptions || undefined,
                  customExperienceConfig: field.schema?.customExperienceConfig || undefined,
                  certificateConfig: field.schema?.certificateConfig || undefined,
                  skillsConfig: field.schema?.skillsConfig || undefined,
                  progressConfig: field.schema?.progressConfig || undefined,
                  identityVerificationConfig: field.schema?.identityVerificationConfig || undefined,
                  otherVerificationConfig: field.schema?.otherVerificationConfig || undefined,
                  imageConfig: field.schema?.imageConfig || undefined,
                  videoConfig: field.schema?.videoConfig || undefined,
                  booleanConfig: field.schema?.booleanConfig || undefined,
                  multiselectConfig: field.schema?.multiselectConfig || undefined,
                  preset: field.schema?.preset || undefined,
                  // 添加关联字段配置
                  relation: field.relation ? {
                    targetDirId: field.relation.targetDirId || null,
                    mode: field.relation.mode || (field.type === 'relation_one' ? 'one' : 'many'),
                    displayFieldKey: field.relation.displayFieldKey || null,
                  } : undefined,
                }))
              }
            }
            
            // 获取记录分类数据
            let categories: any[] = []
            try {
              const categoriesResponse = await api.recordCategories.getRecordCategories({
                applicationId: appId,
                directoryId: dir.id
              })
              
              if (categoriesResponse.success && categoriesResponse.data?.categories) {
                // 将扁平结构转换为树形结构
                categories = buildCategoryTree(categoriesResponse.data.categories)
              }
            } catch (error) {
              console.error("获取分类数据失败:", error)
              // 如果获取失败，使用目录配置中的分类作为备用
              categories = dir.config?.categories || []
            }
            
            return {
              id: dir.id,
              name: dir.name,
              type: dir.type,
              fields: fields,
              categories: categories,
              records: [],
            }
          })
        )
        
        setDirectoriesData(prev => ({
          ...prev,
          [moduleId]: directories
        }))
      }
    } catch (error) {
      console.error("获取目录数据失败:", error)
      toast({
        description: locale === "zh" ? "获取目录数据失败" : "Failed to fetch directories",
        variant: "destructive",
      })
    } finally {
      setDirectoriesLoading(prev => ({ ...prev, [moduleId]: false }))
    }
  }

  // 获取记录数据的函数 - 使用ref来避免依赖项问题
  const fetchRecordsRef = useRef<Record<string, boolean>>({})
  
  const fetchRecords = useCallback(async (dirId: string) => {
    // 使用ref来跟踪请求状态，避免依赖项问题
    if (fetchRecordsRef.current[dirId]) {
      console.log('🔍 记录正在加载中，跳过重复请求:', dirId)
      return
    }
    
    console.log('🔍 开始获取记录数据:', dirId)
    fetchRecordsRef.current[dirId] = true
    setRecordsLoading(prev => ({ ...prev, [dirId]: true }))
    
    try {
      const response = await api.records.listRecords(dirId, {
        page: 1,
        pageSize: 20, // 修复：后端最大限制是50，使用20更安全
      })
      
      if (response.success && response.data) {
        // 后端返回格式: { data: [...], pagination: {...} }
        // 前端期望格式: 直接是记录数组
        const records = Array.isArray(response.data) ? response.data : response.data.records || response.data
        console.log('🔍 记录数据获取成功:', dirId, '记录数量:', records.length)
        setRecordsData(prev => ({
          ...prev,
          [dirId]: records
        }))
      }
    } catch (error) {
      console.error("获取记录数据失败:", error)
      toast({
        description: locale === "zh" ? "获取记录数据失败" : "Failed to fetch records",
        variant: "destructive",
      })
    } finally {
      fetchRecordsRef.current[dirId] = false
      setRecordsLoading(prev => ({ ...prev, [dirId]: false }))
    }
  }, [toast, locale]) // 移除recordsLoading和lastFetchTime依赖

  // 将API模块数据转换为ModuleModel格式，并合并目录数据
  const apiModules = useMemo<ModuleModel[]>(() => {
    return modules.map((module: ApplicationModule) => ({
      id: module.id,
      name: module.name,
      type: module.type,
      icon: module.icon,
      directories: (directoriesData[module.id] || []).map(dir => ({
        ...dir,
        records: [] // 修复：不在useMemo中直接使用recordsData，避免无限循环
      }))
    }))
  }, [modules, directoriesData]) // 修复：移除recordsData依赖，避免无限循环

  // 设置默认选中的模块
  useEffect(() => {
    if (apiModules.length > 0 && !moduleId) {
      setModuleId(apiModules[0].id)
    }
  }, [apiModules, moduleId])

  // 当模块ID变化时，获取该模块的目录数据
  useEffect(() => {
    if (moduleId && appId) {
      fetchDirectories(moduleId)
    }
  }, [moduleId, appId])

  const currentModule = useMemo<ModuleModel | null>(() => {
    if (!moduleId) return null
    return apiModules.find((m) => m.id === moduleId) || null
  }, [apiModules, moduleId])

  // select default directory
  useEffect(() => {
    if (!currentModule) return
    if (!dirId && currentModule.directories.length > 0) {
      setDirId(currentModule.directories[0].id)
    }
  }, [currentModule, dirId])

  const currentDir = useMemo<DirectoryModel | null>(() => {
    if (!currentModule || !dirId) return null
    const dir = currentModule.directories.find((d) => d.id === dirId)
    if (!dir) return null
    
    // 动态获取记录数据，避免在useMemo中直接使用recordsData
    return {
      ...dir,
      records: recordsData[dir.id] || []
    }
  }, [currentModule, dirId, recordsData])

  // 当目录ID变化时，获取该目录的记录数据
  useEffect(() => {
    if (currentDir && currentDir.type === "table") {
      console.log('🔍 useEffect触发，准备获取记录:', currentDir.id, '类型:', currentDir.type)
      fetchRecords(currentDir.id)
    }
  }, [currentDir?.id, currentDir?.type]) // 修复：移除fetchRecords依赖，使用ref避免循环

  // reset selection when directory or filters change
  useEffect(() => {
    setSelectedIds([])
  }, [dirId, filters.kw, filters.status, filters.category])

  // 错误处理
  useEffect(() => {
    if (error) {
      toast({
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // 添加缺失的方法
  async function handleCreateDirectoryFromDialog(payload: { name: string; templateKey: string }) {
    if (!currentModule) return
    if (!can("edit")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权创建目录" : "Current role has no permission to create directory", 
        variant: "destructive" 
      })
      return
    }

    try {
      const response = await api.directories.createDirectory({
        name: payload.name,
        type: "table",
        supportsCategory: false,
        config: {},
        order: 0,
      }, {
        applicationId: appId,
        moduleId: currentModule.id,
      })

      if (response.success && response.data) {
        // 重新获取目录数据
        await fetchDirectories(currentModule.id)
        
        // 设置新创建的目录为当前目录
        setDirId(response.data.id)
        setOpenAddDir(false)
        
        toast({
          description: locale === "zh" ? `目录「${payload.name}」创建成功` : `Directory "${payload.name}" created successfully`,
        })
      }
    } catch (error) {
      console.error("创建目录失败:", error)
      toast({
        description: locale === "zh" ? "创建目录失败" : "Failed to create directory",
        variant: "destructive",
      })
    }
  }

  function handleCreateModuleFromDialog(payload: { name: string; templateKey: string }) {
    // 临时实现，后续可以连接到API
    toast({
      description: locale === "zh" ? "创建模块功能正在开发中" : "Create module feature is under development",
    })
  }

  // 保存记录到API
  async function saveRecord(dirId: string, recordId: string, props: Record<string, any>) {
    try {
      console.log('🔍 保存记录:', { dirId, recordId, props })
      
      const response = await api.records.updateRecord(dirId, recordId, { props })
      
      if (response.success && response.data) {
        // 重新获取记录列表以更新本地状态
        await fetchRecords(dirId)
        
        toast({
          description: locale === "zh" ? "记录保存成功" : "Record saved successfully",
        })
        
        return response.data
      } else {
        throw new Error(response.error || "保存记录失败")
      }
    } catch (error) {
      console.error("保存记录失败:", error)
      toast({
        description: locale === "zh" ? "保存记录失败" : "Failed to save record",
        variant: "destructive",
      })
      throw error
    }
  }

  function persist(app: any) {
    // 临时实现，用于兼容旧的接口
    // 新的实现应该使用 saveRecord 函数
    console.log("Persist app (deprecated):", app)
  }

  async function addRecord() {
    if (!currentDir) return
    if (!can("edit")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权添加记录" : "Current role has no permission to add record", 
        variant: "destructive" 
      })
      return
    }

    try {
      // 检查是否有内容分类
      const hasCategories = currentDir.categories && currentDir.categories.length > 0
      
      if (hasCategories) {
        // 有分类时，先弹出分类选择对话框
        setOpenCategorySelection(true)
      } else {
        // 没有分类时，直接创建记录
        await createRecordWithCategory("")
      }
    } catch (error) {
      console.error("添加记录失败:", error)
      toast({
        description: locale === "zh" ? "添加记录失败" : "Failed to add record",
        variant: "destructive",
      })
    }
  }

  async function createRecordWithCategory(categoryPath: string) {
    if (!currentDir) return

    try {
      // 构建默认记录数据
      const defaultProps: Record<string, any> = {}
      
      // 根据字段定义设置默认值
      currentDir.fields.forEach((field) => {
        if (field.default !== undefined) {
          defaultProps[field.key] = field.default
          return
        }
        
        // 根据字段类型设置默认值
        let defaultValue: any
        switch (field.type) {
          case "select":
            // 如果是分类字段且有分类，设置分类路径
            if (field.key === "category" && categoryPath) {
              defaultValue = categoryPath
            } else {
              defaultValue = field.options?.[0] ?? ""
            }
            break
          case "multiselect":
          case "tags":
            defaultValue = []
            break
          case "boolean":
          case "checkbox":
            defaultValue = false
            break
          case "number":
          case "percent":
            defaultValue = 0
            break
          case "experience":
            defaultValue = []
            break
          case "relation_one":
          case "relation_many":
            defaultValue = field.type === "relation_many" ? [] : ""
            break
          case "email":
            // 为必填的email字段设置一个示例值
            defaultValue = field.required ? "example@example.com" : ""
            break
          case "image":
          case "profile":
            // 图片字段：如果是必填的，设置一个默认图片URL；否则设置空值
            if (field.required) {
              defaultValue = "https://via.placeholder.com/150x150?text=Image" // 使用完整的占位图片URL
            } else {
              defaultValue = ""
            }
            break
          case "date":
            // 日期字段设置今天的日期
            defaultValue = field.required ? new Date().toISOString().split('T')[0] : ""
            break
          case "datetime":
            // 日期时间字段设置当前时间
            defaultValue = field.required ? new Date().toISOString() : ""
            break
          default:
            // 为必填的文本字段设置一个示例值
            if (field.required) {
              defaultValue = `${field.label || field.key}_示例值`
            } else {
              defaultValue = ""
            }
        }
        
        defaultProps[field.key] = defaultValue
      })

      // 设置默认名称
      const nameField = currentDir.fields.find(f => f.key === "name" || f.key === "title")
      if (nameField && !defaultProps[nameField.key]) {
        const currentRecords = recordsData[currentDir.id] || []
        const recordCount = currentRecords.length
        defaultProps[nameField.key] = `${nameField.label || "新记录"}#${recordCount + 1}`
      }

      // 调用API创建记录
      console.log('🔍 创建记录:', { 
        dirId: currentDir.id, 
        dirName: currentDir.name,
        props: defaultProps,
        fieldsInfo: currentDir.fields.map(f => ({ 
          key: f.key, 
          type: f.type, 
          required: f.required,
          label: f.label 
        }))
      })
      const response = await api.records.createRecord(currentDir.id, { props: defaultProps })
      
      if (response.success && response.data) {
        console.log('🔍 记录创建成功，返回数据:', response.data)
        
        // 重新获取记录列表
        console.log('🔍 重新获取记录列表...')
        await fetchRecords(currentDir.id)
        
        // 打开记录抽屉进行编辑
        const recordId = response.data.id
        console.log('🔍 准备打开抽屉:', { dirId: currentDir.id, recordId, tab: "basic" })
        setDrawer({ open: true, dirId: currentDir.id, recordId: recordId, tab: "basic" })
        
        toast({
          description: locale === "zh" ? "记录创建成功" : "Record created successfully",
        })
      } else {
        console.error('🔍 记录创建失败:', response)
        throw new Error(response.error || "创建记录失败")
      }
    } catch (error) {
      console.error("创建记录失败:", error)
      toast({
        description: locale === "zh" ? "创建记录失败" : "Failed to create record",
        variant: "destructive",
      })
    }
  }

  function openDrawer(dirId: string, recordId: string) {
    setDrawer({ open: true, dirId, recordId, tab: "basic" })
  }

  function closeDrawer() {
    setDrawer({ open: false, dirId: null, recordId: null, tab: "basic" })
  }

  function quickOpenAddField() {
    setOpenAddField(true)
  }

  function openRenameModule() {
    if (!currentModule) return
    setRenameModuleName(currentModule.name)
    setRenameModuleOpen(true)
  }

  function handleRenameModule(name?: string) {
    if (!currentModule) return
    if (!can("edit")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权重命名模块" : "Current role has no permission to rename module", 
        variant: "destructive" 
      })
      return
    }
    const newName = (name || renameModuleName).trim()
    if (!newName) return
    // 临时实现
    toast({
      description: locale === "zh" ? "重命名模块功能正在开发中" : "Rename module feature is under development",
    })
    setRenameModuleOpen(false)
  }

  async function renameDir(d: any) {
    if (!can("edit")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权重命名目录" : "Current role has no permission to rename directory", 
        variant: "destructive" 
      })
      return
    }
    setRenameDirTargetId(d.id)
    setRenameDirName(d.name)
    setRenameDirOpen(true)
  }

  async function handleRenameDir(name?: string) {
    if (!currentModule || !renameDirTargetId) return
    const newName = (name || renameDirName).trim()
    if (!newName) return
    
    try {
      const response = await api.directories.updateDirectory(renameDirTargetId, {
        name: newName,
      })

      if (response.success) {
        // 重新获取目录数据
        await fetchDirectories(currentModule.id)
        
        toast({
          description: locale === "zh" ? `目录重命名为「${newName}」` : `Directory renamed to "${newName}"`,
        })
        setRenameDirOpen(false)
      }
    } catch (error) {
      console.error("重命名目录失败:", error)
      toast({
        description: locale === "zh" ? "重命名目录失败" : "Failed to rename directory",
        variant: "destructive",
      })
    }
  }

  async function deleteDir(d: any) {
    if (!currentModule) return
    if (!can("delete")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权删除目录" : "Current role has no permission to delete directory", 
        variant: "destructive" 
      })
      return
    }
    
    // 检查目录是否有记录
    if (d.records && d.records.length > 0) {
      toast({ 
        description: locale === "zh" 
          ? `无法删除目录「${d.name}」，请先删除目录中的 ${d.records.length} 条记录`
          : `Cannot delete directory "${d.name}", please delete ${d.records.length} records first`, 
        variant: "destructive" 
      })
      return
    }

    try {
      const response = await api.directories.deleteDirectory(d.id)

      if (response.success) {
        // 重新获取目录数据
        await fetchDirectories(currentModule.id)
        
        // 如果删除的是当前目录，切换到第一个可用目录
        if (dirId === d.id) {
          const remainingDirs = directoriesData[currentModule.id]?.filter(dir => dir.id !== d.id) || []
          setDirId(remainingDirs.length > 0 ? remainingDirs[0].id : null)
        }
        
        toast({
          description: locale === "zh" ? `目录「${d.name}」已删除` : `Directory "${d.name}" deleted`,
        })
      }
    } catch (error) {
      console.error("删除目录失败:", error)
      toast({
        description: locale === "zh" ? "删除目录失败" : "Failed to delete directory",
        variant: "destructive",
      })
    }
  }

  async function handleSaveCategories(newCats: any[]) {
    if (!currentDir || !appId) return
    
    try {
      console.log('🔍 保存分类数据:', newCats)
      
      // 简化逻辑：先删除所有现有分类，再重新创建
      // 这样可以避免复杂的ID映射和层级关系问题
      
      // 1. 获取并删除所有现有分类
      const existingCategories = await api.recordCategories.getRecordCategories({
        applicationId: appId,
        directoryId: currentDir.id
      })
      
      if (existingCategories.success && existingCategories.data?.categories) {
        console.log('🗑️ 删除现有分类，数量:', existingCategories.data.categories.length)
        
        // 按层级倒序删除：先删除子分类，再删除父分类
        const categories = existingCategories.data.categories
        const sortedCategories = categories.sort((a: any, b: any) => (b.level || 1) - (a.level || 1))
        
        for (const category of sortedCategories) {
          try {
            console.log('🗑️ 删除分类:', category.name, 'level:', category.level)
            await api.recordCategories.deleteRecordCategory(category.id)
          } catch (error) {
            console.warn('删除分类失败:', category.id, category.name, error)
            // 如果删除失败，继续尝试删除其他分类
          }
        }
      }
      
      // 2. 重新创建所有分类（按层级顺序）
      const flatCategories = flattenCategories(newCats)
      console.log('🔄 扁平化分类:', flatCategories)
      
      // 按层级分组
      const levels = new Map()
      flatCategories.forEach(category => {
        const level = category.level || 1
        if (!levels.has(level)) {
          levels.set(level, [])
        }
        levels.get(level).push(category)
      })
      
      // 存储新创建的ID映射
      const idMap = new Map()
      
      // 按层级顺序创建分类
      for (const level of Array.from(levels.keys()).sort()) {
        const categoriesAtLevel = levels.get(level)
        for (const category of categoriesAtLevel) {
          console.log('➕ 创建分类:', category.name, 'level:', level)
          
          // 处理parentId - 使用新创建的ID
          let parentId = null
          if (category.parentId && idMap.has(category.parentId)) {
            parentId = idMap.get(category.parentId)
          }
          
          const response = await api.recordCategories.createRecordCategory({
            name: category.name,
            ...(parentId && { parentId: parentId }),
            order: category.order || 0,
            enabled: category.enabled !== false
          }, {
            applicationId: appId,
            directoryId: currentDir.id
          })
          
          if (response.success && response.data) {
            // 存储新ID映射
            idMap.set(category.tempId, response.data.id)
            console.log('✅ 分类创建成功:', category.name, 'ID:', response.data.id)
          } else {
            console.error('❌ 分类创建失败:', category.name, response)
          }
        }
      }
      
      // 3. 重新获取分类数据并更新本地状态
      const updatedCategories = await api.recordCategories.getRecordCategories({
        applicationId: appId,
        directoryId: currentDir.id
      })
      
      if (updatedCategories.success) {
        // 将扁平数据转换为树形结构
        const treeCategories = buildCategoryTree(updatedCategories.data?.categories || [])
        
        // 更新本地状态
        const updatedDir = {
          ...currentDir,
          categories: treeCategories
        } as any
        
        setDirectoriesData(prev => ({
          ...prev,
          [currentModule?.id || '']: prev[currentModule?.id || '']?.map(dir => 
            dir.id === currentDir.id ? updatedDir : dir
          ) || []
        }))
        
        toast({
          description: locale === "zh" ? "分类保存成功" : "Categories saved successfully",
        })
        setOpenCategory(false)
      } else {
        throw new Error(updatedCategories.error || "获取更新后的分类失败")
      }
    } catch (error) {
      console.error("保存分类失败:", error)
      toast({
        description: locale === "zh" ? "保存分类失败，请重试" : "Failed to save categories, please try again",
        variant: "destructive"
      })
    }
  }
  
  // 将树形分类结构转换为扁平结构
  function flattenCategories(categories: any[], parentId: string | null = null, level: number = 1): any[] {
    const result: any[] = []
    
    categories.forEach((category, index) => {
      // 为没有ID的分类生成临时ID
      const tempId = category.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const flatCategory = {
        id: category.id,
        tempId: tempId, // 临时ID，用于映射关系
        name: category.name,
        parentId,
        level,
        order: index,
        enabled: category.enabled !== false
      }
      result.push(flatCategory)
      
      // 递归处理子分类
      if (category.children && category.children.length > 0) {
        const childCategories = flattenCategories(category.children, category.id || tempId, level + 1)
        result.push(...childCategories)
      }
    })
    
    return result
  }
  
  // 将扁平分类结构转换为树形结构
  function buildCategoryTree(flatCategories: any[]): any[] {
    const categoryMap = new Map()
    const rootCategories: any[] = []
    
    // 创建分类映射
    flatCategories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: []
      })
    })
    
    // 构建树形结构
    flatCategories.forEach(category => {
      const categoryNode = categoryMap.get(category.id)
      
      if (category.parentId && categoryMap.has(category.parentId)) {
        // 有父分类，添加到父分类的children中
        const parent = categoryMap.get(category.parentId)
        parent.children.push(categoryNode)
      } else {
        // 没有父分类，是根分类
        rootCategories.push(categoryNode)
      }
    })
    
    // 按order排序
    const sortCategories = (categories: any[]) => {
      categories.sort((a, b) => (a.order || 0) - (b.order || 0))
      categories.forEach(category => {
        if (category.children.length > 0) {
          sortCategories(category.children)
        }
      })
    }
    
    sortCategories(rootCategories)
    return rootCategories
  }

  async function handleSingleDelete(rid: string) {
    if (!currentDir) return
    if (!can("delete")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权删除记录" : "Current role has no permission to delete record", 
        variant: "destructive" 
      })
      return
    }

    try {
      const response = await api.records.deleteRecord(currentDir.id, rid)
      
      if (response.success) {
        // 重新获取记录数据
        await fetchRecords(currentDir.id)
        
        toast({
          description: locale === "zh" ? "记录删除成功" : "Record deleted successfully",
        })
      }
    } catch (error) {
      console.error("删除记录失败:", error)
      toast({
        description: locale === "zh" ? "删除记录失败" : "Failed to delete record",
        variant: "destructive",
      })
    }
  }

  async function handleBulkDelete() {
    if (!currentDir) return
    if (!can("bulkDelete")) {
      toast({ 
        description: locale === "zh" ? "当前角色无权批量删除" : "Current role has no permission to bulk delete", 
        variant: "destructive" 
      })
      return
    }
    if (selectedIds.length === 0) return

    // 确认删除
    const confirmMessage = locale === "zh" 
      ? `确定要删除选中的 ${selectedIds.length} 条记录吗？此操作不可撤销。`
      : `Are you sure you want to delete ${selectedIds.length} selected records? This action cannot be undone.`
    
    if (!confirm(confirmMessage)) return

    try {
      const response = await api.records.bulkDeleteRecords(currentDir.id, selectedIds)
      
      if (response.success && response.data) {
        const { deletedCount, failedCount } = response.data
        
        // 重新获取记录数据
        await fetchRecords(currentDir.id)
        
        // 清空选择
        setSelectedIds([])
        
        // 显示结果消息
        if (failedCount === 0) {
          toast({
            description: locale === "zh" 
              ? `成功删除 ${deletedCount} 条记录` 
              : `Successfully deleted ${deletedCount} records`,
          })
        } else {
          toast({
            description: locale === "zh" 
              ? `删除了 ${deletedCount} 条记录，${failedCount} 条删除失败` 
              : `Deleted ${deletedCount} records, ${failedCount} failed`,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("批量删除记录失败:", error)
      toast({
        description: locale === "zh" ? "批量删除记录失败" : "Failed to bulk delete records",
        variant: "destructive",
      })
    }
  }



  return {
    // 数据状态
    app: application ? {
      id: application.id,
      name: application.name,
      desc: application.description,
      modules: apiModules,
    } : null,
    modules: apiModules,
    currentModule,
    currentDir,
    records: currentDir ? (recordsData[currentDir.id] || []) : [],
    
    // 选择状态
    moduleId,
    setModuleId,
    dirId,
    setDirId,
    
    // 过滤和标签页
    filters,
    setFilters,
    tab,
    setTab,
    selectedIds,
    setSelectedIds,
    
    // 抽屉状态
    drawer,
    setDrawer,
    
    // 对话框状态
    openAddModule,
    setOpenAddModule,
    openAddDir,
    setOpenAddDir,
    openAddField,
    setOpenAddField,
    renameModuleOpen,
    setRenameModuleOpen,
    renameModuleName,
    setRenameModuleName,
    renameDirOpen,
    setRenameDirOpen,
    renameDirName,
    setRenameDirName,
    renameDirTargetId,
    setRenameDirTargetId,
    openCategory,
    setOpenCategory,
    openCategorySelection,
    setOpenCategorySelection,
    
    // 加载状态
    isLoading,
    error,
    
    // 刷新方法
    refresh: fetchModules,

    // 添加缺失的方法
    persist,
    saveRecord,
    addRecord,
    openDrawer,
    closeDrawer,
    quickOpenAddField,
    handleCreateModuleFromDialog,
    handleCreateDirectoryFromDialog,
    openRenameModule,
    handleRenameModule,
    renameDir,
    handleRenameDir,
    deleteDir,
    handleSaveCategories,
    handleSingleDelete,
    handleBulkDelete,
    createRecordWithCategory,
  }
}
