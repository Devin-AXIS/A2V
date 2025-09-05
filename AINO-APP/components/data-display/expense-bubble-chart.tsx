"use client"

import { ChartCard } from "@/components/data-display/chart-card"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

const expenseData = [
  { name: "Grocery", value: 48, amount: 758.2 },
  { name: "Food & Drink", value: 32, amount: 758.2 },
  { name: "Shopping", value: 13, amount: 758.2 },
  { name: "Transportation", value: 7, amount: 758.2 },
]

export function ExpenseBubbleChart() {
  const { palette } = useDataChartTheme()

  const colorMapping = {
    Grocery: palette[0] || "#8b5cf6",
    "Food & Drink": palette[1] || "#22c55e",
    Shopping: palette[2] || "#ef4444",
    Transportation: palette[3] || "#f97316",
  }

  return (
    <ChartCard>
      <div className="flex h-48 items-center justify-center gap-2">
        {expenseData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: `${item.value * 2.5}px`,
              height: `${item.value * 2.5}px`,
              backgroundColor: `${colorMapping[item.name as keyof typeof colorMapping]}20`, // 20% opacity
              border: `2px solid ${colorMapping[item.name as keyof typeof colorMapping]}`,
            }}
          >
            <span className="text-lg font-bold" style={{ color: colorMapping[item.name as keyof typeof colorMapping] }}>
              {item.value}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
        {expenseData.map((item) => (
          <div key={item.name} className="flex items-center">
            <div
              className="mr-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: colorMapping[item.name as keyof typeof colorMapping] }}
            />
            <div>
              <p className="text-sm" style={{ color: "var(--card-text-color)" }}>
                {item.name}
              </p>
              <p className="font-semibold" style={{ color: "var(--card-title-color)" }}>
                ${item.amount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
