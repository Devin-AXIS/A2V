"use client"

import { useState } from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  { name: "Social Media", value: 35, leads: 1250 },
  { name: "Email Marketing", value: 28, leads: 980 },
  { name: "Direct Traffic", value: 22, leads: 770 },
  { name: "Referrals", value: 15, leads: 525 },
]

const RADIAN = Math.PI / 180

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">{`${data.value}% (${data.leads.toLocaleString()} leads)`}</p>
      </div>
    )
  }
  return null
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, isActive }: any) => {
  const radius = outerRadius + (isActive ? 35 : 25)
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <g>
      <line
        x1={cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)}
        y1={cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)}
        x2={cx + (outerRadius + (isActive ? 30 : 20)) * Math.cos(-midAngle * RADIAN)}
        y2={cy + (outerRadius + (isActive ? 30 : 20)) * Math.sin(-midAngle * RADIAN)}
        stroke="var(--card-text-color)"
        strokeWidth={isActive ? 2 : 1}
        opacity={isActive ? 0.8 : 0.6}
        className="transition-all duration-200"
      />
      <circle
        cx={cx + (outerRadius + (isActive ? 30 : 20)) * Math.cos(-midAngle * RADIAN)}
        cy={cy + (outerRadius + (isActive ? 30 : 20)) * Math.sin(-midAngle * RADIAN)}
        r={isActive ? 3 : 2}
        fill="var(--card-text-color)"
        opacity={isActive ? 0.8 : 0.6}
        className="transition-all duration-200"
      />
      <text
        x={x}
        y={y - 5}
        fill="var(--card-title-color)"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className={`text-xs font-medium transition-all duration-200 ${isActive ? "text-sm" : ""}`}
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 8}
        fill="var(--card-text-color)"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs transition-all duration-200"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  )
}

export function LabeledPieChart() {
  const { palette } = useDataChartTheme()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set())

  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0)
  const visibleData = data.filter((item) => !hiddenItems.has(item.name))
  const visibleLeads = visibleData.reduce((sum, item) => sum + item.leads, 0)

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
        Lead Sources
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Distribution of leads by acquisition channel.
      </p>
      <div className="h-80 relative focus:outline-none [&_*]:focus:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visibleData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) => renderCustomLabel({ ...props, isActive: activeIndex === props.index })}
              outerRadius={70}
              dataKey="value"
              cornerRadius={8}
              paddingAngle={2}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationBegin={0}
              animationDuration={800}
            >
              {visibleData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={palette[data.indexOf(entry) % palette.length]}
                  stroke={activeIndex === index ? "hsl(var(--background))" : "none"}
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-xl font-bold transition-all duration-300" style={{ color: "var(--card-title-color)" }}>
            {visibleLeads.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
            Total Leads
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-lg hover:bg-gray-50/50"
            onClick={() => handleLegendClick(item.name)}
          >
            <div
              className="mr-3 h-3 w-3 rounded-full transition-all duration-200"
              style={{
                backgroundColor: palette[index % palette.length],
                opacity: hiddenItems.has(item.name) ? 0.3 : 1,
                transform: hiddenItems.has(item.name) ? "scale(0.8)" : "scale(1)",
              }}
            />
            <div className="flex-1">
              <span
                className="text-sm font-medium transition-opacity"
                style={{
                  color: "var(--card-title-color)",
                  opacity: hiddenItems.has(item.name) ? 0.5 : 1,
                  textDecoration: hiddenItems.has(item.name) ? "line-through" : "none",
                }}
              >
                {item.name}
              </span>
              <p
                className="text-xs transition-opacity"
                style={{
                  color: "var(--card-text-color)",
                  opacity: hiddenItems.has(item.name) ? 0.5 : 1,
                }}
              >
                {item.leads.toLocaleString()} leads
              </p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
