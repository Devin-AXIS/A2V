"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

export interface AbilityRadarPoint {
  subject: string
  value: number
  fullMark?: number
}

interface AbilityRequirementsRadarProps {
  data: AbilityRadarPoint[]
  className?: string
}

export function AbilityRequirementsRadar({ data, className }: AbilityRequirementsRadarProps) {
  const { palette } = useDataChartTheme()

  return (
    <>
      <h3 className="text-base font-semibold mb-4">能力要求分布</h3>
      <div className={`${className ? className : "h-64"} chart-container`}>
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
