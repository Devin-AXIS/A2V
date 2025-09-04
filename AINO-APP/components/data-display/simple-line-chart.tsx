"use client"

import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { average: 400, today: 240 },
  { average: 300, today: 139 },
  { average: 200, today: 980 },
  { average: 278, today: 390 },
  { average: 189, today: 480 },
  { average: 239, today: 380 },
  { average: 349, today: 430 },
]

export function SimpleLineChart() {
  const { palette } = useDataChartTheme()

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Line Chart
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        January - July 2024
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={palette[0]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={palette[0]} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke={palette[3] || "hsl(var(--muted-foreground))"} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke={palette[3] || "hsl(var(--muted-foreground))"}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
              }}
            />
            <Area type="monotone" dataKey="today" stroke={palette[0]} fill="url(#colorToday)" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="average"
              stroke={palette[1]}
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
