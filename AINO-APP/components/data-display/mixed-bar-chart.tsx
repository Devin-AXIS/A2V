"use client"

import { Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, ComposedChart } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "Jan", revenue: 4000, profit: 2400, margin: 60 },
  { name: "Feb", revenue: 3000, profit: 1398, margin: 46.6 },
  { name: "Mar", revenue: 2000, profit: 9800, margin: 490 },
  { name: "Apr", revenue: 2780, profit: 3908, margin: 140.6 },
  { name: "May", revenue: 1890, profit: 4800, margin: 254 },
  { name: "Jun", revenue: 2390, profit: 3800, margin: 159 },
]

export function MixedBarChart() {
  const { palette } = useDataChartTheme()

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Revenue & Profit Analysis
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Mixed chart with bars and line
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} barCategoryGap="40%" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
            <Bar yAxisId="left" dataKey="revenue" fill={palette[0]} radius={8} name="Revenue" />
            <Bar yAxisId="left" dataKey="profit" fill={palette[1]} radius={8} name="Profit" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margin"
              stroke={palette[2]}
              strokeWidth={3}
              dot={{ fill: palette[2], strokeWidth: 2, r: 4 }}
              name="Margin %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
