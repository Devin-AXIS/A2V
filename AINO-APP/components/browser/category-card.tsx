import type React from "react"
import type { LucideProps } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { AppCard } from "@/components/layout/app-card"

interface CategoryCardProps {
  name: string
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
}

export function CategoryCard({ name, icon: Icon }: CategoryCardProps) {
  return (
    <AppCard className="p-4 transition-all hover:shadow-2xl hover:scale-[1.02] cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium" style={{ color: "var(--card-title-color)" }}>
          {name}
        </span>
        <div className="flex items-center space-x-3" style={{ color: "var(--card-text-color)" }}>
          <Icon className="w-5 h-5" />
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </AppCard>
  )
}
