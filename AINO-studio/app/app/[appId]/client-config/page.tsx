"use client"

import { useEffect, useState, useRef } from "react"
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
import { GripVertical, Trash2 } from "lucide-react"
import dynamic from "next/dynamic"
import type { editor } from "monaco-editor"
import { manifestSchema } from "./manifest-schema"

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
  })

  // 代码编辑范围
  const [codeScope, setCodeScope] = useState<"manifest" | "app" | "page" | "dataSources">("manifest")
  const [activePage, setActivePage] = useState<string>("home")

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
      const url = `http://localhost:3002/${lang}/preview/${id}?device=${device}`
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
    } catch {}
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
      } catch {}
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
                    <a href="http://localhost:3001/docs/swagger" target="_blank" rel="noreferrer">
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
    </main>
  )
 }
