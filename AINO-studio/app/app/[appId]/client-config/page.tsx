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
import { GripVertical, Trash2, Plus, Database, List as ListIcon, ChevronDown, ChevronRight, Search, Settings, Link2, ArrowLeft, PlusCircle, X } from "lucide-react"
import dynamic from "next/dynamic"
import type { editor } from "monaco-editor"
import { manifestSchema } from "./manifest-schema"
import { api } from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { AIOpsDrawer } from "@/components/ai/ai-ops-drawer"
import { EventConfigDialog, type EventConfig } from "@/components/dialogs/event-config-dialog"

const Monaco = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false })

// 轻量卡片配置 JSONSchema（用于编辑器提示与校验）
const cardSchema: any = {
  type: "object",
  additionalProperties: true,
  properties: {
    title: { type: ["string", "object"], properties: { zh: { type: "string" }, en: { type: "string" } } },
    subtitle: { type: ["string", "object"], properties: { zh: { type: "string" }, en: { type: "string" } } },
    actions: {
      type: "array",
      items: { type: "object", properties: { key: { type: "string" }, label: { type: "string" }, icon: { type: "string" } } }
    },
    style: {
      type: "object",
      properties: {
        variant: { type: "string", enum: ["plain", "soft", "elevated"] },
        radius: { type: "string", enum: ["none", "sm", "md", "lg", "xl", "full"] },
        elevation: { type: "number", minimum: 0, maximum: 24 },
        padding: { type: "string", enum: ["none", "xs", "sm", "md", "lg"] },
        gap: { type: "string", enum: ["none", "xs", "sm", "md", "lg"] },
        colors: {
          type: "object",
          properties: { background: { type: "string" }, text: { type: "string" }, highlight: { type: "string" } }
        },
        typography: {
          type: "object",
          properties: { titleSize: { type: "string" }, bodySize: { type: "string" } }
        }
      }
    },
    layout: {
      type: "object",
      properties: { type: { type: "string" }, columns: { type: "number", minimum: 1, maximum: 4 } }
    },
    display: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["pick", "filter", "time", "hot"] },
        limit: { type: ["number", "null"] },
        unlimited: { type: "boolean" },
        sort: { type: "object", properties: { by: { type: "string" }, order: { type: "string", enum: ["asc", "desc"] } } }
      }
    },
    data: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["dynamic", "static"] },
        source: { type: "string" },
        static: { type: ["array", "object", "null"] }
      }
    },
    render: {
      type: "object",
      properties: {
        item: { type: ["object", "string"] }
      }
    }
  }
}

const defaultCardTemplate = () => `{
  "title": "",
  "subtitle": "",
  "style": {
    "variant": "plain",
    "radius": "md",
    "elevation": 0,
    "padding": "md",
    "gap": "md",
    "colors": { "background": "", "text": "" },
    "typography": { "titleSize": "base", "bodySize": "sm" }
  },
  "layout": { "type": "list", "columns": 1 },
  "display": { "limit": 1, "mode": "time" },
  "data": { "mode": "dynamic" },
  "render": { "item": {} }
}`

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

  // 本地持久化水合标记
  const studioDraftHydratedRef = useRef(false)

  // 合并默认草稿与已保存草稿（保留默认必要字段）
  function mergeDraftDefaults(defaults: any, savedRaw: any) {
    try {
      if (!savedRaw || typeof savedRaw !== "object") return defaults
      const saved = { ...savedRaw }
      if ("__ui" in saved) { try { delete (saved as any).__ui } catch { } }
      const out: any = { ...defaults, ...saved }
      out.app = { ...defaults.app, ...(saved.app || {}) }
      // 固定 appKey 与默认语言/locale 合法性
      out.app.appKey = defaults.app.appKey
      out.app.defaultLanguage = out.app.defaultLanguage || defaults.app.defaultLanguage
      out.app.locale = out.app.locale || defaults.app.locale
      if (!Array.isArray(out.app.bottomNav)) out.app.bottomNav = defaults.app.bottomNav
      if (saved.pages) out.pages = saved.pages
      if (saved.dataSources) out.dataSources = saved.dataSources
      return out
    } catch {
      return defaults
    }
  }

  const [aiOpsOpen, setAiOpsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [authUIOpen, setAuthUIOpen] = useState(false)
  const [previewSource, setPreviewSource] = useState<"preview">("manifest")
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
        { key: "home", label: lang === "zh" ? "首页" : "Home", route: "/preview" },
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

  // 接收自子页面的 aino:data 数据缓存与字段映射状态
  const INCOMING_KEY = `AINO_CARD_DATA_${params.appId}`
  const [incomingMappings, setIncomingMappings] = useState<Record<string, { cardType: string; cardName?: string; dataSourceKey?: string; dataSourceLabel?: string; tableId?: string; tableName?: string; inputs: Record<string, any>; timestamp: number }>>({})
  const [tableFieldsByDsKey, setTableFieldsByDsKey] = useState<Record<string, Array<{ key: string; label: string }>>>({})
  const [mappingSelections, setMappingSelections] = useState<Record<string, Record<string, string>>>({})
  const [bindingByMappingKey, setBindingByMappingKey] = useState<Record<string, string>>({})



  function saveIncomingData(payload: any) {
    try {
      const cardType = String(payload?.card?.id || '')
      const cardName = String(payload?.card?.name || '')
      const dsKey = payload?.dataSource?.key ? String(payload?.dataSource?.key) : undefined
      const dsLabel = payload?.dataSource?.label ? String(payload?.dataSource?.label) : undefined
      const tableId = payload?.dataSource?.tableId || payload?.dataSource?.id
      const tableName = payload?.dataSource?.tableName || payload?.dataSource?.name
      const inputs = (payload?.inputs && typeof payload.inputs === 'object') ? payload.inputs : {}
      if (!cardType) return
      const dsPart = dsKey || (tableId ? `table:${tableId}` : 'unknown')
      const mappingKey = `${cardType}::${dsPart}`
      setIncomingMappings((s) => {
        const next = { ...s, [mappingKey]: { cardType, cardName, dataSourceKey: dsKey, dataSourceLabel: dsLabel, tableId: tableId ? String(tableId) : undefined, tableName: tableName ? String(tableName) : undefined, inputs, timestamp: Date.now() } }
        return next
      })
    } catch { }
  }

  async function loadTableFields(dsKey: string) {
    try {
      if (!dsKey) return
      if (tableFieldsByDsKey[dsKey]) return
      const appId = String(params.appId)
      let tableId: string | undefined
      if (dsKey.startsWith('table:')) {
        tableId = dsKey.replace(/^table:/, '')
      } else {
        const ds = (draft.dataSources || {})[dsKey]
        tableId = ds?.tableId
      }
      if (!tableId) { setTableFieldsByDsKey((s) => ({ ...s, [dsKey]: [] })); return }
      const defRes = await api.directoryDefs.getOrCreateDirectoryDefByDirectoryId(tableId, appId)
      const defId = defRes?.data?.id
      if (!defId) { setTableFieldsByDsKey((s) => ({ ...s, [dsKey]: [] })); return }
      const fieldsRes = await api.fields.getFields({ directoryId: defId, page: 1, limit: 100 })
      const list = Array.isArray(fieldsRes?.data) ? fieldsRes.data : []
      const options = [];
      list.map((f: any) => {
        if (f.type === "meta_items") {
          (f.schema?.metaItemsConfig?.fields || []).forEach(field => {
            options.push({
              key: `${f.key}.${field.id}` || '', label: `${(f?.schema?.label || f.key || '')}-${field.label}`
            });
          })
        }
        options.push({ key: String(f.key || ''), label: String(f?.schema?.label || f.key || '') })
      })
      setTableFieldsByDsKey((s) => ({ ...s, [dsKey]: options }))
    } catch {
      setTableFieldsByDsKey((s) => ({ ...s, [dsKey]: [] }))
    }
  }

  // 监听新到的映射上下文，自动加载对应数据源字段
  useEffect(() => {
    try {
      Object.values(incomingMappings || {}).forEach((ctx) => {
        const dsKey = ctx?.dataSourceKey ? String(ctx.dataSourceKey) : undefined
        if (dsKey && (draft.dataSources || {})[dsKey] && !tableFieldsByDsKey[dsKey]) loadTableFields(dsKey)
        const tid = ctx?.tableId ? String(ctx.tableId) : undefined
        if (tid) {
          const pseudo = `table:${tid}`
          if (!tableFieldsByDsKey[pseudo]) loadTableFields(pseudo)
        }
      })
    } catch { }
  }, [incomingMappings, tableFieldsByDsKey])

  // 字段扁平化：支持 Object、Array<Item> 递归展开，生成路径键
  // 规则：
  // - 基本类型直接返回其键
  // - 对象使用点语法：user.name → "user.name"
  // - 数组：若为基本类型数组，使用 key[] 表示；
  //        若为对象数组，展开其子字段：items[].title、items[].id
  function extractInputKeys(inputs: Record<string, any>): string[] {
    try {
      const result: string[] = []
      const isPrimitive = (v: any) => {
        return (
          v === 'String' || v === 'Number' || v === 'Boolean' || v === 'Date' || v === 'Time' || v === 'Datetime' || v === 'RichText' || v === 'Image' || v === 'Video' || v === 'File'
        )
      }

      const walk = (node: any, prefix: string) => {
        if (!node || typeof node !== 'object') {
          if (prefix) result.push(prefix)
          return
        }
        // 如果是数组定义
        if (Array.isArray(node)) {
          // 数组元素类型未知时，仅记录占位键
          if (node.length === 0) {
            if (prefix) result.push(`${prefix}[]`)
            return
          }
          const first = node[0]
          if (isPrimitive(first)) {
            if (prefix) result.push(`${prefix}[]`)
            return
          }
          if (typeof first === 'object' && first) {
            // 对象数组：展开一层字段
            Object.keys(first).forEach((k) => {
              const child = (first as any)[k]
              if (isPrimitive(child)) {
                result.push(`${prefix}[].${k}`)
              } else if (Array.isArray(child)) {
                // 二级数组：仅标记为占位
                result.push(`${prefix}[].${k}[]`)
              } else if (typeof child === 'object' && child) {
                // 对象：展开一层
                Object.keys(child).forEach((kk) => {
                  result.push(`${prefix}[].${k}.${kk}`)
                })
              } else {
                result.push(`${prefix}[].${k}`)
              }
            })
            return
          }
          if (prefix) result.push(`${prefix}[]`)
          return
        }

        // 普通对象：遍历属性
        Object.keys(node).forEach((key) => {
          const val = (node as any)[key]
          const path = prefix ? `${prefix}.${key}` : key
          if (isPrimitive(val)) {
            result.push(path)
          } else if (Array.isArray(val)) {
            // 数组
            if (val.length === 0) {
              result.push(`${path}[]`)
            } else {
              const first = val[0]
              if (isPrimitive(first)) {
                result.push(`${path}[]`)
              } else if (typeof first === 'object' && first) {
                // 对象数组：展开其子字段
                Object.keys(first).forEach((k) => {
                  const child = (first as any)[k]
                  if (isPrimitive(child)) {
                    result.push(`${path}[].${k}`)
                  } else if (Array.isArray(child)) {
                    result.push(`${path}[].${k}[]`)
                  } else if (typeof child === 'object' && child) {
                    Object.keys(child).forEach((kk) => {
                      result.push(`${path}[].${k}.${kk}`)
                    })
                  } else {
                    result.push(`${path}[].${k}`)
                  }
                })
              } else {
                result.push(`${path}[]`)
              }
            }
          } else if (typeof val === 'object' && val) {
            // 嵌套对象：仅展开一层（可按需递归更深）
            const keys = Object.keys(val)
            if (keys.length === 0) {
              result.push(path)
            } else {
              keys.forEach((k) => {
                const child = (val as any)[k]
                if (isPrimitive(child) || typeof child !== 'object') {
                  result.push(`${path}.${k}`)
                } else if (Array.isArray(child)) {
                  if (child.length === 0) {
                    result.push(`${path}.${k}[]`)
                  } else if (isPrimitive(child[0])) {
                    result.push(`${path}.${k}[]`)
                  } else if (typeof child[0] === 'object' && child[0]) {
                    Object.keys(child[0]).forEach((kk) => {
                      result.push(`${path}.${k}[].${kk}`)
                    })
                  }
                } else {
                  Object.keys(child).forEach((kk) => {
                    result.push(`${path}.${k}.${kk}`)
                  })
                }
              })
            }
          } else {
            // 其他情况视为基本类型
            result.push(path)
          }
        })

      }

      walk(inputs, '')
      return Array.from(new Set(result))
    } catch { return [] }
  }

  // 读取/保存映射改为随 manifest 一起持久化到数据库

  function setMappingValue(mappingKey: string, inputKey: string, fieldKey: string) {
    setMappingSelections((s) => {
      const prev = s[mappingKey] || {}
      const nextMap = { ...prev, [inputKey]: fieldKey }
      const nextAll = { ...s, [mappingKey]: nextMap }
      return nextAll
    })
  }

  // 删除整个映射分组（incoming + selections + 绑定）
  function deleteMappingGroup(mappingKey: string) {
    try {
      setIncomingMappings((s) => {
        const next = { ...s }
        delete next[mappingKey]
        return next
      })
      setMappingSelections((s) => {
        const next = { ...s }
        delete next[mappingKey]
        return next
      })
      setBindingByMappingKey((s) => {
        const next = { ...s }
        delete next[mappingKey]
        return next
      })
    } catch { }
  }

  // 清除单个字段的映射
  function clearFieldMapping(mappingKey: string, inputKey: string) {
    setMappingSelections((s) => {
      const group = { ...(s[mappingKey] || {}) }
      if (group[inputKey] !== undefined) delete group[inputKey]
      const nextAll = { ...s, [mappingKey]: group }
      return nextAll
    })
  }

  // 当收到新的映射上下文时，若其 dsKey 恰好存在于本地数据定义，则自动绑定
  useEffect(() => {
    try {
      const entries = Object.entries(incomingMappings || {})
      if (entries.length === 0) return
      setBindingByMappingKey((s) => {
        const next = { ...s }
        entries.forEach(([mKey, ctx]) => {
          const dsKey = String(ctx?.dataSourceKey || '')
          if (!next[mKey]) {
            if (dsKey && (draft.dataSources || {})[dsKey]) next[mKey] = dsKey
            else if (ctx?.tableId) next[mKey] = `table:${String(ctx.tableId)}`
            else next[mKey] = ''
          }
        })
        return next
      })
    } catch { }
  }, [incomingMappings, draft?.dataSources])

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

  // 内容导航配置弹窗与临时状态（新模型：category + style）
  const [contentNavOpen, setContentNavOpen] = useState(false)
  const [cnCategory, setCnCategory] = useState<'navigation' | 'status'>("navigation")
  const [cnType, setCnType] = useState<'iconText' | 'text'>("iconText")
  const [cnLayout, setCnLayout] = useState<'grid-4' | 'grid-5' | 'scroll'>("grid-4")
  const [cnItems, setCnItems] = useState<any[]>([])
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventEditingIndex, setEventEditingIndex] = useState<number | null>(null)
  const [pageTabIndex, setPageTabIndex] = useState<number>(0)
  const [workspaceCardsByCategory, setWorkspaceCardsByCategory] = useState<Record<string, string[]>>({})
  const [activeWorkspaceCategory, setActiveWorkspaceCategory] = useState<string>("")
  const [cardConfigOpen, setCardConfigOpen] = useState(false)

  // 初次水合：从 localStorage 恢复草稿与 UI 状态（activePageKey/pageTabIndex）
  useEffect(() => {
    try {
      if (typeof window === "undefined") return
      const key = `STUDIO_CLIENT_CFG_${params.appId}`
      const raw = window.localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        setDraft((s: any) => mergeDraftDefaults(s, parsed))
        try { const ap = parsed?.__ui?.activePageKey; if (ap) setActivePageKey(String(ap)) } catch { }
        try { const ti = parsed?.__ui?.pageTabIndex; if (typeof ti === "number") setPageTabIndex(ti) } catch { }
      }
    } catch { }
    finally { studioDraftHydratedRef.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.appId])

  // 持久化：草稿/关键 UI 状态 变更时写入 localStorage（避免初次水合覆盖）
  useEffect(() => {
    try {
      if (!studioDraftHydratedRef.current || typeof window === "undefined") return
      const key = `STUDIO_CLIENT_CFG_${params.appId}`
      const payload = { ...draft, __ui: { activePageKey, pageTabIndex } }
      window.localStorage.setItem(key, JSON.stringify(payload))
    } catch { }
  }, [draft, activePageKey, pageTabIndex, params.appId])
  const [cardConfigType, setCardConfigType] = useState<string>("")
  const [cardConfigName, setCardConfigName] = useState<string>("")
  const [cardConfigText, setCardConfigText] = useState<string>("{\n  \"title\": \"\",\n  \"subtitle\": \"\"\n}")
  const [virtualFiles, setVirtualFiles] = useState<Record<string, string>>({})
  const [activeCardPath, setActiveCardPath] = useState<string>("")
  const [activeCardMeta, setActiveCardMeta] = useState<{ pageKey: string; sectionKey: string; cardType: string } | null>(null)
  const [monacoLanguage, setMonacoLanguage] = useState<'json' | 'typescript'>('json')
  const remoteApplyingRef = useRef(false)
  const debounceTimerRef = useRef<any>(null)
  // 显示弹窗（纯 UI，先不落逻辑）
  const [displayOpen, setDisplayOpen] = useState(false)
  const [displayCardName, setDisplayCardName] = useState("")
  const [displayCardType, setDisplayCardType] = useState("")
  const [displayLimit, setDisplayLimit] = useState<string>("1") // LOG: 显示数量
  const [displayUnlimited, setDisplayUnlimited] = useState(false)
  const [displayMode, setDisplayMode] = useState<'pick' | 'filter' | 'time' | 'hot'>("time")
  // 顶部标签管理/新增
  const [addTabTitle, setAddTabTitle] = useState("")
  // 顶部标签管理弹窗
  const [tabManagerOpen, setTabManagerOpen] = useState(false)

  // 统一去重工具：基于 id/title，保持顺序
  function uniqueTabs(list: any[]): any[] {
    const seen = new Set<string>()
    const out: any[] = []
    for (const t of Array.isArray(list) ? list : []) {
      const key = String(t?.id || '') + '::' + String(t?.title || '')
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ id: t?.id || `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: t?.title || '' })
    }
    return out
  }

  // 筛选配置弹窗（UI）
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterCardName, setFilterCardName] = useState("")
  const [filterCardType, setFilterCardType] = useState("")
  const [filterDsKey, setFilterDsKey] = useState<string>("")
  const [filterLoading, setFilterLoading] = useState(false)
  const [filterFields, setFilterFields] = useState<any[]>([])
  const [filterSelected, setFilterSelected] = useState<Record<string, any>>({})
  const pendingFiltersRef = useRef<any>(null)

  const tableDataSources = useMemo(() => {
    const entries = Object.entries(draft.dataSources || {})
    return entries
      .filter(([, v]: any) => v && v.type === 'table')
      .map(([key, v]: any) => ({ key, tableId: v.tableId, label: v.label || `${v.moduleName || ''}/${v.tableName || ''}` }))
  }, [draft.dataSources])

  // 本地演示字段（无数据时兜底）
  function getMockFilterFields() {
    return []
  }

  async function loadFilterFields(dsKey: string) {
    try {
      setFilterLoading(true)
      // 解析数据源，优先使用 draft.dataSources[dsKey]，否则支持 'table:{id}' 直连表ID
      const ds = (draft.dataSources || {})[dsKey]
      let tableId: string | undefined = ds?.tableId
      if (!tableId && typeof dsKey === 'string' && dsKey.startsWith('table:')) {
        tableId = dsKey.replace(/^table:/, '')
      }
      if (!tableId) { setFilterFields([]); return }
      const appId = String(params.appId)
      const defRes = await api.directoryDefs.getOrCreateDirectoryDefByDirectoryId(tableId, appId)
      const defId = defRes?.data?.id
      if (!defId) { setFilterFields([]); return }
      const fieldsRes = await api.fields.getFields({ directoryId: defId, page: 1, limit: 100 })
      const raw = (fieldsRes && (fieldsRes as any).data != null) ? (fieldsRes as any).data : fieldsRes
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.records)
            ? raw.records
            : []
      // Include all fields so that when the data source is a full table, users can choose any field
      const candidatesAll = list
        .map((f: any) => {
          const schema = f.schema || {}
          const mappedType = f.type || schema.type || 'text'
          const label = schema.label || f.label || f.key
          return {
            id: f.id,
            key: f.key,
            label,
            type: mappedType,
            options: Array.isArray(schema.options) ? schema.options : [],
            optionsTree: Array.isArray(schema.cascaderOptions) ? schema.cascaderOptions : [],
          }
        })
        // optional: sort to show select/cascader first for better UX
        .sort((a: any, b: any) => {
          const rank = (t: string) => (t === 'select' || t === 'cascader') ? 0 : 1
          return rank(a.type) - rank(b.type)
        })
      const toUse = candidatesAll
      setFilterFields(toUse)
      // 如果有待应用的覆盖筛选，并且数据源匹配，则根据覆盖勾选字段；否则初始化占位条目
      if (pendingFiltersRef.current && pendingFiltersRef.current.dataSourceKey === dsKey) {
        const ov = pendingFiltersRef.current
        const chosen = new Set<string>((ov.fields || []).map((f: any) => String(f.fieldId)))
        setFilterSelected(() => {
          const next: Record<string, any> = {}
          toUse.forEach((f) => {
            const checked = chosen.has(String(f.key))
            next[f.key] = { fieldId: f.key, type: f.type, label: f.label, __checked: checked }
          })
          return next
        })
        pendingFiltersRef.current = null
      } else {
        setFilterSelected((s) => {
          const next: Record<string, any> = { ...s }
          toUse.forEach((f) => { if (!next[f.key]) next[f.key] = { fieldId: f.key, type: f.type, label: f.label } })
          return next
        })
      }
    } catch (err) {
      setFilterFields([])
    } finally {
      setFilterLoading(false)
    }
  }

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const d: any = e.data
      if (d && d.type === "DYN_CARDS" && Array.isArray(d.cards)) {
        // d.cards: [{ type, displayName }]
        setWorkspaceCardsByCategory((s) => ({ ...s, [d.category]: d.cards }))
        setActiveWorkspaceCategory(d.category || "")
      } else if (d && d.type === 'OVERRIDE') {
        const { pageId: pid, sectionKey, cardType, props, jsx, filters } = d
        try {
          // 根据返回类型写入对应扩展名
          // JSX 模式暂时隐藏，不自动切换或写入编辑器
          if (props) {
            const path = `pages/p-${pid}/cards/${sectionKey}/${cardType}.json`
            const content = JSON.stringify(props || {}, null, 2)
            setVirtualFiles((s) => ({ ...s, [path]: content }))
            if (activeCardPath === path) {
              remoteApplyingRef.current = true
              setJsonText(content)
              setMonacoLanguage('json')
              setViewTab('code')
            }
          }
          // 同步已存在的筛选覆盖：优先采用覆盖里的数据源与字段
          if (filters && typeof filters === 'object') {
            pendingFiltersRef.current = filters
            if (filters.dataSourceKey) {
              setFilterDsKey(String(filters.dataSourceKey))
              loadFilterFields(String(filters.dataSourceKey))
            }
          }
        } catch { }
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  function openContentNavDialog() {
    try {
      const k = activePageKey as string
      const page = (draft.pages && (draft as any).pages[k]) || {}
      const tbEnabled = !!page?.topBar?.enabled
      // 读取：若开启顶部标签栏，则按标签读取；否则读取页面默认
      let cfg: any
      if (tbEnabled) {
        const tabContent = (page as any).tabContent || {}
        cfg = tabContent?.[pageTabIndex]?.contentNav || {}
      } else {
        cfg = page?.contentNav || {}
      }
      const style = (cfg as any).style || (((cfg as any).type === 'text') ? 'text' : ((cfg as any).type ? 'icon' : 'icon'))
      setCnCategory(((cfg as any).category === 'status') ? 'status' : 'navigation')
      setCnType(style === 'text' ? 'text' : 'iconText')
      setCnLayout((cfg as any).layout || 'grid-4')
      setCnItems(Array.isArray((cfg as any).items) ? (cfg as any).items : [])
      setContentNavOpen(true)
    } catch {
      setCnCategory('navigation')
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
      const content = {
        category: cnCategory,
        style: (cnType === 'text' ? 'text' : 'icon'),
        layout: cnType === 'iconText' ? cnLayout : undefined,
        items: cnItems,
      }
      const tbEnabled = !!p?.topBar?.enabled
      if (tbEnabled) {
        const tbc = p.tabContent || {}
        const prev = tbc[pageTabIndex] || {}
        tbc[pageTabIndex] = { ...prev, contentNav: content }
        p.tabContent = tbc
      } else {
        p.contentNav = content
      }
      next.pages[k] = p
      return next
    })
    setContentNavOpen(false)
  }

  function handleUploadCnImage(idx: number) {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e: any) => {
        try {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (!file) return
          const dataUrl = await readAndResizeImage(file, 256, 256, 0.9)
          setCnItems((s: any[]) => s.map((x, i) => i === idx ? { ...x, image: dataUrl } : x))
        } catch { }
      }
      input.click()
    } catch { }
  }

  function openEventDialogForItem(idx: number) {
    setEventEditingIndex(idx)
    setEventDialogOpen(true)
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
      const u = new URL(`http://localhost:3005/${baseLang}/auth/login`)
      u.searchParams.set("authCfg", JSON.stringify(cfg))
      u.searchParams.set("v", String(Date.now()))
      setPreviewUrl(u.toString())
    } catch { }
  }, [authConfig, authUIOpen, previewSource, viewTab, draft.app?.defaultLanguage, lang])

  async function openPreview() {
    try {
      const body = draft
      const res = await fetch("http://localhost:3007/api/preview-manifests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest: body }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success || !data?.data?.id) throw new Error(data?.message || "create failed")
      const id = data.data.id
      setPreviewId(id)
      const dataParam = encodeURIComponent(JSON.stringify(draft?.dataSources || {}))
      const url = `http://localhost:3005/${lang}/preview?previewId=${id}&device=${device}&appId=${params.appId}&data=${dataParam}`
      setPreviewUrl(url)
      setViewTab("preview")
      toast({ description: lang === "zh" ? "预览已生成" : "Preview created" })
    } catch (e: any) {
      toast({ description: e?.message || (lang === "zh" ? "创建预览失败" : "Failed to create preview"), variant: "destructive" as any })
      setViewTab("code")
    }
  }

  async function savePreview(bodyOverride?: any, skipMergeFromEditor?: boolean) {
    try {
      // UI 保存时可跳过编辑器合并，避免被旧 JSON 回滚
      if (!skipMergeFromEditor) {
        try {
          const parsed = JSON.parse(jsonText || "{}")
          setDraft((s: any) => {
            const next = { ...s }
            if (codeScope === "manifest") Object.assign(next, parsed)
            else if (codeScope === "app") next.app = parsed
            else if (codeScope === "dataSources") next.dataSources = parsed
            else if (codeScope === "page") {
              // 若是卡片文件，则把内容同步到预览覆盖（虚拟文件）
              if (activeCardMeta && activeCardPath) {
                try {
                  const pageIdPure = activeCardMeta.pageKey.replace(/^p-/, '')
                  if (activeCardPath.endsWith('.json')) {
                    window.frames[0]?.postMessage({ type: 'SET_OVERRIDE', pageId: pageIdPure, sectionKey: activeCardMeta.sectionKey, cardType: activeCardMeta.cardType, props: parsed }, '*')
                    setVirtualFiles((vf) => ({ ...vf, [activeCardPath]: JSON.stringify(parsed, null, 2) }))
                  } else if (activeCardPath.endsWith('.tsx')) {
                    window.frames[0]?.postMessage({ type: 'SET_OVERRIDE', pageId: pageIdPure, sectionKey: activeCardMeta.sectionKey, cardType: activeCardMeta.cardType, jsx: jsonText }, '*')
                    setVirtualFiles((vf) => ({ ...vf, [activeCardPath]: jsonText }))
                  }
                } catch { }
              } else {
                next.pages = next.pages || {}
                next.pages[activePage] = parsed
              }
            }
            return next
          })
        } catch (e: any) {
          toast({ description: e?.message || (lang === "zh" ? "JSON 无法解析" : "JSON parse error"), variant: "destructive" as any })
          return
        }
      }

      if (!previewId) {
        return openPreview()
      }
      const body = bodyOverride ?? draft
      const res = await fetch(`http://localhost:3007/api/preview-manifests/${previewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest: body }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) throw new Error(data?.message || "save failed")
      // 更新预览URL上的 data 参数，保持与当前数据源一致
      try {
        const u = new URL(previewUrl || `http://localhost:3005/${lang}/preview?previewId=${previewId}&device=${device}&appId=${params.appId}`)
        u.searchParams.set("device", device)
        u.searchParams.set("appId", String(params.appId))
        const dataParam = JSON.stringify(draft?.dataSources || {})
        u.searchParams.set("data", encodeURIComponent(dataParam))
        setPreviewUrl(u.toString())
      } catch {
        const dataParam = encodeURIComponent(JSON.stringify(draft?.dataSources || {}))
        const fallback = `http://localhost:3005/${lang}/preview?previewId=${previewId}&device=${device}&appId=${params.appId}&data=${dataParam}`
        setPreviewUrl(fallback)
      }
      toast({ description: lang === "zh" ? "已保存并刷新预览" : "Saved and refreshed preview" })
    } catch (e: any) {
      toast({ description: e?.message || (lang === "zh" ? "保存失败" : "Save failed"), variant: "destructive" as any })
    }
  }

  useEffect(() => {
    const allowedChildOrigin = "http://localhost:3005"; // 调整为实际被嵌入系统的域名
    const frame = document.getElementById("my-app-iframe");

    function onMessage(event) {
      // 可选：严格校验 message 来自指定子页面域
      // if (event.origin !== allowedChildOrigin) return;

      const data = event.data || {};
      // 仅处理 AINO 规范的消息
      if (!data || typeof data !== "object" || !data.type || !String(data.type).startsWith("aino:")) return;
      
      // 确保frame存在
      if (!frame) {
        console.warn("Frame element not found, skipping message handling");
        return;
      }

      switch (data.type) {
        case "aino:ready":
          // e.g. { appId, id, locale }
          console.log("AINO ready:", data.payload);
          break;

        case "aino:height":
          // e.g. { height }
          if (data.payload && typeof data.payload.height === "number") {
            frame.style.height = data.payload.height + "px";
          }
          break;

        case "aino:data":
          try {
            console.log('aino:data', data.payload)
            saveIncomingData(data.payload)
          } catch { }
          break;

        case "aino:manifest":
          // e.g. { manifest }
          console.log("AINO manifest:", data.payload?.manifest);
          break;

        case "aino:error":
          console.warn("AINO error:", data.payload?.message);
          break;

        case "aino:custom":
          // 预留自定义事件
          console.log("AINO custom:", data.payload);
          break;

        default:
          // ignore
          break;
      }
    }

    window.addEventListener("message", onMessage, false);
  }, [])

  function applyJsonToDraft(base: any, scope: typeof codeScope, active: string, json: string) {
    let parsed: any = {}
    try {
      parsed = JSON.parse(json || "{}")
    } catch (e: any) {
      throw new Error(e?.message || (lang === "zh" ? "JSON 无法解析" : "JSON parse error"))
    }
    const next = { ...(base || {}) }
    if (scope === "manifest") Object.assign(next, parsed)
    else if (scope === "app") next.app = parsed
    else if (scope === "dataSources") next.dataSources = parsed
    else if (scope === "page") {
      next.pages = next.pages || {}
      next.pages[active] = parsed
    }
    return next
  }

  async function saveAll() {
    if (saving) return
    setSaving(true)
    try {
      // 1) 生成将要保存的完整 manifest（基于当前编辑范围合并）
      const nextDraft = applyJsonToDraft(draft, codeScope, activePage, jsonText)
      // 合并数据映射与上下文到 manifest，一起入库
      const mergedDraft = { ...nextDraft, dataMappings: mappingSelections, incomingMappings }

      // 2) 读取现有应用配置，避免覆盖其它 config 字段
      const appId = String(params.appId)
      let existingConfig: Record<string, any> = {}
      try {
        const getRes = await api.applications.getApplication(appId)
        existingConfig = (getRes.success && getRes.data ? (getRes.data as any).config : {}) || {}
      } catch {
        existingConfig = {}
      }

      // 3) 写入数据库：将 manifest 挂载到 applications.config.clientManifest
      const nextConfig = { ...existingConfig, clientManifest: mergedDraft }
      const updRes = await api.applications.updateApplication(appId, { config: nextConfig })
      if (!updRes.success) throw new Error(updRes.error || (lang === "zh" ? "保存到数据库失败" : "Save to database failed"))

      setDraft(mergedDraft)

      // 4) 同步更新/生成预览（保持原行为）
      const body = mergedDraft
      if (!previewId) {
        // 没有预览则创建
        const res = await fetch("http://localhost:3007/api/preview-manifests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manifest: body }),
        })
        const data = await res.json()
        if (!res.ok || !data?.success || !data?.data?.id) throw new Error(data?.message || "create failed")
        const id = data.data.id
        setPreviewId(id)
        const dataParam = encodeURIComponent(JSON.stringify(mergedDraft?.dataSources || {}))
        const url = `http://localhost:3005/${lang}/preview?previewId=${id}&device=${device}&appId=${params.appId}&data=${dataParam}`
        setPreviewUrl(url)
      } else {
        // 已有预览则更新
        const res = await fetch(`http://localhost:3007/api/preview-manifests/${previewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manifest: body }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data?.success === false) throw new Error(data?.message || "save failed")
        try {
          const u = new URL(previewUrl || `http://localhost:3005/${lang}/preview?previewId=${previewId}&device=${device}&appId=${params.appId}`)
          u.searchParams.set("device", device)
          u.searchParams.set("appId", String(params.appId))
          const dataParam = JSON.stringify(mergedDraft?.dataSources || {})
          u.searchParams.set("data", encodeURIComponent(dataParam))
          setPreviewUrl(u.toString())
        } catch {
          const dataParam = encodeURIComponent(JSON.stringify(mergedDraft?.dataSources || {}))
          const fallback = `http://localhost:3005/${lang}/preview?previewId=${previewId}&device=${device}&appId=${params.appId}&data=${dataParam}`
          setPreviewUrl(fallback)
        }
      }

      toast({ description: lang === "zh" ? "已保存到数据库并刷新预览" : "Saved to database and refreshed preview" })
      setViewTab("preview")
    } catch (e: any) {
      toast({ description: e?.message || (lang === "zh" ? "保存失败" : "Save failed"), variant: "destructive" as any })
    } finally {
      setSaving(false)
    }
  }

  function handleMonacoMount(editor: editor.IStandaloneCodeEditor, monaco: any) {
    monacoRef.current = editor
    try {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: true,
        schemas: [
          { uri: 'aino://manifest.schema.json', fileMatch: ['*'], schema: manifestSchema },
          { uri: 'aino://card.schema.json', fileMatch: ['**/pages/*/cards/**/*.json'], schema: cardSchema }
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
        setPreviewUrl(`http://localhost:3005/${baseLang}/auth/login`)
        setViewTab("preview")
      } else if (previewSource === "home") {
        const baseLang = (draft.app?.defaultLanguage || (lang === "zh" ? "zh" : "en")) as string
        setPreviewUrl(`http://localhost:3005/${baseLang}/home`)
        setViewTab("preview")
      } else {
        openPreview()
      }
    } else {
      setViewTab("code")
    }
  }

  // 若默认就在"预览"页且还没有 URL，则自动生成一次预览
  useEffect(() => {
    if (viewTab === "preview" && !previewUrl) {
      openPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewTab])

  // 进入页面配置视图时，自动将当前页面配置应用到右侧预览
  // 目的：初始就显示已配置好的顶部标签栏，而不是必须点击“保留浏览”
  useEffect(() => {
    if (!pageUIOpen) return
    try {
      const k = String(activePageKey || '')
      if (!k) return
      const cfg = (draft.pages && (draft as any).pages[k]) || {}
      const base = String(previewUrl || `http://localhost:3005/${lang}/p/${k.replace(/^p-/, '')}`)
      fetch('http://localhost:3007/api/page-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      })
        .then(r => r.json().catch(() => null))
        .then(j => {
          const id = j && (j.id || j.data?.id)
          const u = new URL(base)
          if (id) u.searchParams.set('cfgId', String(id))
          setPreviewUrl(u.toString())
          setViewTab('preview')
        })
        .catch(() => {
          const u = new URL(base)
          setPreviewUrl(u.toString())
          setViewTab('preview')
        })
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageUIOpen])

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

  // 初始化：加载已保存的客户端配置
  useEffect(() => {
    let mounted = true
    async function loadSavedManifest() {
      setLoadingConfig(true)
      try {
        const appId = String(params.appId)
        const res = await api.applications.getApplication(appId)
        const cfg = res.success && res.data ? (res.data as any).config : null
        const saved = cfg?.clientManifest
        if (mounted && saved && typeof saved === "object") {
          // 同步语言
          try {
            const savedLocale = saved?.app?.locale
            if (typeof savedLocale === "string") {
              if (/^zh/i.test(savedLocale)) setLang("zh")
              else if (/^en/i.test(savedLocale)) setLang("en")
            }
          } catch { }

          // 激活页面：优先首个 pages key
          try {
            const pageKeys = Object.keys(saved?.pages || {})
            if (pageKeys.length > 0) setActivePage(pageKeys[0])
          } catch { }

          setDraft(saved)
          // 恢复字段映射与上下文
          try { setMappingSelections((saved as any).dataMappings || {}) } catch { }
          try { setIncomingMappings((saved as any).incomingMappings || {}) } catch { }

          // 若当前即在预览页，加载后自动刷新预览
          if (viewTab === "preview") {
            setTimeout(() => { openPreview() }, 0)
          }
        }
      } catch {
        // 保持默认 draft
      } finally {
        if (mounted) setLoadingConfig(false)
      }
    }
    loadSavedManifest()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.appId])

  return (
    <main className="h-[100dvh] overflow-hidden bg-gradient-to-br from-white via-blue-50 to-green-50">
      <div className="max-w-[100rem] mx-auto p-3 h-full">
        <Card className="p-0 overflow-hidden h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={22} minSize={18} className="bg-white">
              <div className="h-full overflow-y-auto p-3 space-y-3">
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
                            {/* <Button variant="outline" size="sm" onClick={() => openRouteDialog(idx)} title={item.route || "/route"}>
                              <Link2 className="w-4 h-4 mr-1" />{lang === "zh" ? "路由" : "Route"}
                            </Button> */}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const pageKey = (item.route || '').replace(/^\//, '') || item.key
                                if (pageKey) {
                                  try {
                                    const r = item.route?.startsWith('/') ? item.route : `/${pageKey}`
                                    const u = new URL(`http://localhost:3005/${lang}${r}`)
                                    setPreviewUrl(u.toString())
                                  } catch {
                                    const r = item.route?.startsWith('/') ? item.route : `/${pageKey}`
                                    setPreviewUrl(`http://localhost:3005/${lang}${r}`)
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
                                setDraft((s: any) => {
                                  const next = { ...s, app: { ...s.app, bottomNav: s.app.bottomNav.filter((_: any, i: number) => i !== idx) } }
                                  setTimeout(() => { savePreview(next, true) }, 0)
                                  return next
                                })
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
                            const u = new URL(`http://localhost:3005/${baseLang}/auth/login`)
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
                    {/* 数据映射：卡片入参字段 → 表字段 */}
                    <div className="pt-2 space-y-2">
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{lang === 'zh' ? '数据映射' : 'Field Mapping'}</span>
                        <span className="text-[10px] text-muted-foreground">{lang === 'zh' ? '将卡片入参字段映射到所选数据源表字段' : 'Map card input fields to table fields'}</span>
                      </div>
                      {/* 分组：按 cardType::dataSourceKey 聚合 */}
                      <div className="space-y-3">
                        {Object.entries(incomingMappings || {}).length === 0 && (
                          <div className="text-xs text-muted-foreground px-1">{lang === 'zh' ? '等待子页面选择数据源后将自动出现映射项' : 'Mappings will appear after selecting data source in preview'}</div>
                        )}
                        {Object.entries(incomingMappings || {}).map(([mappingKey, ctx]) => {
                          const inputKeys = extractInputKeys(ctx.inputs || {})
                          const boundKey = bindingByMappingKey[mappingKey] || ctx.dataSourceKey || ''
                          const fieldOptions = tableFieldsByDsKey[boundKey] || []
                          const currentMap = mappingSelections[mappingKey] || {}
                          return (
                            <div key={mappingKey} className="border rounded-md p-2">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-medium">
                                  {ctx.cardName || ctx.cardType} → <span className="text-muted-foreground">{(draft.dataSources || {})[boundKey]?.label || ctx.dataSourceLabel || boundKey || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-[10px] text-muted-foreground">{new Date(ctx.timestamp).toLocaleString()}</div>
                                  <Button size="sm" variant="outline" onClick={() => deleteMappingGroup(mappingKey)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {inputKeys.length === 0 ? (
                                <div className="text-xs text-muted-foreground">{lang === 'zh' ? '暂无卡片入参字段' : 'No input fields'}</div>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  {inputKeys.map((ik) => (
                                    <div key={`${mappingKey}::${ik}`} className="flex items-center gap-2">
                                      <div className="text-xs w-40 truncate" title={ik}>{ik}</div>
                                      <div className="flex-1">
                                        <Select
                                          disabled={fieldOptions.length === 0 || !boundKey}
                                          value={fieldOptions.length > 0 ? ((currentMap[ik] ?? undefined) as any) : (undefined as any)}
                                          onValueChange={(v) => setMappingValue(mappingKey, ik, v)}
                                        >
                                          <SelectTrigger className="max-w-[80px] w-full truncate"><SelectValue placeholder={lang === 'zh' ? '选择字段' : 'Choose field'} /></SelectTrigger>
                                          <SelectContent>
                                            {fieldOptions.length === 0 ? (
                                              <SelectItem disabled value="__no_fields__">{lang === 'zh' ? '（无可用字段）' : '(no fields)'}</SelectItem>
                                            ) : (
                                              fieldOptions.map((fo) => (
                                                <SelectItem key={String(fo.key)} value={String(fo.key)}>{fo.label || String(fo.key)}</SelectItem>
                                              ))
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button size="sm" variant="ghost" onClick={() => clearFieldMapping(mappingKey, ik)} title={lang === 'zh' ? '清除该字段映射' : 'Clear mapping'}>
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : pageUIOpen ? (
                  // 左侧：页面配置编辑视图
                  <div className="h-full overflow-y-auto p-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setPageUIOpen(false);
                        setPreviewSource("preview");
                        setViewTab("preview");
                        try {
                          const baseLang = (draft.app?.defaultLanguage || "zh") as string;
                          const dataParam = encodeURIComponent(JSON.stringify(draft?.dataSources || {}))
                          const url = `http://localhost:3005/${baseLang}/preview?previewId=${previewId}&device=${device}&appId=${params.appId}&data=${dataParam}`
                          setPreviewUrl(url);
                        } catch { }
                      }}>
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
                    </div>
                    {/* 开关项 */}
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center justify-between border rounded-md px-3 py-2">
                        <span>{lang === "zh" ? "开启 顶部栏" : "Show Header"}</span>
                        <Switch checked={!!(activePageKey && draft.pages?.[activePageKey]?.options?.showHeader !== false)} onCheckedChange={(v) => setDraft((s: any) => { const k = activePageKey as string; const next = { ...s }; next.pages = next.pages || {}; const p = next.pages[k] || {}; p.options = { ...(p.options || {}), showHeader: !!v }; next.pages[k] = p; return next })} />
                      </label>
                      {/* 顶部不再放全局底部导航开关，移到底部 */}
                      <div />
                    </div>

                    {/* 顶部标签栏 */}
                    <div className="space-y-2 pt-2">
                      <div className="text-xs text-muted-foreground">{lang === 'zh' ? '顶部标签栏（开启顶部栏后可用）' : 'Top Tabs (requires header)'} </div>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center justify-between border rounded-md px-3 py-2">
                          <span>{lang === 'zh' ? '开启 顶部标签栏' : 'Enable Top Tabs'}</span>
                          <Switch checked={!!(activePageKey && (draft.pages as any)?.[activePageKey]?.topBar?.enabled)} onCheckedChange={(v) => setDraft((s: any) => { const k = activePageKey as string; const n = { ...s }; n.pages = n.pages || {}; const p = n.pages[k] || {}; p.topBar = { ...(p.topBar || {}), enabled: !!v, tabs: Array.isArray(p.topBar?.tabs) ? p.topBar?.tabs : [] }; n.pages[k] = p; return n })} />
                        </label>
                      </div>
                      {/* 标签行：按截图样式，内联标签 + 右侧一个"增加标签"按钮 */}
                      {Boolean((draft.pages as any)?.[activePageKey]?.topBar?.enabled) && (
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-8 overflow-x-auto flex-nowrap">
                            {(() => {
                              const raw = (draft.pages as any)?.[activePageKey]?.topBar?.tabs || []
                              const safeTabs = uniqueTabs(raw)
                              return safeTabs.map((t: any, idx: number) => (
                                <button key={`tabkey-${t?.id || idx}`}
                                  className={`relative text-lg flex-shrink-0 ${pageTabIndex === idx ? 'text-primary' : 'text-foreground'}`}
                                  onClick={() => setPageTabIndex(idx)}
                                >
                                  {t.title || `${lang === 'zh' ? '标签栏' : ''}${idx + 1}`}
                                  {pageTabIndex === idx && (<span className="absolute left-0 right-0 -bottom-1 mx-auto block h-1 w-20 bg-primary rounded-full" />)}
                                </button>
                              ))
                            })()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setAddTabTitle(""); setTabManagerOpen(true) }}>{lang === 'zh' ? '增加/管理' : 'Add/Manage'}</Button>
                          </div>
                        </div>
                      )}
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
                      {/* 若为文字标签，渲染可切换的预览标签栏（按新模型推导） */}
                      {(() => { try { const p = (draft.pages as any)?.[activePageKey] || {}; const eff = p?.topBar?.enabled ? (p?.tabContent?.[pageTabIndex]?.contentNav) : p?.contentNav; return !!eff && eff.style === 'text' } catch { return false } })() && (
                        <div className="mt-2 px-1">
                          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                            {(((draft.pages as any)[activePageKey]?.contentNav?.items) || []).map((it: any, idx: number) => (
                              <button key={idx}
                                className={`relative pb-1 text-sm ${pageTabIndex === idx ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => {
                                  setPageTabIndex(idx)
                                  try {
                                    const k = activePageKey as string
                                    const cfg = draft.pages?.[k] || {}
                                    const base = String(previewUrl || `http://localhost:3005/${lang}/p/${k.replace(/^p-/, '')}`)
                                    fetch('http://localhost:3007/api/page-configs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) })
                                      .then(r => r.json().catch(() => null))
                                      .then(j => {
                                        const id = j && (j.id || j.data?.id)
                                        const u = new URL(base)
                                        if (id) u.searchParams.set('cfgId', String(id))
                                        u.searchParams.set('tab', String(idx))
                                        setPreviewUrl(u.toString())
                                      })
                                      .catch(() => {
                                        const u = new URL(base)
                                        u.searchParams.set('tab', String(idx))
                                        setPreviewUrl(u.toString())
                                      })
                                    setViewTab('preview')
                                  } catch { }
                                }}>
                                {it?.title || `${lang === 'zh' ? '标签' : 'Tab'} ${idx + 1}`}
                                {pageTabIndex === idx && (<span className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-0.5 w-6 bg-primary rounded-full" />)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 若为图标形式，渲染预览的图标导航并支持点击切换配置的分区（索引） */}
                      {(() => { try { const p = (draft.pages as any)?.[activePageKey] || {}; const eff = p?.topBar?.enabled ? (p?.tabContent?.[pageTabIndex]?.contentNav) : p?.contentNav; return !!eff && eff.style === 'icon' } catch { return false } })() && (
                        <div className="mt-2 px-1">
                          <div className="text-[11px] text-muted-foreground mb-1">{lang === 'zh' ? '点击图标以切换配置的卡片区域' : 'Click icon to switch section being configured'}</div>
                          <div className="flex items-center gap-5 overflow-x-auto scrollbar-hide py-2">
                            {(((draft.pages as any)[activePageKey]?.contentNav?.items) || []).map((it: any, idx: number) => (
                              <button key={idx}
                                className={`flex flex-col items-center gap-1 ${pageTabIndex === idx ? 'text-primary' : 'text-foreground'}`}
                                onClick={() => {
                                  setPageTabIndex(idx)
                                  try {
                                    const k = activePageKey as string
                                    const cfg = draft.pages?.[k] || {}
                                    const base = String(previewUrl || `http://localhost:3005/${lang}/p/${k.replace(/^p-/, '')}`)
                                    fetch('http://localhost:3007/api/page-configs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) })
                                      .then(r => r.json().catch(() => null))
                                      .then(j => {
                                        const id = j && (j.id || j.data?.id)
                                        const u = new URL(base)
                                        if (id) u.searchParams.set('cfgId', String(id))
                                        u.searchParams.set('tab', String(idx))
                                        setPreviewUrl(u.toString())
                                      })
                                      .catch(() => {
                                        const u = new URL(base)
                                        u.searchParams.set('tab', String(idx))
                                        setPreviewUrl(u.toString())
                                      })
                                    setViewTab('preview')
                                  } catch { }
                                }}>
                                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200" />
                                <div className="text-xs opacity-70">{it?.title || `Item ${idx + 1}`}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* 数据定义（页面配置内复用） */}
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
                    {/* 数据映射（页面配置内复用） */}
                    <div className="pt-2 space-y-2">
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{lang === 'zh' ? '数据映射' : 'Field Mapping'}</span>
                        <span className="text-[10px] text-muted-foreground">{lang === 'zh' ? '将卡片入参字段映射到所选数据源表字段' : 'Map card input fields to table fields'}</span>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(incomingMappings || {}).length === 0 && (
                          <div className="text-xs text-muted-foreground px-1">{lang === 'zh' ? '等待子页面选择数据源后将自动出现映射项' : 'Mappings will appear after selecting data source in preview'}</div>
                        )}
                        {Object.entries(incomingMappings || {}).map(([mappingKey, ctx]) => {
                          const inputKeys = extractInputKeys(ctx.inputs || {})
                          const boundKey = bindingByMappingKey[mappingKey] || ctx.dataSourceKey || ''
                          const fieldOptions = tableFieldsByDsKey[boundKey] || []
                          const currentMap = mappingSelections[mappingKey] || {}
                          return (
                            <div key={mappingKey} className="border rounded-md p-2">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-medium">
                                  {ctx.cardName || ctx.cardType} → <span className="text-muted-foreground">{(draft.dataSources || {})[boundKey]?.label || ctx.dataSourceLabel || boundKey || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-[10px] text-muted-foreground">{new Date(ctx.timestamp).toLocaleString()}</div>
                                  <Button size="sm" variant="outline" onClick={() => deleteMappingGroup(mappingKey)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {inputKeys.length === 0 ? (
                                <div className="text-xs text-muted-foreground">{lang === 'zh' ? '暂无卡片入参字段' : 'No input fields'}</div>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  {inputKeys.map((ik) => (
                                    <div key={`${mappingKey}::${ik}`} className="flex items-center gap-2">
                                      <div className="text-xs w-40 truncate" title={ik}>{ik}</div>
                                      <div className="flex-1">
                                        <Select
                                          disabled={fieldOptions.length === 0 || !boundKey}
                                          value={fieldOptions.length > 0 ? ((currentMap[ik] ?? undefined) as any) : (undefined as any)}
                                          onValueChange={(v) => setMappingValue(mappingKey, ik, v)}
                                        >
                                          <SelectTrigger className="max-w-[80px] w-full truncate"><SelectValue placeholder={lang === 'zh' ? '选择字段' : 'Choose field'} /></SelectTrigger>
                                          <SelectContent>
                                            {fieldOptions.length === 0 ? (
                                              <SelectItem disabled value="__no_fields__">{lang === 'zh' ? '（无可用字段）' : '(no fields)'}</SelectItem>
                                            ) : (
                                              fieldOptions.map((fo) => (
                                                <SelectItem key={String(fo.key)} value={String(fo.key)}>{fo.label || String(fo.key)}</SelectItem>
                                              ))
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button size="sm" variant="ghost" onClick={() => clearFieldMapping(mappingKey, ik)} title={lang === 'zh' ? '清除该字段映射' : 'Clear mapping'}>
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {/* 主内容 / 其他卡片占位 */}
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">{lang === "zh" ? "主内容" : "Main Content"}</div>
                      {/* 直接显示真实卡片的映射行（不再包裹在占位卡片内） */}
                      <div className="space-y-2">
                        {(workspaceCardsByCategory[activeWorkspaceCategory] || []).map((it: any) => (
                          <div key={it.type} className="px-3 py-2 rounded-xl border bg-white flex items-center justify-between">
                            <span className="truncate text-sm text-foreground">{it.displayName || it.type}</span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                // 在右侧代码编辑器打开虚拟文件 pages/{pageKey}/cards/{sectionKey}/{cardType}.json
                                try {
                                  const k = activePageKey as string
                                  const tba = (draft.pages as any)?.[k]?.topBar
                                  const sectionKey = tba?.enabled ? `tab-${pageTabIndex}` : `icon-${pageTabIndex}`
                                  const path = `pages/${k}/cards/${sectionKey}/${it.type}.json`
                                  // 请求预览返回当前覆盖，若存在则填充
                                  window.frames[0]?.postMessage({ type: 'GET_OVERRIDE', pageId: k.replace(/^p-/, ''), sectionKey, cardType: it.type }, '*')
                                  setTimeout(() => {
                                    const content = virtualFiles[path] || defaultCardTemplate()
                                    setJsonText(content)
                                    setCodeScope('page')
                                    setViewTab('code')
                                    setActiveCardPath(path)
                                    setActiveCardMeta({ pageKey: k, sectionKey, cardType: it.type })
                                    setMonacoLanguage('json')
                                  }, 100)
                                } catch { }
                              }}>{lang === 'zh' ? '配置' : 'Config'}</Button>
                              {/* JSX 编辑暂时隐藏 */}
                              <Button size="sm" variant="outline" onClick={() => { setDisplayCardName(it.displayName || it.type); setDisplayCardType(it.type); setDisplayOpen(true); setDisplayLimit("1"); setDisplayUnlimited(false); setDisplayMode('time') }}>{lang === 'zh' ? '显示' : 'Display'}</Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                try {
                                  const k = activePageKey as string
                                  const tbb = (draft.pages as any)?.[k]?.topBar
                                  const sectionKey = tbb?.enabled ? `tab-${pageTabIndex}` : `icon-${pageTabIndex}`
                                  setFilterCardName(it.displayName || it.type)
                                  setFilterCardType(it.type)
                                  // 优先级：已有 filters.dataSourceKey -> incomingMappings 的 dsKey/tableId -> 第一个表数据源
                                  let preferredKey = ''
                                  // 1) 从 overrides 中读取（若存在）
                                  try {
                                    const raw = localStorage.getItem(`APP_PAGE_${k.replace(/^p-/, '')}`)
                                    const cfg = raw ? JSON.parse(raw) : {}
                                    const ov = cfg?.overrides?.[sectionKey]?.[it.type]
                                    const ovKey = ov?.filters?.dataSourceKey
                                    if (ovKey) preferredKey = String(ovKey)
                                  } catch { }
                                  // 2) 从 incomingMappings 匹配当前卡片，取其 dsKey 或 tableId
                                  if (!preferredKey) {
                                    try {
                                      const entries = Object.entries(incomingMappings || {})
                                      const hit = entries.find(([mKey, ctx]: any) => String(ctx?.cardType) === String(it.type))?.[1] as any
                                      if (hit) {
                                        if (hit.dataSourceKey) preferredKey = String(hit.dataSourceKey)
                                        else if (hit.tableId) preferredKey = `table:${String(hit.tableId)}`
                                      }
                                    } catch { }
                                  }
                                  // 3) 回退到第一个“表”数据源
                                  if (!preferredKey) preferredKey = tableDataSources[0]?.key || ''
                                  setFilterDsKey(preferredKey)
                                  loadFilterFields(preferredKey)
                                  // 请求预览回传覆盖（用于回填字段勾选）
                                  window.frames[0]?.postMessage({ type: 'GET_OVERRIDE', pageId: k.replace(/^p-/, ''), sectionKey, cardType: it.type }, '*')
                                  setFilterOpen(true)
                                } catch { }
                              }}>{lang === 'zh' ? '筛选' : 'Filter'}</Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                try {
                                  const k = activePageKey as string
                                  const tbc = (draft.pages as any)?.[k]?.topBar
                                  const sectionKey = tbc?.enabled ? `tab-${pageTabIndex}` : `icon-${pageTabIndex}`
                                  // 读取已存在的映射
                                  const existing: string | undefined = (draft.pages?.[k]?.innerPages && (draft.pages as any)[k].innerPages[sectionKey] && (draft.pages as any)[k].innerPages[sectionKey][it.type])
                                  let pageKey = existing
                                  setDraft((s: any) => {
                                    const next = { ...s }
                                    next.pages = next.pages || {}
                                    // 若不存在则创建一页并写入映射
                                    if (!pageKey) {
                                      const gen = `p-${Date.now().toString(36)}`
                                      pageKey = gen
                                      next.pages[gen] = { title: { zh: `${it.displayName || it.type}内页`, en: `${it.displayName || it.type} Detail` }, layout: 'mobile', route: `/${gen}`, options: { showBack: true }, cards: [] }
                                      const host = next.pages[k] || {}
                                      host.innerPages = host.innerPages || {}
                                      host.innerPages[sectionKey] = host.innerPages[sectionKey] || {}
                                      host.innerPages[sectionKey][it.type] = gen
                                      next.pages[k] = host
                                    }
                                    return next
                                  })
                                  // 跳转预览该内页，并将页面配置通过 pageCfg 注入运行端，保证标题等元信息立即生效
                                  setTimeout(() => {
                                    try {
                                      const rawCfg = (draft.pages && (draft as any).pages[pageKey as string]) || { title: { zh: `${it.displayName || it.type}内页`, en: `${it.displayName || it.type} Detail` }, layout: 'mobile', route: `/${pageKey}` }
                                      const cfg = { ...rawCfg, options: { ...(rawCfg?.options || {}), showBack: true } }
                                      // 将配置上传到后端，返回 cfgId，避免 URL 过长
                                      fetch('http://localhost:3007/api/page-configs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) })
                                        .then(r => r.json().catch(() => null))
                                        .then(j => {
                                          const id = j && (j.id || j.data?.id)
                                          const u = new URL(`http://localhost:3005/${lang}/p/${String(pageKey).replace(/^p-/, '')}`)
                                          if (id) u.searchParams.set('cfgId', String(id))
                                          setPreviewUrl(u.toString())
                                        })
                                        .catch(() => {
                                          const u = new URL(`http://localhost:3005/${lang}/p/${String(pageKey).replace(/^p-/, '')}`)
                                          setPreviewUrl(u.toString())
                                        })
                                      setActivePageKey(String(pageKey))
                                      setPageUIOpen(true)
                                      setViewTab('preview')
                                    } catch { }
                                  }, 0)
                                } catch { }
                              }}>{lang === 'zh' ? '内页' : 'Inner'}</Button>
                            </div>
                          </div>
                        ))}
                        {(!workspaceCardsByCategory[activeWorkspaceCategory] || workspaceCardsByCategory[activeWorkspaceCategory].length === 0) && (
                          <div className="text-xs opacity-60">{lang === 'zh' ? '右侧新增卡片后，将自动出现在这里以配置显示' : 'New cards added on the right will appear here for display config.'}</div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{lang === "zh" ? "其他卡片" : "Other Cards"}</div>
                      {/* <div className="border rounded-xl p-3 opacity-90">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{lang === "zh" ? "卡片2" : "Card 2"}</div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">{lang === "zh" ? "配置" : "Config"}</Button>
                            <Button size="sm" variant="outline">{lang === "zh" ? "显示" : "Display"}</Button>
                            <Button size="sm" variant="outline">{lang === "zh" ? "内页" : "Detail"}</Button>
                          </div>
                        </div>
                      </div> */}
                    </div>
                    {/* 保留浏览（应用配置到预览）放在页面设置面板底部 */}
                    <div className="pt-2 space-y-2">
                      {/* 全局底部导航开关移至底部 */}
                      <label className="flex items-center justify-between border rounded-md px-3 py-2">
                        <span>{lang === "zh" ? "开启 全局底部导航" : "Show Bottom Nav"}</span>
                        <Switch checked={!!(activePageKey && draft.pages?.[activePageKey]?.options?.showBottomNav !== false)} onCheckedChange={(v) => setDraft((s: any) => { const k = activePageKey as string; const next = { ...s }; next.pages = next.pages || {}; const p = next.pages[k] || {}; p.options = { ...(p.options || {}), showBottomNav: !!v }; next.pages[k] = p; return next })} />
                      </label>
                      <Button size="sm" className="w-full" onClick={() => {
                        try {
                          const k = activePageKey as string
                          const cfg = draft.pages?.[k] || {}
                          const base = String(previewUrl || `http://localhost:3005/${lang}/p/${k.replace(/^p-/, '')}`)
                          fetch('http://localhost:3007/api/page-configs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) })
                            .then(r => r.json().catch(() => null))
                            .then(j => {
                              const id = j && (j.id || j.data?.id)
                              const u = new URL(base)
                              if (id) u.searchParams.set('cfgId', String(id))
                              setPreviewUrl(u.toString())
                            })
                            .catch(() => {
                              const u = new URL(base)
                              setPreviewUrl(u.toString())
                            })
                          setViewTab('preview')
                        } catch { }
                      }}>{lang === 'zh' ? '保留浏览' : 'Keep Preview'}</Button>
                    </div>
                  </div>
                ) : (
                  // 左侧：登录配置编辑视图
                  <div className="h-full p-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setAuthUIOpen(false); setPreviewSource("preview"); setViewTab("preview"); try { const baseLang = (draft.app?.defaultLanguage || "zh") as string; const dataParam = encodeURIComponent(JSON.stringify(draft?.dataSources || {})); const url = `http://localhost:3005/${baseLang}/preview?previewId=${previewId}&device=${device}&appId=${params.appId}&data=${dataParam}`; setPreviewUrl(url); } catch { } }}>
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
            {/* 事件配置通用弹窗 */}
            <EventConfigDialog
              open={eventDialogOpen}
              onOpenChange={setEventDialogOpen}
              lang={lang as any}
              pages={Object.keys(draft.pages || { home: {} })}
              value={(() => {
                const i = eventEditingIndex
                if (i == null) return undefined
                const it = cnItems[i]
                return it?.event as EventConfig | undefined
              })()}
              onSave={(val) => {
                if (eventEditingIndex == null) return
                setCnItems((s: any[]) => s.map((x, i) => i === eventEditingIndex ? { ...x, event: val } : x))
              }}
            />

            {/* 内容导航配置弹窗 */}
            <Dialog open={contentNavOpen} onOpenChange={setContentNavOpen}>
              <DialogContent className="max-w-[760px] w-[95vw] max-h-[85vh] bg-white">
                <DialogHeader>
                  <DialogTitle>{lang === 'zh' ? '内容导航配置' : 'Content Navigation'}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[62vh] pr-2">
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
                                <Button size="sm" variant="outline" onClick={() => handleUploadCnImage(idx)}>{lang === 'zh' ? '上传图片' : 'Upload'}</Button>
                              )}
                              <Button size="sm" variant="secondary" onClick={() => openEventDialogForItem(idx)}>{lang === 'zh' ? '事件' : 'Event'}</Button>
                              <Button size="icon" variant="ghost" onClick={() => setCnItems((s: any[]) => s.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setCnItems((s: any[]) => [...s, { title: '' }])}><Plus className="w-4 h-4 mr-1" />{lang === 'zh' ? '新增导航' : 'Add Item'}</Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
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
                    <Button variant="default" onClick={saveAll} disabled={saving}>
                      {saving ? (lang === "zh" ? "保存中..." : "Saving...") : (lang === "zh" ? "保存" : "Save")}
                    </Button>
                    <Button onClick={openPreview}>
                      {lang === "zh" ? (previewUrl ? "刷新预览" : "生成预览") : (previewUrl ? "Refresh" : "Generate")}
                    </Button>
                    <Button variant="outline" disabled title={lang === "zh" ? "PC 预览稍后提供" : "PC preview later"}>PC</Button>
                    <Button variant={device === "mobile" ? "default" : "outline"} onClick={() => setDevice("mobile")}>Mobile</Button>
                    <Button variant="outline" onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "中/EN" : "EN/中"}</Button>
                    {/* <Button variant="secondary" onClick={() => setAiOpsOpen(true)}>
                      {lang === "zh" ? "AI运营" : "AI Ops"}
                    </Button> */}
                    <a href={`http://localhost:3007/docs/apps/${params.appId}/swagger`} target="_blank" rel="noreferrer">
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
                              <div key={k} className="space-y-1">
                                <Button
                                  variant={codeScope === "page" && activePage === k && !activeCardPath ? "default" : "ghost"}
                                  className="w-full justify-start text-xs"
                                  onClick={() => { setActivePage(k); setActiveCardPath(""); setActiveCardMeta(null); setMonacoLanguage('json'); setCodeScope("page") }}
                                >pages/{k}.json</Button>
                                {/* 渲染该页面下的卡片文件 */}
                                {(() => {
                                  const prefix = `pages/${k}/cards/`
                                  const keys = Object.keys(virtualFiles).filter((p) => p.startsWith(prefix))
                                  if (keys.length === 0) return null
                                  return (
                                    <div className="ml-2 pl-2 border-l space-y-1">
                                      {keys.sort().map((path) => {
                                        const rest = path.slice(prefix.length) // section/card.ext
                                        const parts = rest.split('/')
                                        if (parts.length < 2) return null
                                        const sectionKey = parts[0]
                                        const fileName = parts.slice(1).join('/')
                                        if (fileName.endsWith('.tsx')) return null
                                        const isActive = activeCardPath === path
                                        return (
                                          <Button
                                            key={path}
                                            variant={isActive ? 'default' : 'ghost'}
                                            className="w-full justify-start text-xs"
                                            onClick={() => {
                                              try {
                                                const ext = path.endsWith('.tsx') ? 'typescript' : 'json'
                                                setActivePage(k)
                                                setActiveCardPath(path)
                                                const name = fileName.replace(/\.tsx$|\.json$/, '')
                                                const cardType = name.includes('.') ? name.split('.')[0] : name
                                                setActiveCardMeta({ pageKey: k, sectionKey, cardType })
                                                setMonacoLanguage(ext as any)
                                                setJsonText(virtualFiles[path] || '')
                                                setViewTab('code')
                                                setCodeScope('page')
                                              } catch { }
                                            }}
                                          >cards/{sectionKey}/{fileName}</Button>
                                        )
                                      })}
                                    </div>
                                  )
                                })()}
                              </div>
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
                          defaultLanguage={monacoLanguage}
                          language={monacoLanguage}
                          theme="vs"
                          value={jsonText}
                          onChange={(v) => {
                            const next = v || ""
                            setJsonText(next)
                            if (activeCardPath) {
                              if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
                              debounceTimerRef.current = setTimeout(() => {
                                try {
                                  setVirtualFiles((vf) => ({ ...vf, [activeCardPath]: next }))
                                  if (activeCardMeta) {
                                    const pageIdPure = activeCardMeta.pageKey.replace(/^p-/, '')
                                    if (activeCardPath.endsWith('.json')) {
                                      if (remoteApplyingRef.current) { remoteApplyingRef.current = false; return }
                                      const parsed = JSON.parse(next || '{}')
                                      window.frames[0]?.postMessage({ type: 'SET_OVERRIDE', pageId: pageIdPure, sectionKey: activeCardMeta.sectionKey, cardType: activeCardMeta.cardType, props: parsed }, '*')
                                    } else if (activeCardPath.endsWith('.tsx')) {
                                      window.frames[0]?.postMessage({ type: 'SET_OVERRIDE', pageId: pageIdPure, sectionKey: activeCardMeta.sectionKey, cardType: activeCardMeta.cardType, jsx: next }, '*')
                                    }
                                  }
                                } catch { }
                              }, 300)
                            }
                          }}
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
                      <iframe id="my-app-iframe" src={`${previewUrl}&isEdite=true`} className="w-full h-full" />
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
      {/* 统一的标签管理弹窗（含新增/重命名/删除/排序） */}

      {/* 标签管理弹窗：新增、重命名、删除、排序；并生成唯一key */}
      <Dialog open={tabManagerOpen} onOpenChange={setTabManagerOpen}>
        <DialogContent className="max-w-[560px] w-[96vw] bg-white">
          <DialogHeader>
            <DialogTitle>{lang === 'zh' ? '标签管理' : 'Manage Tabs'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label>{lang === 'zh' ? '新增标签名称' : 'New Tab Title'}</Label>
                <Input value={addTabTitle} onChange={(e) => setAddTabTitle(e.target.value)} placeholder={lang === 'zh' ? '例如：推荐' : 'e.g. Featured'} />
              </div>
              <Button onClick={() => {
                try {
                  const title = (addTabTitle || '').trim(); if (!title) return; const uid = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; setDraft((s: any) => {
                    const k = activePageKey as string; const n = { ...s }; n.pages = n.pages || {}; const p = n.pages[k] || {}; const existed = Array.isArray(p.topBar?.tabs) ? p.topBar.tabs : [];
                    const merged = uniqueTabs([...(Array.isArray(existed) ? existed : []), { id: uid, title }])
                    p.topBar = { ...(p.topBar || { enabled: true }), tabs: merged }; n.pages[k] = p; return n
                  }); setAddTabTitle("")
                } catch { }
              }}>{lang === 'zh' ? '新增' : 'Add'}</Button>
            </div>
            {(((draft.pages as any)?.[activePageKey]?.topBar?.tabs) || []).length === 0 && (
              <div className="text-xs text-muted-foreground">{lang === 'zh' ? '暂无标签，请先新增' : 'No tabs yet. Add one first.'}</div>
            )}
            {uniqueTabs(((draft.pages as any)?.[activePageKey]?.topBar?.tabs) || []).map((t: any, idx: number) => (
              <div key={`mgr-${t.id || idx}`} className="grid grid-cols-[24px_1fr_auto] items-center gap-2 border rounded-md px-2 py-2">
                <div className="text-xs">{idx + 1}</div>
                <Input className="h-8" value={t.title || ''} onChange={(e) => setDraft((s: any) => { const k = activePageKey as string; const n = { ...s }; n.pages = n.pages || {}; const p = n.pages[k] || {}; const existed = Array.isArray(p.topBar?.tabs) ? p.topBar.tabs : []; const list = uniqueTabs(existed); list[idx] = { ...(list[idx] || {}), title: e.target.value, id: list[idx]?.id || `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }; p.topBar = { ...(p.topBar || { enabled: true }), tabs: list }; n.pages[k] = p; return n })} />
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setDraft((s: any) => { const k = activePageKey as string; const n = { ...s }; n.pages = n.pages || {}; const p = n.pages[k] || {}; const list = uniqueTabs(Array.isArray(p.topBar?.tabs) ? p.topBar.tabs : []); if (idx > 0) { const tmp = list[idx - 1]; list[idx - 1] = list[idx]; list[idx] = tmp } p.topBar = { ...(p.topBar || { enabled: true }), tabs: list }; n.pages[k] = p; return n })}>↑</Button>
                  <Button size="icon" variant="ghost" onClick={() => setDraft((s: any) => { const k = activePageKey as string; const n = { ...s }; n.pages = n.pages || {}; const p = n.pages[k] || {}; const list = uniqueTabs(Array.isArray(p.topBar?.tabs) ? p.topBar.tabs : []); if (idx < list.length - 1) { const tmp = list[idx + 1]; list[idx + 1] = list[idx]; list[idx] = tmp } p.topBar = { ...(p.topBar || { enabled: true }), tabs: list }; n.pages[k] = p; return n })}>↓</Button>
                  <Button size="icon" variant="ghost" onClick={() => setDraft((s: any) => { const k = activePageKey as string; const n = { ...s }; n.pages = n.pages || {}; const p = n.pages[k] || {}; const list = uniqueTabs(Array.isArray(p.topBar?.tabs) ? p.topBar.tabs : []); list.splice(idx, 1); p.topBar = { ...(p.topBar || { enabled: true }), tabs: list }; n.pages[k] = p; return n })}>✕</Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setTabManagerOpen(false)}>{lang === 'zh' ? '完成' : 'Done'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 筛选设置弹窗（UI 先行） */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-[880px] w-[96vw] max-h-[85vh] bg-white">
          <DialogHeader>
            <DialogTitle>{lang === 'zh' ? `筛选设置：${filterCardName}` : `Filters: ${filterCardName}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 数据源选择 */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">{lang === 'zh' ? '数据源（表）' : 'Data Source (Table)'}</div>
              <div className="w-80">
                <Select value={filterDsKey} onValueChange={(v) => { setFilterDsKey(v); loadFilterFields(v) }}>
                  <SelectTrigger><SelectValue placeholder={lang === 'zh' ? '选择数据源' : 'Choose data source'} /></SelectTrigger>
                  <SelectContent>
                    {tableDataSources.map((ds) => (
                      <SelectItem key={ds.key} value={ds.key}>{ds.label || ds.key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {tableDataSources.length === 0 && (
                <div className="text-[11px] text-muted-foreground">{lang === 'zh' ? '请先在左侧添加数据源（整表）。' : 'Add a table data source first on the left.'}</div>
              )}
            </div>

            {/* 字段选择 */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">{lang === 'zh' ? '可作为筛选的字段（来自所选数据源）' : 'Fields from selected data source'}</div>
              <ScrollArea className="max-h-[40vh] border rounded-md">
                <div className="p-3 space-y-2">
                  {filterLoading && (<div className="text-xs text-muted-foreground">{lang === 'zh' ? '加载中...' : 'Loading...'}</div>)}
                  {!filterLoading && filterFields.length === 0 && (
                    <div className="text-xs text-muted-foreground">{lang === 'zh' ? '当前数据源无可用字段或数据源未选择。' : 'No fields for current data source or none selected.'}</div>
                  )}
                  {filterFields.map((f: any) => {
                    const checked = !!filterSelected[f.key]?.__checked
                    return (
                      <div key={f.key} className="grid grid-cols-[20px_1fr] items-center gap-2 border rounded-md px-2 py-2">
                        <Checkbox checked={checked} onCheckedChange={(v) => setFilterSelected((s) => ({ ...s, [f.key]: { ...(s[f.key] || { fieldId: f.key, type: f.type, label: f.label }), __checked: !!v } }))} />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{f.label}</span>
                          <span className="text-[10px] text-muted-foreground">{f.type}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
              <div className="text-[11px] text-muted-foreground">{lang === 'zh' ? '多选字段，仅用于决定出现哪些筛选标签，不在此输入默认值。' : 'Multi-select fields to show as filter tags; no defaults here.'}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterOpen(false)}>{lang === 'zh' ? '取消' : 'Cancel'}</Button>
            <Button onClick={async () => {
              try {
                const k = activePageKey as string
                const tba = (draft.pages as any)?.[k]?.topBar
                const sectionKey = tba?.enabled ? `tab-${pageTabIndex}` : `icon-${pageTabIndex}`
                const enabled = true
                const selectedFields = filterFields.filter((f: any) => filterSelected[f.key]?.__checked)
                const fieldsCfg = selectedFields.map((f: any) => ({
                  fieldId: f.key,
                  type: f.type,
                  label: f.label,
                  options: f.type === 'select' ? (Array.isArray(f.options) ? f.options : []) : undefined,
                  optionsTree: f.type === 'cascader' ? (Array.isArray(f.optionsTree) ? f.optionsTree : []) : undefined,
                }))
                const filtersCfg: any = { enabled, dataSourceKey: filterDsKey || undefined, fields: fieldsCfg }
                const cardType = filterCardType || ''
                // 1) 通知预览即时生效
                window.frames[0]?.postMessage({ type: 'SET_OVERRIDE', pageId: k.replace(/^p-/, ''), sectionKey, cardType, filters: filtersCfg }, '*')
                // 2) 同步写回到对应 JSON 文件（若已打开/存在）
                const path = `pages/${k}/cards/${sectionKey}/${cardType}.json`
                const existing = virtualFiles[path]
                if (existing) {
                  try {
                    const parsed = JSON.parse(existing || '{}')
                    const merged = { ...parsed, filters: filtersCfg }
                    const text = JSON.stringify(merged, null, 2)
                    setVirtualFiles((vf) => ({ ...vf, [path]: text }))
                    if (activeCardPath === path) {
                      remoteApplyingRef.current = true
                      setJsonText(text)
                    }
                  } catch { }
                }
                // 3) 写入到草稿 manifest：pages[k].overrides[sectionKey][cardType].filters
                let updatedDraft: any
                setDraft((s: any) => {
                  const next = { ...(s || {}) }
                  next.pages = next.pages || {}
                  const p = { ...(next.pages[k] || {}) }
                  const ov = { ...(p.overrides || {}) }
                  const sec = { ...(ov[sectionKey] || {}) }
                  const card = { ...(sec[cardType] || {}) }
                  card.filters = filtersCfg
                  sec[cardType] = card
                  ov[sectionKey] = sec
                  p.overrides = ov
                  next.pages[k] = p
                  updatedDraft = next
                  return next
                })
                // 4) 持久化到 /api/applications/[id]
                try {
                  const appId = String(params.appId)
                  let existingConfig: Record<string, any> = {}
                  try {
                    const getRes = await api.applications.getApplication(appId)
                    existingConfig = (getRes.success && getRes.data ? (getRes.data as any).config : {}) || {}
                  } catch { existingConfig = {} }
                  const nextConfig = { ...existingConfig, clientManifest: updatedDraft }
                  await api.applications.updateApplication(appId, { config: nextConfig })
                } catch { }
              } catch { }
              setFilterOpen(false)
            }}>{lang === 'zh' ? '保存' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 显示设置弹窗（UI 先行） */}
      <Dialog open={displayOpen} onOpenChange={setDisplayOpen}>
        <DialogContent className="max-w-[720px] w-[96vw] bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{lang === 'zh' ? `显示设置：${displayCardName}` : `Display: ${displayCardName}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* 数量 */}
            <div className="rounded-xl border p-4 bg-white/60">
              <div className="text-sm font-medium mb-3">{lang === 'zh' ? '显示数量' : 'Limit'}</div>
              <div className="flex items-center gap-3">
                <Input type="number" min={1} value={displayLimit} onChange={(e) => setDisplayLimit(e.target.value)} className="w-28" />
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={displayUnlimited} onCheckedChange={(v) => setDisplayUnlimited(!!v)} />
                  <span>{lang === 'zh' ? '无限显示' : 'Unlimited'}</span>
                </label>
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">{lang === 'zh' ? '数量越大渲染越多，可能影响性能' : 'Larger limits may affect performance'}</div>
            </div>
            {/* 模式 */}
            <div className="rounded-xl border p-4 bg-white/60">
              <div className="text-sm font-medium mb-3">{lang === 'zh' ? '展示来源' : 'Source'}</div>
              <div className="flex items-center gap-2 mb-3">
                <Button size="sm" variant={displayMode === 'pick' ? 'default' : 'outline'} onClick={() => setDisplayMode('pick')}>{lang === 'zh' ? '指定内容' : 'Pick'}</Button>
                <Button size="sm" variant={displayMode === 'filter' ? 'default' : 'outline'} onClick={() => setDisplayMode('filter')}>{lang === 'zh' ? '按过滤' : 'Filter'}</Button>
                <Button size="sm" variant={displayMode === 'time' ? 'default' : 'outline'} onClick={() => setDisplayMode('time')}>{lang === 'zh' ? '按时间' : 'Time'}</Button>
                <Button size="sm" variant={displayMode === 'hot' ? 'default' : 'outline'} onClick={() => setDisplayMode('hot')}>{lang === 'zh' ? '按热度' : 'Hot'}</Button>
              </div>
              {displayMode === 'pick' && (
                <div className="text-sm text-muted-foreground">{lang === 'zh' ? '选择具体内容（占位，后续接数据选择器）' : 'Pick specific items (placeholder)'}</div>
              )}
              {displayMode === 'filter' && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Input placeholder={lang === 'zh' ? '关键字' : 'Keyword'} />
                  <Input placeholder={lang === 'zh' ? '类别（占位）' : 'Category (placeholder)'} />
                  <Input placeholder={lang === 'zh' ? '标签（占位）' : 'Tags (placeholder)'} />
                </div>
              )}
              {displayMode === 'time' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-muted-foreground">{lang === 'zh' ? '按时间降序' : 'Newest first'}</div>
                </div>
              )}
              {displayMode === 'hot' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-muted-foreground">{lang === 'zh' ? '按热度降序' : 'Hotness desc'}</div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisplayOpen(false)}>{lang === 'zh' ? '取消' : 'Cancel'}</Button>
            <Button onClick={async () => {
              try {
                const k = activePageKey as string
                const tba = (draft.pages as any)?.[k]?.topBar
                const sectionKey = tba?.enabled ? `tab-${pageTabIndex}` : `icon-${pageTabIndex}`
                const limitNum = displayUnlimited ? undefined : Math.max(1, parseInt(displayLimit || '1', 10))
                const displayCfg: any = { mode: displayMode, limit: limitNum, unlimited: !!displayUnlimited }
                const cardType = displayCardType || ''
                // 1) 通知右侧预览即时生效
                window.frames[0]?.postMessage({ type: 'SET_OVERRIDE', pageId: k.replace(/^p-/, ''), sectionKey, cardType, display: displayCfg }, '*')
                // 2) 同步写回到对应 JSON 文件（若已打开/存在）
                const path = `pages/${k}/cards/${sectionKey}/${cardType}.json`
                const existing = virtualFiles[path]
                if (existing) {
                  try {
                    const parsed = JSON.parse(existing || '{}')
                    const merged = { ...parsed, display: displayCfg }
                    const text = JSON.stringify(merged, null, 2)
                    setVirtualFiles((vf) => ({ ...vf, [path]: text }))
                    if (activeCardPath === path) {
                      remoteApplyingRef.current = true
                      setJsonText(text)
                    }
                  } catch { }
                }
                // 3) 写入到草稿 manifest：pages[k].overrides[sectionKey][cardType].display
                let updatedDraft: any
                setDraft((s: any) => {
                  const next = { ...(s || {}) }
                  next.pages = next.pages || {}
                  const p = { ...(next.pages[k] || {}) }
                  const ov = { ...(p.overrides || {}) }
                  const sec = { ...(ov[sectionKey] || {}) }
                  const card = { ...(sec[cardType] || {}) }
                  card.display = displayCfg
                  sec[cardType] = card
                  ov[sectionKey] = sec
                  p.overrides = ov
                  next.pages[k] = p
                  updatedDraft = next
                  return next
                })
                // 4) 持久化到 /api/applications/[id]：挂载到 applications.config.clientManifest
                try {
                  const appId = String(params.appId)
                  let existingConfig: Record<string, any> = {}
                  try {
                    const getRes = await api.applications.getApplication(appId)
                    existingConfig = (getRes.success && getRes.data ? (getRes.data as any).config : {}) || {}
                  } catch { existingConfig = {} }
                  const nextConfig = { ...existingConfig, clientManifest: updatedDraft }
                  await api.applications.updateApplication(appId, { config: nextConfig })
                } catch { }
              } catch { }
              setDisplayOpen(false)
            }}>{lang === 'zh' ? '保存' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 卡片 JSON 配置编辑器（最小可用版） */}
      <Dialog open={cardConfigOpen} onOpenChange={setCardConfigOpen}>
        <DialogContent className="max-w-[820px] w-[96vw] max-h-[85vh] bg-white">
          <DialogHeader>
            <DialogTitle>{lang === 'zh' ? `配置：${cardConfigName}` : `Config: ${cardConfigName}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">{lang === 'zh' ? 'JSON 属性（保存后立即应用到右侧预览）' : 'JSON props (applies to preview on save)'}</div>
            <Textarea value={cardConfigText} onChange={(e) => setCardConfigText(e.target.value)} rows={16} className="font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCardConfigOpen(false)}>{lang === 'zh' ? '取消' : 'Cancel'}</Button>
            <Button onClick={() => {
              try {
                const k = activePageKey as string
                const tba = (draft.pages as any)?.[k]?.topBar
                const sectionKey = tba?.enabled ? `tab-${pageTabIndex}` : `icon-${pageTabIndex}`
                const props = JSON.parse(cardConfigText || '{}')
                window.frames[0]?.postMessage({ type: 'SET_OVERRIDE', pageId: k.replace(/^p-/, ''), sectionKey, cardType: cardConfigType, props }, '*')
                setCardConfigOpen(false)
              } catch (e: any) {
                toast({ description: e?.message || (lang === 'zh' ? 'JSON 无法解析' : 'Invalid JSON'), variant: 'destructive' as any })
              }
            }}>{lang === 'zh' ? '保存' : 'Save'}</Button>
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
