"use client"

import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const data = [
  { month: "3月", trend1: 75, trend2: 60 },
  { month: "4月", trend1: 75, trend2: 65 },
  { month: "5月", trend1: 25, trend2: 45 },
  { month: "6月", trend1: 150, trend2: 120 },
]

export function JobProspectTrendChart() {
  const { palette } = useDataChartTheme()

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart accessibilityLayer={false}
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[-75, 225]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "0.5rem",
              border: "1px solid rgba(230, 230, 230, 0.8)",
            }}
          />
          <Line
            type="monotone"
            dataKey="trend1"
            stroke={palette[0]}
            strokeWidth={3}
            dot={{ fill: palette[0], strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="trend2"
            stroke={palette[1]}
            strokeWidth={3}
            dot={{ fill: palette[1], strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
