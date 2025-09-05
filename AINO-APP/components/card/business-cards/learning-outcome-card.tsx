import { AppCard } from "@/components/layout/app-card"
import { BarChart3 } from "lucide-react"
import SkillProgressChart from "@/components/data-display/skill-progress-chart"

interface StatItem {
  value: string
  label: string
}

interface SkillProgress {
  skill: string
  percentage: number
}

interface LearningOutcomeCardProps {
  stats?: StatItem[]
  skillProgress?: SkillProgress[]
  className?: string
  disableLocalTheme?: boolean
}

const defaultStats: StatItem[] = [
  { value: "85%", label: "技能掌握" },
  { value: "92%", label: "就业成功" },
  { value: "3+", label: "专业认证" },
  { value: "2.8K", label: "成功学员" },
]

const defaultSkillProgress: SkillProgress[] = [
  { skill: "机器学习基础", percentage: 90 },
  { skill: "深度学习应用", percentage: 85 },
  { skill: "项目实战能力", percentage: 80 },
  { skill: "行业应用理解", percentage: 75 },
]

export default function LearningOutcomeCard({
  stats = defaultStats,
  skillProgress = defaultSkillProgress,
  className = "",
  disableLocalTheme = false,
}: LearningOutcomeCardProps) {
  return (
    <AppCard className={`w-full max-w-2xl mx-auto ${className}`} disableLocalTheme={disableLocalTheme}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <BarChart3 className="w-5 h-5 opacity-60 mr-2" />
          <h3 className="text-lg font-semibold" data-slot="card-title">
            学习成果预期
          </h3>
          <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded">
            数据驱动
          </span>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold mb-1" data-slot="card-title">
                {stat.value}
              </div>
              <div className="text-sm opacity-70" data-slot="card-description">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <SkillProgressChart data={skillProgress} title="" description="" />
      </div>
    </AppCard>
  )
}
