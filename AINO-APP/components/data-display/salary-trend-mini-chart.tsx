"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const data = [{ value: 14200 }, { value: 14500 }, { value: 13800 }, { value: 15200 }]

export function SalaryTrendMiniChart() {
  const { palette } = useDataChartTheme()

  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" data={data} dataKey="value" stroke={palette[2]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
