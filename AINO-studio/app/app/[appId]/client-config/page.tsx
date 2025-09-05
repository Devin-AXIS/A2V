"use client"

import { useEffect, useState } from "react"
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

  const [draft, setDraft] = useState<DraftManifest>({
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

  // 同步JSON文本
  useEffect(() => {
    setJsonText(JSON.stringify(draft, null, 2))
  }, [draft])

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
      const body = JSON.parse(jsonText)
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
    if (!previewId) {
      return openPreview()
    }
    try {
      const body = JSON.parse(jsonText)
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
                      <Button variant="secondary" onClick={() => setDraft(s => ({ ...s, app: { ...s.app, bottomNav: [...s.app.bottomNav, { key: `k${Date.now()}`, label: lang === "zh" ? "新项" : "Item", route: "/new" }] } }))}>
                        {lang === "zh" ? "添加项" : "Add Item"}
                      </Button>
                    )}
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
                  <div className="flex-1">
                    <Textarea className="h-full min-h-[520px] font-mono text-xs" value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
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
