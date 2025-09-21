"use client"

import { RadialBar, RadialBarChart, Legend, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "18-24", uv: 31.47, pv: 2400 },
  { name: "25-29", uv: 26.69, pv: 4567 },
  { name: "30-34", uv: 15.69, pv: 1398 },
  { name: "35-39", uv: 8.22, pv: 9800 },
  { name: "40-49", uv: 8.63, pv: 3908 },
  { name: "50+", uv: 2.63, pv: 4800 },
  { name: "unknow", uv: 6.67, pv: 4800 },
]

export function ProgressRadialBarChart() {
  const { palette } = useDataChartTheme()

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Visitor Age
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Distribution of visitor age groups
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={data}>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
              }}
            />
            <RadialBar label={{ position: "insideStart", fill: "#fff" }} background dataKey="uv">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </RadialBar>
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
