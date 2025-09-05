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

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appId: string
  lang?: "zh" | "en"
  dirId?: string
  dirName?: string
}

// Directory context is passed in from the caller; no cross-directory selection here

export function AIOpsDrawer({ open, onOpenChange, appId, lang = "zh", dirId, dirName }: Props) {
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

  // ensure we have a directory context
  useEffect(() => {
    if (!open) return
    setLoadingMeta(false)
    if (!dirId) {
      toast({ description: t("请先选择目录","Please select a directory first"), variant: "destructive" as any })
    }
  }, [open, dirId])

  const t = (zh: string, en: string) => (lang === "zh" ? zh : en)

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
    toast({ description: t("已提交 Dry-run，请稍等…","Dry-run submitted, please wait…") })
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


