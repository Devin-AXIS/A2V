"use client"

import { ProgressBarChart } from "./progress-bar-chart"

const skillsData = [
  { name: "Photoshop", value: 70 },
  { name: "ComfyUI / Stable Diffusion", value: 85 },
  { name: "Python", value: 60 },
  { name: "数据标注工具", value: 90 },
]

export function CoreSkillsMastery() {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">核心技能掌握</h3>
      <ProgressBarChart data={skillsData} valueLabel="掌握度" />
    </div>
  )
}
