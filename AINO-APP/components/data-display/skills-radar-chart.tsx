"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { subject: "Design", A: 120, B: 110, fullMark: 150 },
  { subject: "Develop", A: 98, B: 130, fullMark: 150 },
  { subject: "Product", A: 86, B: 130, fullMark: 150 },
  { subject: "Market", A: 99, B: 100, fullMark: 150 },
  { subject: "Support", A: 85, B: 90, fullMark: 150 },
  { subject: "Sales", A: 65, B: 85, fullMark: 150 },
]

export function SkillsRadarChart() {
  const { palette } = useDataChartTheme()

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Team Skills
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Comparison between two teams
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Radar name="Team A" dataKey="A" stroke={palette[0]} fill={palette[0]} fillOpacity={0.6} />
            <Radar name="Team B" dataKey="B" stroke={palette[1]} fill={palette[1]} fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
