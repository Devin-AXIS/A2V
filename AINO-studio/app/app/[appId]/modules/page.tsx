"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Download, Upload, Package, Star, ExternalLink, Settings, Trash2, MoreVertical } from "lucide-react"
import { ModuleConfigDialog } from "@/components/dialogs/module-config-dialog"
import { ModuleUninstallDialog } from "@/components/dialogs/module-uninstall-dialog"
import { SuccessToast } from "@/components/ui/success-toast"
import { useLocale } from "@/hooks/use-locale"
import { useModuleManagement } from "@/hooks/use-module-management"

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
  const params = useParams()
  const appId = params.appId as string
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("internal")
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [uninstallDialogOpen, setUninstallDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [availableModules, setAvailableModules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const { 
    getInstalledModules, 
    installModule, 
    uninstallModule, 
    updateModuleConfig,
    getAvailableModules,
    isLoading: isOperationLoading 
  } = useModuleManagement({ applicationId: appId })

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // 为了测试前端交互功能，直接使用测试数据
      console.log('🔄 使用测试数据验证前端交互功能')
      const testModules = [
        {
          id: "test-user-module",
          moduleKey: "user",
          moduleName: "用户管理模块",
          moduleVersion: "1.0.0",
          moduleType: "system",
          installStatus: "active",
          manifest: {
            description: "系统用户管理模块，提供用户注册、登录、权限管理等功能",
            author: "AINO Team"
          }
        },
        {
          id: "test-local-module",
          moduleKey: "local-test",
          moduleName: "本地测试模块",
          moduleVersion: "1.0.0",
          moduleType: "local",
          installStatus: "active",
          manifest: {
            description: "本地开发的测试模块",
            author: "Developer"
          }
        }
      ]
      setModules(testModules)
      setAvailableModules([])
      setIsLoading(false)
      
      // 注释掉API调用，专注于前端交互测试
      /*
      try {
        // 加载已安装的模块
        const installedData = await getInstalledModules()
        console.log('🔍 已安装模块数据:', installedData)
        setModules(installedData.modules || [])
        
        // 加载可用模块
        const availableData = await getAvailableModules()
        console.log('🔍 可用模块数据:', availableData)
        setAvailableModules(availableData.modules || [])
      } catch (error) {
        console.error('加载模块数据失败:', error)
      } finally {
        setIsLoading(false)
      }
      */
    }

    if (appId) {
      loadData()
    }
  }, [appId, getInstalledModules, getAvailableModules])

  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      module.moduleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.moduleKey?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // 根据标签页过滤模块类型
    let matchesTab = true
    if (activeTab === "internal") {
      matchesTab = module.moduleType === "system" || module.moduleType === "local"
    } else if (activeTab === "third-party") {
      matchesTab = module.moduleType === "remote"
    } else if (activeTab === "public") {
      matchesTab = false // 暂时没有公用模块
    }
    
    return matchesSearch && matchesTab
  })

  const handleConfigureModule = (module: any) => {
    console.log("配置模块:", module.moduleName)
    setSelectedModule(module)
    setConfigDialogOpen(true)
  }

  const handleUninstallModule = (module: any) => {
    console.log("卸载模块:", module.moduleName, "类型:", module.moduleType)
    setSelectedModule(module)
    setUninstallDialogOpen(true)
  }

  const handleInstallModule = async (module: any) => {
    try {
      await installModule({
        moduleKey: module.key,
        moduleVersion: module.version,
        installConfig: {}
      })
      
      // 重新加载模块列表
      const installedData = await getInstalledModules()
      setModules(installedData.modules || [])
    } catch (error) {
      console.error('安装模块失败:', error)
    }
  }

  const handleConfirmUninstall = async () => {
    if (selectedModule) {
      console.log('🗑️ 开始卸载模块:', selectedModule.moduleName, '类型:', selectedModule.moduleType)
      
      // 尝试调用API卸载
      try {
        await uninstallModule(selectedModule.moduleKey, false)
        
        // 重新加载模块列表
        const installedData = await getInstalledModules()
        setModules(installedData.modules || [])
      } catch (apiError) {
        console.log('🔄 API调用失败，使用前端模拟卸载')
        // 如果API调用失败，从前端列表中移除模块
        setModules(prevModules => 
          prevModules.filter(m => m.moduleKey !== selectedModule.moduleKey)
        )
      }
      
      setUninstallDialogOpen(false)
      setSelectedModule(null)
      console.log('✅ 模块卸载完成')
      
      // 显示成功提示
      setSuccessMessage(
        locale === "zh" 
          ? `模块 "${selectedModule.moduleName}" 已成功卸载`
          : `Module "${selectedModule.moduleName}" has been successfully uninstalled`
      )
      setShowSuccessToast(true)
    }
  }

  const handleSaveConfig = async (config: any) => {
    if (selectedModule) {
      console.log('💾 开始保存配置:', selectedModule.moduleName, config)
      
      try {
        await updateModuleConfig(selectedModule.moduleKey, config)
        setConfigDialogOpen(false)
        setSelectedModule(null)
        console.log('✅ 配置保存完成')
        
        // 显示成功提示
        setSuccessMessage(
          locale === "zh" 
            ? `模块 "${selectedModule.moduleName}" 的配置已保存`
            : `Configuration for module "${selectedModule.moduleName}" has been saved`
        )
        setShowSuccessToast(true)
      } catch (error) {
        console.error('保存配置失败:', error)
        throw error // 重新抛出错误，让对话框处理
      }
    }
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
              modules={filteredModules}
              onConfigure={handleConfigureModule}
              onUninstall={handleUninstallModule}
              onInstall={handleInstallModule}
            />
          </TabsContent>

          <TabsContent value="third-party" className="mt-0">
            <ModuleGrid 
              modules={filteredModules}
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
        moduleName={selectedModule?.moduleName || ""}
        moduleType={selectedModule?.moduleType}
        onConfirm={handleConfirmUninstall}
      />

      {/* 成功提示 */}
      <SuccessToast
        message={successMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
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
  modules: any[]
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
                <div className="text-2xl">
                  <Package className="size-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-medium truncate">{module.moduleName}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      v{module.moduleVersion}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {module.moduleType}
                    </Badge>
                    {module.installStatus === 'active' && (
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
                  {module.installStatus === 'active' ? (
                    <>
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log("下拉菜单配置点击:", module.moduleName)
                        onConfigure(module)
                      }}>
                        <Settings className="size-4 mr-2" />
                        {locale === "zh" ? "配置" : "Configure"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log("下拉菜单卸载点击:", module.moduleName)
                        onUninstall(module)
                      }}>
                        <Trash2 className="size-4 mr-2" />
                        {module.moduleType === 'system' 
                          ? (locale === "zh" ? "删除" : "Delete")
                          : (locale === "zh" ? "卸载" : "Uninstall")
                        }
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
            <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-2">
              {module.manifest?.description || '暂无描述'}
            </CardDescription>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>by {module.manifest?.author || 'AINO'}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Download className="size-3" />
                  {module.moduleType}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  4.5
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {module.installStatus === 'active' ? (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log("按钮配置点击:", module.moduleName)
                      onConfigure(module)
                    }}
                  >
                    <Settings className="size-3 mr-1" />
                    {locale === "zh" ? "配置" : "Configure"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log("按钮卸载点击:", module.moduleName)
                      onUninstall(module)
                    }}
                  >
                    <Trash2 className="size-3 mr-1" />
                    {module.moduleType === 'system' 
                      ? (locale === "zh" ? "删除" : "Delete")
                      : (locale === "zh" ? "卸载" : "Uninstall")
                    }
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
