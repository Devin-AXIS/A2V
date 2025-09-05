"use client"

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface JobExperienceRatioChartProps {
  showTitle?: boolean
}

const data = [
  { name: "1-3年", value: 25, jobs: 1, color: "#10b981" },
  { name: "不限经验", value: 75, jobs: 3, color: "#06b6d4" },
]

export function JobExperienceRatioChart({ showTitle = true }: JobExperienceRatioChartProps) {
  const { palette } = useDataChartTheme()

  return (
    <div className="space-y-6">
      {showTitle && (
        <>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--card-title-color)" }}>
            不同工作年限的工作机会占比
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--card-text-color)" }}>
            工作年限不同，人工智能训练师的工作机会是否相同呢？面向工作年限1到3年的人群职位开放数为1个，占比为25%；面向不限工作年限的人群职位开放数为3个，占比为75%。
          </p>
        </>
      )}

      <div className="space-y-4">
        {/* 表格头部 */}
        <div
          className="grid grid-cols-3 text-sm font-medium pb-2 border-b border-gray-200"
          style={{ color: "var(--card-text-color)" }}
        >
          <div>工作年限</div>
          <div className="text-center">月度新增职位</div>
          <div className="text-center">职位占比</div>
        </div>

        {/* 数据行 */}
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.name} className="grid grid-cols-3 items-center py-2">
              <div className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
                {item.name}
              </div>
              <div className="text-2xl font-bold text-center" style={{ color: "var(--card-title-color)" }}>
                {item.jobs}
              </div>
              <div className="flex justify-center">
                <div className="w-16 h-16 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: item.value }, { value: 100 - item.value }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={32}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={item.color} />
                        <Cell fill="rgba(229, 231, 235, 0.3)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
