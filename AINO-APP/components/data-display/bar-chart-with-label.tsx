"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "Q1", value: 2400, growth: "+12%" },
  { name: "Q2", value: 1398, growth: "-8%" },
  { name: "Q3", value: 9800, growth: "+24%" },
  { name: "Q4", value: 3908, growth: "+15%" },
]

const CustomLabel = (props: any) => {
  const { x, y, width, value } = props
  return (
    <text x={x + width / 2} y={y - 8} fill="#374151" textAnchor="middle" fontSize={11} fontWeight="600">
      {value.toLocaleString()}
    </text>
  )
}

export function BarChartWithLabel() {
  const { palette } = useDataChartTheme()

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Quarterly Revenue
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Revenue with growth indicators
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="60%" margin={{ top: 40, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
              formatter={(value: any, name: any, props: any) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="value" fill={palette[0]} radius={8}>
              <LabelList content={CustomLabel} />
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
