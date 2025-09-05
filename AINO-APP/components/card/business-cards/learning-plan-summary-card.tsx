import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Clock, Target, Calendar } from "lucide-react"

interface LearningPlanSummaryCardProps {
  planDuration?: string
  weeklyStudy?: string
  targetGoal?: string
  className?: string
  disableLocalTheme?: boolean
}

export default function LearningPlanSummaryCard({
  planDuration = "4-8周",
  weeklyStudy = "4.8周",
  targetGoal = "掌握中级知识",
  className = "",
  disableLocalTheme = true,
}: LearningPlanSummaryCardProps) {
  return (
    <AppCard className={`w-full max-w-lg mx-auto ${className}`} disableLocalTheme={disableLocalTheme}>
      <div className="p-4 scale-90">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-2" data-slot="card-title">
            个性定制学习计划
          </h2>
          <p className="text-xs opacity-70" data-slot="card-description">
            1分钟评估定制
          </p>
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 opacity-60 mr-1" />
              <span className="text-xs opacity-70">计划时长</span>
            </div>
            <div className="text-lg font-bold" data-slot="card-title">
              {planDuration}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 opacity-60 mr-1" />
              <span className="text-xs opacity-70">每周学习</span>
            </div>
            <div className="text-lg font-bold" data-slot="card-title">
              {weeklyStudy}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4 opacity-60 mr-1" />
              <span className="text-xs opacity-70">预计目标</span>
            </div>
            <div className="text-lg font-bold" data-slot="card-title">
              {targetGoal}
            </div>
          </div>
        </div>

        <Button className="w-full bg-transparent" variant="outline" size="sm">
          <Clock className="w-3 h-3 mr-2" />
          评估学习基础，为你定制AI方案
        </Button>
      </div>
    </AppCard>
  )
}
