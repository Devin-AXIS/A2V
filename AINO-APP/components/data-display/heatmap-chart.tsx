"use client"

import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { day: "Mon", hour: "9AM", value: 12 },
  { day: "Mon", hour: "12PM", value: 25 },
  { day: "Mon", hour: "3PM", value: 18 },
  { day: "Mon", hour: "6PM", value: 8 },
  { day: "Tue", hour: "9AM", value: 15 },
  { day: "Tue", hour: "12PM", value: 30 },
  { day: "Tue", hour: "3PM", value: 22 },
  { day: "Tue", hour: "6PM", value: 12 },
  { day: "Wed", hour: "9AM", value: 20 },
  { day: "Wed", hour: "12PM", value: 35 },
  { day: "Wed", hour: "3PM", value: 28 },
  { day: "Wed", hour: "6PM", value: 15 },
  { day: "Thu", hour: "9AM", value: 18 },
  { day: "Thu", hour: "12PM", value: 32 },
  { day: "Thu", hour: "3PM", value: 25 },
  { day: "Thu", hour: "6PM", value: 10 },
  { day: "Fri", hour: "9AM", value: 22 },
  { day: "Fri", hour: "12PM", value: 28 },
  { day: "Fri", hour: "3PM", value: 20 },
  { day: "Fri", hour: "6PM", value: 5 },
]

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const hours = ["9AM", "12PM", "3PM", "6PM"]

export function HeatmapChart() {
  const { palette } = useDataChartTheme()
  const maxValue = Math.max(...data.map((d) => d.value))

  const getIntensity = (value: number) => value / maxValue
  const getColor = (intensity: number) => {
    const baseColor = palette[0] || "#8b5cf6"
    return `${baseColor}${Math.round(intensity * 255)
      .toString(16)
      .padStart(2, "0")}`
  }

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Activity Heatmap
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        User activity by day and time
      </p>
      <div className="h-72 p-4">
        <div className="grid grid-cols-5 gap-2 h-full">
          {days.map((day) => (
            <div key={day} className="flex flex-col space-y-2">
              <div className="text-xs font-medium text-center pb-2" style={{ color: "var(--card-text-color)" }}>
                {day}
              </div>
              {hours.map((hour) => {
                const item = data.find((d) => d.day === day && d.hour === hour)
                const intensity = item ? getIntensity(item.value) : 0
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="flex-1 rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-200 hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: getColor(intensity),
                      color: intensity > 0.5 ? "white" : "var(--card-title-color)",
                      minHeight: "40px",
                    }}
                    title={`${day} ${hour}: ${item?.value || 0} activities`}
                  >
                    {item?.value || 0}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center mt-4 space-x-2">
          <span className="text-xs" style={{ color: "var(--card-text-color)" }}>
            Less
          </span>
          <div className="flex space-x-1">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity) => (
              <div key={intensity} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(intensity) }} />
            ))}
          </div>
          <span className="text-xs" style={{ color: "var(--card-text-color)" }}>
            More
          </span>
        </div>
      </div>
    </ChartCard>
  )
}
