"use client"

import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface SkillProgress {
  skill: string
  percentage: number
}

interface SkillProgressChartProps {
  data?: SkillProgress[]
  title?: string
  description?: string
}

const defaultData: SkillProgress[] = [
  { skill: "机器学习基础", percentage: 90 },
  { skill: "深度学习应用", percentage: 85 },
  { skill: "项目实战能力", percentage: 80 },
  { skill: "行业应用理解", percentage: 75 },
]

export default function SkillProgressChart({
  data = defaultData,
  title = "技能掌握进度",
  description = "各项技能的学习进度和掌握程度",
}: SkillProgressChartProps) {
  const { palette } = useDataChartTheme()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--card-title-color)" }}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
      </div>
      
      <div className="space-y-4 focus:outline-none [&_*]:focus:outline-none">
        {data.map((item, index) => (
          <div key={index} className="group">
            <div className="flex justify-between items-center mb-2">
              <span
                className="text-sm font-medium transition-colors duration-200 group-hover:opacity-80"
                style={{ color: "var(--card-description-color)" }}
              >
                {item.skill}
              </span>
              <span
                className="text-sm font-semibold px-2 py-1 rounded-md transition-all duration-200"
                style={{
                  color: palette[index % palette.length],
                  backgroundColor: `${palette[index % palette.length]}15`,
                }}
              >
                {item.percentage}%
              </span>
            </div>
            <div className="relative w-full bg-black/5 dark:bg-white/5 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: palette[index % palette.length],
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
