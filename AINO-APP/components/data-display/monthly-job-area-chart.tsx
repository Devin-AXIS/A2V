"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const data = [
  { month: "2023-03", jobs: 2 },
  { month: "2023-04", jobs: 5 },
  { month: "2023-05", jobs: 3 },
  { month: "2023-06", jobs: 4 },
]

export function MonthlyJobAreaChart() {
  const { palette } = useDataChartTheme()

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette[2]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={palette[2]} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
          <YAxis hide />
          <Area type="monotone" dataKey="jobs" stroke={palette[2]} fill="url(#colorJobs)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
