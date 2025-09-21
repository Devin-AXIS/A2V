"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "Premium", value: 40, amount: 12500 },
  { name: "Standard", value: 35, amount: 8750 },
  { name: "Basic", value: 25, amount: 5000 },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">{`${data.value}% ($${data.amount.toLocaleString()})`}</p>
      </div>
    )
  }
  return null
}

export function GradientPieChart() {
  const { palette } = useDataChartTheme()
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Subscription Plans
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Revenue distribution by subscription tier.
      </p>
      <div className="h-64 relative [&_*]:focus:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((_, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={palette[index % palette.length]} stopOpacity={1} />
                  <stop offset="100%" stopColor={palette[index % palette.length]} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" cornerRadius={12} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold" style={{ color: "var(--card-title-color)" }}>
            ${(totalAmount / 1000).toFixed(0)}K
          </p>
          <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
            Total Revenue
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50">
            <div className="flex items-center">
              <div
                className="mr-3 h-4 w-4 rounded-full shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${palette[index % palette.length]}, ${palette[index % palette.length]}80)`,
                }}
              />
              <span className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
                {item.name}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold" style={{ color: "var(--card-title-color)" }}>
                ${item.amount.toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
                {item.value}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
