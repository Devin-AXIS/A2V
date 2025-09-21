"use client"

import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "Visitors", value: 10000, color: "#8b5cf6" },
  { name: "Leads", value: 7500, color: "#06b6d4" },
  { name: "Prospects", value: 5000, color: "#10b981" },
  { name: "Customers", value: 2500, color: "#f59e0b" },
  { name: "Advocates", value: 1000, color: "#ef4444" },
]

export function FunnelChart() {
  const { palette } = useDataChartTheme()
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Sales Funnel
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Conversion rates through the pipeline
      </p>
      <div className="h-72 flex flex-col justify-center items-center space-y-2">
        {data.map((item, index) => {
          const width = (item.value / maxValue) * 100
          const conversionRate = index > 0 ? ((item.value / data[index - 1].value) * 100).toFixed(1) : "100.0"

          return (
            <div key={item.name} className="w-full flex flex-col items-center">
              <div
                className="relative flex items-center justify-center text-white font-semibold text-sm transition-all duration-300 hover:scale-105"
                style={{
                  width: `${width}%`,
                  height: "48px",
                  backgroundColor: palette[index % palette.length],
                  borderRadius: "24px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              >
                <span>
                  {item.name}: {item.value.toLocaleString()}
                </span>
                {index > 0 && (
                  <div
                    className="absolute -top-6 right-2 text-xs font-medium px-2 py-1 bg-white rounded-full shadow-sm border"
                    style={{ color: "var(--card-text-color)" }}
                  >
                    {conversionRate}%
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </ChartCard>
  )
}
