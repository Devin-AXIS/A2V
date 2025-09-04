"use client"

import { useEffect, useMemo, useState } from "react"
import {
  getStore,
  saveStore,
  ensureDemoApp,
  type AppModel,
  type ModuleModel,
  type DirectoryModel,
  createDefaultRecord,
  dirTemplates,
  builtinModules,
} from "@/lib/store"
import { useLocale } from "@/hooks/use-locale"

type DrawerState = {
  open: boolean
  dirId: string | null
  recordId: string | null
  tab: string
}

export type Filters = { kw: string; status: string; category: string }

export function useBuilderController({
  appId,
  can,
  toast,
}: {
  appId: string
  can: (action: "view" | "edit" | "delete" | "bulkDelete" | "managePermissions") => boolean
  toast: (opts: { description: string; variant?: any }) => void
}) {
  const { t, locale } = useLocale()
  const [apps, setApps] = useState<AppModel[]>([])
  const [app, setApp] = useState<AppModel | null>(null)
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

  // init store
  useEffect(() => {
    const s = getStore()
    if (s.apps.length === 0) ensureDemoApp()
    setApps(getStore().apps)
  }, [])

  // load app
  useEffect(() => {
    const s = getStore()
    const a = s.apps.find((x) => x.id === appId) || null
    setApp(a)
    if (a && !moduleId) setModuleId(a.modules[0]?.id || null)
  }, [apps, appId])

  const currentModule = useMemo<ModuleModel | null>(() => {
    if (!app || !moduleId) return null
    return app.modules.find((m) => m.id === moduleId) || null
  }, [app, moduleId])

  // select default directory
  useEffect(() => {
    if (!currentModule) return
    if (!dirId) setDirId(currentModule.directories[0]?.id || null)
  }, [currentModule])

  const currentDir = useMemo<DirectoryModel | null>(() => {
    if (!app || !dirId) return null
    return app.modules.find((m) => m.id === moduleId)?.directories.find((d) => d.id === dirId) || null
  }, [app, moduleId, dirId])

  // reset selection when directory or filters change
  useEffect(() => {
    setSelectedIds([])
  }, [dirId, filters.kw, filters.status, filters.category])

  // basic error reload safety (as before)
  useEffect(() => {
    function onError(e: ErrorEvent) {
      const msg = String((e?.error as any)?.message || e.message || "")
      if (msg.includes("Loading chunk") || msg.includes("ChunkLoadError")) {
        window.location.reload()
      }
    }
    function onRejected(e: PromiseRejectionEvent) {
      const reason = e?.reason
      const msg = typeof reason === "string" ? reason : String(reason?.message || "")
      if (msg.includes("Loading chunk") || msg.includes("ChunkLoadError")) {
        window.location.reload()
      }
    }
    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onRejected)
    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onRejected)
    }
  }, [])

  function persist(next: AppModel) {
    const s = getStore()
    s.apps = s.apps.map((x) => (x.id === next.id ? next : x))
    saveStore(s)
    setApps([...s.apps])
    setApp(structuredClone(next))
  }

  function findDirMutable(app: AppModel, id: string): DirectoryModel {
    for (const m of app.modules) {
      const d = m.directories.find((x) => x.id === id)
      if (d) return d
    }
    throw new Error("dir not found")
  }

  function addRecord() {
    if (!app || !currentDir) return
    if (!can("edit")) {
      toast({ description: locale === "zh" ? "当前角色无权新增记录" : "No permission to add record", variant: "destructive" as any })
      return
    }
    
    // 检查是否有内容分类
    const hasCategories = currentDir.categories && currentDir.categories.length > 0
    
    if (hasCategories) {
      // 有分类时，先弹出分类选择对话框
      setOpenCategorySelection(true)
    } else {
      // 没有分类时，直接创建记录
      createRecordWithCategory("")
    }
  }

  function createRecordWithCategory(categoryPath: string) {
    if (!app || !currentDir) return
    const next = structuredClone(app)
    const realDir = findDirMutable(next, currentDir.id)
    const rec = createDefaultRecord(realDir)
    
    // 如果有分类路径，设置到记录中
    if (categoryPath) {
      // 查找分类字段
      const categoryField = realDir.fields.find(f => f.key === "category")
      if (categoryField) {
        ;(rec as any)[categoryField.key] = categoryPath
      }
    }
    
    realDir.records.push(rec)
    persist(next)
    openDrawer(realDir.id, rec.id)
  }

  function openDrawer(did: string, rid: string) {
    setDrawer({ open: true, dirId: did, recordId: rid, tab: "basic" })
  }
  function closeDrawer() {
    setDrawer((s) => ({ ...s, open: false }))
  }

  function quickOpenAddField() {
    if (!can("edit")) {
      toast({ description: "当前角色无权编辑字段", variant: "destructive" as any })
      return
    }
    setOpenAddField(true)
  }

  // Field draft saving logic stays in page (to avoid coupling UI strings here)

  function handleCreateModuleFromDialog(payload: { name: string; templateKey: keyof typeof builtinModules; icon?: string }) {
    if (!app) return
    if (!can("edit")) return
    const next = structuredClone(app)
    const factory = (builtinModules as any)[payload.templateKey] as () => ModuleModel
    const m = factory ? factory() : builtinModules.custom()
    if (payload.name.trim()) m.name = payload.name.trim()
    if (payload.icon) m.icon = payload.icon
    next.modules.push(m)
    persist(next)
    setModuleId(m.id)
    setDirId(m.directories[0]?.id || null)
    setOpenAddModule(false)
  }

  function handleCreateDirectoryFromDialog(payload: { name: string; templateKey: keyof typeof dirTemplates }) {
    if (!app || !currentModule) return
    if (!can("edit")) return
    const next = structuredClone(app)
    const mm = next.modules.find((x) => x.id === currentModule.id)!
    const factory = (dirTemplates as any)[payload.templateKey] as (name?: string) => DirectoryModel
    const d = factory
      ? factory(payload.name.trim() || undefined)
      : dirTemplates.custom(payload.name.trim() || undefined)
    mm.directories.push(d)
    persist(next)
    setDirId(d.id)
    setOpenAddDir(false)
  }

  function openRenameModule() {
    if (!currentModule || !app) return
    setRenameModuleName(currentModule.name)
    setRenameModuleOpen(true)
  }
  function handleRenameModule(name?: string) {
    if (!app || !currentModule) return
    if (!can("edit")) {
      toast({ description: locale === "zh" ? "当前角色无权重命名模块" : "Current role has no permission to rename module", variant: "destructive" as any })
      return
    }
    const newName = (name || renameModuleName).trim()
    if (!newName) return
    const next = structuredClone(app)
    const m = next.modules.find((x) => x.id === currentModule.id)!
    m.name = newName
    persist(next)
    setRenameModuleOpen(false)
  }

  function renameDir(d: DirectoryModel) {
    console.log('=== renameDir called ===', d.name)
    if (!can("edit")) {
      console.log('No edit permission')
      toast({ description: locale === "zh" ? "当前角色无权重命名目录" : "Current role has no permission to rename directory", variant: "destructive" as any })
      return
    }
    console.log('Setting up rename dialog for directory:', d.name, 'with ID:', d.id)
    setRenameDirTargetId(d.id)
    setRenameDirName(d.name)
    setRenameDirOpen(true)
    console.log('Rename dialog should now be open')
  }
  function handleRenameDir(name?: string) {
    console.log('=== handleRenameDir called ===', { name, renameDirName, renameDirTargetId })
    if (!app || !currentModule || !renameDirTargetId) {
      console.log('Missing required data:', { app: !!app, currentModule: !!currentModule, renameDirTargetId })
      return
    }
    const newName = (name || renameDirName).trim()
    if (!newName) {
      console.log('Empty name provided')
      return
    }
    console.log('Proceeding with rename to:', newName)
    const next = structuredClone(app)
    const mm = next.modules.find((x) => x.id === currentModule.id)!
    const dd = mm.directories.find((x) => x.id === renameDirTargetId)!
    dd.name = newName
    persist(next)
    setRenameDirOpen(false)
    console.log('Rename completed successfully')
  }

  function deleteDir(d: DirectoryModel) {
    console.log('=== deleteDir called ===', d.name)
    if (!app || !currentModule) {
      console.log('No app or currentModule')
      return
    }
    if (!can("delete")) {
      console.log('No delete permission')
      toast({ description: locale === "zh" ? "当前角色无权删除目录" : "Current role has no permission to delete directory", variant: "destructive" as any })
      return
    }
    
    // 检查目录是否有记录
    if (d.records && d.records.length > 0) {
      console.log('Directory has records:', d.records.length)
      toast({ 
        description: locale === "zh" 
          ? `无法删除目录「${d.name}」，请先删除目录中的 ${d.records.length} 条记录`
          : `Cannot delete directory "${d.name}", please delete ${d.records.length} records first`, 
        variant: "destructive" as any 
      })
      return
    }

    // 确认删除
    if (!confirm(locale === "zh" 
      ? `确定要删除目录「${d.name}」吗？此操作不可撤销。`
      : `Are you sure you want to delete directory "${d.name}"? This action cannot be undone.`
    )) {
      console.log('User cancelled deletion')
      return
    }

    console.log('Proceeding with deletion')
    const next = structuredClone(app)
    const mm = next.modules.find((x) => x.id === currentModule.id)!
    mm.directories = mm.directories.filter((dir) => dir.id !== d.id)
    
    // 如果删除的是当前选中的目录，切换到第一个目录
    if (d.id === dirId) {
      const firstDir = mm.directories[0]?.id || null
      setDirId(firstDir)
    }
    
    persist(next)
    toast({ 
      description: locale === "zh" 
        ? `目录「${d.name}」已删除`
        : `Directory "${d.name}" has been deleted`
    })
    console.log('Directory deleted successfully')
  }

  function handleSaveCategories(newCats: any[]) {
    if (!app || !currentDir) return
    const next = structuredClone(app)
    const d = findDirMutable(next, currentDir.id)
    d.categories = newCats as any
    persist(next)
    setOpenCategory(false)
  }

  function handleSingleDelete(rid: string) {
    if (!app || !currentDir) return
    if (!can("delete")) {
      toast({ description: t("noPermissionToDelete"), variant: "destructive" as any })
      return
    }
    if (!confirm(t("confirmDeleteRecord"))) return
    const next = structuredClone(app)
    const d = findDirMutable(next, currentDir.id)
    d.records = d.records.filter((x) => x.id !== rid)
    persist(next)
    setSelectedIds((ids) => ids.filter((id) => id !== rid))
  }
  function handleBulkDelete() {
    if (!app || !currentDir) return
    if (!can("bulkDelete")) {
      toast({ description: t("noPermissionToBulkDelete"), variant: "destructive" as any })
      return
    }
    if (selectedIds.length === 0) return
    if (!confirm(`${t("confirmBulkDeleteRecords")} ${selectedIds.length} ${t("records")}`)) return
    const next = structuredClone(app)
    const d = findDirMutable(next, currentDir.id)
    const setSel = new Set(selectedIds)
    d.records = d.records.filter((x) => !setSel.has(x.id))
    persist(next)
    setSelectedIds([])
    toast({ description: t("bulkDeleteCompleted") })
  }

  return {
    // state
    apps,
    app,
    moduleId,
    setModuleId,
    dirId,
    setDirId,
    currentModule,
    currentDir,

    filters,
    setFilters,
    tab,
    setTab,

    selectedIds,
    setSelectedIds,

    drawer,
    setDrawer,

    // dialogs state
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

    // actions
    persist,
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
