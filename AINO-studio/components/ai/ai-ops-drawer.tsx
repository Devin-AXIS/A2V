"use client"

import { useEffect, useMemo, useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appId: string
  lang?: "zh" | "en"
  dirId?: string
  dirName?: string
  dirFields?: Array<{ key: string; label: string; type: string; required?: boolean }>
}

// Directory context is passed in from the caller; no cross-directory selection here

export function AIOpsDrawer({ open, onOpenChange, appId, lang = "zh", dirId, dirName, dirFields }: Props) {
  const { toast } = useToast()

  const [provider, setProvider] = useState<"firecrawl" | "scrapegraph">("firecrawl")
  const [urls, setUrls] = useState("")
  const [domain, setDomain] = useState("")
  const [nlRule, setNlRule] = useState("")
  const [schedulePreset, setSchedulePreset] = useState<"daily" | "weekend" | "weekdays" | "weekly" | "monthly" | "custom">("weekdays")
  const [timeOfDay, setTimeOfDay] = useState("06:00")
  const [customDays, setCustomDays] = useState<string[]>(["Mon","Tue","Wed","Thu","Fri"])
  const [tz, setTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai")
  const [intervalHours, setIntervalHours] = useState<string>("")
  const [dedupKey, setDedupKey] = useState<"url" | "externalId" | "titleWindow">("url")

  const [loadingMeta, setLoadingMeta] = useState(false)
  const [runOnce, setRunOnce] = useState(false)
  const [dom, setDom] = useState<string>("1")
  const [oneDate, setOneDate] = useState<string>("")

  // i18n helper must be declared before any use (e.g., in mockFields)
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en)

  // ===== Mock extracted JSON & array path selection (local only) =====
  const mockExtracted = useMemo(() => ({
    items: Array.from({ length: 6 }).map((_, i) => ({
      title: `Senior Frontend Engineer ${i+1}`,
      desc: `React/Next.js · TypeScript · UI/UX`,
      salary: 20_000 + i * 1000,
      city: ["北京","上海","深圳"][i % 3],
      company: ["AINO","Axis","Nova"][i % 3],
      link: `https://jobs.example.com/${i+1}`,
      posted_at: "2025-09-01",
    })),
    data: [{ name: "fallback" }],
    results: [],
  }), [])
  const arrayPathOptions = ["$.items","$.data","$.results"]
  const [arrayPath, setArrayPath] = useState<string>("$.items")
  const [extractedOverride, setExtractedOverride] = useState<any[] | null>(null)
  const sampleRecords = useMemo<any[]>(() => {
    if (extractedOverride) return extractedOverride
    if (arrayPath === "$.items") return mockExtracted.items
    if (arrayPath === "$.data") return (mockExtracted as any).data
    if (arrayPath === "$.results") return (mockExtracted as any).results
    return []
  }, [arrayPath, mockExtracted, extractedOverride])
  const [crawlId, setCrawlId] = useState<string>("")
  const [batchId, setBatchId] = useState<string>("")
  const [busy, setBusy] = useState<{ scrape?: boolean; crawlStart?: boolean; crawlStatus?: boolean; batchStart?: boolean; batchStatus?: boolean; cancel?: boolean }>({})
  const [statusMsg, setStatusMsg] = useState<string>("")

  // mock fields for mapping UI
  type MockField = { key: string; label: string; type: 'text'|'number'|'date'|'tags'|'url'|'boolean'|'select'|'multiselect'; required?: boolean }
  const mockFields = useMemo<MockField[]>(() => {
    if (Array.isArray(dirFields) && dirFields.length > 0) {
      return dirFields.map((f: any) => ({ key: f.key, label: f.label || f.key, type: (f.type || 'text') as any, required: !!f.required }))
    }
    // fallback demo
    return [
      { key: "title", label: t("标题","Title"), type: 'text', required: true },
      { key: "description", label: t("描述","Description"), type: 'text' },
      { key: "salary", label: t("薪资","Salary"), type: 'number' },
      { key: "city", label: t("城市","City"), type: 'text' },
      { key: "company", label: t("公司","Company"), type: 'text' },
      { key: "url", label: "URL", type: 'url' },
    ]
  }, [dirFields, lang])
  const [mapPage, setMapPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(mockFields.length / pageSize))
  const pageFields = useMemo(() => mockFields.slice((mapPage-1)*pageSize, mapPage*pageSize), [mockFields, mapPage])
  const [mapping, setMapping] = useState<Record<string, string>>({}) // fieldKey -> sourceKey
  const [mappingTransform, setMappingTransform] = useState<Record<string, string>>({}) // fieldKey -> transform
  const sampleSourceKeys = ["title","desc","salary","city","company","link","posted_at"]
  const [keySearch, setKeySearch] = useState("")
  const [saveMsg, setSaveMsg] = useState("")
  function autoMatch() {
    const next: Record<string, string> = {}
    for (const f of mockFields) {
      const guess = sampleSourceKeys.find((s) => s.toLowerCase().includes(f.key.toLowerCase().slice(0, 4)))
      if (guess) next[f.key] = guess
    }
    setMapping(next)
    toast({ description: t("已自动匹配相近字段","Auto matched similar fields") })
  }
  function clearMapping() {
    setMapping({})
  }

  const transformOptions = [
    { value: "none", label: t("无","None") },
    { value: "trim", label: "trim" },
    { value: "toNumber", label: "toNumber" },
    { value: "parseDate", label: "parseDate" },
    { value: "splitTags", label: "splitTags" },
  ]

  function suggestTransform(targetType: MockField['type'], sample: any): string {
    if (targetType === 'number') {
      return typeof sample === 'number' ? 'none' : 'toNumber'
    }
    if (targetType === 'date') {
      return typeof sample === 'string' ? 'parseDate' : 'parseDate'
    }
    if (targetType === 'tags' || targetType === 'multiselect') {
      return Array.isArray(sample) ? 'none' : 'splitTags'
    }
    if (targetType === 'text') {
      return 'trim'
    }
    return 'none'
  }

  // ---------- Source key candidates from sample ----------
  function flattenKeysFromSample(obj: any, prefix = '', depth = 0, out: string[] = []): string[] {
    if (!obj || depth > 2) return out
    if (Array.isArray(obj)) {
      if (obj.length > 0) flattenKeysFromSample(obj[0], prefix, depth + 1, out)
      return out
    }
    if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        const path = prefix ? `${prefix}.${k}` : k
        out.push(path)
        if (typeof obj[k] === 'object') flattenKeysFromSample(obj[k], path, depth + 1, out)
      }
    }
    return out
  }
  const sampleKeys = useMemo(() => {
    try {
      const base = flattenKeysFromSample(sampleRecords?.[0] ?? {})
      return Array.from(new Set([...base, ...sampleSourceKeys])).sort()
    } catch { return sampleSourceKeys }
  }, [sampleRecords])
  function scoreKey(fieldKey: string, sourceKey: string): number {
    const fk = fieldKey.toLowerCase()
    const sk = sourceKey.toLowerCase()
    if (fk === sk) return 100
    if (sk.includes(fk)) return 80
    if (fk.includes(sk)) return 70
    let s = 0
    for (const ch of fk.split(/[_-]/)) if (sk.includes(ch)) s += 10
    return s
  }
  function candidatesForField(f: MockField): string[] {
    const list = sampleKeys
      .map((k) => ({ k, s: scoreKey(f.key, k) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.k)
    const filtered = keySearch ? list.filter(k => k.toLowerCase().includes(keySearch.toLowerCase())) : list
    return filtered.slice(0, 6)
  }

  // ---------- Mapping template (local) ----------
  function tplKey() { return `aino_aiops_mapping_${appId}_${dirId || 'dir'}` }
  function saveTemplate() {
    try {
      const payload = { mapping, mappingTransform, when: Date.now() }
      localStorage.setItem(tplKey(), JSON.stringify(payload))
      setSaveMsg(t("映射模板已保存","Mapping template saved"))
      toast({ description: t("映射模板已保存","Mapping template saved") })
    } catch (e) {
      toast({ description: t("保存失败","Save failed"), variant: 'destructive' as any })
    }
  }
  function loadTemplate() {
    try {
      const raw = localStorage.getItem(tplKey())
      if (!raw) { toast({ description: t("未找到模板","No template found"), variant: 'destructive' as any }); return }
      const p = JSON.parse(raw || '{}')
      setMapping(p.mapping || {})
      setMappingTransform(p.mappingTransform || {})
      toast({ description: t("模板已加载","Template loaded") })
    } catch (e) {
      toast({ description: t("加载失败","Load failed"), variant: 'destructive' as any })
    }
  }

  // ensure we have a directory context
  useEffect(() => {
    if (!open) return
    setLoadingMeta(false)
    if (!dirId) {
      toast({ description: t("请先选择目录","Please select a directory first"), variant: "destructive" as any })
    }
  }, [open, dirId])


  const dayKeys = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const
  const dayZhMap: Record<string, string> = { Mon: "周一", Tue: "周二", Wed: "周三", Thu: "周四", Fri: "周五", Sat: "周六", Sun: "周日" }
  const dayEnMap: Record<string, string> = { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" }
  const dayText = (k: string) => (lang === "zh" ? dayZhMap[k] : dayEnMap[k])

  const cronPreview = useMemo(() => {
    // if interval provided, prefer it
    const hours = parseInt(intervalHours || "0", 10)
    if (!Number.isNaN(hours) && hours > 0) {
      return `0 */${hours} * * * (${tz})`
    }
    const [hh, mm] = (timeOfDay || "06:00").split(":")
    const map: Record<string, string> = { Sun: "0", Mon: "1", Tue: "2", Wed: "3", Thu: "4", Fri: "5", Sat: "6" }
    if (runOnce) {
      const dateStr = oneDate ? new Date(oneDate).toLocaleDateString() : "?"
      return `ONCE ${dateStr} ${timeOfDay} (${tz})`
    }
    if (schedulePreset === "daily") return `${mm} ${hh} * * * (${tz})`
    if (schedulePreset === "weekdays") return `${mm} ${hh} * * 1-5 (${tz})`
    if (schedulePreset === "weekend") return `${mm} ${hh} * * 6,0 (${tz})`
    if (schedulePreset === "monthly") return `${mm} ${hh} ${dom} * * (${tz})`
    // weekly/custom use selected days
    const ds = customDays.map(d => map[d] ?? "").filter(Boolean).join(",") || "1-5"
    return `${mm} ${hh} * * ${ds} (${tz})`
  }, [schedulePreset, timeOfDay, customDays, tz, intervalHours, runOnce, dom, oneDate])

  // no cross-directory selection; use current dir

  function toggleCustomDay(day: string) {
    setCustomDays((s) => s.includes(day) ? s.filter(d => d !== day) : [...s, day])
  }

  function onDryRun() {
    // read per-app OpenAI config from local authorization store
    const raw = typeof window !== 'undefined' ? localStorage.getItem('aino_auth_integrations_v1') : null
    const all = raw ? JSON.parse(raw) : {}
    const conf = all[appId] || {}
    const endpoint = conf.openaiEndpoint || conf.fastgptEndpoint
    const key = conf.openaiKey || conf.fastgptKey
    if (!endpoint || !key) {
      toast({ description: t("请先在设置/授权管理中配置 OpenAI Endpoint 与 Key","Please configure OpenAI Endpoint & Key in Settings/Authorization first"), variant: "destructive" as any })
      return
    }
    toast({ description: t("已提交 Dry-run，请稍等…","Dry-run submitted, please wait…") })
    // demo call: send a tiny parse task to server AI gateway
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-aino-openai-endpoint': endpoint,
        'x-aino-openai-key': key,
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] }),
    }).then(async (r) => {
      if (!r.ok) throw new Error(await r.text())
      toast({ description: t("AI 网关已响应","AI gateway responded") })
    }).catch((e) => {
      console.error(e)
      toast({ description: t("AI 网关调用失败","AI gateway call failed"), variant: "destructive" as any })
    })
  }

  function readAuth() {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('aino_auth_integrations_v1') : null
    const all = raw ? JSON.parse(raw) : {}
    const conf = all[appId] || {}
    return {
      openaiEndpoint: conf.openaiEndpoint || conf.fastgptEndpoint,
      openaiKey: conf.openaiKey || conf.fastgptKey,
      firecrawlKey: conf.firecrawlKey,
    }
  }

  function getApiBase() {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }

  async function onScrapeTest() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey) {
      toast({ description: t("请先在授权管理配置 Firecrawl Key","Please configure Firecrawl Key in Authorization"), variant: "destructive" as any })
      return
    }
    const firstUrl = (urls.split(/\n+/).map(s => s.trim()).filter(Boolean)[0]) || domain || ''
    if (!firstUrl) {
      toast({ description: t("请输入至少一个 URL 或域名","Please enter at least one URL or domain"), variant: "destructive" as any })
      return
    }
    try {
      setBusy((b) => ({ ...b, scrape: true }))
      setStatusMsg(t("正在抓取样例…","Scraping sample…"))
      const r = await fetch(`${getApiBase()}/api/crawl/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-aino-firecrawl-key': firecrawlKey },
        body: JSON.stringify({ url: firstUrl, options: { formats: ['markdown','html'] } })
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'scrape failed')
      // 以返回对象生成样例记录，具体结构以 Firecrawl 返回为准
      const rec = Array.isArray(data?.data?.data) ? data.data.data : [data?.data]
      setExtractedOverride(rec || [])
      toast({ description: t("已抓取样例，已回填到预览","Scraped sample filled into preview") })
      setStatusMsg(t("抓取完成","Scrape done"))
    } catch (e) {
      console.error(e)
      toast({ description: t("抓取失败","Scrape failed"), variant: "destructive" as any })
      setStatusMsg(t("抓取失败","Scrape failed"))
    } finally { setBusy((b) => ({ ...b, scrape: false })) }
  }

  async function onCrawlStart() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey) {
      toast({ description: t("请先在授权管理配置 Firecrawl Key","Please configure Firecrawl Key in Authorization"), variant: "destructive" as any })
      return
    }
    const startUrl = domain || (urls.split(/\n+/).map(s => s.trim()).filter(Boolean)[0]) || ''
    if (!startUrl) {
      toast({ description: t("请输入域名或 URL","Please enter a domain or URL"), variant: "destructive" as any })
      return
    }
    try {
      setBusy((b) => ({ ...b, crawlStart: true }))
      setStatusMsg(t("正在启动爬取…","Starting crawl…"))
      const r = await fetch(`${getApiBase()}/api/crawl/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-aino-firecrawl-key': firecrawlKey },
        body: JSON.stringify({ url: startUrl, options: { limit: 10 } })
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'start failed')
      const id = data?.data?.id || data?.data?.jobId || ''
      setCrawlId(id)
      toast({ description: id ? t("已启动爬取，点击查看状态","Crawl started, click to check status") : t("已启动爬取","Crawl started") })
      setStatusMsg(id ? t("爬取已启动：","Crawl started: ") + id : t("爬取已启动","Crawl started"))
    } catch (e) {
      console.error(e)
      toast({ description: t("启动失败","Start failed"), variant: "destructive" as any })
      setStatusMsg(t("启动失败","Start failed"))
    } finally { setBusy((b) => ({ ...b, crawlStart: false })) }
  }

  async function onCrawlStatus() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey || !crawlId) return
    try {
      setBusy((b) => ({ ...b, crawlStatus: true }))
      setStatusMsg(t("正在获取状态…","Fetching status…"))
      const r = await fetch(`${getApiBase()}/api/crawl/status/${encodeURIComponent(crawlId)}`, {
        headers: { 'x-aino-firecrawl-key': firecrawlKey }
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'status failed')
      const docs = data?.data?.data || []
      if (Array.isArray(docs) && docs.length) {
        setExtractedOverride(docs)
        toast({ description: t("已更新预览数据","Preview updated") })
      }
      setStatusMsg(t("状态已更新","Status updated"))
    } catch (e) {
      console.error(e)
      toast({ description: t("获取状态失败","Fetch status failed"), variant: "destructive" as any })
      setStatusMsg(t("获取状态失败","Fetch status failed"))
    } finally { setBusy((b) => ({ ...b, crawlStatus: false })) }
  }

  async function onBatchStart() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey) {
      toast({ description: t("请先在授权管理配置 Firecrawl Key","Please configure Firecrawl Key in Authorization"), variant: "destructive" as any })
      return
    }
    const list = urls.split(/\n+/).map(s => s.trim()).filter(Boolean)
    if (list.length === 0) {
      toast({ description: t("请在 URL 列表输入若干地址","Please input some URLs in list") , variant: "destructive" as any })
      return
    }
    try {
      setBusy((b) => ({ ...b, batchStart: true }))
      setStatusMsg(t("正在启动批量抓取…","Starting batch…"))
      const r = await fetch(`${getApiBase()}/api/crawl/batch/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-aino-firecrawl-key': firecrawlKey },
        body: JSON.stringify({ urls: list, options: { options: { formats: ['markdown'] } } })
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'batch start failed')
      const id = data?.data?.id || data?.data?.jobId || ''
      setBatchId(id)
      toast({ description: id ? t("已启动批量抓取","Batch started") : t("已启动","Started") })
      setStatusMsg(id ? t("批量抓取已启动：","Batch started: ") + id : t("批量抓取已启动","Batch started"))
    } catch (e) {
      console.error(e)
      toast({ description: t("批量启动失败","Batch start failed"), variant: "destructive" as any })
      setStatusMsg(t("批量启动失败","Batch start failed"))
    } finally { setBusy((b) => ({ ...b, batchStart: false })) }
  }

  async function onBatchStatus() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey || !batchId) return
    try {
      setBusy((b) => ({ ...b, batchStatus: true }))
      const r = await fetch(`${getApiBase()}/api/crawl/batch/status/${encodeURIComponent(batchId)}`, {
        headers: { 'x-aino-firecrawl-key': firecrawlKey }
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'batch status failed')
      const docs = data?.data?.data || []
      if (Array.isArray(docs) && docs.length) {
        setExtractedOverride(docs)
        toast({ description: t("已更新批量预览","Batch preview updated") })
      }
      setStatusMsg(t("批量状态已更新","Batch status updated"))
    } catch (e) {
      console.error(e)
      toast({ description: t("获取批量状态失败","Fetch batch status failed"), variant: "destructive" as any })
      setStatusMsg(t("获取批量状态失败","Fetch batch status failed"))
    } finally { setBusy((b) => ({ ...b, batchStatus: false })) }
  }

  async function onCrawlCancel() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey || !crawlId) return
    try {
      setBusy((b) => ({ ...b, cancel: true }))
      const r = await fetch(`${getApiBase()}/api/crawl/cancel/${encodeURIComponent(crawlId)}`, { method: 'POST', headers: { 'x-aino-firecrawl-key': firecrawlKey } })
      const ok = r.ok
      toast({ description: ok ? t("已取消","Cancelled") : t("取消失败","Cancel failed"), variant: ok ? undefined : ("destructive" as any) })
      setStatusMsg(ok ? t("爬取已取消","Crawl cancelled") : t("取消失败","Cancel failed"))
    } finally { setBusy((b) => ({ ...b, cancel: false })) }
  }

  function onRunNow() {
    toast({ description: t("已开始运行，后台执行中","Run started in background") })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-none">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="rounded-2xl border border-white/40 bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl shadow-lg ring-1 ring-black/5">
            <DrawerHeader className="pb-2 bg-gradient-to-r from-transparent to-white/10 dark:to-neutral-900/10 rounded-t-2xl">
              <DrawerTitle>{t("AI 运营（采集/抽取/入库）","AI Ops (Crawl/Extract/Upsert)")}</DrawerTitle>
              <DrawerDescription>{t("配置数据源、规则、目标与调度；支持 Dry-run 预览后再落库。","Configure sources, rules, target and schedule; Dry-run before upsert.")}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <ScrollArea className="h-[68vh] pr-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <section className="space-y-3">
                    <div className="text-sm font-medium">{t("数据源","Source")}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>{t("Provider","Provider")}</Label>
                        <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                          <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="firecrawl">Firecrawl</SelectItem>
                            <SelectItem value="scrapegraph">ScrapeGraphAI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>{t("域名(可选)","Domain (optional)")}</Label>
                        <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="https://example.com" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>{t("URL 列表(每行一个)","URL list (one per line)")}</Label>
                      <Textarea value={urls} onChange={(e) => setUrls(e.target.value)} placeholder={t("https://...","https://...")} className="min-h-[110px]" />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("自然语言规则","Natural language rule")}</Label>
                      <Textarea value={nlRule} onChange={(e) => setNlRule(e.target.value)} placeholder={t("例如：BOSS直聘/智联，城市=北京，岗位=前端，薪资>20k","e.g. Boss/Zhaopin, city=Beijing, role=frontend, salary>20k")} />
                      <div className="text-xs text-muted-foreground">{t("右侧会解析为结构化条件，便于确认。","Parsed structured conditions will be shown on the right for confirmation.")}</div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div className="space-y-1">
                      <Label>{t("去重与更新策略","Dedup & update strategy")}</Label>
                      <RadioGroup value={dedupKey} onValueChange={(v: any) => setDedupKey(v)} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="url" id="rk1" /><Label htmlFor="rk1">URL</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="externalId" id="rk2" /><Label htmlFor="rk2">External ID</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="titleWindow" id="rk3" /><Label htmlFor="rk3">{t("标题+时间窗口","Title + time window")}</Label></div>
                      </RadioGroup>
                      <div className="text-xs text-muted-foreground">{t("存在则部分字段更新，不存在则新增。","Upsert: update if exists, otherwise create.")}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">{t("调度","Schedule")}</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label>{t("预设","Preset")}</Label>
                          <Select value={schedulePreset} onValueChange={(v: any) => setSchedulePreset(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekdays">{t("工作日","Weekdays")}</SelectItem>
                              <SelectItem value="weekend">{t("周末","Weekend")}</SelectItem>
                              <SelectItem value="daily">{t("每天","Daily")}</SelectItem>
                              <SelectItem value="weekly">{t("每周","Weekly")}</SelectItem>
                              <SelectItem value="monthly">{t("每月","Monthly")}</SelectItem>
                              <SelectItem value="custom">{t("自定义","Custom")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>{t("时间","Time")}</Label>
                          <Input type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>{t("时区","Timezone")}</Label>
                          <Select value={tz} onValueChange={(v: any) => setTz(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                              <SelectItem value="UTC">UTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>{t("运行模式","Run mode")}</Label>
                          <RadioGroup value={runOnce ? "once" : "repeat"} onValueChange={(v: any) => setRunOnce(v === "once")} className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="repeat" id="rm1" /><Label htmlFor="rm1">{t("重复","Repeat")}</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="once" id="rm2" /><Label htmlFor="rm2">{t("仅一次","Once")}</Label></div>
                          </RadioGroup>
                        </div>
                      </div>
                      {schedulePreset === "custom" || schedulePreset === "weekly" ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {dayKeys.map((d) => (
                            <button key={d} className={`px-2.5 py-1 rounded-md text-xs border ${customDays.includes(d) ? "bg-blue-600 text-white border-blue-600" : "bg-white/60 dark:bg-neutral-900/60"}`} onClick={() => toggleCustomDay(d)} type="button">{dayText(d)}</button>
                          ))}
                        </div>
                      ) : null}
                      {schedulePreset === "monthly" && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <Label>{t("每月第几天","Day of month")}</Label>
                            <Select value={dom} onValueChange={(v: any) => setDom(v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 31 }).map((_, i) => (
                                  <SelectItem key={i+1} value={String(i+1)}>{i+1}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      {runOnce && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <Label>{t("执行日期","Run date")}</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start font-normal">
                                  {oneDate ? new Date(oneDate).toLocaleDateString() : t("选择日期","Pick a date")}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0" align="start">
                                <Calendar mode="single" selected={oneDate ? new Date(oneDate) : undefined} onSelect={(d: any) => setOneDate(d ? d.toISOString() : "")}/>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1 md:col-span-2">
                          <div className="text-xs text-muted-foreground">
                            {t("CRON 预览","CRON Preview")}：<span className="font-mono">{cronPreview}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>{t("间隔(小时，可选)","Interval (hours, optional)")}</Label>
                          <Input inputMode="numeric" pattern="[0-9]*" value={intervalHours} onChange={(e) => setIntervalHours(e.target.value.replace(/[^0-9]/g, ''))} placeholder={t("留空则按上面时间执行","Leave empty to use time above")} />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3 lg:col-span-2">
                    {/* Extracted sample + array path selection */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">{t("抽取样例","Extracted Samples")}</div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">{t("数据数组路径","Array path")}</Label>
                        <Select value={arrayPath} onValueChange={(v: any) => setArrayPath(v)}>
                          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {arrayPathOptions.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground">{t("将基于此路径读取记录数组","We will read records from this path")}</div>
                      </div>
                      <div className="rounded-xl border bg-white/60 dark:bg-neutral-900/50 backdrop-blur p-2 max-h-[160px] overflow-auto text-xs">
                        {sampleRecords.length === 0 ? (
                          <div className="text-muted-foreground">{t("暂无样例，请先抓取或爬取。","No samples yet. Scrape/crawl first.")}</div>
                        ) : (
                          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(sampleRecords.slice(0,3), null, 2)}</pre>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{t("字段映射","Field Mapping")}</div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onScrapeTest} disabled={!!busy.scrape}>
                          {busy.scrape ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("抓取中","Scraping")}</> : t("试抓取","Scrape test")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={onCrawlStart} disabled={!!busy.crawlStart}>
                          {busy.crawlStart ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("启动中","Starting")}</> : t("开始爬取","Start crawl")}
                        </Button>
                        <Button variant="outline" size="sm" disabled={!crawlId || !!busy.crawlStatus} onClick={onCrawlStatus}>
                          {busy.crawlStatus ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("查询中","Fetching")}</> : t("查看状态","Check status")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={onCrawlCancel} disabled={!crawlId || !!busy.cancel}>
                          {busy.cancel ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("取消中","Cancelling")}</> : t("取消","Cancel")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={onBatchStart} disabled={!!busy.batchStart}>
                          {busy.batchStart ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("批量中","Starting")}</> : t("批量开始","Batch start")}
                        </Button>
                        <Button variant="outline" size="sm" disabled={!batchId || !!busy.batchStatus} onClick={onBatchStatus}>
                          {busy.batchStatus ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("查询中","Fetching")}</> : t("批量状态","Batch status")}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={autoMatch}>{t("自动匹配","Auto match")}</Button>
                        <Button variant="outline" size="sm" onClick={clearMapping}>{t("清空","Clear")}</Button>
                        <Button variant="outline" size="sm" onClick={saveTemplate}>{t("保存模板","Save template")}</Button>
                        <Button variant="outline" size="sm" onClick={loadTemplate}>{t("加载模板","Load template")}</Button>
                      </div>
                    </div>
                    <div className="rounded-xl border bg-white/60 dark:bg-neutral-900/50 backdrop-blur p-0">
                      {statusMsg && (
                        <div className="px-3 py-2 text-xs text-muted-foreground border-b bg-white/50 dark:bg-neutral-900/40 flex items-center gap-2">
                          <Loader2 className={`size-3 ${Object.values(busy).some(Boolean) ? 'animate-spin' : ''}`} />
                          <span>{statusMsg}</span>
                        </div>
                      )}
                      <div className="max-h-[240px] overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-white/70 dark:bg-neutral-900/70 backdrop-blur">
                            <tr>
                              <th className="text-left px-3 py-2 w-[26%]">{t("字段","Field")}</th>
                              <th className="text-left px-3 py-2 w-[30%]">
                                {t("来源键","Source key")}
                                <div className="mt-1">
                                  <Input value={keySearch} onChange={(e) => setKeySearch(e.target.value)} placeholder={t("搜索键","Search keys")} className="h-7" />
                                </div>
                              </th>
                              <th className="text-left px-3 py-2 w-[22%]">{t("转换","Transform")}</th>
                              <th className="text-left px-3 py-2">{t("示例","Sample")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageFields.map((f) => (
                              <tr key={f.key} className="border-t">
                                <td className="px-3 py-2"><div className="font-medium">{f.label}</div><div className="text-xs text-muted-foreground">{f.key}</div></td>
                                <td className="px-3 py-2 space-y-1">
                                  <Input value={mapping[f.key] || ""} onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value }))} placeholder={t("如 title/desc/link","e.g. title/desc/link")} />
                                  <div className="flex flex-wrap gap-1">
                                    {candidatesForField(f).map((k) => (
                                      <button key={k} type="button" onClick={() => setMapping((m) => ({ ...m, [f.key]: k }))} className={`text-[10px] px-1.5 py-0.5 rounded border ${mapping[f.key] === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/70'}`}>{k}</button>
                                    ))}
                                    {f.required && !mapping[f.key] && (
                                      <span className="text-[10px] text-red-600 ml-1">{t("必填","Required")}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <Select value={mappingTransform[f.key] || suggestTransform(f.type, (sampleRecords?.[0] ?? {})[mapping[f.key] || ""]) } onValueChange={(v: any) => setMappingTransform((m) => ({ ...m, [f.key]: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {transformOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-3 py-2 text-xs text-muted-foreground truncate">{String(sampleRecords?.[0]?.[mapping[f.key] || ""]) || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between p-2 text-xs text-muted-foreground">
                        <div>{t("第","Page")} {mapPage}/{totalPages}</div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" disabled={mapPage<=1} onClick={() => setMapPage((p)=>Math.max(1,p-1))}>Prev</Button>
                          <Button variant="outline" size="sm" disabled={mapPage>=totalPages} onClick={() => setMapPage((p)=>Math.min(totalPages,p+1))}>Next</Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{t("预览","Preview")}</div>
                    <div className="rounded-xl border bg-white/60 dark:bg-neutral-900/50 backdrop-blur p-3 text-xs text-muted-foreground min-h-[120px]">
                      {t("Dry-run 后将在此显示：原始→规范化→字段映射对照。","After dry-run, original → normalized → field mapping diffs will appear here.")}
                    </div>
                  </section>
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between pt-3">
                <div className="text-xs text-muted-foreground">{t("来源与变更将被审计记录，支持回溯。","Source & changes are audited for traceability.")}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>{t("取消","Cancel")}</Button>
                  <Button variant="secondary" onClick={onDryRun}>{t("Dry-run 预览","Dry-run")}</Button>
                  <Button onClick={onRunNow}>{t("立即运行","Run now")}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}


