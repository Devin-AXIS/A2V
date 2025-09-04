"use client"

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const data = [
  { name: "不限经验", value: 50, color: "#3b82f6" },
  { name: "3-5年", value: 40, color: "#f59e0b" },
  { name: "1-3年", value: 10, color: "#10b981" },
]

export function SalaryExperienceDonut() {
  const { palette } = useDataChartTheme()

  return (
    <div className="flex items-center gap-6">
      {/* 环形图 */}
      <div className="h-24 w-24 relative flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={40}
              dataKey="value"
              cornerRadius={4}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 图例 */}
      <div className="space-y-2 text-sm">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: palette[index % palette.length] }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
