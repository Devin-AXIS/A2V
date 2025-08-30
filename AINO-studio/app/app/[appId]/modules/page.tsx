"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Download, Upload, Package, Star, ExternalLink, Settings, Trash2, MoreVertical } from "lucide-react"
import { ModuleConfigDialog } from "@/components/dialogs/module-config-dialog"
import { ModuleUninstallDialog } from "@/components/dialogs/module-uninstall-dialog"
import { useLocale } from "@/hooks/use-locale"

// Mock data for modules
const mockModules = [
  {
    id: "1",
    name: "用户管理模块",
    version: "1.2.0",
    description: "完整的用户管理系统，包含用户注册、登录、权限管理等功能",
    author: "内部团队",
    category: "用户管理",
    type: "internal",
    icon: "👤",
    downloads: 1250,
    rating: 4.8,
    installed: true,
    configurable: true,
  },
  {
    id: "2",
    name: "订单处理系统",
    version: "2.1.5",
    description: "电商订单管理系统，支持订单创建、支付、发货、退款等完整流程",
    author: "商务团队",
    category: "电商",
    type: "internal",
    icon: "📦",
    downloads: 890,
    rating: 4.6,
    installed: true,
    configurable: true,
  },
  {
    id: "3",
    name: "数据分析工具",
    version: "0.8.2",
    description: "强大的数据可视化和分析工具，支持多种图表类型和数据源",
    author: "第三方开发者",
    category: "分析工具",
    type: "third-party",
    icon: "📊",
    downloads: 2100,
    rating: 4.9,
    installed: false,
    configurable: true,
  },
  {
    id: "4",
    name: "消息通知中心",
    version: "1.0.0",
    description: "统一的消息推送和通知管理系统，支持邮件、短信、站内信等多种方式",
    author: "通信团队",
    category: "通信",
    type: "internal",
    icon: "📢",
    downloads: 567,
    rating: 4.4,
    installed: false,
    configurable: false,
  },
]

export default function ModulesPage() {
  const { locale } = useLocale()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("internal")
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [uninstallDialogOpen, setUninstallDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [modules, setModules] = useState(mockModules)

  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || module.type === activeTab
    return matchesSearch && matchesTab
  })

  const handleConfigureModule = (module: any) => {
    console.log("配置模块:", module.name)
    setSelectedModule(module)
    setConfigDialogOpen(true)
  }

  const handleUninstallModule = (module: any) => {
    console.log("卸载模块:", module.name)
    setSelectedModule(module)
    setUninstallDialogOpen(true)
  }

  const handleInstallModule = (module: any) => {
    setModules(prev => prev.map(m => 
      m.id === module.id ? { ...m, installed: true } : m
    ))
  }

  const handleConfirmUninstall = () => {
    if (selectedModule) {
      setModules(prev => prev.map(m => 
        m.id === selectedModule.id ? { ...m, installed: false } : m
      ))
    }
  }

  const handleSaveConfig = (config: any) => {
    // 这里可以添加保存配置的逻辑
    console.log("Saving config:", config)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{locale === "zh" ? "模块管理" : "Module Management"}</h1>
                          <p className="text-sm text-gray-600 mt-1">{locale === "zh" ? "管理和浏览所有可用的模块" : "Manage and browse all available modules"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="size-4 mr-2" />
              {locale === "zh" ? "上传模块" : "Upload Module"}
            </Button>
            <Button size="sm">
              <Plus className="size-4 mr-2" />
              {locale === "zh" ? "创建模块" : "Create Module"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-auto grid-cols-3">
              <TabsTrigger value="internal">{locale === "zh" ? "内部模块" : "Internal Modules"}</TabsTrigger>
              <TabsTrigger value="third-party">{locale === "zh" ? "第三方模块" : "Third-party Modules"}</TabsTrigger>
              <TabsTrigger value="public">{locale === "zh" ? "公用模块" : "Public Modules"}</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                <Input
                  placeholder={locale === "zh" ? "搜索模块..." : "Search modules..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>

          <TabsContent value="internal" className="mt-0">
            <ModuleGrid 
              modules={filteredModules.filter((m) => m.type === "internal")}
              onConfigure={handleConfigureModule}
              onUninstall={handleUninstallModule}
              onInstall={handleInstallModule}
            />
          </TabsContent>

          <TabsContent value="third-party" className="mt-0">
            <ModuleGrid 
              modules={filteredModules.filter((m) => m.type === "third-party")}
              onConfigure={handleConfigureModule}
              onUninstall={handleUninstallModule}
              onInstall={handleInstallModule}
            />
          </TabsContent>

          <TabsContent value="public" className="mt-0">
            <div className="text-center py-12">
              <Package className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {locale === "zh" ? "暂无公用模块" : "No Public Modules"}
              </h3>
              <p className="text-gray-600 mb-4">
                {locale === "zh" ? "您还没有上传任何模块到公用库" : "You haven't uploaded any modules to the public library yet"}
              </p>
              <Button>
                <Upload className="size-4 mr-2" />
                {locale === "zh" ? "上传第一个模块" : "Upload First Module"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ModuleConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        module={selectedModule ? {
          id: selectedModule.id,
          name: selectedModule.name,
          version: selectedModule.version,
          settings: {
            enabled: true,
            apiKey: "",
            webhookUrl: "",
            database: "mysql",
            cacheEnabled: true,
            logLevel: "info",
            maxConnections: 10,
            timeout: 30,
          }
        } : null}
        onSave={handleSaveConfig}
      />

      <ModuleUninstallDialog
        open={uninstallDialogOpen}
        onOpenChange={setUninstallDialogOpen}
        moduleName={selectedModule?.name || ""}
        onConfirm={handleConfirmUninstall}
      />
    </div>
  )
}

function ModuleGrid({ 
  modules, 
  onConfigure, 
  onUninstall, 
  onInstall 
}: { 
  modules: typeof mockModules
  onConfigure: (module: any) => void
  onUninstall: (module: any) => void
  onInstall: (module: any) => void
}) {
  const { locale } = useLocale()
  
  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="size-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {locale === "zh" ? "暂无模块" : "No Modules"}
        </h3>
        <p className="text-gray-600">
          {locale === "zh" ? "没有找到匹配的模块" : "No matching modules found"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {modules.map((module) => (
        <Card key={module.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{module.icon}</div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-medium truncate">{module.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      v{module.version}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {module.category}
                    </Badge>
                    {module.installed && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        {locale === "zh" ? "已安装" : "Installed"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {module.installed ? (
                    <>
                      {module.configurable && (
                        <DropdownMenuItem onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log("下拉菜单配置点击:", module.name)
                          onConfigure(module)
                        }}>
                          <Settings className="size-4 mr-2" />
                          {locale === "zh" ? "配置" : "Configure"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log("下拉菜单卸载点击:", module.name)
                        onUninstall(module)
                      }}>
                        <Trash2 className="size-4 mr-2" />
                        {locale === "zh" ? "卸载" : "Uninstall"}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => onInstall(module)}>
                      <Download className="size-4 mr-2" />
                      {locale === "zh" ? "安装" : "Install"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <ExternalLink className="size-4 mr-2" />
                    {locale === "zh" ? "查看详情" : "View Details"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</CardDescription>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>by {module.author}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Download className="size-3" />
                  {module.downloads}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  {module.rating}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {module.installed ? (
                <>
                  {module.configurable && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log("按钮配置点击:", module.name)
                        onConfigure(module)
                      }}
                    >
                      <Settings className="size-3 mr-1" />
                      {locale === "zh" ? "配置" : "Configure"}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log("按钮卸载点击:", module.name)
                      onUninstall(module)
                    }}
                  >
                    <Trash2 className="size-3 mr-1" />
                    {locale === "zh" ? "卸载" : "Uninstall"}
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onInstall(module)}
                >
                  <Download className="size-3 mr-1" />
                  {locale === "zh" ? "安装" : "Install"}
                </Button>
              )}
              <Button size="sm" variant="outline">
                <ExternalLink className="size-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
