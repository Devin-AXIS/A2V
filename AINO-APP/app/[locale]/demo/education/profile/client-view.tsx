"use client"

import type React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, Gift, PlusCircle, BookOpen, GraduationCap } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"

interface EducationProfileClientViewProps {
  dict: {
    name: string
    id: string
    followers: string
    following: string
    posts: string
    myPoints: string
    pointsToday: string
    redeem: string
    getPoints: string
    toolbar: string
    personalProfile: string
    helpCenter: string
    customerService: string
    settings: string
    details: string
  }
}

export function EducationProfileClientView({ dict }: EducationProfileClientViewProps) {
  const { locale } = useParams()

  const StatItem = ({ value, label }: { value: string; label: string }) => (
    <div className="text-center">
      <p className="text-xl font-bold" style={{ color: "var(--card-title-color)" }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--card-text-color)" }}>
        {label}
      </p>
    </div>
  )

  const ToolbarItem = ({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) => (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 text-center text-xs font-medium hover:text-black transition-colors"
      style={{ color: "var(--card-text-color)" }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )

  return (
    <main className="p-4 space-y-6">
      {/* Top User Avatar & Info */}
      <div className="flex items-center gap-4 p-2">
        <Avatar className="w-14 h-14 border-2 border-white shadow-md">
          <AvatarImage src="/generic-user-avatar.png" alt="User Avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-bold text-gray-900" style={{ color: "var(--card-title-color)" }}>
            {dict.name}
          </h3>
          <p className="text-xs text-gray-500" style={{ color: "var(--card-text-color)" }}>
            {dict.id}
          </p>
        </div>
      </div>

      <AppCard>
        <div className="flex justify-around items-center py-4">
          <StatItem value="12" label="已完成课程" />
          <StatItem value="156" label="学习时长(小时)" />
          <StatItem value="8" label="获得证书" />
        </div>
      </AppCard>

      {/* My Points Card */}
      <AppCard className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-medium" style={{ color: "var(--card-text-color)" }}>
              学习积分
            </h4>
            <p className="text-3xl font-bold mt-1" style={{ color: "var(--card-title-color)" }}>
              4,567
            </p>
          </div>
          <div className="text-right">
            <Link href="#" className="text-xs text-blue-600 hover:underline">
              {dict.details}
            </Link>
            <p className="text-xs mt-4" style={{ color: "var(--card-text-color)" }}>
              今日获得: <span className="font-semibold text-green-500">120+</span>
            </p>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-200/70 pt-4 flex justify-around">
          <Link
            href="#"
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
          >
            <Gift className="h-5 w-5" />
            <span>兑换奖励</span>
          </Link>
          <div className="w-px bg-gray-200/70" />
          <Link
            href="#"
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
          >
            <PlusCircle className="h-5 w-5" />
            <span>学习任务</span>
          </Link>
        </div>
      </AppCard>

      <AppCard className="p-5">
        <h4 className="text-sm font-medium mb-4" style={{ color: "var(--card-title-color)" }}>
          学习工具
        </h4>
        <div className="grid grid-cols-4 gap-4">
          <ToolbarItem
            icon={<User className="w-5 h-5" style={{ color: "var(--card-text-color)" }} />}
            label={dict.personalProfile}
            href="#"
          />
          <ToolbarItem
            icon={<BookOpen className="w-5 h-5" style={{ color: "var(--card-text-color)" }} />}
            label="我的课程"
            href={`/${locale}/demo/education/courses`}
          />
          <ToolbarItem
            icon={<GraduationCap className="w-5 h-5" style={{ color: "var(--card-text-color)" }} />}
            label="我的证书"
            href="#"
          />
          <ToolbarItem
            icon={<Settings className="w-5 h-5" style={{ color: "var(--card-text-color)" }} />}
            label={dict.settings}
            href="#"
          />
        </div>
      </AppCard>
    </main>
  )
}
