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
import { GripVertical, Trash2, Plus, Database, List as ListIcon, ChevronDown, ChevronRight, Search, Settings, Link2, ArrowLeft, PlusCircle } from "lucide-react"
import dynamic from "next/dynamic"
import type { editor } from "monaco-editor"
import { manifestSchema } from "./manifest-schema"
import { api } from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
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
  const [authUIOpen, setAuthUIOpen] = useState(false)
  const [previewSource, setPreviewSource] = useState<"manifest" | "auth-login" | "home">("manifest")
  const [pageUIOpen, setPageUIOpen] = useState(false)
  const [activePageKey, setActivePageKey] = useState<string>("")

  // 登录配置草稿（仅 UI，不保存到后端）
  type ProviderItem = { key: string; label: string; enabled: boolean }
  const [authConfig, setAuthConfig] = useState<{ layoutVariant?: 'centered' | 'bottomDocked'; showBackground: boolean; backgroundImage?: string; showLogo: boolean; logoImage?: string; showIntro: boolean; introTitle?: { zh?: string; en?: string }; introText?: { zh?: string; en?: string }; titleColor?: string; bodyColor?: string; providers: ProviderItem[] }>({
    layoutVariant: 'centered',
    showBackground: true,
    backgroundImage: undefined,
    showLogo: true,
    logoImage: undefined,
    showIntro: true,
    introTitle: undefined,
    introText: undefined,
    providers: [
      { key: "phone", label: locale === "zh" ? "手机号登录" : "Phone", enabled: true },
      { key: "wechat", label: locale === "zh" ? "微信登录" : "WeChat", enabled: true },
      { key: "bytedance", label: locale === "zh" ? "字节登录" : "ByteDance", enabled: false },
      { key: "google", label: locale === "zh" ? "谷歌登录" : "Google", enabled: true },
      { key: "apple", label: locale === "zh" ? "苹果登录" : "Apple", enabled: true },
    ],
  })

  const [draft, setDraft] = useState<any>({
    schemaVersion: "1.0",
    app: {
      appKey: params.appId,
      locale: lang === "zh" ? "zh-CN" : "en-US",
      defaultLanguage: lang === "zh" ? "zh" : "en",
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

  // 路由配置对话框
  const [routeDialogOpen, setRouteDialogOpen] = useState(false)
  const [routeEditingIndex, setRouteEditingIndex] = useState<number | null>(null)
  const [routeTemp, setRouteTemp] = useState("")

  function openRouteDialog(idx: number) {
    const r = draft.app.bottomNav[idx]?.route || ""
    setRouteTemp(r)
    setRouteEditingIndex(idx)
    setRouteDialogOpen(true)
  }

  // 内容导航配置弹窗与临时状态
  const [contentNavOpen, setContentNavOpen] = useState(false)
  const [cnType, setCnType] = useState<'iconText' | 'text'>("iconText")
  const [cnLayout, setCnLayout] = useState<'grid-4' | 'grid-5' | 'scroll'>("grid-4")
  const [cnItems, setCnItems] = useState<any[]>([])

  function openContentNavDialog() {
    try {
      const k = activePageKey as string
      const cfg = (draft.pages && (draft as any).pages[k]?.contentNav) || {}
      setCnType((cfg as any).type || 'iconText')
      setCnLayout((cfg as any).layout || 'grid-4')
      setCnItems(Array.isArray((cfg as any).items) ? (cfg as any).items : [])
      setContentNavOpen(true)
    } catch {
      setCnType('iconText')
      setCnLayout('grid-4')
      setCnItems([])
      setContentNavOpen(true)
    }
  }

  function saveContentNavDialog() {
    const k = activePageKey as string
    setDraft((s: any) => {
      const next = { ...s }
      next.pages = next.pages || {}
      const p = next.pages[k] || {}
      p.contentNav = {
        type: cnType,
        layout: cnType === 'iconText' ? cnLayout : undefined,
        items: cnItems,
      }
      next.pages[k] = p
      return next
    })
    setContentNavOpen(false)
  }

  function saveRouteDialog() {
    const route = (routeTemp || "").trim()
    const ok = /^\/[A-Za-z0-9_\-/]*$/.test(route)
    if (!ok || route.length < 2) {
      toast({ description: lang === "zh" ? "路由格式不正确，应以 / 开头，可包含字母数字-_/" : "Invalid route. Must start with / and contain letters, numbers, - or _.", variant: "destructive" as any })
      return
    }
    setDraft((s: any) => {
      const next = { ...s }
      const list = [...next.app.bottomNav]
      if (routeEditingIndex != null && list[routeEditingIndex]) {
        list[routeEditingIndex] = { ...list[routeEditingIndex], route }
        next.app.bottomNav = list
        const pageKey = (route || '').replace(/^\//, '')
        next.pages = next.pages || {}
        if (!next.pages[pageKey]) {
          next.pages[pageKey] = { title: { zh: "新页面", en: "New Page" }, layout: "mobile", route, cards: [] }
        }
      }
      return next
    })
    setRouteDialogOpen(false)
  }

  async function ensureRecords(dirId: string) {
    if (recordsLoading[dirId] || recordsByDir[dirId]) return
    setRecordsLoading((s: any) => ({ ...s, [dirId]: true }))
    try {
      const res = await api.records.listRecords(dirId, { page: 1, pageSize: 100 })
      const rows: any[] = res.success && res.data ? (Array.isArray(res.data) ? res.data : res.data.records || []) : []
      const items: RecordItem[] = rows.map((r: any) => ({ id: r.id, label: r.name || r.title || r.id, raw: r }))
      setRecordsByDir((s: any) => ({ ...s, [dirId]: items }))
    } catch {
      setRecordsByDir((s: any) => ({ ...s, [dirId]: [] }))
    } finally {
      setRecordsLoading((s: any) => ({ ...s, [dirId]: false }))
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
    setDraft((s: any) => ({
      ...s,
      app: {
        ...s.app,
        locale: lang === "zh" ? "zh-CN" : "en-US",
        bottomNav: s.app.bottomNav.map((i: any) =>
          i.key === "home"
            ? { ...i, label: lang === "zh" ? "首页" : "Home" }
            : i.key === "me"
              ? { ...i, label: lang === "zh" ? "我的" : "Me" }
              : i,
        ),
      },
    }))
  }, [lang])

  // 语言切换时同步登录配置显示文案
  useEffect(() => {
    setAuthConfig((s: any) => ({
      ...s,
      providers: s.providers.map((p: any) => {
        if (p.key === "phone") return { ...p, label: lang === "zh" ? "手机号登录" : "Phone" }
        if (p.key === "wechat") return { ...p, label: lang === "zh" ? "微信登录" : "WeChat" }
        if (p.key === "bytedance") return { ...p, label: lang === "zh" ? "字节登录" : "ByteDance" }
        if (p.key === "google") return { ...p, label: lang === "zh" ? "谷歌登录" : "Google" }
        if (p.key === "apple") return { ...p, label: lang === "zh" ? "苹果登录" : "Apple" }
        return p
      }),
    }))
  }, [lang])

  // 简单图片压缩到移动端尺寸
  async function readAndResizeImage(file: File, targetW: number, targetH: number, quality = 0.8): Promise<string> {
    const img = document.createElement('img')
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    await new Promise((r) => { img.onload = r as any; img.src = dataUrl })
    const canvas = document.createElement('canvas')
    // 按目标框等比缩放
    const scale = Math.min(targetW / img.width, targetH / img.height)
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', quality)
  }

  // 弹窗状态与临时字段
  const [bgDialogOpen, setBgDialogOpen] = useState(false)
  const [logoDialogOpen, setLogoDialogOpen] = useState(false)
  const [introDialogOpen, setIntroDialogOpen] = useState(false)
  const [introTitleTmp, setIntroTitleTmp] = useState("")
  const [introTextTmp, setIntroTextTmp] = useState("")
  const [introTitleEnTmp, setIntroTitleEnTmp] = useState("")
  const [introTextEnTmp, setIntroTextEnTmp] = useState("")

  // 登录配置变化时，右侧预览实时刷新为携带配置的登录页
  useEffect(() => {
    if (!authUIOpen || previewSource !== "auth-login" || viewTab !== "preview") return
    try {
      const baseLang = (draft.app?.defaultLanguage || (lang === "zh" ? "zh" : "en")) as string
      const cfg = {
        layoutVariant: authConfig.layoutVariant || 'centered',
        // 固定图标样式
        showBackground: !!authConfig.showBackground,
        backgroundImage: authConfig.backgroundImage || undefined,
        showLogo: !!authConfig.showLogo,
        logoImage: authConfig.logoImage || undefined,
        showIntro: !!authConfig.showIntro,
        introTitle: authConfig.introTitle || undefined,
        introText: authConfig.introText || undefined,
        titleColor: authConfig.titleColor || undefined,
        bodyColor: authConfig.bodyColor || undefined,
        providers: (authConfig.providers || []).map((p: any) => ({ key: p.key, enabled: !!p.enabled })),
      }
      const u = new URL(`http://localhost:3002/${baseLang}/auth/login`)
      u.searchParams.set("authCfg", JSON.stringify(cfg))
      u.searchParams.set("v", String(Date.now()))
      setPreviewUrl(u.toString())
    } catch { }
  }, [authConfig, authUIOpen, previewSource, viewTab, draft.app?.defaultLanguage, lang])

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
      const dataParam = encodeURIComponent(JSON.stringify(draft?.dataSources || {}))
      const url = `http://localhost:3002/${lang}/preview/${id}?device=${device}&appId=${params.appId}&data=${dataParam}`
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
      // 更新预览URL上的 data 参数，保持与当前数据源一致
      try {
        const u = new URL(previewUrl || `http://localhost:3002/${lang}/preview/${previewId}?device=${device}&appId=${params.appId}`)
        u.searchParams.set("device", device)
        u.searchParams.set("appId", String(params.appId))
        const dataParam = JSON.stringify(draft?.dataSources || {})
        u.searchParams.set("data", encodeURIComponent(dataParam))
        setPreviewUrl(u.toString())
      } catch {
        const dataParam = encodeURIComponent(JSON.stringify(draft?.dataSources || {}))
        const fallback = `http://localhost:3002/${lang}/preview/${previewId}?device=${device}&appId=${params.appId}&data=${dataParam}`
        setPreviewUrl(fallback)
      }
      toast({ description: lang === "zh" ? "已保存并刷新预览" : "Saved and refreshed preview" })
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
      // 根据源决定预览 URL
      if (previewSource === "auth-login") {
        const baseLang = (draft.app?.defaultLanguage || (lang === "zh" ? "zh" : "en")) as string
        setPreviewUrl(`http://localhost:3002/${baseLang}/auth/login`)
        setViewTab("preview")
      } else if (previewSource === "home") {
        const baseLang = (draft.app?.defaultLanguage || (lang === "zh" ? "zh" : "en")) as string
        setPreviewUrl(`http://localhost:3002/${baseLang}/home`)
        setViewTab("preview")
      } else {
        openPreview()
      }
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
                {!authUIOpen && !pageUIOpen ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{lang === "zh" ? "配置/构建" : "Config/Build"}</div>
                      <Tabs value="config" className="-mr-2">
                        <TabsList>
                          <TabsTrigger value="config">{lang === "zh" ? "配置" : "Config"}</TabsTrigger>
                          <TabsTrigger value="ai" disabled>{lang === "zh" ? "AI 对话（稍后）" : "AI (later)"}</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    {/* 默认语言（保存为 App 默认语言） */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">{lang === "zh" ? "默认语言（应用）" : "Default Language (App)"}</div>
                      <div className="inline-flex items-center gap-2 bg-gray-50 rounded-md p-1 border">
                        <Button size="sm" variant={draft.app.defaultLanguage === "zh" ? "default" : "ghost"} onClick={() => { setDraft((s: any) => ({ ...s, app: { ...s.app, defaultLanguage: "zh", locale: "zh-CN" } })); }}>中文</Button>
                        <Button size="sm" variant={draft.app.defaultLanguage === "en" ? "default" : "ghost"} onClick={() => { setDraft((s: any) => ({ ...s, app: { ...s.app, defaultLanguage: "en", locale: "en-US" } })); }}>EN</Button>
                      </div>
                    </div>
                    {/* App Key 隐藏：无需显示 */}
                    {false && (
                      <div className="space-y-2">
                        <Label>{lang === "zh" ? "主题" : "Theme"}</Label>
                        <Input value={draft.app.theme} onChange={(e) => setDraft((s: any) => ({ ...s, app: { ...s.app, theme: e.target.value } }))} />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>{lang === "zh" ? "底部导航（最多5项）" : "Bottom Nav (max 5)"}</Label>
                      <div className="space-y-2">
                        {draft.app.bottomNav.map((item: any, idx: number) => (
                          <div
                            key={item.key}
                            className="grid grid-cols-[20px_1fr_auto_auto_auto] items-center gap-2"
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
                              setDraft((s: any) => {
                                const next = [...s.app.bottomNav]
                                const [moved] = next.splice(from, 1)
                                next.splice(to, 0, moved)
                                return { ...s, app: { ...s.app, bottomNav: next } }
                              })
                            }}
                          >
                            <div className="cursor-grab active:cursor-grabbing text-muted-foreground flex items-center justify-center"><GripVertical className="w-4 h-4" /></div>
                            <Input value={item.label} onChange={(e) => setDraft((s: any) => ({ ...s, app: { ...s.app, bottomNav: s.app.bottomNav.map((it: any, i: number) => i === idx ? { ...it, label: e.target.value } : it) } }))} placeholder={lang === "zh" ? "名称" : "Label"} />
                            <Button variant="outline" size="sm" onClick={() => openRouteDialog(idx)} title={item.route || "/route"}>
                              <Link2 className="w-4 h-4 mr-1" />{lang === "zh" ? "路由" : "Route"}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const pageKey = (item.route || '').replace(/^\//, '') || item.key
                                if (pageKey) {
                                  try {
                                    const r = item.route?.startsWith('/') ? item.route : `/${pageKey}`
                                    const u = new URL(`http://localhost:3002/${lang}${r}`)
                                    setPreviewUrl(u.toString())
                                  } catch {
                                    const r = item.route?.startsWith('/') ? item.route : `/${pageKey}`
                                    setPreviewUrl(`http://localhost:3002/${lang}${r}`)
                                  }
                                  setActivePageKey(pageKey)
                                  setPageUIOpen(true)
                                  setViewTab("preview")
                                } else {
                                  toast({ description: lang === "zh" ? "请先设置路由" : "Set route first" })
                                }
                              }}
                            >
                              <Settings className="w-4 h-4 mr-1" />{lang === "zh" ? "配置" : "Config"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDraft((s: any) => ({ ...s, app: { ...s.app, bottomNav: s.app.bottomNav.filter((_: any, i: number) => i !== idx) } }))
                                setTimeout(() => { savePreview() }, 0)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {draft.app.bottomNav.length < 5 && (
                          <Button variant="secondary" onClick={() => setDraft((s: any) => {
                            const key = `k${Date.now()}`
                            const route = `/p-${key}`
                            const next = { ...s }
                            next.app = { ...next.app, bottomNav: [...next.app.bottomNav, { key, label: lang === "zh" ? "新项" : "Item", route }] }
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
                    {/* 登录配置入口（排在数据定义之前） */}
                    <div className="pt-2">
                      <Button
                        className="w-full justify-center"
                        variant="secondary"
                        onClick={() => {
                          setAuthUIOpen(true)
                          // 右侧立即显示登录页预览
                          setPreviewSource("auth-login")
                          setViewTab("preview")
                          try {
                            const baseLang = (draft.app?.defaultLanguage || "zh") as string
                            const cfg = {
                              layoutVariant: authConfig.layoutVariant || 'centered',
                              showBackground: !!authConfig.showBackground,
                              backgroundImage: authConfig.backgroundImage || undefined,
                              showLogo: !!authConfig.showLogo,
                              logoImage: authConfig.logoImage || undefined,
                              showIntro: !!authConfig.showIntro,
                              introTitle: authConfig.introTitle || undefined,
                              introText: authConfig.introText || undefined,
                              titleColor: authConfig.titleColor || undefined,
                              bodyColor: authConfig.bodyColor || undefined,
                              providers: (authConfig.providers || []).map((p: any) => ({ key: p.key, enabled: !!p.enabled })),
                            }
                            const u = new URL(`http://localhost:3002/${baseLang}/auth/login`)
                            u.searchParams.set("authCfg", JSON.stringify(cfg))
                            u.searchParams.set("v", String(Date.now()))
                            setPreviewUrl(u.toString())
                          } catch { }
                        }}
                      >
                        {lang === "zh" ? "登录配置" : "Login Settings"}
                      </Button>
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
                  </>
                ) : pageUIOpen ? (
                  // 左侧：页面配置编辑视图
                  <div className="h-full p-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setPageUIOpen(false); setPreviewSource("home"); setViewTab("preview"); try { const baseLang = (draft.app?.defaultLanguage || "zh") as string; setPreviewUrl(`http://localhost:3002/${baseLang}`); } catch { } }}>
                        <ArrowLeft className="w-4 h-4 mr-1" />{lang === "zh" ? "返回" : "Back"}
                      </Button>
                      <div className="text-sm font-semibold">{lang === "zh" ? "页面配置" : "Page Settings"}</div>
                      {activePageKey && (<div className="text-xs text-muted-foreground">/pages/{activePageKey}.json</div>)}
                    </div>
                    {/* 页面名称 */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">{lang === "zh" ? "页面名称" : "Page Title"}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder={lang === "zh" ? "中文标题" : "Title ZH"} value={activePageKey && draft.pages?.[activePageKey]?.title?.zh || ""} onChange={(e) => setDraft((s: any) => { const k = activePageKey as string; const next = { ...s }; next.pages = next.pages || {}; const p = next.pages[k] || {}; p.title = { ...(p.title || {}), zh: e.target.value }; next.pages[k] = p; return next })} />
                        <Input placeholder={lang === "zh" ? "英文标题" : "Title EN"} value={activePageKey && draft.pages?.[activePageKey]?.title?.en || ""} onChange={(e) => setDraft((s: any) => { const k = activePageKey as string; const next = { ...s }; next.pages = next.pages || {}; const p = next.pages[k] || {}; p.title = { ...(p.title || {}), en: e.target.value }; next.pages[k] = p; return next })} />
                      </div>
                      <div className="text-[10px] text-muted-foreground">{lang === "zh" ? "保存后右侧预览页标题会跟随显示" : "Title applies to header after save"}</div>
                      {/* 将当前页面配置同步给运行端预览 */}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => {
                          try {
                            const k = activePageKey as string
                            const cfg = draft.pages?.[k] || {}
                            const u = new URL(String(previewUrl || `http://localhost:3002/${lang}/p/${k.replace(/^p-/, '')}`))
                            u.searchParams.set('pageCfg', JSON.stringify(cfg))
                            setPreviewUrl(u.toString())
                            setViewTab('preview')
                          } catch {}
                        }}>{lang === 'zh' ? '应用到预览' : 'Apply to Preview'}</Button>
                      </div>
                    </div>
                    {/* 开关项 */}
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center justify-between border rounded-md px-3 py-2">
                        <span>{lang === "zh" ? "开启 顶部栏" : "Show Header"}</span>
                        <Switch checked={!!(activePageKey && draft.pages?.[activePageKey]?.options?.showHeader !== false)} onCheckedChange={(v) => setDraft((s: any) => { const k = activePageKey as string; const next = { ...s }; next.pages = next.pages || {}; const p = next.pages[k] || {}; p.options = { ...(p.options || {}), showHeader: !!v }; next.pages[k] = p; return next })} />
                      </label>
                      <label className="flex items-center justify-between border rounded-md px-3 py-2">
                        <span>{lang === "zh" ? "开启 全局底部导航" : "Show Bottom Nav"}</span>
                        <Switch checked={!!(activePageKey && draft.pages?.[activePageKey]?.options?.showBottomNav !== false)} onCheckedChange={(v) => setDraft((s: any) => { const k = activePageKey as string; const next = { ...s }; next.pages = next.pages || {}; const p = next.pages[k] || {}; p.options = { ...(p.options || {}), showBottomNav: !!v }; next.pages[k] = p; return next })} />
                      </label>
                    </div>
                    {/* 内容导航配置入口 */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">{lang === "zh" ? "内容导航配置" : "Content Navigation"}</div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={openContentNavDialog}>{lang === "zh" ? "配置内容导航" : "Configure"}</Button>
                        {activePageKey && draft.pages?.[activePageKey]?.contentNav && (
                          <div className="text-[11px] text-muted-foreground">
                            {(draft.pages as any)[activePageKey]?.contentNav?.type === 'iconText' ? (lang === 'zh' ? '图+文' : 'Icon+Text') : (lang === 'zh' ? '文字' : 'Text')} · {(draft.pages as any)[activePageKey]?.contentNav?.layout || '-'} · {Array.isArray((draft.pages as any)[activePageKey]?.contentNav?.items) ? (draft.pages as any)[activePageKey]?.contentNav?.items.length : 0} {lang === 'zh' ? '项' : 'items'}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 主内容 / 其他卡片占位 */}
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">{lang === "zh" ? "主内容" : "Main Content"}</div>
                      <div className="border rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{lang === "zh" ? "卡片" : "Card"}</div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">{lang === "zh" ? "筛选" : "Filter"}</Button>
                            <Button size="sm" variant="outline">{lang === "zh" ? "配置" : "Config"}</Button>
                            <Button size="sm" variant="outline">{lang === "zh" ? "显示" : "Display"}</Button>
                            <Button size="sm" variant="outline">{lang === "zh" ? "内页" : "Detail"}</Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{lang === "zh" ? "其他卡片" : "Other Cards"}</div>
                      <div className="border rounded-xl p-3 opacity-90">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{lang === "zh" ? "卡片2" : "Card 2"}</div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">{lang === "zh" ? "配置" : "Config"}</Button>
                            <Button size="sm" variant="outline">{lang === "zh" ? "显示" : "Display"}</Button>
                            <Button size="sm" variant="outline">{lang === "zh" ? "内页" : "Detail"}</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 左侧：登录配置编辑视图
                  <div className="h-full p-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setAuthUIOpen(false); setPreviewSource("home"); setViewTab("preview"); try { const baseLang = (draft.app?.defaultLanguage || "zh") as string; setPreviewUrl(`http://localhost:3002/${baseLang}`); } catch { } }}>
                        <ArrowLeft className="w-4 h-4 mr-1" />{lang === "zh" ? "返回" : "Back"}
                      </Button>
                      <div className="text-sm font-semibold">{lang === "zh" ? "登录配置" : "Login Settings"}</div>
                    </div>
                    <div className="space-y-6">
                      {/* 布局模式 */}
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">{lang === "zh" ? "布局模式" : "Layout"}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant={authConfig.layoutVariant === 'centered' ? 'default' : 'outline'} onClick={() => setAuthConfig((s: any) => ({ ...s, layoutVariant: 'centered' }))}>{lang === "zh" ? "居中" : "Centered"}</Button>
                          <Button size="sm" variant={authConfig.layoutVariant === 'bottomDocked' ? 'default' : 'outline'} onClick={() => setAuthConfig((s: any) => ({ ...s, layoutVariant: 'bottomDocked' }))}>{lang === "zh" ? "底部承载" : "Bottom"}</Button>
                        </div>
                      </div>

                      {/* 第三方样式固定为图标，不提供切换 */}
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">{lang === "zh" ? "显示元素" : "Visibility"}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center justify-between border rounded-md px-3 py-2">
                            <span className="mr-2">{lang === "zh" ? "背景" : "Background"}</span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => setBgDialogOpen(true)} disabled={!authConfig.showBackground}>{lang === "zh" ? "上传" : "Upload"}</Button>
                              <Switch checked={authConfig.showBackground} onCheckedChange={(v) => setAuthConfig((s: any) => ({ ...s, showBackground: !!v }))} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between border rounded-md px-3 py-2">
                            <span className="mr-2">logo</span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => setLogoDialogOpen(true)} disabled={!authConfig.showLogo}>{lang === "zh" ? "上传" : "Upload"}</Button>
                              <Switch checked={authConfig.showLogo} onCheckedChange={(v) => setAuthConfig((s: any) => ({ ...s, showLogo: !!v }))} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between border rounded-md px-3 py-2 col-span-2">
                            <span className="mr-2">{lang === "zh" ? "介绍" : "Intro"}</span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => { setIntroTitleTmp((authConfig.introTitle?.zh || authConfig.introTitle?.en || "")); setIntroTextTmp((authConfig.introText?.zh || authConfig.introText?.en || "")); setIntroTitleEnTmp((authConfig.introTitle?.en || "")); setIntroTextEnTmp((authConfig.introText?.en || "")); setIntroDialogOpen(true) }} disabled={!authConfig.showIntro}>{lang === "zh" ? "编辑" : "Edit"}</Button>
                              <Switch checked={authConfig.showIntro} onCheckedChange={(v) => setAuthConfig((s: any) => ({ ...s, showIntro: !!v }))} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">{lang === "zh" ? "文本设置" : "Text Settings"}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>{lang === "zh" ? "标题颜色" : "Title Color"}</Label>
                            <Input type="color" value={authConfig.titleColor || "#111111"} onChange={(e) => setAuthConfig((s: any) => ({ ...s, titleColor: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label>{lang === "zh" ? "内容颜色" : "Body Color"}</Label>
                            <Input type="color" value={authConfig.bodyColor || "#6b7280"} onChange={(e) => setAuthConfig((s: any) => ({ ...s, bodyColor: e.target.value }))} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="text-xs text-muted-foreground">{lang === "zh" ? "登录方式" : "Login Methods"}</div>
                        <div className="space-y-2">
                          {authConfig.providers.map((p: any, idx: number) => (
                            <div key={p.key}
                              className="grid grid-cols-[20px_1fr_auto] items-center gap-2 border rounded-md px-2 py-2"
                              draggable={p.key !== "phone"}
                              onDragStart={(e) => { if (p.key === "phone") return; e.dataTransfer.setData("text/plain", String(idx)) }}
                              onDragOver={(e) => { if (p.key === "phone") return; e.preventDefault() }}
                              onDrop={(e) => {
                                if (p.key === "phone") return
                                e.preventDefault()
                                const from = Number(e.dataTransfer.getData("text/plain"))
                                const to = idx
                                if (Number.isNaN(from) || from === to || from === 0 || to === 0) return
                                setAuthConfig((s: any) => {
                                  const list = [...s.providers]
                                  const [m] = list.splice(from, 1)
                                  list.splice(to, 0, m)
                                  return { ...s, providers: list }
                                })
                              }}
                            >
                              <div className="cursor-grab active:cursor-grabbing text-muted-foreground flex items-center justify-center opacity-70"><GripVertical className="w-4 h-4" /></div>
                              <div className="font-medium text-sm">{p.label}</div>
                              <Switch checked={p.enabled} onCheckedChange={(v) => setAuthConfig((s: any) => ({ ...s, providers: s.providers.map((it: any, i: number) => i === idx ? { ...it, enabled: p.key === "phone" ? true : !!v } : it) }))} disabled={p.key === "phone"} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

            {/* 内容导航配置弹窗 */}
            <Dialog open={contentNavOpen} onOpenChange={setContentNavOpen}>
              <DialogContent className="max-w-[760px] w-[95vw] bg-white">
                <DialogHeader>
                  <DialogTitle>{lang === 'zh' ? '内容导航配置' : 'Content Navigation'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* 类型选择 */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">{lang === 'zh' ? '展示样式' : 'Display Type'}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={cnType === 'iconText' ? 'default' : 'outline'} onClick={() => setCnType('iconText')}>{lang === 'zh' ? '图+文' : 'Icon+Text'}</Button>
                      <Button size="sm" variant={cnType === 'text' ? 'default' : 'outline'} onClick={() => setCnType('text')}>{lang === 'zh' ? '文字' : 'Text'}</Button>
                    </div>
                  </div>
                  {/* 布局选择（仅图+文时显示） */}
                  {cnType === 'iconText' && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">{lang === 'zh' ? '排版' : 'Layout'}</div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant={cnLayout === 'grid-4' ? 'default' : 'outline'} onClick={() => setCnLayout('grid-4')}>{lang === 'zh' ? '每行4个' : '4 per row'}</Button>
                        <Button size="sm" variant={cnLayout === 'grid-5' ? 'default' : 'outline'} onClick={() => setCnLayout('grid-5')}>{lang === 'zh' ? '每行5个' : '5 per row'}</Button>
                        <Button size="sm" variant={cnLayout === 'scroll' ? 'default' : 'outline'} onClick={() => setCnLayout('scroll')}>{lang === 'zh' ? '横向滑动' : 'Horizontal scroll'}</Button>
                      </div>
                    </div>
                  )}
                  {/* 导航项列表 */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">{lang === 'zh' ? '导航项' : 'Items'}</div>
                    <div className="space-y-2">
                      {cnItems.map((it: any, idx: number) => (
                        <div
                          key={idx}
                          className={cnType === 'iconText' ? "grid grid-cols-[20px_56px_1fr_auto] items-center gap-2 border rounded-md px-2 py-2" : "grid grid-cols-[20px_1fr_auto] items-center gap-2 border rounded-md px-2 py-2"}
                          draggable
                          onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(idx)) }}
                          onDragOver={(e) => { e.preventDefault() }}
                          onDrop={(e) => {
                            e.preventDefault()
                            const from = Number(e.dataTransfer.getData('text/plain'))
                            const to = idx
                            if (Number.isNaN(from) || from === to) return
                            setCnItems((list: any[]) => {
                              const next = [...list]
                              const [m] = next.splice(from, 1)
                              next.splice(to, 0, m)
                              return next
                            })
                          }}
                        >
                          <div className="cursor-grab active:cursor-grabbing text-muted-foreground flex items-center justify-center opacity-70"><GripVertical className="w-4 h-4" /></div>
                          {cnType === 'iconText' && (
                            <div className="flex items-center gap-2">
                              {it.image ? (
                                <img src={it.image} alt="icon" className="w-12 h-12 rounded border object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded border bg-gray-50 text-[10px] flex items-center justify-center text-gray-400">img</div>
                              )}
                            </div>
                          )}
                          <Input placeholder={lang === 'zh' ? '标题(中文/英文皆可)' : 'Title'} value={it.title || ''} onChange={(e) => setCnItems((s: any[]) => s.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} />
                          <div className="flex items-center gap-2">
                            {cnType === 'iconText' && (
                              <input type="file" accept="image/*" onChange={async (e) => {
                                const f = e.target.files?.[0]
                                if (!f) return
                                const dataUrl = await readAndResizeImage(f, 256, 256, 0.9)
                                setCnItems((s: any[]) => s.map((x, i) => i === idx ? { ...x, image: dataUrl } : x))
                              }} />
                            )}
                            <Button size="icon" variant="ghost" onClick={() => setCnItems((s: any[]) => s.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setCnItems((s: any[]) => [...s, { title: '' }])}><Plus className="w-4 h-4 mr-1" />{lang === 'zh' ? '新增导航' : 'Add Item'}</Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setContentNavOpen(false)}>{lang === 'zh' ? '取消' : 'Cancel'}</Button>
                  <Button onClick={saveContentNavDialog}>{lang === 'zh' ? '保存' : 'Save'}</Button>
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
      {/* 背景上传弹窗 */}
      <Dialog open={bgDialogOpen} onOpenChange={setBgDialogOpen}>
        <DialogContent className="max-w-[520px] w-[92vw] bg-white">
          <DialogHeader>
            <DialogTitle>{lang === "zh" ? "上传背景图" : "Upload Background"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">{lang === "zh" ? "建议尺寸：1080×1920（9:16）" : "Suggested: 1080×1920 (9:16)"}</div>
            <input type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const dataUrl = await readAndResizeImage(f, 1080, 1920, 0.82)
              setAuthConfig((s: any) => ({ ...s, backgroundImage: dataUrl, showBackground: true }))
              setBgDialogOpen(false)
            }} />
            {authConfig.backgroundImage && (
              <img src={authConfig.backgroundImage} alt="bg" className="mt-2 rounded-md border max-h-64 object-cover" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBgDialogOpen(false)}>{lang === "zh" ? "关闭" : "Close"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* logo 上传弹窗 */}
      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent className="max-w-[520px] w-[92vw] bg-white">
          <DialogHeader>
            <DialogTitle>Logo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">{lang === "zh" ? "建议：正方形 PNG，至少 256×256" : "Square PNG, ≥256×256"}</div>
            <input type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const dataUrl = await readAndResizeImage(f, 512, 512, 0.9)
              setAuthConfig((s: any) => ({ ...s, logoImage: dataUrl, showLogo: true }))
              setLogoDialogOpen(false)
            }} />
            {authConfig.logoImage && (
              <img src={authConfig.logoImage} alt="logo" className="mt-2 rounded-md border size-24 object-cover" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoDialogOpen(false)}>{lang === "zh" ? "关闭" : "Close"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 介绍编辑弹窗 */}
      <Dialog open={introDialogOpen} onOpenChange={setIntroDialogOpen}>
        <DialogContent className="max-w-[560px] w-[95vw] bg-white">
          <DialogHeader>
            <DialogTitle>{lang === "zh" ? "编辑介绍" : "Edit Intro"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{lang === "zh" ? "标题（中文）" : "Title (ZH)"}</Label>
              <Input value={introTitleTmp} onChange={(e) => setIntroTitleTmp(e.target.value)} maxLength={30} placeholder={lang === "zh" ? "中文标题" : "ZH Title"} />
              <Label className="mt-2 block">{lang === "zh" ? "标题（英文）" : "Title (EN)"}</Label>
              <Input value={introTitleEnTmp} onChange={(e) => setIntroTitleEnTmp(e.target.value)} maxLength={60} placeholder={lang === "zh" ? "英文标题" : "EN Title"} />
            </div>
            <div className="space-y-2">
              <Label>{lang === "zh" ? "介绍（中文，最多3行）" : "Intro ZH (max 3 lines)"}</Label>
              <Textarea value={introTextTmp} onChange={(e) => setIntroTextTmp(e.target.value)} rows={3} maxLength={180} placeholder={lang === "zh" ? "中文介绍" : "ZH Intro"} />
              <Label className="mt-2 block">{lang === "zh" ? "介绍（英文，最多3行）" : "Intro EN (max 3 lines)"}</Label>
              <Textarea value={introTextEnTmp} onChange={(e) => setIntroTextEnTmp(e.target.value)} rows={3} maxLength={300} placeholder={lang === "zh" ? "英文介绍" : "EN Intro"} />
              <div className="text-[10px] text-muted-foreground">{lang === "zh" ? "建议每行约60字以内" : "~60 chars per line suggested"}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntroDialogOpen(false)}>{lang === "zh" ? "取消" : "Cancel"}</Button>
            <Button onClick={() => { setAuthConfig((s: any) => ({ ...s, introTitle: { zh: introTitleTmp.trim(), en: introTitleEnTmp.trim() }, introText: { zh: introTextTmp.trim(), en: introTextEnTmp.trim() }, showIntro: true })); setIntroDialogOpen(false) }}>{lang === "zh" ? "确定" : "OK"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 路由设置对话框 */}
      <Dialog open={routeDialogOpen} onOpenChange={setRouteDialogOpen}>
        <DialogContent className="max-w-[520px] w-[92vw] bg-white">
          <DialogHeader>
            <DialogTitle>{lang === "zh" ? "设置路由" : "Set Route"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{lang === "zh" ? "路由" : "Route"}</Label>
            <Input value={routeTemp} onChange={(e) => setRouteTemp(e.target.value)} placeholder="/p-kxxxxxxxx or /home" />
            <div className="text-xs text-muted-foreground">{lang === "zh" ? "建议页面使用 /p- 开头的短链接；必须以 / 开头。" : "Recommend using short links starting with /p-; must start with /."}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRouteDialogOpen(false)}>{lang === "zh" ? "取消" : "Cancel"}</Button>
            <Button onClick={saveRouteDialog}>{lang === "zh" ? "保存" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
