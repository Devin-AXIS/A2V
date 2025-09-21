"use client"

import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { month: "Jan", revenue: 4000, profit: 2400, expenses: 1600 },
  { month: "Feb", revenue: 3000, profit: 1398, expenses: 1602 },
  { month: "Mar", revenue: 2000, profit: 800, expenses: 1200 },
  { month: "Apr", revenue: 2780, profit: 1908, expenses: 872 },
  { month: "May", revenue: 1890, profit: 1200, expenses: 690 },
  { month: "Jun", revenue: 2390, profit: 1600, expenses: 790 },
  { month: "Jul", revenue: 3490, profit: 2100, expenses: 1390 },
]

export function MultiLineChart() {
  const { palette } = useDataChartTheme()

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Financial Overview
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Revenue, profit, and expenses trends
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart accessibilityLayer={false} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                borderRadius: "1rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconType="line" />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={palette[0]}
              strokeWidth={3}
              dot={{ fill: palette[0], strokeWidth: 2, r: 5 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke={palette[1]}
              strokeWidth={3}
              dot={{ fill: palette[1], strokeWidth: 2, r: 5 }}
              name="Profit"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke={palette[2]}
              strokeWidth={3}
              dot={{ fill: palette[2], strokeWidth: 2, r: 5 }}
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
