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

const isType = (obj) => {
  return Object.prototype.toString.call(obj).split(' ')[1].split(']')[0]
}

/**
 * 将JSON路径按最长公共前缀进行分组
 * @param pathMapping 包含键值对的对象，值为JSON路径字符串
 * @returns 按最长公共前缀分组的对象，键为最长公共前缀路径，值为包含该前缀的键名数组
 * 
 * @example
 * const input = {
 *   a: "$.items.result.jobs.salary",
 *   b: "$.items.result.jobs.job_title", 
 *   c: "$.items.status.success"
 * }
 * 
 * const result = groupPathsByPrefix(input)
 * // 返回: {
 * //   "$.items.result": ["a", "b"],
 * //   "$.items.status": ["c"]
 * // }
 */
function groupPathsByPrefix(pathMapping: Record<string, string>): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  // 遍历所有键值对
  for (const [key, path] of Object.entries(pathMapping)) {
    // 将路径按点分割
    const pathParts = path.split('.')

    // 生成所有可能的前缀（从最短到最长）
    for (let i = 1; i <= pathParts.length; i++) {
      const prefix = pathParts.slice(0, i).join('.')

      // 如果这个前缀还没有在结果中，创建空数组
      if (!result[prefix]) {
        result[prefix] = []
      }

      // 将当前键添加到这个前缀的数组中
      result[prefix].push(key)
    }
  }

  // 过滤掉只有一个键的前缀，只保留有多个键共享的前缀
  const multiKeyPrefixes: Record<string, string[]> = {}
  for (const [prefix, keys] of Object.entries(result)) {
    if (keys.length > 1) {
      multiKeyPrefixes[prefix] = keys
    }
  }

  // 找到每个键的最长公共前缀
  const finalResult: Record<string, string[]> = {}
  const processedKeys = new Set<string>()

  // 按前缀长度从长到短排序，优先处理更长的前缀
  const sortedPrefixes = Object.keys(multiKeyPrefixes).sort((a, b) => b.length - a.length)

  for (const prefix of sortedPrefixes) {
    const keys = multiKeyPrefixes[prefix]

    // 检查这些键是否已经被处理过
    const unprocessedKeys = keys.filter(key => !processedKeys.has(key))

    if (unprocessedKeys.length > 1) {
      // 标记这些键为已处理
      unprocessedKeys.forEach(key => processedKeys.add(key))
      finalResult[prefix] = unprocessedKeys
    }
  }

  return finalResult
}

const getJsonDataByPath = (path, data) => {
  const parts = path.split('.')
  let cur = data
  for (let i = 0; i < parts.length; i++) {
    cur = cur[parts[i]]
    if (isType(cur) === 'Array') {
      return [cur, parts[i + 1]];
    }
  }
  return [cur]
}

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
  const [customDays, setCustomDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"])
  const [tz, setTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai")
  const [intervalHours, setIntervalHours] = useState<string>("")
  const [dedupKey, setDedupKey] = useState<"url" | "externalId" | "titleWindow">("url")
  const [captured, setCaptured] = useState<boolean>(false)

  const [loadingMeta, setLoadingMeta] = useState(false)
  const [runOnce, setRunOnce] = useState(false)
  const [dom, setDom] = useState<string>("1")
  const [oneDate, setOneDate] = useState<string>("")

  // i18n helper must be declared before any use (e.g., in mockFields)
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en)

  // ===== Mock extracted JSON & array path selection (local only) =====
  const mockExtracted = useMemo(() => ({
    items: Array.from({ length: 6 }).map((_, i) => ({
      title: `Senior Frontend Engineer ${i + 1}`,
      desc: `React/Next.js · TypeScript · UI/UX`,
      salary: 20_000 + i * 1000,
      city: ["北京", "上海", "深圳"][i % 3],
      company: ["AINO", "Axis", "Nova"][i % 3],
      link: `https://jobs.example.com/${i + 1}`,
      posted_at: "2025-09-01",
    })),
    data: [{ name: "fallback" }],
    results: [],
  }), [])
  const arrayPathOptions = ["$.items", "$.data", "$.results"]
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
  const [upserting, setUpserting] = useState<boolean>(false)
  const [upsertProgress, setUpsertProgress] = useState<{ total: number; done: number; ok: number; fail: number }>({ total: 0, done: 0, ok: 0, fail: 0 })

  // mock fields for mapping UI
  type MockField = { key: string; label: string; type: 'text' | 'number' | 'date' | 'tags' | 'url' | 'boolean' | 'select' | 'multiselect'; required?: boolean }
  const mockFields = useMemo<MockField[]>(() => {
    if (Array.isArray(dirFields) && dirFields.length > 0) {
      const fields = [];
      dirFields.map((f: any) => {
        if (f.type === "meta_items") {
          f.metaItemsConfig.fields.map((field: any) => {
            fields.push({
              parentKey: f.key,
              key: `${f.key}::${field.id}`,
              label: `${f.label || f.key}-${field.label}`,
              originLabel: field.label,
              type: field.type,
              required: !!field.required,
            });
          });
        } else {
          const field = {
            key: f.key,
            label: f.label || f.key,
            type: (f.type || 'text') as any,
            required: !!f.required,
          };
          fields.push(field);
        }
      })
      return fields;
    }
    // fallback demo
    return [
      { key: "title", label: t("标题", "Title"), type: 'text', required: true },
      { key: "description", label: t("描述", "Description"), type: 'text' },
      { key: "salary", label: t("薪资", "Salary"), type: 'number' },
      { key: "city", label: t("城市", "City"), type: 'text' },
      { key: "company", label: t("公司", "Company"), type: 'text' },
      { key: "url", label: "URL", type: 'url' },
    ]
  }, [dirFields, lang])
  const [mapPage, setMapPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(mockFields.length / pageSize))
  const pageFields = useMemo(() => mockFields.slice((mapPage - 1) * pageSize, mapPage * pageSize), [mockFields, mapPage])
  const [mapping, setMapping] = useState<Record<string, string>>({}) // fieldKey -> sourceKey
  const [mappingTransform, setMappingTransform] = useState<Record<string, string>>({}) // fieldKey -> transform
  const [progressMap, setProgressMap] = useState<Record<string, { arrayPath: string; labelKey: string; valueKey: string; statusKey?: string; weightKey?: string; aggregation: 'weightedAverage' | 'max' | 'min' }>>({})
  const [sampleSourceKeys, setSampleSourceKeys] = useState<string[]>([])
  const [keySearch, setKeySearch] = useState("")
  const [saveMsg, setSaveMsg] = useState("")
  const [previewJson, setPreviewJson] = useState<string>("")

  // 分析采集回来的数据结构，提取可用字段
  function analyzeScrapedData(data: any[]): string[] {
    if (!data || data.length === 0) return []

    const fields = new Set<string>()

    // 分析第一个数据项的所有字段
    const firstItem = data[0]
    if (firstItem && typeof firstItem === 'object') {
      // 递归提取所有字段路径
      function extractFields(obj: any, prefix = ''): void {
        for (const [key, value] of Object.entries(obj)) {
          const fieldPath = prefix ? `${prefix}.${key}` : key

          // 如果是基本类型，添加到字段列表
          if (value !== null && value !== undefined &&
            (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
            fields.add(fieldPath)
          }
          // 如果是对象，递归处理
          else if (value && typeof value === 'object' && !Array.isArray(value)) {
            extractFields(value, fieldPath)
          }
          // 如果是数组，添加数组路径，并分析数组内对象的字段
          else if (Array.isArray(value)) {
            fields.add(fieldPath)
            // 分析数组内第一个对象的字段
            if (value.length > 0 && value[0] && typeof value[0] === 'object') {
              extractFields(value[0], fieldPath)
            }
          }
        }
      }

      extractFields(firstItem)
    }

    return Array.from(fields).sort()
  }

  // 规范化路径，确保以 $. 开头
  function ensureAbsolutePath(p: string): string {
    if (!p) return p
    return p.startsWith('$.') || p === '$' ? p : (p.startsWith('$') ? `$.${p.slice(1)}` : `$.${p}`)
  }

  // 将相对路径与当前数组路径组合成完整候选，如 $.result.jobs.title
  function addArrayPathPrefix(relativeKey: string, arrPath: string): string {
    const base = ensureAbsolutePath(arrPath || '$')
    const rel = relativeKey.replace(/^\$\.?/, '')
    const sep = base.endsWith('.') || base === '$' ? '' : '.'
    return `${base}${sep}${rel}`
  }

  // 当采集数据更新时，自动分析字段
  useEffect(() => {
    if (sampleRecords && sampleRecords.length > 0) {
      const extractedFields = analyzeScrapedData(sampleRecords)
      // 同时提供：
      // 1) 相对键: title
      // 2) 分层相对键: jobs.title / result.jobs.title（来自 arrayPath 的各层）
      // 3) 绝对键: $.jobs.title / $.result.jobs.title
      const absBase = (ensureAbsolutePath(arrayPath) || '').replace(/^\$\.?/, '')
      const parts = absBase.split('.').filter(Boolean)
      const layeredPrefixes: string[] = []
      for (let i = 1; i <= parts.length; i++) {
        layeredPrefixes.push(parts.slice(parts.length - i).join('.'))
      }
      const layeredRel = extractedFields.flatMap(k => layeredPrefixes.map(p => `${p}.${k}`))
      const layeredAbs = layeredRel.map(k => ensureAbsolutePath(k))
      const withAbsFull = extractedFields.map(k => addArrayPathPrefix(k, arrayPath))
      const keys = Array.from(new Set([...
        extractedFields,
      ...layeredRel,
      ...layeredAbs,
      ...withAbsFull,
      ])).sort()
      setSampleSourceKeys(keys)

      // 自动进行字段匹配
      autoMatchFromScrapedData(keys)
    }
  }, [sampleRecords])

  // 基于实际采集数据自动匹配字段
  function autoMatchFromScrapedData(availableFields: string[]) {
    const next: Record<string, string> = {}

    // 智能匹配规则
    const matchRules = {
      'title': ['title', 'name', 'job_title', 'position', '职位', '岗位', '名称', 'jobName', 'positionName'],
      'description': ['description', 'desc', 'content', 'detail', '描述', '内容', '详情', '介绍', 'jobDesc', 'jobDescription'],
      'salary': ['salary', 'pay', 'wage', '薪资', '工资', '待遇', '报酬', 'money', 'compensation'],
      'city': ['city', 'location', 'address', '城市', '地点', '地址', '位置', 'area', 'region'],
      'company': ['company', 'employer', 'corp', '公司', '企业', '雇主', 'companyName', 'employerName'],
      'url': ['url', 'link', 'href', '链接', '网址', 'jobUrl', 'detailUrl'],
      'date': ['date', 'time', 'created', 'posted', '日期', '时间', '发布时间', 'publishTime', 'createTime'],
      'experience': ['experience', 'exp', 'years', '经验', '年限', 'workExp', 'workExperience'],
      'education': ['education', 'degree', '学历', '学位', 'edu', 'educationLevel'],
      'type': ['type', 'category', 'kind', '类型', '分类', 'jobType', 'category'],
      'level': ['level', 'grade', '级别', '等级', 'jobLevel', 'positionLevel'],
      'skills': ['skills', 'requirements', '技能', '要求', '要求技能', 'jobSkills', 'requiredSkills'],
      'benefits': ['benefits', 'perks', '福利', '待遇', 'jobBenefits', 'companyBenefits'],
    }

    for (const f of mockFields) {
      // 首先尝试精确匹配
      const exactMatch = availableFields.find(field =>
        matchRules[f.key]?.some(rule =>
          field.toLowerCase().includes(rule.toLowerCase()) ||
          rule.toLowerCase().includes(field.toLowerCase())
        )
      )

      if (exactMatch) {
        next[f.key] = exactMatch
        continue
      }

      // 然后尝试模糊匹配
      const fuzzyMatch = availableFields.find(field =>
        field.toLowerCase().includes(f.key.toLowerCase().slice(0, 4)) ||
        f.key.toLowerCase().includes(field.toLowerCase().slice(0, 4))
      )

      if (fuzzyMatch) {
        next[f.key] = fuzzyMatch
      }
    }

    setMapping(next)
    if (Object.keys(next).length > 0) {
      toast({ description: t("已自动匹配采集数据字段", "Auto matched scraped data fields") })
    }
  }

  function autoMatch() {
    const next: Record<string, string> = {}

    // 智能匹配规则
    const matchRules = {
      // 标题相关
      'title': ['title', 'name', 'job_title', 'position', '职位', '岗位', '名称'],
      'description': ['description', 'desc', 'content', 'detail', '描述', '内容', '详情', '介绍'],
      'salary': ['salary', 'pay', 'wage', '薪资', '工资', '待遇', '报酬'],
      'city': ['city', 'location', 'address', '城市', '地点', '地址', '位置'],
      'company': ['company', 'employer', 'corp', '公司', '企业', '雇主'],
      'url': ['url', 'link', 'href', '链接', '网址'],
      'date': ['date', 'time', 'created', 'posted', '日期', '时间', '发布时间'],
      'experience': ['experience', 'exp', 'years', '经验', '年限'],
      'education': ['education', 'degree', '学历', '学位'],
      'type': ['type', 'category', 'kind', '类型', '分类'],
      'level': ['level', 'grade', '级别', '等级'],
      'skills': ['skills', 'requirements', '技能', '要求', '要求技能'],
      'benefits': ['benefits', 'perks', '福利', '待遇'],
    }

    for (const f of mockFields) {
      // 首先尝试精确匹配
      const exactMatch = sampleSourceKeys.find(s =>
        matchRules[f.key]?.some(rule => s.toLowerCase().includes(rule.toLowerCase()))
      )

      if (exactMatch) {
        next[f.key] = exactMatch
        continue
      }

      // 然后尝试模糊匹配
      const fuzzyMatch = sampleSourceKeys.find(s =>
        s.toLowerCase().includes(f.key.toLowerCase().slice(0, 4)) ||
        f.key.toLowerCase().includes(s.toLowerCase().slice(0, 4))
      )

      if (fuzzyMatch) {
        next[f.key] = fuzzyMatch
      }
    }

    setMapping(next)
    toast({ description: t("已自动匹配相近字段", "Auto matched similar fields") })
  }
  function clearMapping() {
    setMapping({})
  }

  const transformOptions = [
    { value: "none", label: t("无", "None") },
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
    // 使用从采集数据中提取的字段，如果没有则使用默认字段
    const availableFields = sampleSourceKeys.length > 0 ? sampleSourceKeys : sampleKeys

    const list = availableFields
      .map((k) => ({ k, s: scoreKey(f.key, k) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.k)
    const filtered = keySearch ? list.filter(k => k.toLowerCase().includes(keySearch.toLowerCase())) : list
    const resultList = [];

    (filtered || []).forEach(key => {
      if (key.startsWith(arrayPath)) {
        resultList.push(key)
      }
    })
    return resultList.slice(0, 8) // 显示更多候选字段
  }

  // ---------- Progress helpers ----------
  function getByPath(obj: any, path: string): any {
    if (!obj || !path) return undefined

    console.log(`🔍 getByPath 输入:`, { obj, path, arrayPath })

    // 处理路径，去除 $ 前缀
    let p = path.replace(/^\$\.?/, '')

    // 如果路径以 arrayPath 开头，去掉 arrayPath 部分
    const absArrayPath = ensureAbsolutePath(arrayPath).replace(/^\$\.?/, '')
    if (absArrayPath && p.startsWith(absArrayPath)) {
      p = p.slice(absArrayPath.length)
      if (p.startsWith('.')) p = p.slice(1)
    }

    console.log(`🔍 处理后的路径:`, p)

    const parts = p.split('.').filter(Boolean)
    let cur = obj

    for (const part of parts) {
      console.log(`🔍 访问路径部分: ${part}, 当前值:`, cur)
      if (cur && typeof cur === 'object') {
        cur = cur[part]
        console.log(`🔍 获取到值:`, cur)
      } else {
        console.log(`🔍 路径中断，返回 undefined`)
        return undefined
      }
    }

    console.log(`🔍 最终结果:`, cur)
    return cur
  }
  function calcProgressAggregate(items: Array<{ value?: number; weight?: number }>, mode: 'weightedAverage' | 'max' | 'min' = 'weightedAverage'): number {
    const vals = items.map(it => ({ v: Number(it.value ?? 0), w: Number(it.weight ?? 1) }))
    if (mode === 'max') return Math.max(0, ...vals.map(x => x.v))
    if (mode === 'min') return Math.min(100, ...vals.map(x => x.v))
    const sumW = vals.reduce((a, b) => a + (isFinite(b.w) ? b.w : 0), 0) || 1
    const sum = vals.reduce((a, b) => a + ((isFinite(b.v) ? b.v : 0) * (isFinite(b.w) ? b.w : 0)), 0)
    const r = sum / sumW
    return Math.max(0, Math.min(100, Math.round(r)))
  }

  function toNumberLike(v: any): number {
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const m = v.match(/([0-9]+(?:\.[0-9]+)?)/)
      if (m) return Number(m[1])
    }
    return Number(v) || 0
  }
  function applyTransformVal(raw: any, t: string): any {
    switch (t) {
      case 'trim': return typeof raw === 'string' ? raw.trim() : raw
      case 'toNumber': return toNumberLike(raw)
      case 'parseDate': return raw
      case 'splitTags': return typeof raw === 'string' ? raw.split(/[，,\s]+/).filter(Boolean) : Array.isArray(raw) ? raw : []
      default: return raw
    }
  }

  // LOG: AI运营关键函数，提取字段并入库
  async function onUpsert() {
    try {
      if (!dirId) {
        toast({ description: t("缺少目录ID，无法入库", "Missing directory id"), variant: 'destructive' as any })
        return
      }
      if (!sampleRecords || sampleRecords.length === 0) {
        toast({ description: t('暂无样例，请先抓取或爬取。', 'No samples yet. Scrape/crawl first.'), variant: 'destructive' as any })
        return
      }

      // 取数组数据：根据 arrayPath 从 sampleRecords 中提取目标数组
      const list = (() => {
        console.log('🔍 开始提取数组数据:', { arrayPath, sampleRecords })

        let firstItem;
        const list = [];
        // 如果 arrayPath 是 $.items，说明要从 sampleRecords 中取第一个对象的某个数组字段
        if (arrayPath === '$.items' && sampleRecords && sampleRecords.length > 0) {
          firstItem = sampleRecords[0]
          firstItem = firstItem;
        }

        let publicMappings = groupPathsByPrefix(mapping);
        for (let mappingKey in mapping) {
          if (mapping[mappingKey].indexOf('$.items.') > -1) {
            mapping[mappingKey] = mapping[mappingKey].replace('$.items.', "")
          }
        }
        Object.keys(publicMappings).map((key) => {
          publicMappings[key.replace('$.items.', "")] = publicMappings[key]
        })
        for (let publicKey in publicMappings) {
          if (publicKey.indexOf('$.items.') > -1) {
            delete publicMappings[publicKey]
          }
        }

        for (let publicKey in publicMappings) {
          const currentPublicKey = publicMappings[publicKey];
          currentPublicKey.forEach((mappingKey, index) => {
            if (mapping[mappingKey]) {
              publicMappings[publicKey][index] = {
                [mappingKey]: mapping[mappingKey].replace(`${publicKey}.`, ""),
              }
            }
          })
        }

        // id: "81t57gtt0b9",
        // images: [],
        // label: "项 1",
        // numbers: [],
        // texts: [
        //   {id: "jmulwhv648a", label: "工作年限", value: "a", fieldId: "jmulwhv648a"}
        //   {id: "ojbhcxb0a2", label: "月度工资占比", value: "v", fieldId: "ojbhcxb0a2"}
        //   {id: "igwku3x0k3q", label: "新增岗位数量", value: "c", fieldId: "igwku3x0k3q"}
        // ]s

        // return;

        for (let publicKey in publicMappings) {
          const currentMappings = publicMappings[publicKey];
          const [datas, nextKey] = getJsonDataByPath(publicKey, firstItem)
          if (datas instanceof Array) {
            datas.forEach((data, dataIndex) => {
              const listItem = {};
              currentMappings.forEach(currentMapping => {
                Object.keys(currentMapping).forEach((key, currentMappingIndex) => {
                  const [parentKey, childKey] = key.split("::");
                  if (childKey) {
                    if (!listItem[parentKey]) {
                      listItem[parentKey] = [{
                        images: [],
                        label: `项 1`,
                        numbers: [],
                        texts: [],
                      }];
                    }
                    listItem[parentKey][0].texts.push({ id: childKey, value: data[nextKey || currentMapping[key]], fieldId: childKey })
                  } else {
                    listItem[key] = data[nextKey || currentMapping[key]];
                  }
                })
              })
              list[dataIndex] = { ...list[dataIndex], ...listItem };
            })
          } else if (isType(datas) === 'Object') {
            let listItem = {};
            Object.keys(currentMapping).forEach(key => {
              listItem[key] = datas[currentMapping[key]]
            });
            list.push(listItem);
          } else {
            let listItem = {};
            Object.keys(currentMapping).forEach(key => {
              listItem[key] = datas;
            });
            list.push(listItem);
          }
        }
        return list;
      })()

      if (list.length === 0) {
        toast({ description: t('未找到可入库的数据数组', 'No array data to upsert'), variant: 'destructive' as any })
        return
      }

      // 认证
      let token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null
      if (!token) token = 'test-token'

      setUpserting(true)
      setUpsertProgress({ total: list.length, done: 0, ok: 0, fail: 0 })
      setStatusMsg(t('正在入库…', 'Upserting…'))

      const base = getApiBase()
      let ok = 0, fail = 0, done = 0

      // 顺序逐条入库，避免并发带来的速率与顺序问题
      for (const rec of list) {
        try {
          const r = await fetch(`${base}/api/records/${encodeURIComponent(String(dirId))}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ props: rec })
          })
          if (!r.ok) throw new Error(await r.text().catch(() => 'create failed'))
          ok += 1
        } catch (e) {
          console.error('Upsert failed:', e)
          fail += 1
        } finally {
          done += 1
          setUpsertProgress({ total: list.length, done, ok, fail })
        }
      }

      const msg = t(`入库完成：成功 ${ok}，失败 ${fail}`, `Upsert done: ok ${ok}, fail ${fail}`)
      toast({ description: msg })
      setStatusMsg(msg)
    } finally {
      setUpserting(false)
    }
  }

  function onLocalPreview() {
    if (!sampleRecords || sampleRecords.length === 0) {
      toast({ description: t('暂无样例，请先抓取或爬取。', 'No samples yet. Scrape/crawl first.'), variant: 'destructive' as any })
      return
    }
    const rec = sampleRecords[0]
    const out: Record<string, any> = {}
    // map normal fields
    for (const f of mockFields) {
      if (f.key === 'progress') continue
      const path = mapping[f.key]
      if (!path) continue
      const val = getByPath(rec, path)
      const tv = applyTransformVal(val, mappingTransform[f.key] || suggestTransform(f.type, val))
      out[f.key] = tv
    }
    // progress items
    const pcfg = progressMap['progress'] || { arrayPath: '$.progress', labelKey: 'label', valueKey: 'value', statusKey: 'status', weightKey: 'weight', aggregation: 'weightedAverage' as const }
    let arr = getByPath(rec, pcfg.arrayPath)
    let items: Array<any> = []
    if (Array.isArray(arr)) {
      items = arr.map((it: any, idx: number) => ({
        id: String(idx + 1),
        key: String(it[pcfg.labelKey] || `p${idx + 1}`),
        label: String(it[pcfg.labelKey] || `Progress ${idx + 1}`),
        value: Math.max(0, Math.min(100, toNumberLike(it[pcfg.valueKey]))),
        status: it[pcfg.statusKey || 'status'] || undefined,
        weight: it[pcfg.weightKey || 'weight'] !== undefined ? toNumberLike(it[pcfg.weightKey || 'weight']) : 1,
      }))
    } else if (mapping['progress']) {
      // fallback: single numeric path to one item
      const v = toNumberLike(getByPath(rec, mapping['progress']))
      items = [{ id: '1', key: 'progress', label: 'Progress', value: Math.max(0, Math.min(100, v)), weight: 1 }]
    }
    out['progress'] = { items, aggregated: calcProgressAggregate(items, pcfg.aggregation) }
    setPreviewJson(JSON.stringify({ original: rec, mapped: out }, null, 2))
    // toast({ description: t('本地预览已生成', 'Local preview generated') })
  }

  // ---------- Mapping template (local) ----------
  function tplKey() { return `aino_aiops_mapping_${appId}_${dirId || 'dir'}` }
  function saveTemplate() {
    try {
      const payload = { mapping, mappingTransform, when: Date.now() }
      localStorage.setItem(tplKey(), JSON.stringify(payload))
      setSaveMsg(t("映射模板已保存", "Mapping template saved"))
      toast({ description: t("映射模板已保存", "Mapping template saved") })
    } catch (e) {
      toast({ description: t("保存失败", "Save failed"), variant: 'destructive' as any })
    }
  }
  function loadTemplate() {
    try {
      const raw = localStorage.getItem(tplKey())
      if (!raw) { toast({ description: t("未找到模板", "No template found"), variant: 'destructive' as any }); return }
      const p = JSON.parse(raw || '{}')
      setMapping(p.mapping || {})
      setMappingTransform(p.mappingTransform || {})
      toast({ description: t("模板已加载", "Template loaded") })
    } catch (e) {
      toast({ description: t("加载失败", "Load failed"), variant: 'destructive' as any })
    }
  }

  // ensure we have a directory context
  useEffect(() => {
    if (!open) return
    setLoadingMeta(false)
    if (!dirId) {
      toast({ description: t("请先选择目录", "Please select a directory first"), variant: "destructive" as any })
    }
  }, [open, dirId])


  const dayKeys = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
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
      toast({ description: t("请先在设置/授权管理中配置 OpenAI Endpoint 与 Key", "Please configure OpenAI Endpoint & Key in Settings/Authorization first"), variant: "destructive" as any })
      return
    }
    toast({ description: t("已提交 Dry-run，请稍等…", "Dry-run submitted, please wait…") })
    // demo call: send a tiny parse task to server AI gateway
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://47.94.52.142:3007'}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-aino-openai-endpoint': endpoint,
        'x-aino-openai-key': key,
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] }),
    }).then(async (r) => {
      if (!r.ok) throw new Error(await r.text())
      toast({ description: t("AI 网关已响应", "AI gateway responded") })
    }).catch((e) => {
      console.error(e)
      toast({ description: t("AI 网关调用失败", "AI gateway call failed"), variant: "destructive" as any })
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
    return process.env.NEXT_PUBLIC_API_URL || 'http://47.94.52.142:3007'
  }

  async function onScrapeTest() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey) {
      toast({ description: t("请先在授权管理配置 Firecrawl Key", "Please configure Firecrawl Key in Authorization"), variant: "destructive" as any })
      return
    }
    const firstUrl = (urls.split(/\n+/).map(s => s.trim()).filter(Boolean)[0]) || domain || ''
    if (!firstUrl) {
      toast({ description: t("请输入至少一个 URL 或域名", "Please enter at least one URL or domain"), variant: "destructive" as any })
      return
    }
    try {
      setBusy((b) => ({ ...b, scrape: true }))
      setStatusMsg(t("正在抓取样例…", "Scraping sample…"))

      // 获取认证token
      let token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null
      if (!token) {
        token = 'test-token'
      }

      const r = await fetch(`${getApiBase()}/api/crawl/scrape`, {
        method: 'POST',
        mode: 'cors' as RequestMode,
        credentials: 'include' as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-aino-firecrawl-key': firecrawlKey
        },
        body: JSON.stringify({
          url: firstUrl,
          domain: domain,
          nlRule: nlRule,
          options: { formats: ['markdown', 'html'] }
        })
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'scrape failed')
      // 以返回对象生成样例记录，具体结构以 Firecrawl 返回为准
      const rec = Array.isArray(data?.data?.data) ? data.data.data : [data?.data]
      setExtractedOverride(rec || [])
      toast({ description: t("已抓取样例，已回填到预览", "Scraped sample filled into preview") })
      setStatusMsg(t("抓取完成", "Scrape done"))
    } catch (e) {
      console.error(e)
      toast({ description: t("抓取失败", "Scrape failed"), variant: "destructive" as any })
      setStatusMsg(t("抓取失败", "Scrape failed"))
    } finally { setBusy((b) => ({ ...b, scrape: false })) }
  }

  async function onCrawlStart() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey) {
      toast({ description: t("请先在授权管理配置 Firecrawl Key", "Please configure Firecrawl Key in Authorization"), variant: "destructive" as any })
      return
    }
    const startUrl = domain || (urls.split(/\n+/).map(s => s.trim()).filter(Boolean)[0]) || ''
    if (!startUrl) {
      toast({ description: t("请输入域名或 URL", "Please enter a domain or URL"), variant: "destructive" as any })
      return
    }
    try {
      setBusy((b) => ({ ...b, crawlStart: true }))
      setStatusMsg(t("正在启动爬取…", "Starting crawl…"))

      // 获取认证token
      let token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null
      if (!token) {
        token = 'test-token'
      }

      const r = await fetch(`${getApiBase()}/api/crawl/start`, {
        method: 'POST',
        mode: 'cors' as RequestMode,
        credentials: 'include' as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-aino-firecrawl-key': firecrawlKey
        },
        body: JSON.stringify({
          urls: [startUrl],
          domain: domain,
          nlRule: nlRule,
          options: { limit: 10 }
        })
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'start failed')
      const id = data?.data?.id || data?.data?.jobId || ''
      setCrawlId(id)
      toast({ description: id ? t("已启动爬取，点击查看状态", "Crawl started, click to check status") : t("已启动爬取", "Crawl started") })
      setStatusMsg(id ? t("爬取已启动：", "Crawl started: ") + id : t("爬取已启动", "Crawl started"))
    } catch (e) {
      console.error(e)
      toast({ description: t("启动失败", "Start failed"), variant: "destructive" as any })
      setStatusMsg(t("启动失败", "Start failed"))
    } finally { setBusy((b) => ({ ...b, crawlStart: false })) }
  }

  async function onCrawlStatus() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey || !crawlId) return
    try {
      setBusy((b) => ({ ...b, crawlStatus: true }))
      setStatusMsg(t("正在获取状态…", "Fetching status…"))

      // 获取认证token
      let token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null
      if (!token) {
        token = 'test-token'
      }

      const r = await fetch(`${getApiBase()}/api/crawl/status/${encodeURIComponent(crawlId)}`, {
        mode: 'cors' as RequestMode,
        credentials: 'include' as RequestCredentials,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-aino-firecrawl-key': firecrawlKey
        }
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'status failed')
      const docs = data?.data?.data || []
      if (Array.isArray(docs) && docs.length) {
        setExtractedOverride(docs)
        toast({ description: t("已更新预览数据", "Preview updated") })
      }
      setStatusMsg(t("状态已更新", "Status updated"))
    } catch (e) {
      console.error(e)
      toast({ description: t("获取状态失败", "Fetch status failed"), variant: "destructive" as any })
      setStatusMsg(t("获取状态失败", "Fetch status failed"))
    } finally { setBusy((b) => ({ ...b, crawlStatus: false })) }
  }

  async function onBatchStart() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey) {
      toast({ description: t("请先在授权管理配置 Firecrawl Key", "Please configure Firecrawl Key in Authorization"), variant: "destructive" as any })
      return
    }
    const list = urls.split(/\n+/).map(s => s.trim()).filter(Boolean)
    if (list.length === 0) {
      toast({ description: t("请在 URL 列表输入若干地址", "Please input some URLs in list"), variant: "destructive" as any })
      return
    }
    try {
      setBusy((b) => ({ ...b, batchStart: true }))
      setStatusMsg(t("正在启动批量抓取…", "Starting batch…"))

      // 获取认证token
      let token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null
      if (!token) {
        token = 'test-token'
      }

      const r = await fetch(`${getApiBase()}/api/crawl/batch/start`, {
        method: 'POST',
        mode: 'cors' as RequestMode,
        credentials: 'include' as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-aino-firecrawl-key': firecrawlKey
        },
        body: JSON.stringify({
          urls: list,
          domain: domain,
          nlRule: nlRule,
          options: { options: { formats: ['markdown'] } }
        })
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'batch start failed')
      const id = data?.data?.id || data?.data?.jobId || ''
      setBatchId(id)
      toast({ description: id ? t("已启动批量抓取", "Batch started") : t("已启动", "Started") })
      setStatusMsg(id ? t("批量抓取已启动：", "Batch started: ") + id : t("批量抓取已启动", "Batch started"))
    } catch (e) {
      console.error(e)
      toast({ description: t("批量启动失败", "Batch start failed"), variant: "destructive" as any })
      setStatusMsg(t("批量启动失败", "Batch start failed"))
    } finally { setBusy((b) => ({ ...b, batchStart: false })) }
  }

  async function captureTemplate() {
    setCaptured(true)
    let token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null
    if (!token) {
      token = 'test-token'
    }

    const r = await fetch(`${getApiBase()}/api/crawler/tanzhi/jobs`, {
      method: 'GET',
      mode: 'cors' as RequestMode,
      credentials: 'include' as RequestCredentials,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || data?.success === false) throw new Error(data?.message || 'batch start failed')
    setExtractedOverride([{
      result: {
        jobs: data.data
      }
    }]);
    setCaptured(false);
  }

  async function onBatchStatus() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey || !batchId) return
    try {
      setBusy((b) => ({ ...b, batchStatus: true }))

      // 获取认证token
      let token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null
      if (!token) {
        token = 'test-token'
      }

      const r = await fetch(`${getApiBase()}/api/crawl/batch/status/${encodeURIComponent(batchId)}`, {
        mode: 'cors' as RequestMode,
        credentials: 'include' as RequestCredentials,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-aino-firecrawl-key': firecrawlKey
        }
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.success === false) throw new Error(data?.message || 'batch status failed')
      const docs = data?.data?.data || []
      if (Array.isArray(docs) && docs.length) {
        setExtractedOverride(docs)
        toast({ description: t("已更新批量预览", "Batch preview updated") })
      }
      setStatusMsg(t("批量状态已更新", "Batch status updated"))
    } catch (e) {
      console.error(e)
      toast({ description: t("获取批量状态失败", "Fetch batch status failed"), variant: "destructive" as any })
      setStatusMsg(t("获取批量状态失败", "Fetch batch status failed"))
    } finally { setBusy((b) => ({ ...b, batchStatus: false })) }
  }

  async function onCrawlCancel() {
    const { firecrawlKey } = readAuth()
    if (!firecrawlKey || !crawlId) return
    try {
      setBusy((b) => ({ ...b, cancel: true }))

      // 获取认证token
      let token = typeof window !== 'undefined' ? localStorage.getItem('aino_token') : null
      if (!token) {
        token = 'test-token'
      }

      const r = await fetch(`${getApiBase()}/api/crawl/cancel/${encodeURIComponent(crawlId)}`, {
        method: 'POST',
        mode: 'cors' as RequestMode,
        credentials: 'include' as RequestCredentials,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-aino-firecrawl-key': firecrawlKey
        }
      })
      const ok = r.ok
      toast({ description: ok ? t("已取消", "Cancelled") : t("取消失败", "Cancel failed"), variant: ok ? undefined : ("destructive" as any) })
      setStatusMsg(ok ? t("爬取已取消", "Crawl cancelled") : t("取消失败", "Cancel failed"))
    } finally { setBusy((b) => ({ ...b, cancel: false })) }
  }

  function onRunNow() {
    toast({ description: t("已开始运行，后台执行中", "Run started in background") })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-none">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="rounded-2xl border border-white/40 bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl shadow-lg ring-1 ring-black/5">
            <DrawerHeader className="pb-2 bg-gradient-to-r from-transparent to-white/10 dark:to-neutral-900/10 rounded-t-2xl">
              <DrawerTitle>{t("AI 运营（采集/抽取/入库）", "AI Ops (Crawl/Extract/Upsert)")}</DrawerTitle>
              <DrawerDescription>{t("配置数据源、规则、目标与调度；支持 Dry-run 预览后再落库。", "Configure sources, rules, target and schedule; Dry-run before upsert.")}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <ScrollArea className="h-[68vh] pr-2">
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium">{t("按模板抓取", "Capture according to template")}</div>
                  <div className="rounded-xl border bg-white/60 dark:bg-neutral-900/50 backdrop-blur p-2 max-h-[160px] overflow-auto text-xs">
                    <Button size="sm" className="cursor-pointer" onClick={captureTemplate} disabled={!!captured}>
                      {captured ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("抓取中", "Scraping")}</> : t("谈职岗位信息", "Start scrape")}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <section className="space-y-3">
                    <div className="text-sm font-medium">{t("数据源", "Source")}</div>
                    {/* <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>{t("Provider", "Provider")}</Label>
                        <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                          <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="firecrawl">Firecrawl</SelectItem>
                            <SelectItem value="scrapegraph">ScrapeGraphAI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>{t("域名(可选)", "Domain (optional)")}</Label>
                        <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="https://example.com" />
                      </div>
                    </div> */}
                    <div className="space-y-1">
                      <Label>{t("URL 列表(每行一个)", "URL list (one per line)")}</Label>
                      <Textarea value={urls} onChange={(e) => setUrls(e.target.value)} placeholder={t("https://...", "https://...")} className="min-h-[110px]" />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("自然语言规则", "Natural language rule")}</Label>
                      <Textarea
                        value={nlRule}
                        onChange={(e) => setNlRule(e.target.value)}
                        placeholder={t("例如：我想要任何数据 / 只要海淀区的 / 城市=北京，岗位=前端，薪资>20k", "e.g. I want any data / Only Haidian district / city=Beijing, role=frontend, salary>20k")}
                        className="min-h-[80px]"
                      />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>{t("支持多种表达方式：", "Supports various expressions:")}</div>
                        <div className="grid grid-cols-1 gap-1 text-[10px]">
                          <div>• {t("通用采集：我想要任何数据、全部都要、都可以", "General: I want any data, all data, anything")}</div>
                          <div>• {t("城市筛选：只要海淀区、城市=北京、在海淀区", "City: Only Haidian, city=Beijing, in Haidian")}</div>
                          <div>• {t("岗位筛选：只要前端开发、岗位=前端、需要前端工程师", "Role: Only frontend dev, role=frontend, need frontend engineer")}</div>
                          <div>• {t("薪资筛选：10k以上、薪资>20k、最低15k", "Salary: Above 10k, salary>20k, minimum 15k")}</div>
                          <div>• {t("公司筛选：只要腾讯的、公司=腾讯、在腾讯工作", "Company: Only Tencent, company=Tencent, work at Tencent")}</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div className="space-y-1">
                      <Label>{t("去重与更新策略", "Dedup & update strategy")}</Label>
                      <RadioGroup value={dedupKey} onValueChange={(v: any) => setDedupKey(v)} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="url" id="rk1" /><Label htmlFor="rk1">URL</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="externalId" id="rk2" /><Label htmlFor="rk2">External ID</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="titleWindow" id="rk3" /><Label htmlFor="rk3">{t("标题+时间窗口", "Title + time window")}</Label></div>
                      </RadioGroup>
                      <div className="text-xs text-muted-foreground">{t("存在则部分字段更新，不存在则新增。", "Upsert: update if exists, otherwise create.")}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">{t("调度", "Schedule")}</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label>{t("预设", "Preset")}</Label>
                          <Select value={schedulePreset} onValueChange={(v: any) => setSchedulePreset(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekdays">{t("工作日", "Weekdays")}</SelectItem>
                              <SelectItem value="weekend">{t("周末", "Weekend")}</SelectItem>
                              <SelectItem value="daily">{t("每天", "Daily")}</SelectItem>
                              <SelectItem value="weekly">{t("每周", "Weekly")}</SelectItem>
                              <SelectItem value="monthly">{t("每月", "Monthly")}</SelectItem>
                              <SelectItem value="custom">{t("自定义", "Custom")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>{t("时间", "Time")}</Label>
                          <Input type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>{t("时区", "Timezone")}</Label>
                          <Select value={tz} onValueChange={(v: any) => setTz(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                              <SelectItem value="UTC">UTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>{t("运行模式", "Run mode")}</Label>
                          <RadioGroup value={runOnce ? "once" : "repeat"} onValueChange={(v: any) => setRunOnce(v === "once")} className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="repeat" id="rm1" /><Label htmlFor="rm1">{t("重复", "Repeat")}</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="once" id="rm2" /><Label htmlFor="rm2">{t("仅一次", "Once")}</Label></div>
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
                            <Label>{t("每月第几天", "Day of month")}</Label>
                            <Select value={dom} onValueChange={(v: any) => setDom(v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 31 }).map((_, i) => (
                                  <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      {runOnce && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <Label>{t("执行日期", "Run date")}</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start font-normal">
                                  {oneDate ? new Date(oneDate).toLocaleDateString() : t("选择日期", "Pick a date")}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0" align="start">
                                <Calendar mode="single" selected={oneDate ? new Date(oneDate) : undefined} onSelect={(d: any) => setOneDate(d ? d.toISOString() : "")} />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1 md:col-span-2">
                          <div className="text-xs text-muted-foreground">
                            {t("CRON 预览", "CRON Preview")}：<span className="font-mono">{cronPreview}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>{t("间隔(小时，可选)", "Interval (hours, optional)")}</Label>
                          <Input inputMode="numeric" pattern="[0-9]*" value={intervalHours} onChange={(e) => setIntervalHours(e.target.value.replace(/[^0-9]/g, ''))} placeholder={t("留空则按上面时间执行", "Leave empty to use time above")} />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3 lg:col-span-2">
                    {/* Extracted sample + array path selection */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">{t("抽取样例", "Extracted Samples")}</div>
                      {/* <div className="flex items-center gap-2">
                        <Label className="text-xs">{t("数据数组路径", "Array path")}</Label>
                        <Select value={arrayPath} onValueChange={(v: any) => setArrayPath(v)}>
                          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {arrayPathOptions.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground">{t("将基于此路径读取记录数组", "We will read records from this path")}</div>
                      </div> */}
                      <div className="rounded-xl border bg-white/60 dark:bg-neutral-900/50 backdrop-blur p-2 max-h-[160px] overflow-auto text-xs">
                        {sampleRecords.length === 0 ? (
                          <div className="text-muted-foreground">{t("暂无样例，请先抓取或爬取。", "No samples yet. Scrape/crawl first.")}</div>
                        ) : (
                          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(sampleRecords.slice(0, 3), null, 2)}</pre>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{t("字段映射", "Field Mapping")}</div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={autoMatch}>{t("自动匹配", "Auto match")}</Button>
                          <Button variant="outline" size="sm" onClick={clearMapping}>{t("清空", "Clear")}</Button>
                        </div>
                      </div>

                      {/* 字段映射说明 */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm font-medium text-blue-900 mb-2">
                          {t("字段映射说明", "Field Mapping Guide")}
                        </div>
                        <div className="text-xs text-blue-800 space-y-1">
                          <div>• {t("采集数据 → 映射字段 → 格式化存储", "Scraped Data → Map Fields → Format & Store")}</div>
                          <div>• {t("例如：采集到'职位名称' → 映射到'title'字段 → 存储为文本格式", "e.g. 'Job Title' → map to 'title' field → store as text")}</div>
                          <div>• {t("例如：采集到'薪资15k' → 映射到'salary'字段 → 转换为数字15000", "e.g. 'Salary 15k' → map to 'salary' field → convert to number 15000")}</div>
                        </div>
                      </div>

                      {/* 采集数据字段展示 */}
                      {sampleSourceKeys.length > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="text-sm font-medium text-green-900 mb-2">
                            {t("采集数据字段", "Scraped Data Fields")} ({sampleSourceKeys.length})
                          </div>
                          <div className="text-xs text-green-800">
                            <div className="flex flex-wrap gap-1">
                              {sampleSourceKeys.map(field => (
                                <span key={field} className="px-2 py-1 bg-green-100 rounded text-green-700">
                                  {field}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 text-green-600">
                              {t("系统已自动分析采集数据结构，并尝试匹配到您的字段", "System has analyzed scraped data structure and attempted to match to your fields")}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onScrapeTest} disabled={!!busy.scrape}>
                          {busy.scrape ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("抓取中", "Scraping")}</> : t("开始抓取", "Start scrape")}
                        </Button>
                        {/* <Button variant="outline" size="sm" onClick={onCrawlStart} disabled={!!busy.crawlStart}>
                          {busy.crawlStart ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("启动中", "Starting")}</> : t("开始爬取", "Start crawl")}
                        </Button>
                        <Button variant="outline" size="sm" disabled={!crawlId || !!busy.crawlStatus} onClick={onCrawlStatus}>
                          {busy.crawlStatus ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("查询中", "Fetching")}</> : t("查看状态", "Check status")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={onCrawlCancel} disabled={!crawlId || !!busy.cancel}>
                          {busy.cancel ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("取消中", "Cancelling")}</> : t("取消", "Cancel")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={onBatchStart} disabled={!!busy.batchStart}>
                          {busy.batchStart ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("批量中", "Starting")}</> : t("批量开始", "Batch start")}
                        </Button>
                        <Button variant="outline" size="sm" disabled={!batchId || !!busy.batchStatus} onClick={onBatchStatus}>
                          {busy.batchStatus ? <><Loader2 className="size-4 mr-1 animate-spin" />{t("查询中", "Fetching")}</> : t("批量状态", "Batch status")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={clearMapping}>{t("清空", "Clear")}</Button>
                        <Button variant="outline" size="sm" onClick={saveTemplate}>{t("保存模板", "Save template")}</Button>
                        <Button variant="outline" size="sm" onClick={loadTemplate}>{t("加载模板", "Load template")}</Button> */}
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
                              <th className="text-left px-3 py-2 w-[26%]">{t("字段", "Field")}</th>
                              <th className="text-left px-3 py-2 w-[30%]">
                                {t("来源键", "Source key")}
                                <div className="mt-1">
                                  <Input value={keySearch} onChange={(e) => setKeySearch(e.target.value)} placeholder={t("搜索键", "Search keys")} className="h-7" />
                                </div>
                              </th>
                              <th className="text-left px-3 py-2 w-[22%]">{t("转换", "Transform")}</th>
                              <th className="text-left px-3 py-2">{t("示例", "Sample")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageFields.map((f) => (
                              <tr key={f.key} className="border-t">
                                <td className="px-3 py-2"><div className="font-medium">{f.label}</div><div className="text-xs text-muted-foreground">{f.key}</div></td>
                                <td className="px-3 py-2 space-y-1">
                                  {f.key === 'progress' ? (
                                    <div className="space-y-1">
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input value={progressMap[f.key]?.arrayPath || '$.progress'} onChange={(e) => setProgressMap(p => ({ ...p, [f.key]: { ...(p[f.key] || { aggregation: 'weightedAverage' }), arrayPath: e.target.value } }))} placeholder={t('数组路径 如 $.progress', 'Array path e.g. $.progress')} />
                                        <Select value={(progressMap[f.key]?.aggregation) || 'weightedAverage'} onValueChange={(v: any) => setProgressMap(p => ({ ...p, [f.key]: { ...(p[f.key] || {}), aggregation: v } }))}>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="weightedAverage">weightedAverage</SelectItem>
                                            <SelectItem value="max">max</SelectItem>
                                            <SelectItem value="min">min</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="grid grid-cols-4 gap-2">
                                        <Input value={progressMap[f.key]?.labelKey || 'label'} onChange={(e) => setProgressMap(p => ({ ...p, [f.key]: { ...(p[f.key] || { aggregation: 'weightedAverage' }), labelKey: e.target.value } }))} placeholder={t('标签键 label', 'label key')} />
                                        <Input value={progressMap[f.key]?.valueKey || 'value'} onChange={(e) => setProgressMap(p => ({ ...p, [f.key]: { ...(p[f.key] || { aggregation: 'weightedAverage' }), valueKey: e.target.value } }))} placeholder={t('数值键 value', 'value key')} />
                                        <Input value={progressMap[f.key]?.statusKey || 'status'} onChange={(e) => setProgressMap(p => ({ ...p, [f.key]: { ...(p[f.key] || { aggregation: 'weightedAverage' }), statusKey: e.target.value } }))} placeholder={t('状态键 status', 'status key')} />
                                        <Input value={progressMap[f.key]?.weightKey || 'weight'} onChange={(e) => setProgressMap(p => ({ ...p, [f.key]: { ...(p[f.key] || { aggregation: 'weightedAverage' }), weightKey: e.target.value } }))} placeholder={t('权重键 weight', 'weight key')} />
                                      </div>
                                      <div className="text-[10px] text-muted-foreground">
                                        {t('样例: [{label,value,status,weight}] 将按聚合规则展示', 'Sample: [{label,value,status,weight}] aggregated by rule')}
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <Input value={mapping[f.key] || ""} onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value }))} placeholder={t("如 title/desc/link", "e.g. title/desc/link")} />
                                      <div className="flex flex-wrap gap-1">
                                        {candidatesForField(f).map((k) => (
                                          <button key={k} type="button" onClick={() => setMapping((m) => ({ ...m, [f.key]: k }))} className={`text-[10px] px-1.5 py-0.5 rounded border ${mapping[f.key] === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/70'}`}>{k}</button>
                                        ))}
                                        {f.required && !mapping[f.key] && (
                                          <span className="text-[10px] text-red-600 ml-1">{t("必填", "Required")}</span>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <Select value={mappingTransform[f.key] || suggestTransform(f.type, (sampleRecords?.[0] ?? {})[mapping[f.key] || ""])} onValueChange={(v: any) => setMappingTransform((m) => ({ ...m, [f.key]: v }))}>
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
                        <div>{t("第", "Page")} {mapPage}/{totalPages}</div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" disabled={mapPage <= 1} onClick={() => setMapPage((p) => Math.max(1, p - 1))}>Prev</Button>
                          <Button variant="outline" size="sm" disabled={mapPage >= totalPages} onClick={() => setMapPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{t("预览", "Preview")}</div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onLocalPreview}>{t("本地预览", "Local preview")}</Button>
                        <Button size="sm" onClick={onUpsert} disabled={upserting || !dirId}>
                          {upserting ? <><Loader2 className="size-4 mr-1 animate-spin" />{t('入库中…', 'Upserting…')}</> : t('入库', 'Upsert')}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl border bg-white/60 dark:bg-neutral-900/50 backdrop-blur p-3 text-xs text-muted-foreground min-h-[120px]">
                      <pre className="whitespace-pre-wrap break-all">{previewJson || t("Dry-run 后将在此显示：原始→规范化→字段映射对照。", "After dry-run, original → normalized → field mapping diffs will appear here.")}</pre>
                    </div>
                  </section>
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between pt-3">
                <div className="text-xs text-muted-foreground">{t("来源与变更将被审计记录，支持回溯。", "Source & changes are audited for traceability.")}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>{t("取消", "Cancel")}</Button>
                  <Button variant="secondary" onClick={onDryRun}>{t("Dry-run 预览", "Dry-run")}</Button>
                  <Button variant="outline" onClick={onRunNow}>{t("立即运行", "Run now")}</Button>
                  <Button onClick={onUpsert} disabled={upserting || !dirId}>
                    {upserting ? <><Loader2 className="size-4 mr-1 animate-spin" />{t('入库中…', 'Upserting…')}</> : t('入库', 'Upsert')}
                  </Button>
                </div>
              </div>
              {upserting && (
                <div className="pt-2 text-xs text-muted-foreground">
                  {t('进度', 'Progress')}: {upsertProgress.done}/{upsertProgress.total} {t('成功', 'OK')}: {upsertProgress.ok} {t('失败', 'Fail')}: {upsertProgress.fail}
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}



