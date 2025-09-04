"use client"

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "USA", value: 400 },
  { name: "India", value: 300 },
  { name: "Japan", value: 300 },
  { name: "Germany", value: 200 },
]

export function DonutChartWithText() {
  const { palette } = useDataChartTheme()
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0)
  const goal = 5000
  const percentage = Math.round((totalValue / goal) * 100)

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Sales by Region
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        A donut chart with text in the center.
      </p>
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={85}
              dataKey="value"
              paddingAngle={2}
              cornerRadius={20}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-3xl font-bold" style={{ color: "var(--card-title-color)" }}>
            {percentage}%
          </p>
        </div>
      </div>
    </ChartCard>
  )
}
