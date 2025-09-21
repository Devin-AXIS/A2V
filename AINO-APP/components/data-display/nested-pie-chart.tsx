"use client"

import { useState } from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const innerData = [
  { name: "Q1", value: 25 },
  { name: "Q2", value: 30 },
  { name: "Q3", value: 25 },
  { name: "Q4", value: 20 },
]

const outerData = [
  { name: "Jan", value: 8 },
  { name: "Feb", value: 9 },
  { name: "Mar", value: 8 },
  { name: "Apr", value: 10 },
  { name: "May", value: 11 },
  { name: "Jun", value: 9 },
  { name: "Jul", value: 8 },
  { name: "Aug", value: 9 },
  { name: "Sep", value: 8 },
  { name: "Oct", value: 7 },
  { name: "Nov", value: 6 },
  { name: "Dec", value: 7 },
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

export function NestedPieChart() {
  const { palette } = useDataChartTheme()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [activeLayer, setActiveLayer] = useState<"inner" | "outer" | null>(null)

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Revenue Distribution
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Nested pie chart showing quarterly and monthly breakdown.
      </p>
      <div className="h-64 relative focus:outline-none [&_*]:focus:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Inner pie - Quarters */}
            <Pie
              data={innerData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              dataKey="value"
              cornerRadius={6}
              paddingAngle={2}
              onMouseEnter={(_, index) => {
                setActiveIndex(index)
                setActiveLayer("inner")
              }}
              onMouseLeave={() => {
                setActiveIndex(null)
                setActiveLayer(null)
              }}
              animationBegin={0}
              animationDuration={800}
            >
              {innerData.map((entry, index) => (
                <Cell
                  key={`inner-${index}`}
                  fill={palette[index % palette.length]}
                  opacity={activeLayer === "inner" && activeIndex === index ? 1 : 0.8}
                  stroke={activeLayer === "inner" && activeIndex === index ? "#fff" : "none"}
                  strokeWidth={activeLayer === "inner" && activeIndex === index ? 2 : 0}
                  style={{
                    filter: activeLayer === "inner" && activeIndex === index ? "brightness(1.1)" : "none",
                    transition: "all 0.2s ease-in-out",
                  }}
                />
              ))}
            </Pie>
            {/* Outer pie - Months */}
            <Pie
              data={outerData}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={95}
              dataKey="value"
              cornerRadius={4}
              paddingAngle={1}
              onMouseEnter={(_, index) => {
                setActiveIndex(index)
                setActiveLayer("outer")
              }}
              onMouseLeave={() => {
                setActiveIndex(null)
                setActiveLayer(null)
              }}
              animationBegin={200}
              animationDuration={800}
            >
              {outerData.map((entry, index) => (
                <Cell
                  key={`outer-${index}`}
                  fill={palette[Math.floor(index / 3) % palette.length]}
                  opacity={activeLayer === "outer" && activeIndex === index ? 0.8 : 0.6}
                  stroke={activeLayer === "outer" && activeIndex === index ? "#fff" : "none"}
                  strokeWidth={activeLayer === "outer" && activeIndex === index ? 2 : 0}
                  style={{
                    filter: activeLayer === "outer" && activeIndex === index ? "brightness(1.1)" : "none",
                    transition: "all 0.2s ease-in-out",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-bold" style={{ color: "var(--card-title-color)" }}>
            2024
          </p>
          <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
            Revenue
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--card-text-color)" }}>
            Quarters
          </p>
          {innerData.map((item, index) => (
            <div key={item.name} className="flex items-center mb-1">
              <div className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              <span className="text-xs" style={{ color: "var(--card-title-color)" }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--card-text-color)" }}>
            Recent Months
          </p>
          {outerData.slice(0, 4).map((item, index) => (
            <div key={item.name} className="flex items-center mb-1">
              <div
                className="mr-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: palette[Math.floor(index / 3) % palette.length], opacity: 0.6 }}
              />
              <span className="text-xs" style={{ color: "var(--card-title-color)" }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  )
}
