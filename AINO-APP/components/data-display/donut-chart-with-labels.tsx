"use client"

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "Marketing", value: 36, amount: 448.87 },
  { name: "Development", value: 24, amount: 298.72 },
  { name: "Design", value: 20, amount: 248.93 },
  { name: "Operations", value: 12, amount: 149.36 },
  { name: "Other", value: 8, amount: 99.57 },
]

const RADIAN = Math.PI / 180

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = outerRadius + 12
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <g>
      <rect
        x={x - 16}
        y={y - 9}
        width={32}
        height={18}
        rx={10}
        ry={10}
        fill="rgba(255, 255, 255, 0.9)"
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth={1}
        className="backdrop-blur-sm drop-shadow-md"
      />
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-semibold drop-shadow-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  )
}

export function DonutChartWithLabels() {
  const { palette } = useDataChartTheme()
  const totalAmount = data.reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Budget Allocation
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Spent this month
      </p>
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              innerRadius={70}
              outerRadius={85}
              dataKey="value"
              cornerRadius={15}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <p className="text-xs mb-0.5" style={{ color: "var(--card-text-color)" }}>
            Spent this April ▼
          </p>
          <p className="text-lg font-bold" style={{ color: "var(--card-title-color)" }}>
            ${totalAmount.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
                {item.name}
              </p>
              <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
                ${item.amount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
