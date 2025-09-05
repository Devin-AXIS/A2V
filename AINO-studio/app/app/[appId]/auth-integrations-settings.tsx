"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FrostPanel } from "@/components/frost"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"
import { Eye, EyeOff } from "lucide-react"

type AppAuthConfig = {
  firecrawlKey?: string
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
  } catch {}
}

export function AuthIntegrationsSettings() {
  const params = useParams<{ appId: string }>()
  const appId = String(params.appId)
  const { toast } = useToast()
  const { locale } = useLocale()

  const [state, setState] = useState<AppAuthConfig>({})
  const [show, setShow] = useState<{ firecrawl: boolean; fastgpt: boolean }>({ firecrawl: false, fastgpt: false })

  useEffect(() => {
    const all = loadAll()
    setState(all[appId] || {})
  }, [appId])

  function save() {
    const all = loadAll()
    all[appId] = state
    saveAll(all)
    toast({ description: locale === "zh" ? "已保存授权配置" : "Authorization settings saved" })
  }

  return (
    <FrostPanel>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{locale === "zh" ? "授权管理" : "Authorization"}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {locale === "zh" ? "配置 Firecrawl 与 FastGPT 的访问凭证（按应用存储）" : "Configure credentials for Firecrawl and FastGPT (per app)"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Firecrawl API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                type={show.firecrawl ? "text" : "password"}
                placeholder="fc-xxxxxxxx"
                value={state.firecrawlKey || ""}
                onChange={(e) => setState((s) => ({ ...s, firecrawlKey: e.target.value }))}
              />
              <Button variant="outline" size="sm" onClick={() => setShow((s) => ({ ...s, firecrawl: !s.firecrawl }))} className="shrink-0">
                {show.firecrawl ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "zh" ? "用于抓取与渲染网页内容。" : "Used for crawling and rendering web content."}
            </p>
          </div>

          <div className="space-y-2">
            <Label>FastGPT Endpoint</Label>
            <Input
              type="text"
              placeholder="https://api.fastgpt.run/v1"
              value={state.fastgptEndpoint || ""}
              onChange={(e) => setState((s) => ({ ...s, fastgptEndpoint: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              {locale === "zh" ? "与 OpenAI 接口兼容的地址。" : "OpenAI-compatible endpoint URL."}
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>FastGPT API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                type={show.fastgpt ? "text" : "password"}
                placeholder="fk-xxxxxxxx"
                value={state.fastgptKey || ""}
                onChange={(e) => setState((s) => ({ ...s, fastgptKey: e.target.value }))}
              />
              <Button variant="outline" size="sm" onClick={() => setShow((s) => ({ ...s, fastgpt: !s.fastgpt }))} className="shrink-0">
                {show.fastgpt ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "zh" ? "用于自然语言规则解析与结构化抽取。" : "For rule parsing and structured extraction."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={save}>{locale === "zh" ? "保存" : "Save"}</Button>
        </div>
      </div>
    </FrostPanel>
  )
}


