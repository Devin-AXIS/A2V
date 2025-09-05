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
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appId: string
  lang?: "zh" | "en"
}

type ModuleItem = { id: string; name: string }
type DirectoryItem = { id: string; name: string; moduleId: string }

export function AIOpsDrawer({ open, onOpenChange, appId, lang = "zh" }: Props) {
  const { toast } = useToast()

  const [provider, setProvider] = useState<"firecrawl" | "scrapegraph">("firecrawl")
  const [urls, setUrls] = useState("")
  const [domain, setDomain] = useState("")
  const [nlRule, setNlRule] = useState("")
  const [schedulePreset, setSchedulePreset] = useState<"daily" | "weekend" | "weekdays" | "custom">("weekdays")
  const [timeOfDay, setTimeOfDay] = useState("09:30")
  const [customDays, setCustomDays] = useState<string[]>(["Mon","Tue","Wed","Thu","Fri"])
  const [dedupKey, setDedupKey] = useState<"url" | "externalId" | "titleWindow">("url")

  const [modules, setModules] = useState<ModuleItem[]>([])
  const [directories, setDirectories] = useState<DirectoryItem[]>([])
  const [targetModuleId, setTargetModuleId] = useState<string>("")
  const [targetDirId, setTargetDirId] = useState<string>("")
  const [loadingMeta, setLoadingMeta] = useState(false)

  // load modules and directories for current app
  useEffect(() => {
    if (!open) return
    let cancelled = false
    async function load() {
      setLoadingMeta(true)
      try {
        const modsRes = await api.applications.getApplicationModules(appId)
        const mods = (modsRes.success && modsRes.data?.modules) ? modsRes.data.modules : []
        const mList = mods.map((m: any) => ({ id: m.id, name: m.name })) as ModuleItem[]
        if (cancelled) return
        setModules(mList)

        // load dirs per module
        const dirLists = await Promise.all(mList.map(async (m) => {
          try {
            const dres = await api.directories.getDirectories({ applicationId: appId, moduleId: m.id })
            const list = (dres.success && dres.data?.directories) ? dres.data.directories : []
            return list.map((d: any) => ({ id: d.id, name: d.name, moduleId: m.id })) as DirectoryItem[]
          } catch {
            return [] as DirectoryItem[]
          }
        }))
        if (cancelled) return
        const all = dirLists.flat()
        setDirectories(all)
        if (mList.length && !targetModuleId) setTargetModuleId(mList[0].id)
        const firstDir = all.find(d => d.moduleId === (targetModuleId || mList[0]?.id))
        if (firstDir && !targetDirId) setTargetDirId(firstDir.id)
      } finally {
        if (!cancelled) setLoadingMeta(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [open, appId])

  const t = (zh: string, en: string) => (lang === "zh" ? zh : en)

  const dayOptions = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

  const selectedDirs = useMemo(() => directories.filter(d => d.moduleId === targetModuleId), [directories, targetModuleId])

  function toggleCustomDay(day: string) {
    setCustomDays((s) => s.includes(day) ? s.filter(d => d !== day) : [...s, day])
  }

  function onDryRun() {
    toast({ description: t("已提交 Dry-run，请稍等…","Dry-run submitted, please wait…") })
  }

  function onRunNow() {
    toast({ description: t("已开始运行，后台执行中","Run started in background") })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-none">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="rounded-2xl border bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md shadow-sm">
            <DrawerHeader className="pb-2">
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
                    <div className="text-sm font-medium">{t("目标与映射","Target & mapping")}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>{t("目标模块","Module")}</Label>
                        <Select value={targetModuleId} onValueChange={(v) => setTargetModuleId(v)} disabled={loadingMeta || modules.length === 0}>
                          <SelectTrigger><SelectValue placeholder={t("选择模块","Select module")} /></SelectTrigger>
                          <SelectContent>
                            {modules.map(m => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>{t("目标目录","Directory")}</Label>
                        <Select value={targetDirId} onValueChange={(v) => setTargetDirId(v)} disabled={loadingMeta || selectedDirs.length === 0}>
                          <SelectTrigger><SelectValue placeholder={t("选择目录","Select directory")} /></SelectTrigger>
                          <SelectContent>
                            {selectedDirs.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

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
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>{t("预设","Preset")}</Label>
                          <Select value={schedulePreset} onValueChange={(v: any) => setSchedulePreset(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekdays">{t("工作日","Weekdays")}</SelectItem>
                              <SelectItem value="weekend">{t("周末","Weekend")}</SelectItem>
                              <SelectItem value="daily">{t("每天","Daily")}</SelectItem>
                              <SelectItem value="custom">{t("自定义","Custom")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>{t("时间","Time")}</Label>
                          <Input type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
                        </div>
                      </div>
                      {schedulePreset === "custom" && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {dayOptions.map(d => (
                            <button key={d} className={`px-2.5 py-1 rounded-md text-xs border ${customDays.includes(d) ? "bg-blue-600 text-white border-blue-600" : "bg-white/60 dark:bg-neutral-900/60"}`} onClick={() => toggleCustomDay(d)} type="button">{d}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-3 lg:col-span-2">
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


