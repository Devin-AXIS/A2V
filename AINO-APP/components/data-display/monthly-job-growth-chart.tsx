"use client"

import { Area, AreaChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const data = [
  { month: "2023-03", jobs: 5 },
  { month: "2023-04", jobs: 4 },
  { month: "2023-05", jobs: 1 },
  { month: "2023-06", jobs: 4 },
]

export function MonthlyJobGrowthChart() {
  const { palette } = useDataChartTheme()

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="jobGrowthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette[2]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={palette[2]} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.split("-")[1]}
          />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 8]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "0.5rem",
              border: "1px solid rgba(230, 230, 230, 0.8)",
            }}
            labelFormatter={(value) => `${value}月`}
            formatter={(value: any) => [`${value}个职位`, "新增职位"]}
          />
          <Area type="monotone" dataKey="jobs" stroke={palette[2]} fill="url(#jobGrowthGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
