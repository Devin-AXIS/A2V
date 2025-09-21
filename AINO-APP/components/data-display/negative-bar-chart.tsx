"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: -300 },
  { name: "Mar", value: 200 },
  { name: "Apr", value: -278 },
  { name: "May", value: 189 },
  { name: "Jun", value: -239 },
  { name: "Jul", value: 349 },
  { name: "Aug", value: -200 },
  { name: "Sep", value: 278 },
  { name: "Oct", value: -189 },
  { name: "Nov", value: 239 },
  { name: "Dec", value: 349 },
]

export function NegativeBarChart() {
  const { palette } = useDataChartTheme()

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Cash Flow Analysis
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Positive and negative values
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
              formatter={(value: any) => [`$${value}`, "Cash Flow"]}
            />
            <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />
            <Bar dataKey="value" radius={8}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value >= 0 ? palette[0] : palette[3] || "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
