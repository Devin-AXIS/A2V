"use client"

import { Code, Brain, MessageSquare, Zap, Database } from "lucide-react"
import { Tag } from "@/components/basic/tag"

const abilities = [
  { name: "编程语言", icon: Code },
  { name: "机器学习", icon: Brain },
  { name: "自然语言处理", icon: MessageSquare },
  { name: "深度学习", icon: Zap },
  { name: "数据结构", icon: Database },
]

export function BasicAbilityRequirements() {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">底层能力要求</h3>
      <div className="flex flex-wrap gap-2">
        {abilities.map((ability, index) => {
          const IconComponent = ability.icon
          return (
            <Tag key={index} variant="white" size="sm" icon={<IconComponent className="w-3 h-3" />}>
              {ability.name}
            </Tag>
          )
        })}
      </div>
    </div>
  )
}
