import { AppCard } from "@/components/layout/app-card"
import { JobTrendAreaChart } from "@/components/data-display/job-trend-area-chart"
import { JobCategoryDonutChart } from "@/components/data-display/job-category-donut-chart"
import { SalaryTrendMiniChart } from "@/components/data-display/salary-trend-mini-chart"
import { LeftOneRightTwoContainer } from "@/components/card/package/layouts/left-one-right-two-container"
import { LeftOneRightThreeContainer } from "@/components/card/package/layouts/left-one-right-three-container"

interface JobOverviewCardProps {
  leftTitle?: string
  leftTrendList?: string[]
  rightTopTitle?: string
  rightMiddleTitle?: string
  rightBottomTitle?: string
  avgSalary?: string
  salaryGrowth?: string
  disableLocalTheme?: boolean
}

export function JobOverviewCard({
  leftTitle = "新职业趋势",
  leftTrendList = ["1. 人工智能训练师", "2. 提示词工程师", "3. 人工智能应用师"],
  rightTopTitle = "岗位类型占比",
  rightMiddleTitle = "岗位类型占比",
  rightBottomTitle = "平均工资",
  avgSalary = "¥15,200",
  salaryGrowth = "+6%",
  disableLocalTheme,
}: JobOverviewCardProps) {
  return (
    <AppCard className="p-4" disableLocalTheme={disableLocalTheme}>
      <div className="grid grid-cols-1 gap-6">
        <LeftOneRightTwoContainer
          breakpoint="base"
          left={(
            <div>
              <h2 className="text-mg font-bold mb-3" data-slot="card-title">{leftTitle}</h2>
              <JobTrendAreaChart />
              <div className="mt-4 space-y-2">
                {leftTrendList.map((text, idx) => (
                  <div key={idx} className="text-sm font-medium">{text}</div>
                ))}
              </div>
            </div>
          )}
          rightTop={(
            <div>
              <h2 className="text-mg font-bold mb-3" data-slot="card-title">{rightTopTitle}</h2>
              <div className="flex items-center justify-center mb-4 h-48" style={{ marginTop: 30 }}>
                <JobCategoryDonutChart />
              </div>

            </div>
          )}
          rightMiddle={(
            <div>
              <h2 className="text-mg font-bold mb-3" data-slot="card-title">{rightMiddleTitle}</h2>
              <div className="flex items-center justify-center mb-4 h-48">
                <JobCategoryDonutChart />
              </div>

            </div>
          )}
          rightBottom={(
            <div style={{ marginTop: 20 }}>
              <h2 className="text-mg font-bold mb-3" data-slot="card-title">{rightBottomTitle}</h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{avgSalary}</div>
                </div>
                <span style={{ position: "relative", left: -10, top: -2 }} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{salaryGrowth}</span>
                {/* <div className="w-20 h-12">
                  <SalaryTrendMiniChart />
                </div> */}
              </div>
            </div >
          )}
        />

        {/* <div className="lg:col-span-2 grid grid-cols-1 gap-6">
          <div>
            <h2 className="text-lg font-bold mb-3" data-slot="card-title">
              岗位类型占比
            </h2>
            <div className="flex items-center justify-center mb-4 h-48">
              <JobCategoryDonutChart />
            </div>

          </div>

          <div>
            <h2 className="text-lg font-bold mb-3" data-slot="card-title">
              平均工资
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-2">¥15,200</div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">+6%</span>
              </div>
              <div className="w-20 h-12">
                <SalaryTrendMiniChart />
              </div>
            </div>
          </div>
        </div> */}
      </div >
    </AppCard >
  )
}
