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

  const [draft, setDraft] = useState<DraftManifest>({
    schemaVersion: "1.0",
    app: {
      appKey: params.appId,
      locale: lang === "zh" ? "zh-CN" : "en-US",
      theme: "default",
      bottomNav: [
        { key: "home", label: lang === "zh" ? "首页" : "Home", route: "/home" },
        { key: "me", label: lang === "zh" ? "我的" : "Me", route: "/me" },
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

  function onSwitchTab(next: "preview" | "code") {
    if (next === "preview") {
      try {
        const obj = JSON.parse(jsonText)
        setDraft(obj)
        setViewTab("preview")
        toast({ description: lang === "zh" ? "已应用修改" : "Changes applied" })
      } catch (e) {
        toast({ description: lang === "zh" ? "JSON 格式错误" : "Invalid JSON", variant: "destructive" as any })
        setViewTab("code")
      }
    } else {
      setViewTab("code")
    }
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-white via-blue-50 to-green-50">
      <div className="max-w-[100rem] mx-auto p-3">
        <Card className="p-0 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-[80vh]">
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
                      <div key={item.key} className="grid grid-cols-2 gap-2">
                        <Input value={item.label} onChange={(e) => setDraft(s => ({ ...s, app: { ...s.app, bottomNav: s.app.bottomNav.map((it, i) => i === idx ? { ...it, label: e.target.value } : it) } }))} placeholder={lang === "zh" ? "名称" : "Label"} />
                        <Input value={item.route} onChange={(e) => setDraft(s => ({ ...s, app: { ...s.app, bottomNav: s.app.bottomNav.map((it, i) => i === idx ? { ...it, route: e.target.value } : it) } }))} placeholder="/route" />
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
                    <Button variant={device === "pc" ? "default" : "outline"} onClick={() => setDevice("pc")}>PC</Button>
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
                  <div className={device === "mobile" ? "mx-auto w-[360px] border rounded-xl bg-white overflow-hidden" : "mx-auto w-full border rounded-xl bg-white overflow-hidden"}>
                    <div className="h-12 border-b flex items-center justify-between px-3 text-sm">
                      <div>{draft.app.appKey}</div>
                      <div className="text-muted-foreground">{lang === "zh" ? (device === "mobile" ? "移动" : "PC") : (device === "mobile" ? "Mobile" : "PC")}</div>
                    </div>
                    <div className="h-[420px] flex items-center justify-center text-xs text-muted-foreground">
                      {lang === "zh" ? "此处展示根据 Manifest 渲染的应用页面占位。" : "Preview placeholder rendered from Manifest."}
                    </div>
                    <div className="h-14 border-t grid grid-cols-5 text-xs">
                      {draft.app.bottomNav.map((i) => (
                        <div key={i.key} className="flex items-center justify-center gap-1 hover:bg-gray-50 cursor-default">
                          <span className="inline-block w-4 h-4 rounded-full bg-gray-200" />
                          <span>{i.label}</span>
                        </div>
                      ))}
                    </div>
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
