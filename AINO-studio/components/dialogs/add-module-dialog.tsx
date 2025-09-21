"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EntityCreator, type TemplateOption } from "@/components/entity-creator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Store } from "lucide-react"
import { useLocale } from "@/hooks/use-locale"

interface ThirdPartyModule {
  id: string
  name: string
  provider: string
  description: string
  category: string
  version: string
  downloads: number
  rating: number
}

function getMockThirdPartyModules(locale: string): ThirdPartyModule[] {
  return [
    {
      id: "1",
      name: locale === "zh" ? "用户认证模块" : "User Authentication Module",
      provider: "AuthTech Solutions",
      description: locale === "zh" 
        ? "完整的用户认证和授权系统，支持多种登录方式"
        : "Complete user authentication and authorization system with multiple login methods",
      category: locale === "zh" ? "认证" : "Authentication",
      version: "2.1.0",
      downloads: 15420,
      rating: 4.8,
    },
    {
      id: "2",
      name: locale === "zh" ? "支付集成模块" : "Payment Integration Module",
      provider: "PaymentPro",
      description: locale === "zh"
        ? "支持多种支付方式的集成模块，包括微信、支付宝等"
        : "Payment integration module supporting multiple payment methods including WeChat, Alipay, etc.",
      category: locale === "zh" ? "支付" : "Payment",
      version: "1.5.2",
      downloads: 8930,
      rating: 4.6,
    },
    {
      id: "3",
      name: locale === "zh" ? "数据分析模块" : "Data Analytics Module",
      provider: "DataViz Inc",
      description: locale === "zh"
        ? "强大的数据可视化和分析工具，支持多种图表类型"
        : "Powerful data visualization and analytics tool supporting multiple chart types",
      category: locale === "zh" ? "分析" : "Analytics",
      version: "3.0.1",
      downloads: 12350,
      rating: 4.9,
    },
    {
      id: "4",
      name: locale === "zh" ? "消息推送模块" : "Message Push Module",
      provider: "NotifyHub",
      description: locale === "zh"
        ? "实时消息推送服务，支持邮件、短信、应用内通知"
        : "Real-time message push service supporting email, SMS, and in-app notifications",
      category: locale === "zh" ? "通信" : "Communication",
      version: "1.8.0",
      downloads: 6780,
      rating: 4.4,
    },
  ]
}

interface AddModuleDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  nameLabel?: string
  namePlaceholder?: string
  showDesc?: boolean
  descLabel?: string
  descPlaceholder?: string
  submitText?: string
  cancelText?: string
  templateLabel?: string
  options: TemplateOption[]
  defaultOptionKey?: string
  initialName?: string
  showIconUpload?: boolean
  iconLabel?: string
  onSubmit: (payload: { name: string; desc?: string; templateKey: string; icon?: string }) => void
}

export function AddModuleDialog({
  open,
  onOpenChange,
  title,
  nameLabel = "名称",
  namePlaceholder = "输入模块名称",
  showDesc = false,
  descLabel = "描述（可选）",
  descPlaceholder = "可填写模块用途简述",
  submitText = "创建",
  cancelText = "取消",
  templateLabel = "选择模板",
  options = [],
  defaultOptionKey,
  initialName = "",
  showIconUpload = false,
  iconLabel = locale === "zh" ? "模块图标" : "Module Icon",
  onSubmit,
}: AddModuleDialogProps) {
  const { t, locale } = useLocale()
  const [moduleType, setModuleType] = useState<"self" | "third-party">("self")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const mockThirdPartyModules = getMockThirdPartyModules(locale)
  const filteredModules = mockThirdPartyModules.filter((module) => {
    const matchesSearch =
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || module.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(mockThirdPartyModules.map((m) => m.category)))]

  const handleSubmit = (payload: { name: string; desc?: string; templateKey: string; icon?: string }) => {
    onSubmit(payload)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleInstallModule = (module: ThirdPartyModule) => {
    onSubmit({
      name: module.name,
      desc: `第三方模块：${module.description}`,
      templateKey: `third-party-${module.id}`,
      icon: module.icon,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[720px] bg-white/70 backdrop-blur border-white/60"
        aria-describedby="add-module-description"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div id="add-module-description" className="sr-only">
          Create a new module by selecting self-developed or third-party options
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={moduleType === "self" ? "default" : "outline"}
            onClick={() => setModuleType("self")}
            className="flex-1 flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            {t("selfModule")}
          </Button>
          <Button
            variant={moduleType === "third-party" ? "default" : "outline"}
            onClick={() => setModuleType("third-party")}
            className="flex-1 flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            {t("thirdPartyModule")}
          </Button>
        </div>

        {moduleType === "self" ? (
          <EntityCreator
            mode="module"
            nameLabel={nameLabel}
            namePlaceholder={namePlaceholder}
            showDesc={showDesc}
            descLabel={descLabel}
            descPlaceholder={descPlaceholder}
            submitText={submitText}
            cancelText={cancelText}
            templateLabel={templateLabel}
            options={options}
            defaultOptionKey={defaultOptionKey}
            initialName={initialName}
            showIconUpload={showIconUpload}
            iconLabel={iconLabel}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : (
          /* Third-party module marketplace only for modules */
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t("searchModulePlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">{t("allCategories")}</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {filteredModules.map((module) => (
                <div key={module.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{module.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {t("provider")}: <span className="font-medium">{module.provider}</span>
                      </p>
                      <p className="text-sm text-gray-700 mb-2">{module.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{module.category}</Badge>
                        <span className="text-xs text-gray-500">v{module.version}</span>
                        <span className="text-xs text-gray-500">{t("downloads")}: {module.downloads.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">{t("rating")}: {module.rating}/5.0</span>
                      </div>
                    </div>
                    <Button onClick={() => handleInstallModule(module)} size="sm" className="ml-4">
                      {t("install")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredModules.length === 0 && <div className="text-center py-8 text-gray-500">{t("noMatchingModules")}</div>}

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                {cancelText}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
