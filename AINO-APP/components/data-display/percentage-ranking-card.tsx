"use client"

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { useDataChartTheme } from "@/hooks/use-data-chart-theme"

interface RankingItem {
  label: string
  value: string
  percentage: number
  color: string
}

interface PercentageRankingCardProps {
  title: string
  description: string
  data: RankingItem[]
  columns: {
    label: string
    value: string
    percentage: string
  }
  showTitle?: boolean
}

export function PercentageRankingCard({
  title,
  description,
  data,
  columns,
  showTitle = true,
}: PercentageRankingCardProps) {
  const { palette } = useDataChartTheme()

  return (
    <div className="space-y-6">
      {showTitle && (
        <>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--card-title-color)" }}>
            {title}
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--card-text-color)" }}>
            {description}
          </p>
        </>
      )}

      <div className="space-y-4">
        {/* 表格头部 */}
        <div
          className="grid grid-cols-3 text-sm font-medium pb-2 border-b border-gray-200"
          style={{ color: "var(--card-text-color)" }}
        >
          <div>{columns.label}</div>
          <div className="text-center">{columns.value}</div>
          <div className="text-center">{columns.percentage}</div>
        </div>

        {/* 数据行 */}
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.label} className="grid grid-cols-3 items-center py-2">
              <div className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
                {item.label}
              </div>
              <div className="text-lg font-bold text-center" style={{ color: "var(--card-title-color)" }}>
                {item.value}
              </div>
              <div className="flex justify-center">
                <div className="w-16 h-16 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: item.percentage }, { value: 100 - item.percentage }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={32}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={item.color} />
                        <Cell fill="rgba(229, 231, 235, 0.3)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
