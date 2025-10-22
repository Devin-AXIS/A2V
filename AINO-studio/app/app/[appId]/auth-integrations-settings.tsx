"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FrostPanel } from "@/components/frost"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type AppAuthConfig = {
  firecrawlKey?: string
  openaiEndpoint?: string
  openaiKey?: string
  // backward-compat keys
  fastgptEndpoint?: string
  fastgptKey?: string
}

const LS_KEY = "aino_auth_integrations_v1"

function loadAll(): Record<string, AppAuthConfig> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
function saveAll(v: Record<string, AppAuthConfig>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(v))
  } catch { }
}

export function AuthIntegrationsSettings() {
  const params = useParams<{ appId: string }>()
  const appId = String(params.appId)
  const { toast } = useToast()
  const { locale } = useLocale()

  const [state, setState] = useState<AppAuthConfig>({})
  const [show, setShow] = useState<{ firecrawl: boolean; fastgpt: boolean }>({ firecrawl: false, fastgpt: false })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<{ openai?: boolean; firecrawl?: boolean }>({})

  useEffect(() => {
    const all = loadAll() as Record<string, AppAuthConfig>
    const conf = all[appId] || {}
    setState({
      firecrawlKey: conf.firecrawlKey || "",
      openaiEndpoint: conf.openaiEndpoint || conf.fastgptEndpoint || "",
      openaiKey: conf.openaiKey || conf.fastgptKey || "",
    })
  }, [appId])

  async function save() {
    const all = loadAll() as Record<string, AppAuthConfig>
    all[appId] = {
      firecrawlKey: state.firecrawlKey,
      openaiEndpoint: state.openaiEndpoint,
      openaiKey: state.openaiKey,
      // keep fastgpt fields for compatibility
      fastgptEndpoint: state.openaiEndpoint,
      fastgptKey: state.openaiKey,
    }
    try {
      setSaving(true)
      saveAll(all)
      toast({ description: locale === "zh" ? "已保存授权配置" : "Authorization settings saved" })
    } finally {
      setSaving(false)
    }
  }

  async function testOpenAI() {
    setTesting((s) => ({ ...s, openai: true }))
    try {
      const endpoint = state.openaiEndpoint?.trim()
      const key = state.openaiKey?.trim()
      if (!endpoint || !key) throw new Error('missing')
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007'}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-aino-openai-endpoint': endpoint, 'x-aino-openai-key': key },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] })
      })
      if (r.ok) toast({ description: locale === 'zh' ? 'OpenAI 接通' : 'OpenAI OK' })
      else toast({ description: locale === 'zh' ? 'OpenAI 测试失败' : 'OpenAI test failed', variant: 'destructive' as any })
    } catch {
      toast({ description: locale === 'zh' ? '请填写 Endpoint/Key 后再测试' : 'Fill Endpoint/Key and retry', variant: 'destructive' as any })
    } finally { setTesting((s) => ({ ...s, openai: false })) }
  }

  async function testFirecrawl() {
    setTesting((s) => ({ ...s, firecrawl: true }))
    try {
      const key = state.firecrawlKey?.trim()
      if (!key) throw new Error('missing')
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007'}/api/crawl/scrape`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-aino-firecrawl-key': key },
        body: JSON.stringify({ url: 'https://example.com', options: { formats: ['markdown'] } })
      })
      if (r.ok) toast({ description: locale === 'zh' ? 'Firecrawl 接通' : 'Firecrawl OK' })
      else toast({ description: locale === 'zh' ? 'Firecrawl 测试失败' : 'Firecrawl test failed', variant: 'destructive' as any })
    } catch {
      toast({ description: locale === 'zh' ? '请填写 Key 后再测试' : 'Fill key and retry', variant: 'destructive' as any })
    } finally { setTesting((s) => ({ ...s, firecrawl: false })) }
  }

  return (
    <FrostPanel>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{locale === "zh" ? "授权管理" : "Authorization"}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {locale === "zh" ? "配置 ScrapeGraphAI 与 FastGPT 的访问凭证（按应用存储）" : "Configure credentials for Firecrawl and FastGPT (per app)"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>ScrapeGraphAI API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                type={show.firecrawl ? "text" : "password"}
                placeholder="sgai-xxxxxxxx"
                value={state.firecrawlKey || ""}
                onChange={(e) => setState((s) => ({ ...s, firecrawlKey: e.target.value }))}
              />
              <Button variant="outline" size="sm" onClick={() => setShow((s) => ({ ...s, firecrawl: !s.firecrawl }))} className="shrink-0">
                {show.firecrawl ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button variant="secondary" size="sm" onClick={testFirecrawl} disabled={!!testing.firecrawl} className="shrink-0">
                {testing.firecrawl ? <><Loader2 className="size-4 mr-1 animate-spin" />{locale === 'zh' ? '测试中' : 'Testing'}</> : (locale === 'zh' ? '测试' : 'Test')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "zh" ? "用于抓取与渲染网页内容。" : "Used for crawling and rendering web content."}
            </p>
            <div className="text-xs flex items-center gap-1 text-green-600" hidden={!state.firecrawlKey}>
              <ShieldCheck className="size-3" /> {locale === 'zh' ? '已配置' : 'Configured'}
            </div>
          </div>

          <div className="space-y-2">
            <Label>OpenAI Endpoint</Label>
            <Input
              type="text"
              placeholder="https://api.openai.com/v1"
              value={state.openaiEndpoint || ""}
              onChange={(e) => setState((s) => ({ ...s, openaiEndpoint: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              {locale === "zh" ? "OpenAI 或兼容 OpenAI 的接口地址。" : "OpenAI or OpenAI-compatible endpoint URL."}
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>OpenAI API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                type={show.fastgpt ? "text" : "password"}
                placeholder="sk-xxxxxxxx"
                value={state.openaiKey || ""}
                onChange={(e) => setState((s) => ({ ...s, openaiKey: e.target.value }))}
              />
              <Button variant="outline" size="sm" onClick={() => setShow((s) => ({ ...s, fastgpt: !s.fastgpt }))} className="shrink-0">
                {show.fastgpt ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button variant="secondary" size="sm" onClick={testOpenAI} disabled={!!testing.openai} className="shrink-0">
                {testing.openai ? <><Loader2 className="size-4 mr-1 animate-spin" />{locale === 'zh' ? '测试中' : 'Testing'}</> : (locale === 'zh' ? '测试' : 'Test')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "zh" ? "用于自然语言规则解析与结构化抽取（兼容 OpenAI）。" : "For rule parsing and structured extraction (OpenAI-compatible)."}
            </p>
            <div className="text-xs flex items-center gap-1 text-green-600" hidden={!(state.openaiEndpoint && state.openaiKey)}>
              <ShieldCheck className="size-3" /> {locale === 'zh' ? '已配置' : 'Configured'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={saving}>{saving ? <><Loader2 className="size-4 mr-1 animate-spin" />{locale === 'zh' ? '保存中' : 'Saving'}</> : (locale === "zh" ? "保存" : "Save")}</Button>
        </div>
      </div>
    </FrostPanel>
  )
}


