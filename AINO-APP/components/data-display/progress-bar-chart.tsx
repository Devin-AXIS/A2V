"use client"

import { useDataChartTheme } from "@/hooks/use-data-chart-theme"

interface ProgressItem {
  name: string
  value: number
  unit?: string
}

interface ProgressBarChartProps {
  data: ProgressItem[]
  valueLabel?: string
}

export function ProgressBarChart({ data, valueLabel = "进度" }: ProgressBarChartProps) {
  const { primaryColor, secondaryColor, backgroundColor } = useDataChartTheme()

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{item.name}</span>
            <span className="text-sm text-muted-foreground">
              {valueLabel}: {item.value}
              {item.unit || "%"}
            </span>
          </div>
          <div className="w-full rounded-full h-2" style={{ backgroundColor }}>
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${item.value}%`,
                background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
