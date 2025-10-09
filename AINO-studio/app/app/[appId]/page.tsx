"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLocale } from "@/hooks/use-locale"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions"
import { useApplicationModules } from "@/hooks/use-application-modules"
import { getStore, saveStore, type FieldType } from "@/lib/store"

import { ModuleRail } from "@/components/builder/module-rail"
import { DirectoryList } from "@/components/builder/directory-list"
import { DirectoryShell } from "@/components/builder/directory-shell"
import { BuilderHeader } from "@/components/builder/builder-header"
import { BulkToolbar } from "@/components/builder/bulk-toolbar"
import { BackgroundLights } from "@/components/background-lights"
import { useApiBuilderController } from "@/hooks/use-api-builder-controller"
import { useModuleManagement } from "@/hooks/use-module-management"
import { useModuleConfigs } from "@/hooks/use-module-configs"
import { builtinModules } from "@/lib/store"
import { DataTable } from "./data-table"
import { FieldManager } from "./field-manager"

import { ApiRecordDrawer } from "./api-record-drawer"
import { RenameDialog } from "@/components/dialogs/rename-dialog"
import { CategoryDialog } from "@/components/dialogs/category-dialog"
import { CategorySelectionDialog } from "@/components/dialogs/category-selection-dialog"
import { AddEntityDialog } from "@/components/dialogs/add-entity-dialog"
import { AddFieldDialog, type FieldDraft } from "@/components/dialogs/add-field-dialog"
import { ListFilters } from "@/components/builder/list-filters"
import { SettingsSidebar } from "./settings-sidebar"
import { SettingsContent } from "./settings-content"
import { SimpleModuleDialog } from "@/components/dialogs/simple-module-dialog"
import { AIOpsDrawer } from "@/components/ai/ai-ops-drawer"

type SettingsSection = "personal" | "team" | "usage" | "api-keys" | "notifications" | "settings"

export default function BuilderPage() {
  const router = useRouter()
  const params = useParams<{ appId: string }>()
  const { t, locale, toggleLocale } = useLocale()
  const { toast } = useToast()
  const { role, setRole, can } = usePermissions()

  const c = useApiBuilderController({ appId: params.appId, can, toast })
  const { uninstallModule, updateModuleConfig } = useModuleManagement({ applicationId: params.appId })
  const { configs: savedModules, loading: savedModulesLoading, deleteConfig, refetch: refetchSavedModules } = useModuleConfigs()
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>("team")
  const [showModuleManagement, setShowModuleManagement] = useState(false)
  const [selectedModuleCategory, setSelectedModuleCategory] = useState<"internal" | "thirdparty" | "public">("internal")
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [uninstallDialogOpen, setUninstallDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [aiOpsOpen, setAiOpsOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null)
  const [installConfirmOpen, setInstallConfirmOpen] = useState(false)
  const [moduleToInstall, setModuleToInstall] = useState<any>(null)
  const [installModuleName, setInstallModuleName] = useState("")
  const [isInstalling, setIsInstalling] = useState(false)
  const [tableNameMappings, setTableNameMappings] = useState<Record<string, string>>({})

  const handleDeleteSavedModule = async (moduleId: string) => {
    setModuleToDelete(moduleId)
    setDeleteConfirmOpen(true)
  }

  // 获取模块模板中的表名称
  const getModuleTemplateTableNames = (moduleType: string) => {
    const template = builtinModules[moduleType as keyof typeof builtinModules]
    if (!template) return []

    const module = typeof template === 'function' ? template() : template
    return module.directories
      .filter(dir => dir.type === 'table')
      .map(dir => dir.name)
  }

  // 从已保存的第三方模块payload中获取表名称
  const getSavedModuleTableNames = (savedModule: any) => {
    try {
      const payloadObj = JSON.parse(savedModule?.payload || '{}')
      const dirs = Array.isArray(payloadObj?.directories) ? payloadObj.directories : []
      return dirs
        .filter((dir: any) => !dir.type || dir.type === 'table')
        .map((dir: any) => dir.name)
    } catch {
      return []
    }
  }

  // 初始化表名称映射
  const initializeTableNameMappings = (moduleType: string) => {
    const tableNames = getModuleTemplateTableNames(moduleType)
    const mappings: Record<string, string> = {}
    tableNames.forEach(tableName => {
      mappings[tableName] = tableName // 默认使用模板中的表名称
    })
    setTableNameMappings(mappings)
  }

  const confirmDeleteSavedModule = async () => {
    if (!moduleToDelete) return

    try {
      const success = await deleteConfig(moduleToDelete)
      if (success) {
        toast({
          title: "删除成功",
          description: "模块已删除"
        })
      } else {
        toast({
          title: "删除失败",
          description: "模块删除失败，请重试",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "模块删除失败，请重试",
        variant: "destructive"
      })
    } finally {
      setDeleteConfirmOpen(false)
      setModuleToDelete(null)
    }
  }

  const handleInstallModule = (module: any) => {
    setModuleToInstall(module)
    setInstallModuleName(module.title) // 默认使用原模块名
    // 优先根据第三方模块的payload解析表名
    const namesFromSaved = getSavedModuleTableNames(module)
    if (namesFromSaved.length > 0) {
      const mappings: Record<string, string> = {}
      namesFromSaved.forEach((n) => { mappings[n] = n })
      setTableNameMappings(mappings)
    } else {
      // 兜底：尝试用模板键初始化（若payload缺失或无法解析）
      try {
        const payload = JSON.parse(module.payload)
        const templateKey = payload?.moduleKey || payload?.type || "blank-template"
        initializeTableNameMappings(templateKey)
      } catch {
        initializeTableNameMappings("blank-template")
      }
    }
    setInstallConfirmOpen(true)
  }

  const confirmInstallModule = async () => {
    if (!moduleToInstall || !installModuleName.trim()) return

    setIsInstalling(true)

    try {
      const token = window.localStorage.getItem('aino_token');
      const publishedModuleRes = await fetch(`http://localhost:3007/api/module-configs/${moduleToInstall.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      const data = await publishedModuleRes.json().catch(() => ({}));
      const publishedModuleData = JSON.parse(data.data.payload);
      const { directories } = publishedModuleData;

      // 创建模块
      const installedModuleRes = await fetch(`http://localhost:3007/api/modules/simple/install?applicationId=${params.appId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          installConfig: { name: installModuleName },
          moduleKey: "blank-template",
          moduleType: 'local'
        })
      })
      const installedModuleData = await installedModuleRes.json().catch(() => ({}))
      if (!installedModuleData.success || installedModuleData.message !== "模块安装成功") {
        throw new Error("模块安装失败,请重试.");
      }
      const installedModuleId = installedModuleData.data.id;
      // const installedModuleId = "41b5379d-9f58-467f-88a9-db0f383a3640";

      // 生成新旧表名映射对象（模板表名 -> 新表名）
      const tableNameMappingObject: Record<string, string> = { ...tableNameMappings }

      // 创建表（使用映射后的名称）
      for (let i = 0; i < directories.length; i++) {
        const directory = directories[i];
        const mappedName = tableNameMappingObject[directory.name] || directory.name
        const tebleRes = await fetch(`http://localhost:3007/api/directories?applicationId=${params.appId}&moduleId=${installedModuleId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            config: {},
            name: mappedName,
            order: 0,
            supportsCategory: false,
            type: "table",
          })
        })
        const tebleData = await tebleRes.json().catch(() => ({}))

        for (let j = 0; j < directory.fields.length; j++) {
          // 创建字段
          const field = directory.fields[j];
          const fieldRes = await fetch(`http://localhost:3007/api/directory-defs/by-directory/${tebleData.data.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              applicationId: params.appId
            })
          })
          const fieldData = await fieldRes.json().catch(() => ({}))
          // 填充字段
          const setFieldParams = {
            directoryId: fieldData.data.id,
            key: crypto.randomUUID(),
            kind: "primitive",
            required: false,
            schema: { ...field },
            type: field.type,
            validators: {},
          }
          const fieldDefRes = await fetch(`http://localhost:3007/api/field-defs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(setFieldParams)
          })
        }
      }

      console.log("tableNameMappingObject", tableNameMappingObject)

      toast({
        title: "安装成功",
        description: `模块 ${installModuleName} 已安装`
      })

      // 安装完成后关闭弹窗
      setInstallConfirmOpen(false)
      setModuleToInstall(null)
      setInstallModuleName("")
      setTableNameMappings({})

      // 刷新模块列表以显示最新结果
      try {
        await c.refresh()
      } catch (e) {
        console.warn('刷新模块列表失败:', e)
      }
    } catch (error) {
      toast({
        title: "安装失败",
        description: "模块安装失败，请重试",
        variant: "destructive"
      })
    } finally {
      setIsInstalling(false)
    }
  }

  const handlePublicModule = async () => {
    const currentModule = { ...c.currentModule, type: "public" };
    try {
      const createResponse = await fetch(`http://localhost:3007/api/module-configs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: JSON.stringify(currentModule), title: currentModule.name, description: currentModule.type }),
      })
      const data = await createResponse.json().catch(() => ({}))
      toast({
        title: "发布成功",
        description: "模块已发布"
      });
      // 刷新已保存模块列表
      refetchSavedModules();
    } catch (e) {
      toast({
        title: "发布失败",
        description: e.message,
        variant: "destructive",
      });
    }
  }

  const typeNames: Record<FieldType, string> = useMemo(
    () => ({
      text: t("ft_text"),
      textarea: t("ft_textarea"),
      number: t("ft_number"),
      select: t("ft_select"),
      multiselect: t("ft_multiselect"),
      boolean: t("ft_boolean"),
      date: t("ft_date"),
      time: t("ft_time"),
      tags: t("ft_tags"),
      image: t("ft_image"),
      video: t("ft_video"),
      file: t("ft_file"),
      richtext: t("ft_richtext"),
      percent: t("ft_percent"),
      barcode: t("ft_barcode"),
      checkbox: t("ft_checkbox"),
      cascader: t("ft_cascader"),
      relation_one: t("ft_relation_one"),
      relation_many: t("ft_relation_many"),
      experience: t("ft_experience"),
    }),
    [locale],
  )

  const isSettingsMode = c.moduleId === "settings"
  const isModuleManagementMode = showModuleManagement

  const breadcrumb = isSettingsMode
    ? `${c.app?.name || (locale === "zh" ? "应用" : "App")} / ${locale === "zh" ? "设置" : "Settings"}`
    : isModuleManagementMode
      ? `${c.app?.name || (locale === "zh" ? "应用" : "App")} / ${locale === "zh" ? "模块管理" : "Module Management"}`
      : `${c.app?.name || (locale === "zh" ? "应用" : "App")} / ${c.currentModule?.name || "-"} / ${c.currentDir?.name || "-"}`

  function handleCreateFieldFromDraft(draft: FieldDraft) {
    const app = c.app
    const currentDir = c.currentDir
    if (!app || !currentDir) return
    const key = draft.key.trim()
    const label = draft.label.trim() || "新字段"
    if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,39}$/.test(key)) return
    if (currentDir.fields.some((f) => f.key === key)) return

    let def: any = undefined
    if (draft.type === "select") def = draft.defaultRaw || (draft.options?.[0] ?? "")
    if (draft.type === "multiselect")
      def = draft.defaultRaw
        ? draft.defaultRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : []
    if (draft.type === "boolean" || draft.type === "checkbox")
      def = draft.defaultRaw === "true" ? true : draft.defaultRaw === "false" ? false : undefined

    const fld: any = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      key,
      label,
      type: draft.type,
      required: draft.required,
      unique: draft.unique,
      locked: false,
      enabled: true,
      showInList: draft.showInList,
      showInForm: true,
      showInDetail: true,
      preset: draft.preset,
      categoryId: draft.categoryId,
      ...(draft.options ? { options: Array.from(new Set(draft.options.filter(Boolean))) } : {}),
      ...(def !== undefined ? { default: def } : {}),
      ...(draft.dateMode ? { dateMode: draft.dateMode } : {}),
      ...(draft.type === "cascader" ? { cascaderOptions: draft.cascaderOptions || [] } : {}),
      ...(draft.skillsConfig ? { skillsConfig: draft.skillsConfig } : {}),
      ...(draft.progressConfig ? { progressConfig: draft.progressConfig } : {}),
      ...(draft.customExperienceConfig ? { customExperienceConfig: draft.customExperienceConfig } : {}),
      ...(draft.certificateConfig ? { certificateConfig: draft.certificateConfig } : {}),
      ...(draft.identityVerificationConfig ? { identityVerificationConfig: draft.identityVerificationConfig } : {}),
      ...(draft.otherVerificationConfig ? { otherVerificationConfig: draft.otherVerificationConfig } : {}),
      ...(draft.imageConfig ? { imageConfig: draft.imageConfig } : {}),
      ...(draft.videoConfig ? { videoConfig: draft.videoConfig } : {}),
      ...(draft.booleanConfig ? { booleanConfig: draft.booleanConfig } : {}),
      ...(draft.multiselectConfig ? { multiselectConfig: draft.multiselectConfig } : {}),
    }
    if (draft.type === "relation_one" || draft.type === "relation_many") {
      ; (fld as any).relation = {
        targetDirId: draft.relationTargetId || null,
        mode: draft.type === "relation_one" ? "one" : "many",
        ...(draft.relationDisplayFieldKey ? { displayFieldKey: draft.relationDisplayFieldKey } : {}),
      }
        ; (fld as any).relationBidirectional = draft.relationBidirectional || false
        ; (fld as any).relationAllowDuplicate = draft.relationAllowDuplicate || false
    }
    const next = structuredClone(c.app)
    if (!next) return
    const d = findDir(next, c.currentDir!.id)
    d.fields.push(fld)
    c.persist(next)
    c.setOpenAddField(false)
    c.setTab("fields")
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-[#eef6ff] via-[#e9f3ff] to-[#e6fff5] relative">
      <BackgroundLights />

      <BuilderHeader
        appName={c.app?.name || "应用"}
        moduleName={isSettingsMode ? "设置" : c.currentModule?.name}
        dirName={isSettingsMode ? "" : c.currentDir?.name}
        role={role}
        onRole={setRole}
        locale={locale}
        onToggleLocale={toggleLocale}
        onSave={() => {
          const s = getStore()
          saveStore(s)
        }}
        onHome={() => router.push("/")}
        tSave={t("save")}
      />

      <div className="px-4 -mt-2 pointer-events-none" style={{ position: 'absolute', zIndex: 1000, top: 24, right: 340 }}>
        <div className="max-w-full flex items-center justify-end pointer-events-auto">
          <button
            onClick={() => router.push(`/app/${params.appId}/auth-test`)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors cursor-pointer"
            title="前往登录测试页"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            登录测试页
          </button>
        </div>
      </div>

      <div className="w-full p-4 grid grid-cols-1 md:grid-cols-[76px_260px_1fr] gap-4">
        <ModuleRail
          modules={c.app?.modules || []}
          selectedId={c.moduleId || ""}
          onSelect={(id) => {
            if (id === "settings") {
              c.setModuleId("settings")
              c.setDirId(null)
              setShowModuleManagement(false)
            } else {
              c.setModuleId(id)
              const firstDir = c.app?.modules?.find((m) => m.id === id)?.directories[0]?.id || null
              c.setDirId(firstDir)
              setShowModuleManagement(false)
            }
          }}
          onAdd={() => c.setOpenAddModule(true)}
          onSettings={() => {
            c.setModuleId("settings")
            c.setDirId(null)
            setShowModuleManagement(false)
          }}
          onModuleManagement={() => {
            setShowModuleManagement(true)
            c.setModuleId("")
            c.setDirId(null)
          }}
          canAdd={can("edit")}
        />

        {isSettingsMode ? (
          <>
            <SettingsSidebar activeSection={activeSettingsSection} onSectionChange={setActiveSettingsSection} />
            <SettingsContent activeSection={activeSettingsSection} />
          </>
        ) : isModuleManagementMode ? (
          <>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-semibold mb-4 text-gray-900">{locale === "zh" ? "模块分类" : "Module Categories"}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedModuleCategory("internal")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedModuleCategory === "internal"
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                    }`}
                >
                  {locale === "zh" ? "内部模块" : "Internal Modules"}
                </button>
                <button
                  onClick={() => setSelectedModuleCategory("thirdparty")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedModuleCategory === "thirdparty"
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                    }`}
                >
                  {locale === "zh" ? "第三方模块" : "Third-party Modules"}
                </button>
                <button
                  onClick={() => setSelectedModuleCategory("public")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedModuleCategory === "public"
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                    }`}
                >
                  {locale === "zh" ? "上传到公用模块" : "Upload to Public Modules"}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedModuleCategory === "internal" && (locale === "zh" ? "内部模块" : "Internal Modules")}
                    {selectedModuleCategory === "thirdparty" && (locale === "zh" ? "第三方模块" : "Third-party Modules")}
                    {selectedModuleCategory === "public" && (locale === "zh" ? "公用模块" : "Public Modules")}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {selectedModuleCategory === "internal" ? (c.app?.modules || []).length :
                      selectedModuleCategory === "thirdparty" ? savedModules.length : 0}
                  </span>
                  <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                    {locale === "zh" ? "探索 Marketplace" : "Explore Marketplace"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={locale === "zh" ? "搜索" : "Search"}
                      className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                    <svg
                      className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <button
                    onClick={() => c.setOpenAddModule(true)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    {locale === "zh" ? "+ 安装模块" : "+ Install Module"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedModuleCategory === "internal" &&
                  (c.app?.modules || []).map((module, index) => (
                    <div
                      key={module.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base">{module.name}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                  v1.0.{index + 1}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">工具</span>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 p-0.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                />
                              </svg>
                            </button>
                          </div>

                          <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                            {locale === "zh"
                              ? `${module.name}模块包含 ${module.directories?.length || 0} 个数据表，提供完整的${module.name}管理功能。`
                              : `${module.name} module contains ${module.directories?.length || 0} data tables, providing complete ${module.name} management functionality.`
                            }
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>system / {module.name.toLowerCase()}</span>
                            <a href="#" className="text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                              MARKETPLACE
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedModule(module)
                                setConfigDialogOpen(true)
                              }}
                              className="flex-1 text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors font-medium"
                            >
                              {locale === "zh" ? "配置" : "Configure"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedModule(module)
                                setUninstallDialogOpen(true)
                              }}
                              className="flex-1 text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
                            >
                              {locale === "zh" ? "卸载" : "Uninstall"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {selectedModuleCategory === "thirdparty" && savedModules.length > 0 && (
                  savedModules.map((module) => (
                    <div
                      key={module.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base">{module.title}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                  已保存
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                  {module.description || "模块"}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteSavedModule(module.id)}
                              className="text-gray-400 hover:text-red-600 p-0.5"
                              title="删除模块"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>

                          <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                            {locale === "zh"
                              ? `保存时间: ${new Date(module.createdAt).toLocaleString('zh-CN')}`
                              : `Saved: ${new Date(module.createdAt).toLocaleString()}`
                            }
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>ID: {module.id}</span>
                            <span className="text-blue-600">
                              {locale === "zh" ? "已发布模块" : "Published Module"}
                            </span>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                try {
                                  const moduleData = JSON.parse(module.payload)
                                  console.log('查看模块配置:', moduleData)
                                  toast({
                                    title: "模块信息",
                                    description: `模块: ${module.title}, 类型: ${module.description}`
                                  })
                                } catch (error) {
                                  toast({
                                    title: "查看失败",
                                    description: "模块数据格式错误",
                                    variant: "destructive"
                                  })
                                }
                              }}
                              className="flex-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors font-medium"
                            >
                              {locale === "zh" ? "查看" : "View"}
                            </button>
                            <button
                              onClick={() => handleInstallModule(module)}
                              className="flex-1 text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium"
                            >
                              {locale === "zh" ? "安装" : "Install"}
                            </button>
                            <button
                              onClick={() => handleDeleteSavedModule(module.id)}
                              className="flex-1 text-xs px-3 py-1.5 border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors font-medium"
                            >
                              {locale === "zh" ? "删除" : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {((selectedModuleCategory === "internal" && (c.app?.modules || []).length === 0) ||
                  (selectedModuleCategory === "thirdparty" && savedModules.length === 0) ||
                  selectedModuleCategory === "public") && (
                    <div className="col-span-2 text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedModuleCategory === "internal" && (locale === "zh" ? "暂无内部模块" : "No Internal Modules")}
                        {selectedModuleCategory === "thirdparty" && (locale === "zh" ? "暂无第三方模块" : "No Third-party Modules")}
                        {selectedModuleCategory === "public" && (locale === "zh" ? "暂无公用模块" : "No Public Modules")}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {selectedModuleCategory === "internal" && (locale === "zh" ? "开始创建您的第一个内部模块" : "Start creating your first internal module")}
                        {selectedModuleCategory === "thirdparty" && (locale === "zh" ? "从市场安装第三方模块" : "Install third-party modules from marketplace")}
                        {selectedModuleCategory === "public" && (locale === "zh" ? "上传模块到公用市场" : "Upload modules to public marketplace")}
                      </p>
                      <button
                        onClick={() => c.setOpenAddModule(true)}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                      >
                        {selectedModuleCategory === "internal" && (locale === "zh" ? "创建模块" : "Create Module")}
                        {selectedModuleCategory === "thirdparty" && (locale === "zh" ? "浏览模块市场" : "Browse Marketplace")}
                        {selectedModuleCategory === "public" && (locale === "zh" ? "上传模块" : "Upload Module")}
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </>
        ) : (
          <>
            <DirectoryList
              title={t("directories")}
              directories={c.currentModule?.directories || []}
              selectedId={c.dirId || ""}
              onSelect={(id) => c.setDirId(id)}
              onRename={(d) => c.renameDir(d)}
              onDelete={(d) => c.deleteDir(d)}
              onAdd={() => c.setOpenAddDir(true)}
              addText={t("addDir")}
              typeLabel={(d) => (d.type === "category" ? t("typeCategory") : t("typeTable"))}
              canEdit={can("edit")}
            />

            <DirectoryShell
              breadcrumb={breadcrumb}
              canEdit={can("edit")}
              tab={c.tab}
              onTabChange={(v) => c.setTab(v)}
              onOpenAddField={c.quickOpenAddField}
              onOpenCategories={() => c.setOpenCategory(true)}
              onOpenFieldSettings={() => c.setTab("fields")}
              handlePublicModule={handlePublicModule}
              filtersSlot={
                c.currentDir?.type === "table" ? (
                  <ListFilters
                    kw={c.filters.kw}
                    onKw={(v) => c.setFilters((s) => ({ ...s, kw: v }))}
                    category={c.filters.category}
                    onCategory={(v) => c.setFilters((s) => ({ ...s, category: v }))}
                    categoriesTree={c.currentDir?.categories || []}
                    status={c.filters.status}
                    onStatus={(v) => c.setFilters((s) => ({ ...s, status: v }))}
                    statuses={[
                      { label: t("all"), value: "all" },
                      { label: t("statusOn"), value: "上架" },
                      { label: t("statusOff"), value: "下架" },
                    ]}
                    addText={t("addRecord")}
                    onAdd={c.addRecord}
                    onAIOps={() => setAiOpsOpen(true)}
                    onCategoryManage={() => c.setOpenCategory(true)}
                    searchPlaceholder={t("searchPlaceholder")}
                    catLabel={t("filterByCategory")}
                    statusLabel={t("filterByStatus")}
                  />
                ) : null
              }
              bulkToolbarSlot={
                c.currentDir?.type === "table" ? (
                  <BulkToolbar
                    count={c.selectedIds.length}
                    canBulkDelete={can("bulkDelete")}
                    onBulkDelete={c.handleBulkDelete}
                    onClear={() => c.setSelectedIds([])}
                  />
                ) : null
              }
              listSlot={
                c.currentDir?.type === "table" ? (
                  <>
                    <div className="text-xs text-muted-foreground mb-2">{t("listHint")}</div>
                    <DataTable
                      app={c.app}
                      dir={c.currentDir}
                      filters={c.filters}
                      onOpen={(rid) => c.openDrawer(c.currentDir!.id, rid)}
                      onDelete={c.handleSingleDelete}
                      selectable={true}
                      selected={c.selectedIds}
                      onSelectedChange={c.setSelectedIds}
                      canDelete={can("delete")}
                      refreshToken={c.listRefreshToken}
                    />
                  </>
                ) : (
                  <div className="mt-4 text-sm text-muted-foreground">{t("emptyDirHint")}</div>
                )
              }
              fieldsSlot={
                c.currentDir ? (
                  <FieldManager
                    app={c.app}
                    dir={c.currentDir}
                    onChange={(dir) => {
                      if (!can("edit")) {
                        toast({ description: "当前角色无权编辑字段", variant: "destructive" as any })
                        return
                      }
                      const next = structuredClone(c.app)
                      if (!next) return
                      const d = findDir(next, dir.id)
                      Object.assign(d, dir)
                      c.persist(next)
                      if (c.moduleId && dir?.fields) {
                        c.updateDirectoryFields(c.moduleId, dir.id, dir.fields as any)
                      }
                    }}
                    onAddField={c.quickOpenAddField}
                  />
                ) : null
              }

            />
          </>
        )}
      </div>

      {!isSettingsMode && (
        <ApiRecordDrawer
          currentDir={c.currentDir}
          records={c.records}
          app={c.app}
          open={c.drawer.open}
          state={c.drawer}
          onClose={() => c.closeDrawer()}
          onSave={c.saveRecord}
        />
      )}

      {/* Dialogs */}
      <RenameDialog
        open={c.renameModuleOpen}
        onOpenChange={c.setRenameModuleOpen}
        title="模块名"
        label="名称"
        initialValue={c.renameModuleName}
        canEdit={can("edit")}
        onSave={(name) => c.handleRenameModule(name)}
      />
      <RenameDialog
        open={c.renameDirOpen}
        onOpenChange={c.setRenameDirOpen}
        title="目录名"
        label="名称"
        initialValue={c.renameDirName}
        canEdit={can("edit")}
        onSave={(name) => c.handleRenameDir(name)}
      />
      <CategoryDialog
        open={c.openCategory}
        onOpenChange={c.setOpenCategory}
        initialCats={(c.currentDir?.categories as any[]) || []}
        canEdit={can("edit")}
        onSave={c.handleSaveCategories}
        i18n={
          locale === "zh"
            ? {
              title: "配置三级内容分类",
              l1: "一级分类",
              l2: "二级分类",
              l3: "三级分类",
              selectL1: "选择一级分类",
              selectL2: "选择二级分类",
              selectL3: "选择三级分类（可选）",
              none: "未选择",
              add: "添加",
              save: "保存",
              cancel: "取消",
              preview: "预览：",
              delete: "删除",
              confirmDelete: "确认删除内容分类",
            }
            : {
              title: "Configure 3-level Content Categories",
              l1: "Level 1",
              l2: "Level 2",
              l3: "Level 3",
              selectL1: "Select Level 1",
              selectL2: "Select Level 2",
              selectL3: "Select Level 3 (optional)",
              none: "None",
              add: "Add",
              save: "Save",
              cancel: "Cancel",
              preview: "Preview:",
              delete: "Delete",
              confirmDelete: "Confirm delete content category",
            }
        }
      />
      <AddFieldDialog
        open={c.openAddField}
        onOpenChange={c.setOpenAddField}
        app={c.app}
        canEdit={can("edit")}
        existingKeys={c.currentDir?.fields.map((f) => f.key) || []}
        onSubmit={handleCreateFieldFromDraft}
        currentDir={c.currentDir}
        i18n={
          locale === "zh"
            ? {
              title: "添加字段",
              displayName: "显示名",
              displayNamePh: "请输入显示名",
              key: "内部名（唯一）",
              keyPh: "请输入内部名",
              keyInvalid: "需以字母或下划线开头，仅含字母数字下划线，≤40字符",
              keyDuplicate: "内部名已存在",
              dataType: "数据类型",
              required: "必填",
              requiredHint: "表单校验时要求必填",
              unique: "唯一",
              uniqueHint: "该字段值不可重复",
              showInList: "显示在列表",
              showInListHint: "控制列表是否展示",
              default: "默认值",
              none: "无",
              true: "是",
              false: "否",
              optionLabel: "选项",
              optionPlaceholder: "选项",
              addOption: "添加选项",
              optionsHint: "提示：默认值会根据当前选项生成；修改选项后请重新确认默认值。",
              relationTarget: "关联目标表",
              cancel: "取消",
              submit: "添加字段",
            }
            : {
              title: "Add Field",
              displayName: "Label",
              displayNamePh: "Enter label",
              key: "Key (unique)",
              keyPh: "Enter key",
              keyInvalid: "Must start with a letter/underscore, only letters/digits/underscore, ≤ 40 chars",
              keyDuplicate: "Key already exists",
              dataType: "Data Type",
              required: "Required",
              requiredHint: "Enforce required in forms",
              unique: "Unique",
              uniqueHint: "Value cannot be duplicated",
              showInList: "Show in List",
              showInListHint: "Control visibility in list",
              default: "Default",
              none: "None",
              true: "True",
              false: "False",
              optionLabel: "Options",
              optionPlaceholder: "Option",
              addOption: "Add option",
              optionsHint: "Tip: default value depends on options; re-verify after changes.",
              relationTarget: "Relation Target Table",
              cancel: "Cancel",
              submit: "Add Field",
            }
        }
        typeNames={typeNames}
      />
      <AddEntityDialog
        open={c.openAddModule}
        onOpenChange={c.setOpenAddModule}
        mode="module"
        title={t("addModule")}
        nameLabel={t("renameModule")}
        namePlaceholder={t("renameModule")}
        submitText={locale === "zh" ? "创建模块" : "Create Module"}
        cancelText={locale === "zh" ? "取消" : "Cancel"}
        templateLabel={locale === "zh" ? "选择模块模板" : "Choose Module Template"}
        showIconUpload={true}
        iconLabel={locale === "zh" ? "模块图标" : "Module Icon"}
        options={[
          { key: "blank-template", label: t("module_custom") },
          // { key: "ecom", label: t("module_ecom") },
          { key: "edu", label: t("module_edu") },
          { key: "rec", label: t("module_rec") },
          // { key: "content", label: t("module_content") },
          // { key: "project", label: t("module_project") },
        ]}
        defaultOptionKey="blank-template"
        onSubmit={(p) => c.handleCreateModuleFromDialog(p as any)}
      />
      <AddEntityDialog
        open={c.openAddDir}
        onOpenChange={c.setOpenAddDir}
        mode="directory"
        title={t("addDir")}
        nameLabel={t("renameDir")}
        namePlaceholder={t("newDirNamePlaceholder")}
        submitText={locale === "zh" ? "创建目录" : "Create Directory"}
        cancelText={locale === "zh" ? "取消" : "Cancel"}
        templateLabel={t("chooseTableTpl")}
        options={[
          { key: "custom", label: locale === "zh" ? "自定义表" : "Custom Table" },
          { key: "ecom-product", label: locale === "zh" ? "商品管理（电商）" : "Product Management (E-commerce)" },

          { key: "ecom-order", label: locale === "zh" ? "订单管理（电商）" : "Order Management (E-commerce)" },
          { key: "ecom-logistics", label: locale === "zh" ? "物流管理（电商）" : "Logistics Management (E-commerce)" },
          { key: "edu-teacher", label: locale === "zh" ? "老师表（教育）" : "Teacher Table (Education)" },
          { key: "common-people", label: locale === "zh" ? "人员表（通用）" : "People Table (General)" },
          { key: "dict-brand", label: locale === "zh" ? "品牌字典（通用）" : "Brand Dictionary (General)" },
        ]}
        defaultOptionKey="custom"
        onSubmit={(p) => c.handleCreateDirectoryFromDialog(p as any)}
      />

      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        open={c.openCategorySelection}
        onOpenChange={c.setOpenCategorySelection}
        categories={c.currentDir?.categories || []}
        onConfirm={(categoryPath) => c.createRecordWithCategory(categoryPath)}
        title={locale === "zh" ? "选择内容分类" : "Select Content Category"}
      />

      <AIOpsDrawer
        open={aiOpsOpen}
        onOpenChange={setAiOpsOpen}
        appId={String(params.appId)}
        lang={locale === "zh" ? "zh" : "en"}
        dirId={c.currentDir?.id}
        dirName={c.currentDir?.name}
        dirFields={c.currentDir?.fields as any}
      />

      {/* Simple Module Dialogs */}
      <SimpleModuleDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        module={selectedModule}
        type="config"
        onConfirm={async (config) => {
          try {
            const { __moduleName, __icon, ...rest } = config || {}
            if (selectedModule) {
              await updateModuleConfig(selectedModule.moduleKey || selectedModule.key || selectedModule.name, {
                ...rest,
                moduleName: typeof __moduleName === 'string' && __moduleName.trim() ? __moduleName.trim() : undefined,
                icon: typeof __icon === 'string' && __icon ? __icon : undefined,
              })
            }
            // 刷新模块列表展示最新名称与图标
            try { // @ts-ignore: c.refresh 由页面控制器提供
              await c.refresh?.()
            } catch { }
            toast({ description: locale === "zh" ? "配置已保存" : "Configuration saved" })
          } catch (e) {
            console.error('配置保存失败:', e)
            toast({ description: locale === "zh" ? "配置保存失败" : "Save failed", variant: 'destructive' })
          }
        }}
      />

      <SimpleModuleDialog
        open={uninstallDialogOpen}
        onOpenChange={setUninstallDialogOpen}
        module={selectedModule}
        type="uninstall"
        onConfirm={async () => {
          if (selectedModule) {
            try {
              // 调用真正的卸载API（优先使用模块ID，避免同名误删）
              await uninstallModule(selectedModule.id || selectedModule.moduleKey || selectedModule.key || selectedModule.name, false)
              toast({
                title: locale === "zh" ? "卸载成功" : "Uninstall Success",
                description: locale === "zh" ? "模块已卸载" : "Module uninstalled"
              })
              setUninstallDialogOpen(false)
              setSelectedModule(null)

              // 卸载完成后刷新模块列表
              try {
                await c.refresh()
              } catch (e) {
                console.warn('刷新模块列表失败:', e)
              }
            } catch (error) {
              console.error('卸载模块失败:', error)
              toast({
                title: locale === "zh" ? "卸载失败" : "Uninstall Failed",
                description: locale === "zh" ? "模块卸载失败，请重试" : "Module uninstall failed, please try again",
                variant: "destructive"
              })
            }
          }
        }}
      />

      {/* 删除确认弹窗 */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === "zh" ? "确认删除" : "Confirm Delete"}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {locale === "zh"
                ? "您确定要删除这个已保存的模块吗？此操作无法撤销。"
                : "Are you sure you want to delete this saved module? This action cannot be undone."
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setModuleToDelete(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {locale === "zh" ? "取消" : "Cancel"}
              </button>
              <button
                onClick={confirmDeleteSavedModule}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {locale === "zh" ? "删除" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 安装确认弹窗 */}
      {installConfirmOpen && moduleToInstall && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === "zh" ? "确认安装模块" : "Confirm Install Module"}
              </h3>
            </div>

            {/* 模块信息 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{moduleToInstall.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {moduleToInstall.description || "模块描述"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>ID: {moduleToInstall.id}</span>
                    <span>•</span>
                    <span>
                      {locale === "zh"
                        ? `保存时间: ${new Date(moduleToInstall.createdAt).toLocaleString('zh-CN')}`
                        : `Saved: ${new Date(moduleToInstall.createdAt).toLocaleString()}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              {locale === "zh"
                ? "您确定要安装这个模块吗？安装后该模块将添加到您的应用中。"
                : "Are you sure you want to install this module? It will be added to your application after installation."
              }
            </p>

            {/* 模块名输入框 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === "zh" ? "模块名称" : "Module Name"}
              </label>
              <input
                type="text"
                value={installModuleName}
                onChange={(e) => setInstallModuleName(e.target.value)}
                placeholder={locale === "zh" ? "请输入模块名称" : "Enter module name"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isInstalling}
              />
            </div>

            {/* 表名称映射输入 */}
            {Object.keys(tableNameMappings).length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === "zh" ? "表名称映射（可修改）" : "Table Name Mapping (editable)"}
                </label>
                <div className="space-y-3 max-h-60 overflow-auto pr-1">
                  {Object.entries(tableNameMappings).map(([templateName, mappedName]) => (
                    <div key={templateName} className="flex items-center gap-3">
                      <div className="text-xs text-gray-500 min-w-[140px] truncate" title={templateName}>
                        {templateName}
                      </div>
                      <span className="text-gray-400">→</span>
                      <input
                        type="text"
                        value={mappedName}
                        onChange={(e) => setTableNameMappings((prev) => ({ ...prev, [templateName]: e.target.value }))}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder={templateName}
                        disabled={isInstalling}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setInstallConfirmOpen(false)
                  setModuleToInstall(null)
                  setInstallModuleName("")
                  setTableNameMappings({})
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={isInstalling}
              >
                {locale === "zh" ? "取消" : "Cancel"}
              </button>
              <button
                onClick={confirmInstallModule}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={isInstalling || !installModuleName.trim()}
              >
                {isInstalling && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isInstalling
                  ? (locale === "zh" ? "安装中..." : "Installing...")
                  : (locale === "zh" ? "确认安装" : "Confirm Install")
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

/* ---------- helpers ---------- */

import type { AppModel, DirectoryModel } from "@/lib/store"
function findDir(app: AppModel, id: string): DirectoryModel {
  for (const m of app.modules) {
    const d = m.directories.find((x) => x.id === id)
    if (d) return d
  }
  throw new Error("dir not found")
}

function flattenCategories(cats: any[] = [], locale: string = "zh") {
  const out: Array<{ value: string; label: string }> = [{ value: "all", label: locale === "zh" ? "全部" : "All" }]
  const walk = (list: any[], trail: string[]) => {
    list.forEach((n) => {
      const lbl = [...trail, n.name].join(" / ")
      out.push({ value: n.name, label: lbl })
      if (n.children?.length) walk(n.children, [...trail, n.name])
    })
  }
  walk(cats, [])
  return out
}
