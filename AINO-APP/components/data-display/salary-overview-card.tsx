"use client"

import { useDataChartTheme } from "@/hooks/use-data-chart-theme"
import { LineChart, Line, ResponsiveContainer } from "recharts"

const rankingData = [
  { name: "互联网专家", rank: 340 },
  { name: "人工智能开发", rank: 351 },
  { name: "售前解决方案", rank: 360 },
]

const salaryDistribution = [
  { range: "0-8k", percentage: 10, color: "bg-teal-400" },
  { range: "8-15k", percentage: 40, color: "bg-teal-500" },
  { range: "15-30k", percentage: 50, color: "bg-teal-600" },
  { range: ">30k", percentage: 0, color: "bg-gray-300" },
]

export function SalaryOverviewCard() {
  const { primaryColor } = useDataChartTheme()

  return (
    <div className="space-y-6">
      

      <div className="grid grid-cols-2 gap-8">
        {/* 左侧：平均月薪和排名 */}
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">平均月薪</div>
            <div className="text-3xl font-bold">¥15900</div>
            <div className="text-sm text-muted-foreground mt-2">排名第351</div>
          </div>

          {/* 排名趋势图 */}
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rankingData}>
                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 职位类型标签 */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>互联网专家</span>
            <span>人工智能开...</span>
            <span>售前解决方案</span>
          </div>
        </div>

        {/* 右侧：月薪分布 */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">月薪分布</div>

          <div className="space-y-3">
            {salaryDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="text-sm font-medium w-16">{item.range}</div>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium w-8 text-right">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部链接 */}
      <div className="pt-4">
        <button className="text-primary text-sm font-medium hover:underline">查看技术类全部排名</button>
      </div>
    </div>
  )
}
