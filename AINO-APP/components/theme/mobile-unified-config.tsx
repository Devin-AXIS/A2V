"use client"

import { useState } from "react"
import { Settings, Palette, Brush, Layers, Zap, Eye, Shield, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"
import { cn } from "@/lib/utils"

// 导入现有的主题配置 hooks
import { useUnifiedConfig } from "@/hooks/use-unified-config"
import { useUnifiedTheme } from "@/components/providers/unified-theme-provider"

// 导入配置数据
import { cardThemePresets } from "@/config/card-theme"

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
    name: "蓝色", 
    colors: [
      { id: 1, name: "主色", value: "#3b82f6", enabled: true },
      { id: 2, name: "次色", value: "#dbeafe", enabled: true },
      { id: 3, name: "强调色", value: "#bfdbfe", enabled: true }
    ] 
  },
  { 
    name: "绿色", 
    colors: [
      { id: 1, name: "主色", value: "#10b981", enabled: true },
      { id: 2, name: "次色", value: "#d1fae5", enabled: true },
      { id: 3, name: "强调色", value: "#a7f3d0", enabled: true }
    ] 
  },
  { 
    name: "紫色", 
    colors: [
      { id: 1, name: "主色", value: "#8b5cf6", enabled: true },
      { id: 2, name: "次色", value: "#ede9fe", enabled: true },
      { id: 3, name: "强调色", value: "#ddd6fe", enabled: true }
    ] 
  },
  { 
    name: "橙色", 
    colors: [
      { id: 1, name: "主色", value: "#f59e0b", enabled: true },
      { id: 2, name: "次色", value: "#fef3c7", enabled: true },
      { id: 3, name: "强调色", value: "#fde68a", enabled: true }
    ] 
  }
]



import type { CardThemeConfig } from "@/types"

// 导入国际化

import { useLocale } from "@/components/providers/locale-provider"
import { RadiusConfig } from "./radius-config"

export function MobileUnifiedConfig() {
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
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/60"
      >
        <Settings className="w-6 h-6 text-gray-700" />
        <span className="sr-only">{isEnglish ? "Open Configuration Panel" : "打开配置面板"}</span>
      </Button>

      {/* 底部配置面板 */}
      <BottomDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={isEnglish ? "Configuration Panel" : "配置面板"}
      >
        <div className="h-full flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-6 flex-shrink-0">
              <TabsTrigger value="background" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                {isEnglish ? "Background" : "背景配置"}
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Brush className="w-4 h-4" />
                {isEnglish ? "Content" : "内容配置"}
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {isEnglish ? "Advanced" : "高级配置"}
              </TabsTrigger>
              <TabsTrigger value="unified" className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                {isEnglish ? "Unified" : "统一主题"}
              </TabsTrigger>
            </TabsList>

            {/* 背景配置标签页 - 保持现有功能完全不变 */}
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

                  {/* 字体配置 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Font" : "字体"}</Label>
                    <Select defaultValue="system-ui">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isEnglish ? "Select font" : "选择字体"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system-ui">System UI</SelectItem>
                        <SelectItem value="geist">Geist Sans</SelectItem>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 字体大小配置 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Font Size" : "字体大小"}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'small', name: isEnglish ? 'Small' : '小', scale: 0.8 },
                        { key: 'normal', name: isEnglish ? 'Normal' : '正常', scale: 1.0 },
                        { key: 'large', name: isEnglish ? 'Large' : '大', scale: 1.2 }
                      ].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => {
                            console.log("Font size button clicked:", option.key)
                            console.log("Current config:", config.fontSize)
                            config.fontSize.setPreset(option.key as any)
                            console.log("Font size preset set to:", option.key)
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 space-y-1 rounded-lg border transition-colors",
                            config.fontSize.current.current === option.key
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-gray-50/50 border-gray-200/60 hover:bg-gray-100/50"
                          )}
                          title={`${option.name} (${Math.round(option.scale * 100)}%)`}
                        >
                          <div className="text-lg font-semibold">{option.name}</div>
                          <div className="text-xs opacity-80">{Math.round(option.scale * 100)}%</div>
                        </button>
                      ))}
                    </div>
                    {config.fontSize.current.current !== "normal" && (
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        {isEnglish ? "Current" : "当前"}：{config.fontSize.current.name} ({Math.round(config.fontSize.current.scale * 100)}%)
                      </div>
                    )}
                  </div>


                </TabsContent>

                {/* 内容配置标签页 - 保持现有功能完全不变 */}
                <TabsContent value="content" className="space-y-6 flex-1 overflow-y-auto px-4 pb-8">
                  {/* 卡片预设 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Card Presets" : "卡片预设"}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {config.card.cardThemePresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => config.card.applyPreset(preset.config)}
                          className="flex flex-col items-center justify-center p-2 space-y-1 rounded-lg hover:bg-gray-100/50 transition-colors"
                          title={preset.name}
                        >
                          <div
                            className="w-12 h-8 rounded-lg border"
                            style={{
                              backgroundColor: preset.config.background,
                            }}
                          />
                          <span className="text-xs text-gray-600">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 卡片样式配置 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Card Style" : "卡片样式"}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'solid', name: isEnglish ? 'Solid' : '实心', icon: '■' },
                        { key: 'frosted', name: isEnglish ? 'Frosted' : '毛玻璃', icon: '◆' },
                        { key: 'none', name: isEnglish ? 'None' : '无', icon: '○' }
                      ].map((style) => (
                        <button
                          key={style.key}
                          onClick={() => handleCardStyleChange(style.key as any)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 space-y-1 rounded-lg border transition-colors",
                            config.card.theme.backgroundStyle === style.key
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-gray-50/50 border-gray-200/60 hover:bg-gray-100/50"
                          )}
                        >
                          <div className="text-lg">{style.icon}</div>
                          <div className="text-xs">{style.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 毛玻璃透明度配置 */}
                  {config.card.theme.backgroundStyle === 'frosted' && (
                    <div>
                      <Label className="text-gray-600 mb-3 block">{isEnglish ? "Frosted Opacity" : "毛玻璃透明度"}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'normal', name: isEnglish ? 'Normal' : '正常' },
                          { key: 'high', name: isEnglish ? 'High' : '高' }
                        ].map((opacity) => (
                          <button
                            key={opacity.key}
                            onClick={() => handleCardOpacityChange(opacity.key as any)}
                            className={cn(
                              "flex flex-col items-center justify-center p-3 space-y-1 rounded-lg border transition-colors",
                              config.card.theme.frostedOpacity === opacity.key
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-gray-50/50 border-gray-200/60 hover:bg-gray-100/50"
                            )}
                          >
                            <div className="text-xs">{opacity.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}




                  {/* 全局边角配置 - 新增 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block flex items-center gap-2">
                      <Square className="w-4 h-4" />
                      {isEnglish ? "Global Radius" : "全局边角"}
                    </Label>
                    <RadiusConfig />
                  </div>
                </TabsContent>

                {/* 新增：高级配置标签页 */}
                <TabsContent value="advanced" className="space-y-6 flex-1 overflow-y-auto px-4 pb-8">
                  {/* 语义令牌配置 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Semantic Context" : "语义上下文"}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'default', name: isEnglish ? 'Default' : '默认' },
                        { key: 'high-contrast', name: isEnglish ? 'High Contrast' : '高对比度' }
                      ].map((context) => (
                        <button
                          key={context.key}
                          onClick={() => config.semantic.setContext(context.key)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 space-y-1 rounded-lg border transition-colors",
                            config.semantic.currentContext === context.key
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-gray-50/50 border-gray-200/60 hover:bg-gray-100/50"
                          )}
                        >
                          <div className="text-xs">{context.name}</div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      {isEnglish ? "Current" : "当前"}：{config.semantic.currentContext}
                    </div>
                  </div>

                  {/* 组件变体配置 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Component Variants" : "组件变体"}</Label>
                    <div className="space-y-3">
                      {['button', 'input', 'card', 'navigation'].map((component) => (
                        <div key={component} className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/60">
                          <div className="text-sm font-medium text-gray-800 mb-2 capitalize">{component}</div>
                          <div className="text-xs text-gray-500">
                            {isEnglish ? "Available variants:" : "可用变体:"} {
                              Object.keys(config.variants.getComponentVariants(component)?.variant || {}).join(', ')
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 动画配置 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Animation Presets" : "动画预设"}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['fade', 'slide', 'scale', 'bounce'].map((animation) => (
                        <button
                          key={animation}
                          className="flex flex-col items-center justify-center p-2 space-y-1 rounded-lg bg-gray-50/50 border border-gray-200/60 hover:bg-gray-100/50 transition-colors"
                          title={animation}
                        >
                          <Zap className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-600 capitalize">{animation}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 可访问性配置 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Accessibility" : "可访问性"}</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-200/60">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-800">{isEnglish ? "High Contrast Mode" : "高对比度模式"}</span>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-200/60">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-800">{isEnglish ? "Reduced Motion" : "减少动画"}</span>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  {/* 配置导出导入 */}
                  <div>
                    <Label className="text-gray-600 mb-3 block">{isEnglish ? "Configuration" : "配置管理"}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const configData = config.importExport.export()
                          // 这里可以实现下载功能
                          console.log('Export config:', configData)
                        }}
                        className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">{isEnglish ? "Export" : "导出"}</span>
                      </button>
                      <button
                        onClick={() => {
                          // 这里可以实现导入功能
                          console.log('Import config clicked')
                        }}
                        className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">{isEnglish ? "Import" : "导入"}</span>
                      </button>
                    </div>
                  </div>
                </TabsContent>

                {/* 统一主题标签页 */}
                <TabsContent value="unified" className="space-y-6 flex-1 overflow-y-auto px-4 pb-8">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">{isEnglish ? "Unified Theme" : "统一主题配置"}</h3>
                      <p className="text-sm text-muted-foreground">{isEnglish ? "One-click theme switching with font, component and chart colors" : "一键切换主题风格，同时更新字体、组件和数据图配色"}</p>
                    </div>
                    
                    {/* 主题选择 */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{isEnglish ? "Theme Style" : "选择主题风格"}</Label>
                      {!unifiedTheme.isHydrated ? (
                        <div className="grid grid-cols-2 gap-3">
                          {unifiedTheme.availableThemes.map((theme) => (
                            <div
                              key={theme.name}
                              className="h-auto p-4 flex flex-col items-center space-y-2 border rounded-lg bg-gray-50 animate-pulse"
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                              <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {unifiedTheme.availableThemes.map((theme) => (
                            <Button 
                              key={theme.name}
                              variant={unifiedTheme.currentTheme.name === theme.name ? "default" : "outline"}
                              className="h-auto p-4 flex flex-col items-center space-y-2"
                              onClick={() => unifiedTheme.applyTheme(theme.name)}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                              <div className="text-sm font-medium">{theme.name}</div>
                              <div className="text-xs text-muted-foreground">{theme.description}</div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* 当前主题信息 */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium mb-2">{isEnglish ? "Current Theme" : "当前主题"}</div>
                      <div className="text-sm text-muted-foreground">{unifiedTheme.currentTheme.name} - {unifiedTheme.currentTheme.description}</div>
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
      </BottomDrawer>
    </>
  )
}
