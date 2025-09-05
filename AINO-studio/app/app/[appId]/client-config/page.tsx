"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/hooks/use-locale"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/components/ui/use-mobile"
import { GripVertical, Trash2, Plus, Database, List as ListIcon, ChevronDown, ChevronRight, Search } from "lucide-react"
import dynamic from "next/dynamic"
import type { editor } from "monaco-editor"
import { manifestSchema } from "./manifest-schema"
import { api } from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AIOpsDrawer } from "@/components/ai/ai-ops-drawer"

const Monaco = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false })

type BottomNavItem = { key: string; label: string; icon?: string; route: string }

type DraftManifest = {
  schemaVersion: string
  app: {
    appKey: string
    locale: string
    theme: string
    bottomNav: BottomNavItem[]
  }
}

export default function ClientConfigPage() {
  const params = useParams<{ appId: string }>()
  const router = useRouter()
  const { locale } = useLocale()
  const { toast } = useToast()
  const isMobileDefault = useIsMobile()

  const [device, setDevice] = useState<"pc" | "mobile">(isMobileDefault ? "mobile" : "pc")
  const [lang, setLang] = useState(locale === "zh" ? "zh" : "en")
  const [jsonText, setJsonText] = useState("")
  const [viewTab, setViewTab] = useState<"preview" | "code">("preview")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [previewId, setPreviewId] = useState<string>("")
  const [monacoMounted, setMonacoMounted] = useState(false)
  const monacoRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const [aiOpsOpen, setAiOpsOpen] = useState(false)

  const [draft, setDraft] = useState<any>({
    schemaVersion: "1.0",
    app: {
      appKey: params.appId,
      locale: lang === "zh" ? "zh-CN" : "en-US",
      theme: "default",
      bottomNav: [
        { key: "home", label: lang === "zh" ? "首页" : "Home", route: "/home" },
        { key: "me", label: lang === "zh" ? "我的" : "Me", route: "/profile" },
      ],
    },
    dataSources: {},
  })

  // 代码编辑范围
  const [codeScope, setCodeScope] = useState<"manifest" | "app" | "page" | "dataSources">("manifest")
  const [activePage, setActivePage] = useState<string>("home")

  // 数据定义对话框与状态
  type TableItem = { id: string; name: string; moduleName: string }
  type RecordItem = { id: string; label: string; raw: any }
  const [dataDialogOpen, setDataDialogOpen] = useState(false)
  const [tables, setTables] = useState<TableItem[]>([])
  const [tablesLoading, setTablesLoading] = useState(false)
  const [tableSearch, setTableSearch] = useState("")
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null)
  const [recordsByDir, setRecordsByDir] = useState<Record<string, RecordItem[]>>({})
  const [recordsLoading, setRecordsLoading] = useState<Record<string, boolean>>({})

  const filteredTables = useMemo(() => {
    const kw = tableSearch.trim().toLowerCase()
    if (!kw) return tables
    return tables.filter(t =>
      t.name.toLowerCase().includes(kw) || t.moduleName.toLowerCase().includes(kw),
    )
  }, [tables, tableSearch])

  async function loadTables() {
    if (tablesLoading || tables.length > 0) return
    setTablesLoading(true)
    try {
      const appId = String(params.appId)
      const modsRes = await api.applications.getApplicationModules(appId)
      const mods = modsRes.success && modsRes.data ? modsRes.data.modules : []
      const dirLists = await Promise.all(
        mods.map(async (m: any) => {
          try {
            const dres = await api.directories.getDirectories({ applicationId: appId, moduleId: m.id })
            const list = dres.success && dres.data ? dres.data.directories || [] : []
            return list
              .filter((d: any) => d.type === "table")
              .map((d: any) => ({ id: d.id, name: d.name, moduleName: m.name })) as TableItem[]
          } catch {
            return [] as TableItem[]
          }
        }),
      )
      setTables(dirLists.flat())
    } finally {
      setTablesLoading(false)
    }
  }

  async function ensureRecords(dirId: string) {
    if (recordsLoading[dirId] || recordsByDir[dirId]) return
    setRecordsLoading((s) => ({ ...s, [dirId]: true }))
    try {
      const res = await api.records.listRecords(dirId, { page: 1, pageSize: 100 })
      const rows: any[] = res.success && res.data ? (Array.isArray(res.data) ? res.data : res.data.records || []) : []
      const items: RecordItem[] = rows.map((r: any) => ({ id: r.id, label: r.name || r.title || r.id, raw: r }))
      setRecordsByDir((s) => ({ ...s, [dirId]: items }))
    } catch {
      setRecordsByDir((s) => ({ ...s, [dirId]: [] }))
    } finally {
      setRecordsLoading((s) => ({ ...s, [dirId]: false }))
    }
  }

  function addTableDataSource(t: TableItem) {
    const key = `table_${t.id}`
    setDraft((s: any) => {
      const next = { ...s }
      next.dataSources = next.dataSources || {}
      next.dataSources[key] = { type: "table", tableId: t.id, tableName: t.name, moduleName: t.moduleName, label: `${t.moduleName}/${t.name}` }
      return next
    })
    setDataDialogOpen(false)
  }

  function addRecordDataSource(t: TableItem, rec: RecordItem) {
    const key = `record_${t.id}_${rec.id}`
    setDraft((s: any) => {
      const next = { ...s }
      next.dataSources = next.dataSources || {}
      next.dataSources[key] = { type: "record", tableId: t.id, tableName: t.name, moduleName: t.moduleName, recordId: rec.id, label: `${t.moduleName}/${t.name}#${rec.label}` }
      return next
    })
    setDataDialogOpen(false)
  }

  function removeDataSource(key: string) {
    setDraft((s: any) => {
      const next = { ...s }
      const ds = { ...(next.dataSources || {}) }
      delete ds[key]
      next.dataSources = ds
      return next
    })
  }

  useEffect(() => {
    try {
      let data: any
      if (codeScope === "manifest") data = draft
      else if (codeScope === "app") data = draft.app || {}
      else if (codeScope === "dataSources") data = draft.dataSources || {}
      else if (codeScope === "page") data = (draft.pages && draft.pages[activePage]) || {}
      else data = draft
      setJsonText(JSON.stringify(data, null, 2))
    } catch { setJsonText("{}") }
  }, [draft, codeScope, activePage])

  // 语言切换同步显示文案
  useEffect(() => {
    setDraft((s) => ({
      ...s,
      app: {
        ...s.app,
        locale: lang === "zh" ? "zh-CN" : "en-US",
        bottomNav: s.app.bottomNav.map((i) =>
          i.key === "home"
            ? { ...i, label: lang === "zh" ? "首页" : "Home" }
            : i.key === "me"
              ? { ...i, label: lang === "zh" ? "我的" : "Me" }
              : i,
        ),
      },
    }))
  }, [lang])

  async function openPreview() {
    try {
      const body = draft
      const res = await fetch("http://localhost:3001/api/preview-manifests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest: body }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success || !data?.data?.id) throw new Error(data?.message || "create failed")
      const id = data.data.id
      setPreviewId(id)
      const url = `http://localhost:3002/${lang}/preview/${id}?device=${device}&appId=${params.appId}`
      setPreviewUrl(url)
      setViewTab("preview")
      toast({ description: lang === "zh" ? "预览已生成" : "Preview created" })
    } catch (e: any) {
      toast({ description: e?.message || (lang === "zh" ? "创建预览失败" : "Failed to create preview"), variant: "destructive" as any })
      setViewTab("code")
    }
  }

  async function savePreview() {
    try {
      // 合并当前范围
      try {
        const parsed = JSON.parse(jsonText || "{}")
        setDraft((s: any) => {
          const next = { ...s }
          if (codeScope === "manifest") Object.assign(next, parsed)
          else if (codeScope === "app") next.app = parsed
          else if (codeScope === "dataSources") next.dataSources = parsed
          else if (codeScope === "page") {
            next.pages = next.pages || {}
            next.pages[activePage] = parsed
          }
          return next
        })
      } catch (e: any) {
        toast({ description: e?.message || (lang === "zh" ? "JSON 无法解析" : "JSON parse error"), variant: "destructive" as any })
        return
      }

      if (!previewId) {
        return openPreview()
      }
      const body = draft
      const res = await fetch(`http://localhost:3001/api/preview-manifests/${previewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest: body }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) throw new Error(data?.message || "save failed")
      toast({ description: lang === "zh" ? "已保存" : "Saved" })
    } catch (e: any) {
      toast({ description: e?.message || (lang === "zh" ? "保存失败" : "Save failed"), variant: "destructive" as any })
    }
  }

  function handleMonacoMount(editor: editor.IStandaloneCodeEditor, monaco: any) {
    monacoRef.current = editor
    try {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: true,
        schemas: [
          { uri: 'aino://manifest.schema.json', fileMatch: ['*'], schema: manifestSchema }
        ]
      })
    } catch { }
    setMonacoMounted(true)
  }

  function onSwitchTab(next: "preview" | "code") {
    if (next === "preview") {
      openPreview()
    } else {
      setViewTab("code")
    }
  }

  // 若默认就在“预览”页且还没有 URL，则自动生成一次预览
  useEffect(() => {
    if (viewTab === "preview" && !previewUrl) {
      openPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewTab])

  useEffect(() => {
    // 设备/语言变化时，如果已经有预览URL，刷新URL
    if (previewUrl) {
      try {
        const u = new URL(previewUrl)
        u.searchParams.set("device", device)
        const parts = u.pathname.split("/")
        // /{lang}/preview/{id}
        if (parts.length >= 3) {
          parts[1] = lang
          u.pathname = parts.join("/")
        }
        setPreviewUrl(u.toString())
      } catch { }
    }
  }, [device, lang])

  return (
    <main className="h-[100dvh] overflow-hidden bg-gradient-to-br from-white via-blue-50 to-green-50">
      <div className="max-w-[100rem] mx-auto p-3 h-full">
        <Card className="p-0 overflow-hidden h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={22} minSize={18} className="bg-white">
              <div className="h-full p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{lang === "zh" ? "结构" : "Structure"}</div>
                  <Tabs value="config" className="-mr-2">
                    <TabsList>
                      <TabsTrigger value="config">{lang === "zh" ? "配置" : "Config"}</TabsTrigger>
                      <TabsTrigger value="ai" disabled>{lang === "zh" ? "AI 对话（稍后）" : "AI (later)"}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="text-xs text-muted-foreground">{lang === "zh" ? "应用信息" : "App Info"}</div>
                <div className="space-y-2">
                  <Label>App Key</Label>
                  <Input value={draft.app.appKey} onChange={(e) => setDraft(s => ({ ...s, app: { ...s.app, appKey: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "zh" ? "主题" : "Theme"}</Label>
                  <Input value={draft.app.theme} onChange={(e) => setDraft(s => ({ ...s, app: { ...s.app, theme: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "zh" ? "底部导航（最多5项）" : "Bottom Nav (max 5)"}</Label>
                  <div className="space-y-2">
                    {draft.app.bottomNav.map((item, idx) => (
                      <div
                        key={item.key}
                        className="grid grid-cols-[20px_1fr_1fr_auto] items-center gap-2"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(idx))
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const from = Number(e.dataTransfer.getData("text/plain"))
                          const to = idx
                          if (Number.isNaN(from) || from === to) return
                          setDraft((s) => {
                            const next = [...s.app.bottomNav]
                            const [moved] = next.splice(from, 1)
                            next.splice(to, 0, moved)
                            return { ...s, app: { ...s.app, bottomNav: next } }
                          })
                        }}
                      >
                        <div className="cursor-grab active:cursor-grabbing text-muted-foreground flex items-center justify-center"><GripVertical className="w-4 h-4" /></div>
                        <Input value={item.label} onChange={(e) => setDraft(s => ({ ...s, app: { ...s.app, bottomNav: s.app.bottomNav.map((it, i) => i === idx ? { ...it, label: e.target.value } : it) } }))} placeholder={lang === "zh" ? "名称" : "Label"} />
                        <Input value={item.route} onChange={(e) => setDraft(s => ({ ...s, app: { ...s.app, bottomNav: s.app.bottomNav.map((it, i) => i === idx ? { ...it, route: e.target.value } : it) } }))} placeholder="/route" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDraft(s => ({ ...s, app: { ...s.app, bottomNav: s.app.bottomNav.filter((_, i) => i !== idx) } }))
                            // 自动保存
                            setTimeout(() => { savePreview() }, 0)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {draft.app.bottomNav.length < 5 && (
                      <Button variant="secondary" onClick={() => setDraft(s => {
                        const key = `k${Date.now()}`
                        const route = `/p-${key}`
                        const next = { ...s }
                        next.app = { ...next.app, bottomNav: [...next.app.bottomNav, { key, label: lang === "zh" ? "新项" : "Item", route }] }
                        // 导航新增时自动创建页面（若不存在）
                        const pageKey = (route || '').replace(/^\//, '') || `p-${key}`
                        next.pages = next.pages || {}
                        if (!next.pages[pageKey]) {
                          next.pages[pageKey] = { title: { zh: "新页面", en: "New Page" }, layout: "mobile", route, cards: [] }
                        }
                        return next
                      })}>
                        {lang === "zh" ? "添加项" : "Add Item"}
                      </Button>
                    )}
                  </div>
                </div>
                {/* 数据定义 */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{lang === "zh" ? "数据定义" : "Data Sources"}</div>
                    <Button variant="secondary" size="sm" onClick={() => setDataDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />{lang === "zh" ? "添加数据" : "Add Data"}
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-auto pr-1">
                    {Object.entries(draft.dataSources || {}).length === 0 && (
                      <div className="text-xs text-muted-foreground px-1">{lang === "zh" ? "尚未添加数据源" : "No data sources yet"}</div>
                    )}
                    {Object.entries(draft.dataSources || {}).map(([key, item]: any) => (
                      <div key={key} className="flex items-center gap-2 border rounded-md px-2 py-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Database className="w-3.5 h-3.5" />
                          <span className="font-medium">{item?.label || key}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{item?.type}</span>
                          <Button variant="outline" size="sm" onClick={() => removeDataSource(key)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 页面列表 */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{lang === "zh" ? "页面" : "Pages"}</div>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-auto pr-1">
                    {Object.keys(draft.pages || {}).map((k: string) => (
                      <Button key={k} variant={activePage === k ? "default" : "outline"} size="sm" className="w-full justify-start" onClick={() => setActivePage(k)}>
                        {k}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </ResizablePanel>
            {/* 添加数据弹窗 */}
            <Dialog open={dataDialogOpen} onOpenChange={setDataDialogOpen}>
              <DialogContent className="max-w-[880px] w-[95vw] max-h-[80vh] bg-white">
                <DialogHeader>
                  <DialogTitle>{lang === "zh" ? "选择数据源" : "Choose Data Source"}</DialogTitle>
                </DialogHeader>
                <div className="p-0">
                  <div className="p-3 text-xs text-muted-foreground">
                    {lang === "zh" ? "可选择整张表作为数据源，或展开表选择某条记录作为数据源。" : "Choose a whole table or expand to pick a specific record."}
                  </div>
                  <div className="px-3 pb-3 flex items-center gap-3">
                    <div className="relative">
                      <Input placeholder={lang === "zh" ? "搜索表/模块" : "Search tables/modules"} value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} className="pl-8 w-64" />
                      <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                    </div>
                    <Button variant="outline" onClick={loadTables} disabled={tablesLoading}>{lang === "zh" ? "刷新" : "Refresh"}</Button>
                  </div>
                  <div className="px-3 pb-3">
                    <ScrollArea className="h-[52vh] border rounded-lg">
                      <div className="divide-y">
                        {tablesLoading && (
                          <div className="p-4 text-sm text-muted-foreground">{lang === "zh" ? "加载中..." : "Loading..."}</div>
                        )}
                        {!tablesLoading && filteredTables.length === 0 && (
                          <div className="p-4 text-sm text-muted-foreground">{lang === "zh" ? "暂无数据表" : "No tables found"}</div>
                        )}
                        {filteredTables.map((t) => {
                          const expanded = expandedTableId === t.id
                          const recs = recordsByDir[t.id]
                          const loading = !!recordsLoading[t.id]
                          return (
                            <div key={t.id} className="p-3">
                              <div className="flex items-center gap-2">
                                <button className="p-1 rounded hover:bg-gray-100" onClick={async () => {
                                  const next = expanded ? null : t.id
                                  setExpandedTableId(next)
                                  if (next) await ensureRecords(t.id)
                                }} aria-label={expanded ? "collapse" : "expand"}>
                                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                <Database className="w-4 h-4 text-blue-600" />
                                <div className="font-medium">{t.name}</div>
                                <div className="text-xs text-muted-foreground">/ {t.moduleName}</div>
                                <div className="ml-auto flex items-center gap-2">
                                  <Button size="sm" onClick={() => addTableDataSource(t)}>{lang === "zh" ? "整表" : "Whole Table"}</Button>
                                  <Button variant="secondary" size="sm" onClick={async () => { setExpandedTableId(t.id); await ensureRecords(t.id) }}>{lang === "zh" ? "选择记录" : "Pick Record"}</Button>
                                </div>
                              </div>
                              {expanded && (
                                <div className="mt-2 ml-7">
                                  {loading && (
                                    <div className="text-xs text-muted-foreground p-2">{lang === "zh" ? "加载记录..." : "Loading records..."}</div>
                                  )}
                                  {!loading && (recs && recs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {recs.map((r) => (
                                        <div key={r.id} className="border rounded-md px-2 py-1.5 flex items-center gap-2">
                                          <ListIcon className="w-3.5 h-3.5 text-gray-500" />
                                          <div className="text-sm truncate" title={r.label}>{r.label}</div>
                                          <div className="ml-auto">
                                            <Button size="sm" onClick={() => addRecordDataSource(t, r)}>{lang === "zh" ? "选择" : "Select"}</Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-muted-foreground p-2">{lang === "zh" ? "暂无记录" : "No records"}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDataDialogOpen(false)}>{lang === "zh" ? "关闭" : "Close"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={35} className="bg-gray-50">
              <div className="h-full p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Tabs value={viewTab} onValueChange={(v) => onSwitchTab(v as any)}>
                    <TabsList>
                      <TabsTrigger value="preview">{lang === "zh" ? "预览" : "Preview"}</TabsTrigger>
                      <TabsTrigger value="code">{lang === "zh" ? "代码" : "Code"}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="flex items-center gap-2">
                    <Button variant="default" onClick={savePreview}>
                      {lang === "zh" ? "保存" : "Save"}
                    </Button>
                    <Button onClick={openPreview}>
                      {lang === "zh" ? (previewUrl ? "刷新预览" : "生成预览") : (previewUrl ? "Refresh" : "Generate")}
                    </Button>
                    <Button variant="outline" disabled title={lang === "zh" ? "PC 预览稍后提供" : "PC preview later"}>PC</Button>
                    <Button variant={device === "mobile" ? "default" : "outline"} onClick={() => setDevice("mobile")}>Mobile</Button>
                    <Button variant="outline" onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "中/EN" : "EN/中"}</Button>
                    <Button variant="secondary" onClick={() => setAiOpsOpen(true)}>
                      {lang === "zh" ? "AI运营" : "AI Ops"}
                    </Button>
                    <a href={`http://localhost:3001/docs/apps/${params.appId}/swagger`} target="_blank" rel="noreferrer">
                      <Button variant="secondary">API</Button>
                    </a>
                  </div>
                </div>

                {viewTab === "code" ? (
                  <div className="flex-1 min-h-[520px]">
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                      <ResizablePanel defaultSize={20} minSize={14} className="bg-white border rounded-xl overflow-auto">
                        <div className="p-2 text-xs text-muted-foreground">{lang === "zh" ? "文件" : "Files"}</div>
                        <div className="px-2 pb-2 space-y-1">
                          <Button
                            variant={codeScope === "manifest" ? "default" : "ghost"}
                            className="w-full justify-start text-xs"
                            onClick={() => setCodeScope("manifest")}
                          >manifest.json</Button>
                          <Button
                            variant={codeScope === "app" ? "default" : "ghost"}
                            className="w-full justify-start text-xs"
                            onClick={() => setCodeScope("app")}
                          >app.json</Button>
                          <div className="pt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{lang === "zh" ? "页面" : "Pages"}</div>
                          <div className="space-y-1">
                            {Object.keys(draft.pages || {}).map((k: string) => (
                              <Button
                                key={k}
                                variant={codeScope === "page" && activePage === k ? "default" : "ghost"}
                                className="w-full justify-start text-xs"
                                onClick={() => { setActivePage(k); setCodeScope("page") }}
                              >pages/{k}.json</Button>
                            ))}
                          </div>
                          <div className="pt-1 text-[10px] uppercase tracking-wide text-muted-foreground">data</div>
                          <Button
                            variant={codeScope === "dataSources" ? "default" : "ghost"}
                            className="w-full justify-start text-xs"
                            onClick={() => setCodeScope("dataSources")}
                          >data-sources.json</Button>
                        </div>
                      </ResizablePanel>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={80} minSize={40}>
                        <Monaco
                          height="100%"
                          defaultLanguage="json"
                          language="json"
                          theme="vs"
                          value={jsonText}
                          onChange={(v) => setJsonText(v || "")}
                          options={{
                            wordWrap: 'on',
                            minimap: { enabled: false },
                            formatOnPaste: true,
                            formatOnType: true,
                            tabSize: 2,
                          }}
                          onMount={handleMonacoMount}
                        />
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>
                ) : (
                  <div className="flex-1 border rounded-xl bg-white overflow-hidden">
                    {previewUrl ? (
                      <iframe src={previewUrl} className="w-full h-full" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        {lang === "zh" ? "点击上方预览按钮生成预览" : "Switch to Preview to generate"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Card>
      </div>
      <AIOpsDrawer open={aiOpsOpen} onOpenChange={setAiOpsOpen} appId={String(params.appId)} lang={lang as any} />
    </main>
  )
}
