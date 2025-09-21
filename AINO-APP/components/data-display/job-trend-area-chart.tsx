"use client"

import { Area, AreaChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const data = [
  { month: "1月", value: 120 },
  { month: "2月", value: 180 },
  { month: "3月", value: 240 },
  { month: "4月", value: 320 },
  { month: "5月", value: 280 },
  { month: "6月", value: 350 },
]

export function JobTrendAreaChart() {
  const { palette } = useDataChartTheme()

  return (
    <div className="h-64" style={{ height: "240px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="jobTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette[0]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={palette[0]} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "0.5rem",
              border: "1px solid rgba(230, 230, 230, 0.8)",
            }}
          />
          <Area type="monotone" dataKey="value" stroke={palette[0]} fill="url(#jobTrendGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
