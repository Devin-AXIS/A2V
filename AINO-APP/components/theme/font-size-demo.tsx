"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FontSizeSelector } from "./font-size-selector"
import { FontSizeToggleButton } from "./font-size-toggle-button"
import { useFontSizeConfig } from "@/hooks/use-font-size-config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { FontSize } from "@/types"
import { 
  BookOpen, 
  GraduationCap, 
  Briefcase, 
  TrendingUp,
  Users,
  BarChart3
} from "lucide-react"

export function FontSizeDemo() {
  const { currentPreset, fontSizes, getFontSize } = useFontSizeConfig()

  const demoCards = [
    {
      icon: BookOpen,
      title: "学习计划",
      subtitle: "个性化AI学习方案",
      content: "基于你的学习基础和目标，AI将为你定制专属的学习计划，包含课程推荐、进度跟踪和效果评估。",
      stats: [
        { label: "计划时长", value: "4-8周" },
        { label: "每周学习", value: "4.8小时" },
        { label: "目标技能", value: "React + TypeScript" }
      ]
    },
    {
      icon: Briefcase,
      title: "工作分析",
      subtitle: "AI训练师职位市场",
      content: "深入分析AI训练师职位的工作要求、薪资水平和市场趋势，帮助你做出职业规划决策。",
      stats: [
        { label: "平均薪资", value: "15K-25K" },
        { label: "经验要求", value: "1-3年" },
        { label: "热门城市", value: "北上广深" }
      ]
    },
    {
      icon: TrendingUp,
      title: "数据趋势",
      subtitle: "市场发展动态",
      content: "实时监控AI行业的发展趋势，包括技术热点、投资动态和人才需求变化。",
      stats: [
        { label: "增长率", value: "35%" },
        { label: "投资额", value: "120亿" },
        { label: "新增职位", value: "2.3万" }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {/* 字体大小控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            字体大小控制
          </CardTitle>
          <CardDescription>
            选择字体大小档位，观察下方所有内容的变化
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 主要选择器 */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-2">主要选择器</h3>
              <p className="text-sm text-muted-foreground">
                选择小、正常、大三个档位
              </p>
            </div>
            <FontSizeSelector variant="default" />
          </div>
          
          <Separator />
          
          {/* 快速切换 */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-2">快速切换</h3>
              <p className="text-sm text-muted-foreground">
                一键切换字体大小
              </p>
            </div>
            <FontSizeToggleButton />
          </div>
          
          {/* 当前状态 */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm font-medium mb-2">当前配置</div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                {currentPreset.name} ({Math.round(currentPreset.scale * 100)}%)
              </Badge>
              <span className="text-sm text-muted-foreground">
                缩放比例：{currentPreset.scale}
              </span>
              <span className="text-sm text-muted-foreground">
                基础字体：{getFontSize('base')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 字体大小预览 */}
      <Card>
        <CardHeader>
          <CardTitle>字体大小预览</CardTitle>
          <CardDescription>
            查看不同字体大小的实际效果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              { label: "超大标题", size: "3xl", description: "页面主标题，用于最重要的信息展示" },
              { label: "大标题", size: "2xl", description: "页面副标题，用于主要章节标题" },
              { label: "标题", size: "xl", description: "卡片标题，用于内容块标题" },
              { label: "正文", size: "base", description: "主要内容文字，用于一般文本内容" },
              { label: "小字", size: "sm", description: "辅助信息，用于说明、注释等" },
              { label: "极小字", size: "xs", description: "标签、徽章等极小文字" }
            ].map((text, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {text.label}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {text.size} ({getFontSize(text.size as keyof FontSize)})
                  </Badge>
                </div>
                
                <div 
                  className="border-l-4 border-primary pl-4 py-3 bg-muted/30 rounded-r-lg"
                  style={{ fontSize: getFontSize(text.size as keyof FontSize) }}
                >
                  <div className="font-semibold mb-1">
                    这是 {text.label} 的示例文字
                  </div>
                  <div className="text-muted-foreground">
                    {text.description} - 当前字体大小：{getFontSize(text.size as keyof FontSize)}
                  </div>
                </div>
                
                {index < 5 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 实际应用效果 */}
      <Card>
        <CardHeader>
          <CardTitle>实际应用效果</CardTitle>
          <CardDescription>
            在真实卡片和组件中的显示效果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                        <CardDescription>{card.subtitle}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.content}
                    </p>
                    
                    <div className="space-y-2">
                      {card.stats.map((stat, statIndex) => (
                        <div key={statIndex} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{stat.label}</span>
                          <span className="font-medium">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button className="w-full" size="sm">
                      了解更多
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 响应式测试 */}
      <Card>
        <CardHeader>
          <CardTitle>响应式测试</CardTitle>
          <CardDescription>
            在不同屏幕尺寸下的字体大小表现
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">移动端效果</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="text-2xl font-bold">移动端标题</div>
                <div className="text-base">移动端正文内容，适合触摸操作和阅读体验。</div>
                <div className="text-sm text-muted-foreground">移动端辅助信息</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">桌面端效果</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="text-3xl font-bold">桌面端标题</div>
                <div className="text-lg">桌面端正文内容，充分利用大屏幕空间，提供更好的阅读体验。</div>
                <div className="text-base text-muted-foreground">桌面端辅助信息</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用建议 */}
      <Card>
        <CardHeader>
          <CardTitle>使用建议</CardTitle>
          <CardDescription>
            如何选择合适的字体大小档位
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h4 className="font-semibold">小字体 (80%)</h4>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• 适合密集信息展示</p>
                <p>• 节省屏幕空间</p>
                <p>• 专业用户首选</p>
                <p>• 高分辨率显示器</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="font-semibold">正常字体 (100%)</h4>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• 标准字体大小</p>
                <p>• 适合大多数用户</p>
                <p>• 平衡可读性</p>
                <p>• 推荐默认选择</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h4 className="font-semibold">大字体 (120%)</h4>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• 增强可读性</p>
                <p>• 适合视力不佳用户</p>
                <p>• 移动设备友好</p>
                <p>• 远距离观看</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 智能建议</h4>
            <p className="text-sm text-blue-700">
              系统会根据您的设备类型、屏幕分辨率和历史使用习惯，自动推荐最适合的字体大小档位。
              您也可以随时手动调整，所有设置都会实时保存。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
