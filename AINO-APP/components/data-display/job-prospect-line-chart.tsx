"use client"

import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const data = [
  { month: "3月", value: 2 },
  { month: "4月", value: 3 },
  { month: "5月", value: 1 },
  { month: "6月", value: 4 },
]

export function JobProspectLineChart() {
  const { palette } = useDataChartTheme()

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={palette[0]} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
          <YAxis hide />
          <Area type="monotone" dataKey="value" stroke={palette[0]} fill="url(#colorValue)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
