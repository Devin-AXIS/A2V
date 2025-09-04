/**
 * 统一图标工具
 * 简化图标导入和使用，减少包体积
 */

import dynamic from 'next/dynamic'
import type { LucideProps } from 'lucide-react'
import React from 'react'

// 常用图标类型
export type IconName = 
  | "Heart" | "Share2" | "ShoppingCart" | "Star" | "TrendingUp"
  | "Users" | "Settings" | "Plus" | "X" | "Grid3X3" | "Edit3"
  | "Save" | "Layers" | "Briefcase" | "GraduationCap" | "ShoppingBag"
  | "FileText" | "MessageSquare" | "BarChart3" | "Store" | "MapPin"
  | "Zap" | "LayoutGrid" | "Maximize2" | "RotateCcw" | "Home"
  | "Search" | "User" | "Clock" | "Info" | "AlertTriangle"
  | "CheckCircle" | "XCircle" | "Sun" | "Moon" | "Laptop"
  | "ChevronLeft" | "ChevronRight" | "ChevronsLeft" | "ChevronsRight"
  | "MoreHorizontal" | "EllipsisVertical" | "Menu" | "Bell" | "Mail"
  | "Calendar" | "Filter" | "ListFilter" | "SlidersHorizontal"
  | "Eye" | "EyeOff" | "Lock" | "Unlock" | "Trash2"
  | "Download" | "Upload" | "ExternalLink" | "Link" | "Copy"
  | "Check" | "Minus" | "HelpCircle" | "AlertCircle"
  | "ShieldCheck" | "ShieldAlert" | "ShieldOff" | "Key"
  | "LogOut" | "LogIn" | "UserPlus" | "UserMinus" | "UserCheck"
  | "UserX" | "Users2" | "UserCog" | "UserCircle"

// 动态图标组件
export const DynamicIcon = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.Heart })),
  { ssr: false }
)

// 图标映射
const iconMap: Record<string, React.ComponentType<LucideProps>> = {} as any

// 获取图标组件
export function getIcon(name: string): React.ComponentType<LucideProps> {
  if (!iconMap[name]) {
    iconMap[name] = dynamic(
      () => import('lucide-react').then(mod => ({ default: (mod as any)[name] })),
      { ssr: false }
    )
  }
  return iconMap[name]
}

// 图标组件
export interface IconProps extends LucideProps {
  name: string
}

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const IconComponent = getIcon(name)
  return React.createElement(IconComponent, props)
}

// 预定义图标组件
export const Heart = (props: LucideProps) => React.createElement(Icon, { name: "Heart", ...props })
export const Share2 = (props: LucideProps) => React.createElement(Icon, { name: "Share2", ...props })
export const ShoppingCart = (props: LucideProps) => React.createElement(Icon, { name: "ShoppingCart", ...props })
export const Star = (props: LucideProps) => React.createElement(Icon, { name: "Star", ...props })
export const TrendingUp = (props: LucideProps) => React.createElement(Icon, { name: "TrendingUp", ...props })
export const Users = (props: LucideProps) => React.createElement(Icon, { name: "Users", ...props })
export const Settings = (props: LucideProps) => React.createElement(Icon, { name: "Settings", ...props })
export const Plus = (props: LucideProps) => React.createElement(Icon, { name: "Plus", ...props })
export const X = (props: LucideProps) => React.createElement(Icon, { name: "X", ...props })
export const Grid3X3 = (props: LucideProps) => React.createElement(Icon, { name: "Grid3X3", ...props })
export const Edit3 = (props: LucideProps) => React.createElement(Icon, { name: "Edit3", ...props })
export const Save = (props: LucideProps) => React.createElement(Icon, { name: "Save", ...props })
export const Layers = (props: LucideProps) => React.createElement(Icon, { name: "Layers", ...props })
export const Briefcase = (props: LucideProps) => React.createElement(Icon, { name: "Briefcase", ...props })
export const GraduationCap = (props: LucideProps) => React.createElement(Icon, { name: "GraduationCap", ...props })
export const ShoppingBag = (props: LucideProps) => React.createElement(Icon, { name: "ShoppingBag", ...props })
export const FileText = (props: LucideProps) => React.createElement(Icon, { name: "FileText", ...props })
export const MessageSquare = (props: LucideProps) => React.createElement(Icon, { name: "MessageSquare", ...props })
export const BarChart3 = (props: LucideProps) => React.createElement(Icon, { name: "BarChart3", ...props })
export const Store = (props: LucideProps) => React.createElement(Icon, { name: "Store", ...props })
export const MapPin = (props: LucideProps) => React.createElement(Icon, { name: "MapPin", ...props })
export const Zap = (props: LucideProps) => React.createElement(Icon, { name: "Zap", ...props })
export const LayoutGrid = (props: LucideProps) => React.createElement(Icon, { name: "LayoutGrid", ...props })
export const Maximize2 = (props: LucideProps) => React.createElement(Icon, { name: "Maximize2", ...props })
export const RotateCcw = (props: LucideProps) => React.createElement(Icon, { name: "RotateCcw", ...props })
export const Home = (props: LucideProps) => React.createElement(Icon, { name: "Home", ...props })
export const Search = (props: LucideProps) => React.createElement(Icon, { name: "Search", ...props })
export const User = (props: LucideProps) => React.createElement(Icon, { name: "User", ...props })
export const Clock = (props: LucideProps) => React.createElement(Icon, { name: "Clock", ...props })
export const Info = (props: LucideProps) => React.createElement(Icon, { name: "Info", ...props })
export const AlertTriangle = (props: LucideProps) => React.createElement(Icon, { name: "AlertTriangle", ...props })
export const CheckCircle = (props: LucideProps) => React.createElement(Icon, { name: "CheckCircle", ...props })
export const XCircle = (props: LucideProps) => React.createElement(Icon, { name: "XCircle", ...props })
export const Sun = (props: LucideProps) => React.createElement(Icon, { name: "Sun", ...props })
export const Moon = (props: LucideProps) => React.createElement(Icon, { name: "Moon", ...props })
export const Laptop = (props: LucideProps) => React.createElement(Icon, { name: "Laptop", ...props })
export const ChevronLeft = (props: LucideProps) => React.createElement(Icon, { name: "ChevronLeft", ...props })
export const ChevronRight = (props: LucideProps) => React.createElement(Icon, { name: "ChevronRight", ...props })
export const ChevronsLeft = (props: LucideProps) => React.createElement(Icon, { name: "ChevronsLeft", ...props })
export const ChevronsRight = (props: LucideProps) => React.createElement(Icon, { name: "ChevronsRight", ...props })
export const MoreHorizontal = (props: LucideProps) => React.createElement(Icon, { name: "MoreHorizontal", ...props })
export const EllipsisVertical = (props: LucideProps) => React.createElement(Icon, { name: "EllipsisVertical", ...props })
export const Menu = (props: LucideProps) => React.createElement(Icon, { name: "Menu", ...props })
export const Bell = (props: LucideProps) => React.createElement(Icon, { name: "Bell", ...props })
export const Mail = (props: LucideProps) => React.createElement(Icon, { name: "Mail", ...props })
export const Calendar = (props: LucideProps) => React.createElement(Icon, { name: "Calendar", ...props })
export const Filter = (props: LucideProps) => React.createElement(Icon, { name: "Filter", ...props })
export const ListFilter = (props: LucideProps) => React.createElement(Icon, { name: "ListFilter", ...props })
export const SlidersHorizontal = (props: LucideProps) => React.createElement(Icon, { name: "SlidersHorizontal", ...props })
export const Eye = (props: LucideProps) => React.createElement(Icon, { name: "Eye", ...props })
export const EyeOff = (props: LucideProps) => React.createElement(Icon, { name: "EyeOff", ...props })
export const Lock = (props: LucideProps) => React.createElement(Icon, { name: "Lock", ...props })
export const Unlock = (props: LucideProps) => React.createElement(Icon, { name: "Unlock", ...props })
export const Trash2 = (props: LucideProps) => React.createElement(Icon, { name: "Trash2", ...props })
export const Download = (props: LucideProps) => React.createElement(Icon, { name: "Download", ...props })
export const Upload = (props: LucideProps) => React.createElement(Icon, { name: "Upload", ...props })
export const ExternalLink = (props: LucideProps) => React.createElement(Icon, { name: "ExternalLink", ...props })
export const Link = (props: LucideProps) => React.createElement(Icon, { name: "Link", ...props })
export const Copy = (props: LucideProps) => React.createElement(Icon, { name: "Copy", ...props })
export const Check = (props: LucideProps) => React.createElement(Icon, { name: "Check", ...props })
export const Minus = (props: LucideProps) => React.createElement(Icon, { name: "Minus", ...props })
export const HelpCircle = (props: LucideProps) => React.createElement(Icon, { name: "HelpCircle", ...props })
export const AlertCircle = (props: LucideProps) => React.createElement(Icon, { name: "AlertCircle", ...props })
export const ShieldCheck = (props: LucideProps) => React.createElement(Icon, { name: "ShieldCheck", ...props })
export const ShieldAlert = (props: LucideProps) => React.createElement(Icon, { name: "ShieldAlert", ...props })
export const ShieldOff = (props: LucideProps) => React.createElement(Icon, { name: "ShieldOff", ...props })
export const Key = (props: LucideProps) => React.createElement(Icon, { name: "Key", ...props })
export const LogOut = (props: LucideProps) => React.createElement(Icon, { name: "LogOut", ...props })
export const LogIn = (props: LucideProps) => React.createElement(Icon, { name: "LogIn", ...props })
export const UserPlus = (props: LucideProps) => React.createElement(Icon, { name: "UserPlus", ...props })
export const UserMinus = (props: LucideProps) => React.createElement(Icon, { name: "UserMinus", ...props })
export const UserCheck = (props: LucideProps) => React.createElement(Icon, { name: "UserCheck", ...props })
export const UserX = (props: LucideProps) => React.createElement(Icon, { name: "UserX", ...props })
export const Users2 = (props: LucideProps) => React.createElement(Icon, { name: "Users2", ...props })
export const UserCog = (props: LucideProps) => React.createElement(Icon, { name: "UserCog", ...props })
export const UserCircle = (props: LucideProps) => React.createElement(Icon, { name: "UserCircle", ...props })