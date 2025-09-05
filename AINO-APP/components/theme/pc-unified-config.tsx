"use client"

import { useState } from "react"
import { Settings, Palette, Brush, Layers, Zap, Eye, Shield, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

// 导入现有的主题配置 hooks
import { useUnifiedConfig } from "@/hooks/use-unified-config"
import { useUnifiedTheme } from "@/components/providers/unified-theme-provider"

// 默认配置数据（已整合到统一主题系统）
const defaultPresets = [
  { 
    name: "默认", 
    colors: [
      { id: 1, name: "主色", value: "#ffffff", enabled: true },
      { id: 2, name: "次色", value: "#f8fafc", enabled: true },
      { id: 3, name: "强调色", value: "#f1f5f9", enabled: true }
    ] 
  },
  { 
    name: "蓝色系", 
    colors: [
      { id: 1, name: "主色", value: "#dbeafe", enabled: true },
      { id: 2, name: "次色", value: "#bfdbfe", enabled: true },
      { id: 3, name: "强调色", value: "#93c5fd", enabled: true }
    ] 
  },
  { 
    name: "绿色系", 
    colors: [
      { id: 1, name: "主色", value: "#dcfce7", enabled: true },
      { id: 2, name: "次色", value: "#bbf7d0", enabled: true },
      { id: 3, name: "强调色", value: "#86efac", enabled: true }
    ] 
  },
  { 
    name: "紫色系", 
    colors: [
      { id: 1, name: "主色", value: "#f3e8ff", enabled: true },
      { id: 2, name: "次色", value: "#e9d5ff", enabled: true },
      { id: 3, name: "强调色", value: "#d8b4fe", enabled: true }
    ] 
  },
  { 
    name: "橙色系", 
    colors: [
      { id: 1, name: "主色", value: "#fed7aa", enabled: true },
      { id: 2, name: "次色", value: "#fdba74", enabled: true },
      { id: 3, name: "强调色", value: "#fb923c", enabled: true }
    ] 
  }
]

import type { CardThemeConfig } from "@/types"

// 导入国际化
import { useLocale } from "@/components/providers/locale-provider"
import { RadiusConfig } from "./radius-config"

export function PCUnifiedConfig() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("background")

  // 使用升级后的统一配置Hook
  const config = useUnifiedConfig()
  
  // 使用统一主题Hook
  const unifiedTheme = useUnifiedTheme()
  
  // 使用国际化
  const { locale } = useLocale()
  const isEnglish = locale === "en"

  const handleCardValueChange = (key: keyof CardThemeConfig, value: string) => {
    config.card.setTheme((prev) => ({ ...prev, [key]: value }))
  }

  const handleCardStyleChange = (style: "solid" | "frosted" | "none") => {
    config.card.setTheme((prev) => ({ ...prev, backgroundStyle: style }))
  }

  const handleCardOpacityChange = (opacity: "normal" | "high") => {
    config.card.setTheme((prev) => ({ ...prev, frostedOpacity: opacity }))
  }

  return (
    <>
      {/* 配置入口按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/60 hover:bg-white/90"
      >
        <Settings className="w-6 h-6 text-gray-700" />
        <span className="sr-only">打开配置面板</span>
      </Button>

      {/* 配置面板 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* 头部 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    {isEnglish ? "Theme Configuration" : "主题配置"}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 p-0"
                >
                  ×
                </Button>
              </div>

              {/* 标签页 */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
                  <TabsTrigger value="background" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {isEnglish ? "Background" : "背景"}
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    {isEnglish ? "Content" : "内容"}
                  </TabsTrigger>
                  <TabsTrigger value="unified" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {isEnglish ? "Unified" : "统一"}
                  </TabsTrigger>
                </TabsList>

                {/* 背景配置标签页 */}
                <TabsContent value="background" className="space-y-6 flex-1 overflow-y-auto px-4 pb-8">
                  {/* 背景颜色预设 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Background Color" : "背景颜色"}</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {defaultPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            const colors = preset.colors.map(c => c.value);
                            if (colors.length >= 3) {
                              config.theme.applyPreset([colors[0], colors[1], colors[2]]);
                            }
                          }}
                          className="flex flex-col items-center justify-center p-2 space-y-1 rounded-lg hover:bg-gray-100/50 transition-colors"
                          title={preset.name}
                        >
                          <div
                            className="w-8 h-8 rounded-lg border border-gray-200"
                            style={{
                              background: `linear-gradient(135deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 50%, ${preset.colors[2]} 100%)`,
                            }}
                          />
                          <span className="text-xs text-gray-600">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 自定义颜色 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Custom Colors" : "自定义颜色"}</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500 mb-2 block">{isEnglish ? "Primary" : "主色"}</Label>
                        <div className="relative">
                          <input
                            type="color"
                            value={config.theme.primaryColor}
                            onChange={(e) => config.theme.updateColor(1, e.target.value)}
                            className="w-full h-12 rounded-lg border border-gray-200 cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-2 block">{isEnglish ? "Secondary" : "次色"}</Label>
                        <div className="relative">
                          <input
                            type="color"
                            value={config.theme.secondaryColor || "#f8fafc"}
                            onChange={(e) => config.theme.updateColor(2, e.target.value)}
                            className="w-full h-12 rounded-lg border border-gray-200 cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-2 block">{isEnglish ? "Accent" : "强调色"}</Label>
                        <div className="relative">
                          <input
                            type="color"
                            value={config.theme.accentColor}
                            onChange={(e) => config.theme.updateColor(3, e.target.value)}
                            className="w-full h-12 rounded-lg border border-gray-200 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 内容配置标签页 - 保持现有功能完全不变 */}
                <TabsContent value="content" className="space-y-6 flex-1 overflow-y-auto px-4 pb-8">
                  {/* 卡片预设 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Card Presets" : "卡片预设"}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {config.card.cardThemePresets?.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => config.card.setTheme(preset)}
                          className="flex flex-col items-center justify-center p-2 space-y-1 rounded-lg hover:bg-gray-100/50 transition-colors"
                          title={preset.name}
                        >
                          <div
                            className="w-8 h-8 rounded-lg border border-gray-200"
                            style={{ backgroundColor: preset.config?.background || '#ffffff' }}
                          />
                          <span className="text-xs text-gray-600">{preset.name}</span>
                        </button>
                      )) || []}
                    </div>
                  </div>

                  {/* 卡片样式 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Card Style" : "卡片样式"}</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{isEnglish ? "Background Style" : "背景样式"}</span>
                        <Select
                          value={config.card.theme.backgroundStyle}
                          onValueChange={handleCardStyleChange}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">{isEnglish ? "Solid" : "纯色"}</SelectItem>
                            <SelectItem value="frosted">{isEnglish ? "Frosted" : "毛玻璃"}</SelectItem>
                            <SelectItem value="none">{isEnglish ? "None" : "无"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {config.card.theme.backgroundStyle === "frosted" && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{isEnglish ? "Frosted Opacity" : "毛玻璃透明度"}</span>
                          <Select
                            value={config.card.theme.frostedOpacity}
                            onValueChange={handleCardOpacityChange}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">{isEnglish ? "Normal" : "正常"}</SelectItem>
                              <SelectItem value="high">{isEnglish ? "High" : "高"}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 全局边角配置 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block flex items-center gap-2">
                      <Square className="w-4 h-4" />
                      {isEnglish ? "Global Radius" : "全局边角"}
                    </Label>
                    <RadiusConfig />
                  </div>
                </TabsContent>

                {/* 统一主题配置标签页 */}
                <TabsContent value="unified" className="space-y-6 flex-1 overflow-y-auto px-4 pb-8">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">{isEnglish ? "Unified Theme" : "统一主题配置"}</h3>
                      <p className="text-sm text-muted-foreground">{isEnglish ? "One-click theme switching with font, component and chart colors" : "一键切换主题风格，同时更新字体、组件和数据图配色"}</p>
                    </div>
                    
                    {/* 主题选择 */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{isEnglish ? "Theme Selection" : "主题选择"}</Label>
                      {!unifiedTheme.isHydrated ? (
                        <div className="grid grid-cols-2 gap-2">
                          {unifiedTheme.availableThemes.map((theme) => (
                            <div
                              key={theme.name}
                              className="p-3 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
                            >
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {unifiedTheme.availableThemes.map((theme) => (
                            <button
                              key={theme.name}
                              onClick={() => unifiedTheme.applyTheme(theme.name)}
                              className={cn(
                                "p-3 rounded-lg border text-left transition-all",
                                unifiedTheme.currentTheme.name === theme.name
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              )}
                            >
                              <div className="font-medium text-sm">{theme.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">{theme.description}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 当前主题信息 */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-800">{isEnglish ? "Current Theme" : "当前主题"}</div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">{unifiedTheme.currentTheme.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{unifiedTheme.currentTheme.description}</div>
                    </div>
                    
                    {/* 个别调整功能 */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-md font-medium mb-2">个别调整</h4>
                        <p className="text-xs text-muted-foreground">在统一主题基础上进行微调</p>
                      </div>
                      
                      {/* 字体颜色调整 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">字体颜色调整</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-xs text-muted-foreground">标题颜色</div>
                            <div className="relative">
                              <div 
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                                style={{ backgroundColor: unifiedTheme.currentTheme.config.fontColors.heading }}
                              />
                              <input
                                type="color"
                                value={unifiedTheme.currentTheme.config.fontColors.heading}
                                onChange={(e) => unifiedTheme.updateFontColors({ heading: e.target.value })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="选择标题颜色"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-xs text-muted-foreground">正文颜色</div>
                            <div className="relative">
                              <div 
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                                style={{ backgroundColor: unifiedTheme.currentTheme.config.fontColors.body }}
                              />
                              <input
                                type="color"
                                value={unifiedTheme.currentTheme.config.fontColors.body}
                                onChange={(e) => unifiedTheme.updateFontColors({ body: e.target.value })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="选择正文颜色"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 组件颜色调整 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">组件颜色调整</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-xs text-muted-foreground">主要</div>
                            <div className="relative">
                              <div 
                                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                                style={{ backgroundColor: unifiedTheme.currentTheme.config.componentColors.primary }}
                              />
                              <input
                                type="color"
                                value={unifiedTheme.currentTheme.config.componentColors.primary}
                                onChange={(e) => unifiedTheme.updateComponentColors({ primary: e.target.value })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="选择主要按钮颜色"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-xs text-muted-foreground">次要</div>
                            <div className="relative">
                              <div 
                                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                                style={{ backgroundColor: unifiedTheme.currentTheme.config.componentColors.secondary }}
                              />
                              <input
                                type="color"
                                value={unifiedTheme.currentTheme.config.componentColors.secondary}
                                onChange={(e) => unifiedTheme.updateComponentColors({ secondary: e.target.value })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="选择次要按钮颜色"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-xs text-muted-foreground">危险</div>
                            <div className="relative">
                              <div 
                                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                                style={{ backgroundColor: unifiedTheme.currentTheme.config.componentColors.danger }}
                              />
                              <input
                                type="color"
                                value={unifiedTheme.currentTheme.config.componentColors.danger}
                                onChange={(e) => unifiedTheme.updateComponentColors({ danger: e.target.value })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="选择危险按钮颜色"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 数据图配色调整 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">数据图配色调整</Label>
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground mb-2">6个图表颜色</div>
                          <div className="grid grid-cols-3 gap-2">
                            {unifiedTheme.currentTheme.config.chartColors.colors.map((color, index) => (
                              <div key={index} className="flex flex-col items-center space-y-1">
                                <div className="text-xs text-muted-foreground">颜色{index + 1}</div>
                                <div className="relative">
                                  <div 
                                    className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                                    style={{ backgroundColor: color }}
                                  />
                                  <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => {
                                      const newColors = [...unifiedTheme.currentTheme.config.chartColors.colors]
                                      newColors[index] = e.target.value
                                      unifiedTheme.updateChartColors({ colors: newColors })
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    title={`选择图表颜色${index + 1}`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
