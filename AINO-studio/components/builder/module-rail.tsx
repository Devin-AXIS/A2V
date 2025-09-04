"use client"

import { cn } from "@/lib/utils"
import type { ModuleModel } from "@/lib/store"

// 兼容API模块类型
interface ApiModuleModel {
  id: string
  name: string
  type: string
  icon: string
  directories: any[]
}
import { 
  Grid2X2, 
  ShoppingCart, 
  GraduationCap, 
  FileText, 
  Blocks, 
  Plus, 
  Settings, 
  Package,
  Users,
  Database,
  BarChart3,
  Calendar,
  MessageSquare,
  CreditCard,
  Truck,
  BookOpen,
  Video,
  Music,
  Image,
  FileVideo,
  FolderOpen,
  Globe,
  Zap,
  Shield,
  Heart,
  Star,
  Target,
  TrendingUp,
  Lightbulb,
  Puzzle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { JSX } from "react"
import { FrostRail, IconTile } from "@/components/frost"
import { useLocale } from "@/hooks/use-locale"

// 更丰富的图标映射
const ICONS: Record<ModuleModel["type"], JSX.Element> = {
  system: <Shield className="size-5" />,
  ecom: <ShoppingCart className="size-5" />,
  edu: <GraduationCap className="size-5" />,
  content: <FileText className="size-5" />,
  project: <Target className="size-5" />,
  custom: <Puzzle className="size-5" />,
}

// 根据模块名称生成动态图标
function getModuleIcon(module: ModuleModel | ApiModuleModel): JSX.Element {
  // 如果有自定义图标URL，优先使用
  if (module.icon && module.icon.startsWith('http')) {
    return (
      <img 
        src={module.icon} 
        alt={module.name} 
        className="size-5 rounded object-cover"
      />
    )
  }
  
  const name = module.name.toLowerCase()
  const iconName = module.icon?.toLowerCase()
  
  // 系统模块的默认图标映射
  const systemModuleIcons: Record<string, JSX.Element> = {
    'users': <Users className="size-5" />,
    'user': <Users className="size-5" />,
    'settings': <Settings className="size-5" />,
    'setting': <Settings className="size-5" />,
    'activity': <BarChart3 className="size-5" />,
    'audit': <BarChart3 className="size-5" />,
    'log': <BarChart3 className="size-5" />,
    'config': <Settings className="size-5" />,
    'configuration': <Settings className="size-5" />,
  }
  
  // 1. 先检查系统模块的图标名称
  if (iconName && systemModuleIcons[iconName]) {
    return systemModuleIcons[iconName]
  }
  
  // 2. 根据模块名称关键词匹配图标
  if (name.includes('用户') || name.includes('user') || name.includes('member')) {
    return <Users className="size-5" />
  }
  if (name.includes('系统配置') || name.includes('系统设置') || name.includes('settings') || name.includes('config')) {
    return <Settings className="size-5" />
  }
  if (name.includes('审计') || name.includes('日志') || name.includes('audit') || name.includes('log') || name.includes('activity')) {
    return <BarChart3 className="size-5" />
  }
  if (name.includes('数据') || name.includes('data') || name.includes('db')) {
    return <Database className="size-5" />
  }
  if (name.includes('分析') || name.includes('analytics') || name.includes('chart')) {
    return <BarChart3 className="size-5" />
  }
  if (name.includes('日历') || name.includes('calendar') || name.includes('schedule')) {
    return <Calendar className="size-5" />
  }
  if (name.includes('消息') || name.includes('message') || name.includes('chat')) {
    return <MessageSquare className="size-5" />
  }
  if (name.includes('支付') || name.includes('payment') || name.includes('billing')) {
    return <CreditCard className="size-5" />
  }
  if (name.includes('物流') || name.includes('logistics') || name.includes('shipping')) {
    return <Truck className="size-5" />
  }
  if (name.includes('课程') || name.includes('course') || name.includes('lesson')) {
    return <BookOpen className="size-5" />
  }
  if (name.includes('视频') || name.includes('video')) {
    return <Video className="size-5" />
  }
  if (name.includes('音乐') || name.includes('music') || name.includes('audio')) {
    return <Music className="size-5" />
  }
  if (name.includes('图片') || name.includes('image') || name.includes('photo')) {
    return <Image className="size-5" />
  }
  if (name.includes('文件') || name.includes('file')) {
    return <FileVideo className="size-5" />
  }
  if (name.includes('文件夹') || name.includes('folder')) {
    return <FolderOpen className="size-5" />
  }
  if (name.includes('网站') || name.includes('web') || name.includes('site')) {
    return <Globe className="size-5" />
  }
  if (name.includes('工具') || name.includes('tool') || name.includes('utility')) {
    return <Zap className="size-5" />
  }
  if (name.includes('安全') || name.includes('security') || name.includes('auth')) {
    return <Shield className="size-5" />
  }
  if (name.includes('收藏') || name.includes('favorite') || name.includes('like')) {
    return <Heart className="size-5" />
  }
  if (name.includes('评分') || name.includes('rating') || name.includes('review')) {
    return <Star className="size-5" />
  }
  if (name.includes('目标') || name.includes('goal') || name.includes('target')) {
    return <Target className="size-5" />
  }
  if (name.includes('趋势') || name.includes('trend') || name.includes('growth')) {
    return <TrendingUp className="size-5" />
  }
  if (name.includes('创意') || name.includes('creative') || name.includes('idea')) {
    return <Lightbulb className="size-5" />
  }
  
  // 3. 根据模块类型返回默认图标
  return ICONS[module.type] || ICONS.custom
}

export function ModuleRail({
  modules = [],
  selectedId = "",
  onSelect,
  onAdd,
  onSettings,
  onModuleManagement,
  canAdd = true,
}: {
  modules?: (ModuleModel | ApiModuleModel)[]
  selectedId?: string
  onSelect?: (id: string) => void
  onAdd?: () => void
  onSettings?: () => void
  onModuleManagement?: () => void
  canAdd?: boolean
}) {
  const { locale } = useLocale()
  return (
    <div className="hidden md:flex sticky top-[68px] h-[calc(100dvh-84px)]">
      <FrostRail>
        <div className="flex flex-col gap-2 w-full items-center">
          <div className="size-11 rounded-2xl bg-[conic-gradient(at_30%_30%,#60a5fa_0deg,#f59e0b_140deg,#60a5fa_320deg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_12px_24px_rgba(0,0,0,0.35)]" />
          <div className="flex-1 overflow-auto flex flex-col gap-2 w-full items-center pr-1">
            {modules.map((m) => (
              <IconTile key={m.id} title={m.name} active={m.id === selectedId} onClick={() => onSelect?.(m.id)}>
                {getModuleIcon(m)}
              </IconTile>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <IconTile title={locale === "zh" ? "模块管理" : "Module Management"} active={selectedId === "module-management"} onClick={() => onModuleManagement?.()}>
            <Package className="size-5" />
          </IconTile>
          <IconTile title={locale === "zh" ? "设置" : "Settings"} active={selectedId === "settings"} onClick={() => onSelect?.("settings")}>
            <Settings className="size-5" />
          </IconTile>
          <Button
            className={cn(
              "rounded-2xl px-0 w-11 h-11",
              "bg-gradient-to-br from-emerald-500 to-sky-500 shadow-[0_10px_24px_rgba(16,185,129,0.35)]",
            )}
            onClick={() => onAdd?.()}
            aria-label={locale === "zh" ? "添加模块" : "Add Module"}
            disabled={!canAdd}
            title={!canAdd ? (locale === "zh" ? "当前角色不可添加模块" : "Current role cannot add modules") : (locale === "zh" ? "添加模块" : "Add Module")}
          >
            <Plus className="size-5 text-white" />
          </Button>
        </div>
      </FrostRail>
    </div>
  )
}
