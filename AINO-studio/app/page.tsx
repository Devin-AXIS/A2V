"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Plus, SquarePen, Copy, Trash2, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getStore, saveStore, ensureDemoApp, type AppModel, builtinModules } from "@/lib/store"
import { Glass } from "@/components/glass"
import { useLocale } from "@/hooks/use-locale"
import { AddEntityDialog } from "@/components/dialogs/add-entity-dialog"
import { UserMenu } from "@/components/layout/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { useApplications } from "@/hooks/use-applications"
import { type Application } from "@/lib/api"

export default function Page() {
  const { user, isLoading: authLoading } = useAuth()
  const { t, locale, toggleLocale } = useLocale()
  
  // 新的 API 状态
  const {
    applications: apiApplications,
    isLoading: apiLoading,
    error: apiError,
    fetchApplications,
    createApplication,
    deleteApplication,
  } = useApplications({ autoFetch: false })

  // 旧的 localStorage 状态（暂时保留）
  const [localApps, setLocalApps] = useState<AppModel[]>([])
  const [kw, setKw] = useState("")
  const [openAddApp, setOpenAddApp] = useState(false)
  const [appName, setAppName] = useState("")
  const [appDesc, setAppDesc] = useState("")

  // 决定使用哪种数据源
  const isUsingApi = !!user // 如果用户已登录，使用 API
  // 只有在用户已登录且正在使用 API 时才考虑 API 加载状态
  const isLoading = authLoading || (isUsingApi ? apiLoading : false)
  const applications = isUsingApi ? apiApplications : localApps

  // 初始化数据
  useEffect(() => {
    if (isUsingApi) {
      // 使用 API 数据，手动获取应用列表
      console.log("🔄 使用 API 数据源，获取应用列表")
      fetchApplications()
    } else {
      // 使用 localStorage 数据
      console.log("💾 使用 localStorage 数据源")
      const s = getStore()
      if (s.apps.length === 0) {
        ensureDemoApp()
      }
      setLocalApps(getStore().apps)
    }
  }, [isUsingApi, fetchApplications])

  function doCreate() {
    setAppName("")
    setAppDesc("")
    setOpenAddApp(true)
  }

  // 创建应用（支持两种模式）
  async function handleCreateApp() {
    const name = appName.trim()
    if (!name) return

    if (isUsingApi) {
      // 使用 API 创建
      try {
        await createApplication({
          name,
          description: appDesc.trim(),
          template: "blank",
        })
        setOpenAddApp(false)
      } catch (error) {
        console.error("创建应用失败:", error)
      }
    } else {
      // 使用 localStorage 创建
      const id = crypto.randomUUID()
      const s = getStore()
      s.apps.push({
        id,
        name,
        desc: appDesc.trim(),
        modules: [builtinModules.baseUser(), builtinModules.baseConfig()],
      })
      saveStore(s)
      setLocalApps([...s.apps])
      setOpenAddApp(false)
    }
  }

  // 从对话框创建应用
  async function handleCreateAppFromDialog(payload: { name: string; desc?: string; templateKey: string }) {
    const { name, desc = "", templateKey } = payload

    if (isUsingApi) {
      // 使用 API 创建
      try {
        await createApplication({
          name,
          description: desc,
          template: templateKey,
        })
        setOpenAddApp(false)
      } catch (error) {
        console.error("创建应用失败:", error)
      }
    } else {
      // 使用 localStorage 创建
      const id = crypto.randomUUID()
      const s = getStore()
      const modules =
        templateKey === "blank"
          ? [builtinModules.baseUser(), builtinModules.baseConfig()]
          : templateKey === "ecom"
            ? [builtinModules.baseUser(), builtinModules.baseConfig(), builtinModules.ecom()]
            : templateKey === "edu"
              ? [builtinModules.baseUser(), builtinModules.baseConfig(), builtinModules.edu()]
              : templateKey === "content"
                ? [builtinModules.baseUser(), builtinModules.baseConfig(), builtinModules.content()]
                : templateKey === "project"
                  ? [builtinModules.baseUser(), builtinModules.baseConfig(), builtinModules.project()]
                  : [builtinModules.baseUser(), builtinModules.baseConfig()]
      s.apps.push({ id, name, desc, modules })
      saveStore(s)
      setLocalApps([...s.apps])
      setOpenAddApp(false)
    }
  }

  // 克隆应用
  function doClone(id: string) {
    if (isUsingApi) {
      // TODO: 实现 API 克隆功能
      console.log("🔄 API 克隆功能待实现")
      alert("克隆功能正在开发中...")
    } else {
      // 使用 localStorage 克隆
      const s = getStore()
      const src = s.apps.find((a) => a.id === id)
      if (!src) return
      const copy = structuredClone(src)
      copy.id = crypto.randomUUID()
      copy.name = src.name + t("copySuffix")
      s.apps.push(copy)
      saveStore(s)
      setLocalApps([...s.apps])
    }
  }

  // 删除应用
  async function doDelete(id: string) {
    if (!confirm(t("confirmDeleteApp"))) return

    if (isUsingApi) {
      // 使用 API 删除
      try {
        await deleteApplication(id)
      } catch (error) {
        console.error("删除应用失败:", error)
      }
    } else {
      // 使用 localStorage 删除
      const s = getStore()
      s.apps = s.apps.filter((a) => a.id !== id)
      saveStore(s)
      setLocalApps([...s.apps])
    }
  }

  // 过滤应用列表
  const list = useMemo(() => {
    if (!kw.trim()) return applications
    
    const l = kw.trim().toLowerCase()
    if (isUsingApi) {
      // 过滤 API 应用
      return applications.filter((app) => {
        const apiApp = app as Application
        return apiApp.name.toLowerCase().includes(l) || 
               (apiApp.description || "").toLowerCase().includes(l)
      })
    } else {
      // 过滤 localStorage 应用
      return applications.filter((app) => {
        const localApp = app as AppModel
        return localApp.name.toLowerCase().includes(l) || 
               (localApp.desc || "").toLowerCase().includes(l)
      })
    }
  }, [applications, kw, isUsingApi])

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-gradient-to-br from-white via-blue-50 to-green-50 relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </main>
    )
  }

  // 如果用户未登录，显示登录提示
  if (!user && !isLoading) {
    return (
      <main className="min-h-[100dvh] bg-gradient-to-br from-white via-blue-50 to-green-50 relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">欢迎使用 AINO</h2>
            <p className="text-muted-foreground mb-6">请先登录以使用完整功能</p>
            <Button onClick={() => window.location.href = '/login'}>
              去登录
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-white via-blue-50 to-green-50 relative">
      <div className="pointer-events-none absolute inset-0 [filter:blur(40px)]" aria-hidden />
      <header className="sticky top-0 z-20 border-b bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-gradient-to-br from-blue-500 to-orange-400 shadow-inner" />
          <h1 className="text-sm font-semibold">{t("brand")}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" className="gap-2" onClick={toggleLocale} aria-label={t("toggleLang")}>
              <Languages className="size-4" />
              <span>{locale === "zh" ? "中/EN" : "EN/中"}</span>
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-4">
        <Glass className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-semibold">
              {t("appsTitle")}
              <span className="ml-2 text-muted-foreground text-sm">
                {isUsingApi ? "已连接后端 API" : "使用本地存储"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("searchApp")}
                className="w-[220px] bg-white/60 backdrop-blur"
                value={kw}
                onChange={(e) => setKw(e.target.value)}
              />
              <Button className="shadow" onClick={doCreate}>
                <Plus className="mr-1 size-4" />
                {t("newApp")}
              </Button>
            </div>
          </div>
          
          {apiError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">API 错误: {apiError}</p>
            </div>
          )}
          
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-10">
                {isUsingApi ? "暂无应用，点击上方按钮创建第一个应用" : t("emptyAppHint")}
              </div>
            )}
            {list.map((app) => (
              <Card key={app.id} className="border-white/50 bg-white/50 backdrop-blur-md shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">
                        {isUsingApi ? (app as Application).name : (app as AppModel).name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isUsingApi 
                          ? (app as Application).description || t("noDesc")
                          : (app as AppModel).desc || t("noDesc")
                        }
                      </div>
                    </div>
                    <div className="text-xs rounded-full bg-black/5 border border-white/60 px-2 py-0.5">
                      {isUsingApi 
                        ? "API 应用"
                        : t("modulesCount", { n: (app as AppModel).modules.length })
                      }
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/app/${app.id}`}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-2 text-sm shadow",
                      )}
                    >
                      <SquarePen className="size-4" />
                      {t("enter")}
                    </Link>
                    <Button variant="secondary" className="shadow-sm" onClick={() => doClone(app.id)}>
                      <Copy className="mr-1 size-4" />
                      {t("clone")}
                    </Button>
                    <Button variant="destructive" className="shadow-sm" onClick={() => doDelete(app.id)}>
                      <Trash2 className="mr-1 size-4" />
                      {t("delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Glass>
      </div>
      <AddEntityDialog
        open={openAddApp}
        onOpenChange={setOpenAddApp}
        mode="app"
        title={t("newApp")}
        nameLabel={t("newAppNamePlaceholder")}
        namePlaceholder={t("newAppNamePlaceholder")}
        showDesc={true}
        descLabel="描述（可选）"
        descPlaceholder="应用用途简述"
        submitText={t("newApp")}
        cancelText="取消"
        templateLabel="选择应用模板"
        options={[
          { key: "blank", label: "空白应用", desc: "仅包含用户管理与全局配置" },
          { key: "ecom", label: "电商演示", desc: "电商模块 + 系统模块" },
          { key: "edu", label: "教育演示", desc: "教育模块 + 系统模块" },
          { key: "content", label: "内容演示", desc: "内容模块 + 系统模块" },
          { key: "project", label: "项目演示", desc: "项目模块 + 系统模块" },
        ]}
        defaultOptionKey="blank"
        initialName=""
        onSubmit={handleCreateAppFromDialog}
      />
    </main>
  )
}
