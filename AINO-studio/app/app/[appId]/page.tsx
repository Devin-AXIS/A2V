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

type SettingsSection = "personal" | "team" | "usage" | "api-keys" | "notifications" | "settings"

export default function BuilderPage() {
  const router = useRouter()
  const params = useParams<{ appId: string }>()
  const { t, locale, toggleLocale } = useLocale()
  const { toast } = useToast()
  const { role, setRole, can } = usePermissions()

  const c = useApiBuilderController({ appId: params.appId, can, toast })
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>("team")
  const [showModuleManagement, setShowModuleManagement] = useState(false)
  const [selectedModuleCategory, setSelectedModuleCategory] = useState<"internal" | "thirdparty" | "public">("internal")

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
      ;(fld as any).relation = {
        targetDirId: draft.relationTargetId || null,
        mode: draft.type === "relation_one" ? "one" : "many",
        ...(draft.relationDisplayFieldKey ? { displayFieldKey: draft.relationDisplayFieldKey } : {}),
      }
      ;(fld as any).relationBidirectional = draft.relationBidirectional || false
      ;(fld as any).relationAllowDuplicate = draft.relationAllowDuplicate || false
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
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedModuleCategory === "internal"
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {locale === "zh" ? "内部模块" : "Internal Modules"}
                </button>
                <button
                  onClick={() => setSelectedModuleCategory("thirdparty")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedModuleCategory === "thirdparty"
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {locale === "zh" ? "第三方模块" : "Third-party Modules"}
                </button>
                <button
                  onClick={() => setSelectedModuleCategory("public")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedModuleCategory === "public"
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
                    {selectedModuleCategory === "internal" ? (c.app?.modules || []).length : 0}
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
                    {locale === "zh" ? "+ 安装插件" : "+ Install Plugin"}
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
                            <button className="flex-1 text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors font-medium">
                              {locale === "zh" ? "配置" : "Configure"}
                            </button>
                            <button className="flex-1 text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium">
                              {locale === "zh" ? "卸载" : "Uninstall"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {((selectedModuleCategory === "internal" && (c.app?.modules || []).length === 0) ||
                  selectedModuleCategory === "thirdparty" ||
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
                title: "配置三级分类",
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
              }
            : {
                title: "Configure 3-level Categories",
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
          { key: "ecom", label: t("module_ecom") },
          { key: "edu", label: t("module_edu") },
          { key: "content", label: t("module_content") },
          { key: "project", label: t("module_project") },
          { key: "custom", label: t("module_custom") },
        ]}
        defaultOptionKey="custom"
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
        title={locale === "zh" ? "选择记录分类" : "Select Record Category"}
      />
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
