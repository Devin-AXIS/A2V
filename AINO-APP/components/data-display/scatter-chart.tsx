"use client"

import {
  ScatterChart as RechartsScatterChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Scatter,
} from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
  { x: 200, y: 350, z: 300 },
  { x: 180, y: 180, z: 250 },
]

export function ScatterChart() {
  const { palette } = useDataChartTheme()

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Performance Analysis
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Correlation between metrics
      </p>
      <div className="h-72 focus:outline-none [&_*]:focus:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis
              type="number"
              dataKey="x"
              name="Performance"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Efficiency"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                borderRadius: "1rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              }}
              formatter={(value, name) => [
                value,
                name === "x" ? "Performance" : name === "y" ? "Efficiency" : "Impact",
              ]}
            />
            <Scatter name="Data Points" data={data} fill={palette[0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Scatter>
          </RechartsScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
