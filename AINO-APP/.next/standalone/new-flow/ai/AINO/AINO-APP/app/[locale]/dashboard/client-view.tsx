"use client"

import { AppCard } from "@/components/layout/app-card"

interface DashboardClientViewProps {
  dict: {
    title: string
  }
}

export default function DashboardClientView({ dict }: DashboardClientViewProps) {
  return (
    <main className="p-4 space-y-6">
      <div className="animate-in fade-in duration-500">
        <AppCard className="flex justify-center items-center p-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{dict.title}</h2>
            <p className="text-gray-500">欢迎使用仪表盘</p>
          </div>
        </AppCard>
      </div>
    </main>
  )
}
