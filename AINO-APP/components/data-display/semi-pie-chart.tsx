"use client"

import { useState } from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "Desktop", value: 45, color: "#3b82f6" },
  { name: "Mobile", value: 35, color: "#10b981" },
  { name: "Tablet", value: 20, color: "#f59e0b" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600">{`${payload[0].value}%`}</p>
      </div>
    )
  }
  return null
}

export function SemiPieChart() {
  const { palette } = useDataChartTheme()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set())

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const visibleData = data.filter((item) => !hiddenItems.has(item.name))

  const handleLegendClick = (itemName: string) => {
    const newHiddenItems = new Set(hiddenItems)
    if (hiddenItems.has(itemName)) {
      newHiddenItems.delete(itemName)
    } else {
      newHiddenItems.add(itemName)
    }
    setHiddenItems(newHiddenItems)
  }

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Device Usage Distribution
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Semi-circular pie chart showing device usage.
      </p>
      <div className="h-48 relative focus:outline-none [&_*]:focus:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visibleData}
              cx="50%"
              cy="85%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              cornerRadius={8}
              paddingAngle={3}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationBegin={0}
              animationDuration={800}
            >
              {visibleData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={palette[data.indexOf(entry) % palette.length]}
                  stroke={activeIndex === index ? "#fff" : "none"}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  style={{
                    filter: activeIndex === index ? "brightness(1.1)" : "none",
                    transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "all 0.2s ease-in-out",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-2xl font-bold" style={{ color: "var(--card-title-color)" }}>
            {visibleData.reduce((sum, item) => sum + item.value, 0)}%
          </p>
          <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
            Total Coverage
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleLegendClick(item.name)}
          >
            <div
              className="mr-2 h-3 w-3 rounded-full transition-opacity"
              style={{
                backgroundColor: palette[index % palette.length],
                opacity: hiddenItems.has(item.name) ? 0.3 : 1,
              }}
            />
            <span
              className="text-sm transition-opacity"
              style={{
                color: "var(--card-title-color)",
                opacity: hiddenItems.has(item.name) ? 0.5 : 1,
                textDecoration: hiddenItems.has(item.name) ? "line-through" : "none",
              }}
            >
              {item.name} ({item.value}%)
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
