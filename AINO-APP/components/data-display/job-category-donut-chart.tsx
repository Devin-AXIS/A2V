"use client"

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const data = [
  { name: "AI训练/数据", value: 26, color: "#3b82f6" },
  { name: "AI", value: 24, color: "#8b5cf6" },
  { name: "AIGC/多媒体", value: 18, color: "#10b981" },
  { name: "产品", value: 16, color: "#f59e0b" },
  { name: "安全/对齐", value: 10, color: "#06b6d4" },
]

export function JobCategoryDonutChart() {
  const { palette } = useDataChartTheme()

  return (
    <div className="space-y-4">
      {/* 环形图 */}
      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
              cornerRadius={8}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 图例 - 两列布局 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: palette[index % palette.length] }}
            />
            <span className="font-medium text-foreground">{item.value}</span>
            <span className="text-muted-foreground truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
