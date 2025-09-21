"use client"

import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const salaryData = [
  { range: "¥15900", location: "中等月薪", percentage: 19 },
  { range: "6-8k", location: "", percentage: 42 },
  { range: "10-15k", location: "", percentage: 56 },
  { range: "20k+", location: "", percentage: 42 },
]

export function SalaryDistributionTable() {
  const { palette } = useDataChartTheme()

  return (
    <div className="space-y-3">
      {salaryData.map((item, index) => (
        <div key={index} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground">{item.range}</span>
            {item.location && <span className="text-sm text-muted-foreground">{item.location}</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: palette[0],
                }}
              />
            </div>
            <span className="text-sm font-medium w-8 text-right">{item.percentage}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}
