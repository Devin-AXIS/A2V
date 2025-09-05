"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const data = [
  { subject: "数据分析", value: 90, fullMark: 100 },
  { subject: "沟通能力", value: 85, fullMark: 100 },
  { subject: "行业知识", value: 80, fullMark: 100 },
  { subject: "AI工具", value: 95, fullMark: 100 },
  { subject: "项目管理", value: 75, fullMark: 100 },
  { subject: "创新思维", value: 88, fullMark: 100 },
]

export function AbilityRequirementsRadar() {
  const { palette } = useDataChartTheme()

  return (
    <>
      <h3 className="text-base font-semibold mb-4">能力要求分布</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke={palette[0]} />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
              }}
            />
            <Radar dataKey="value" stroke={palette[0]} fill={palette[0]} fillOpacity={0.3} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
