"use client"

import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

export interface LineChartPoint {
  month: string
  value: number
}

interface JobProspectLineChartProps {
  data: LineChartPoint[]
  xKey?: keyof LineChartPoint
  yKey?: keyof LineChartPoint
  className?: string
}

export function JobProspectLineChart({
  data,
  xKey = "month",
  yKey = "value",
  className,
}: JobProspectLineChartProps) {
  const { palette } = useDataChartTheme()

  return (
    <div className={`${className ? className : "h-32"} chart-container`}>
      <ResponsiveContainer width="100%" height="100%">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AreaChart data={data as any[]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={palette[0]} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey={xKey as string} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
          <YAxis hide />
          <Area type="monotone" dataKey={yKey as string} stroke={palette[0]} fill="url(#colorValue)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
