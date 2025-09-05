"use client"

import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

const data = [
  {
    name: "Frontend",
    size: 2400,
    children: [
      { name: "React", size: 1200 },
      { name: "Vue", size: 800 },
      { name: "Angular", size: 400 },
    ],
  },
  {
    name: "Backend",
    size: 1800,
    children: [
      { name: "Node.js", size: 900 },
      { name: "Python", size: 600 },
      { name: "Java", size: 300 },
    ],
  },
  {
    name: "Mobile",
    size: 1200,
    children: [
      { name: "React Native", size: 600 },
      { name: "Flutter", size: 400 },
      { name: "Native", size: 200 },
    ],
  },
  {
    name: "DevOps",
    size: 800,
    children: [
      { name: "Docker", size: 400 },
      { name: "K8s", size: 250 },
      { name: "CI/CD", size: 150 },
    ],
  },
]

const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, size, palette } = props

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? palette[index % palette.length] : `${palette[Math.floor(index / 3) % palette.length]}80`,
          stroke: "#fff",
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
        rx={8}
        ry={8}
        className="transition-all duration-200 hover:opacity-80"
      />
      {width > 60 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={width > 100 ? 14 : 12}
          fontWeight="600"
          className="drop-shadow-sm"
        >
          {name}
        </text>
      )}
      {width > 80 && height > 50 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 18}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={10}
        >
          {size}
        </text>
      )}
    </g>
  )
}

export function TreemapChart() {
  const { palette } = useDataChartTheme()

  const CustomizedContentWithPalette = (props: any) => <CustomizedContent {...props} palette={palette} />

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        Technology Stack
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        Distribution of development resources
      </p>
      <div className="h-72 focus:outline-none [&_*]:focus:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={data} dataKey="size" aspectRatio={4 / 3} stroke="#fff" content={CustomizedContentWithPalette}>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                borderRadius: "1rem",
                border: "1px solid rgba(230, 230, 230, 0.8)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              }}
              formatter={(value: any) => [value, "Resources"]}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
