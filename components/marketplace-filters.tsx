"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Wallet, BarChart3, Bot, Shield, Zap, Globe } from "lucide-react"

const categories = [
  { id: "all", name: "All Apps", icon: Globe, count: 128 },
  { id: "trending", name: "Trending", icon: TrendingUp, count: 24 },
  { id: "new", name: "New Releases", icon: Sparkles, count: 18 },
  { id: "defi", name: "DeFi Finance", icon: Wallet, count: 32 },
  { id: "analytics", name: "Data Analytics", icon: BarChart3, count: 28 },
  { id: "ai", name: "AI Intelligence", icon: Bot, count: 45 },
  { id: "security", name: "Security Tools", icon: Shield, count: 21 },
  { id: "trading", name: "Trading Tools", icon: Zap, count: 36 },
]

export function MarketplaceFilters() {
  const [selected, setSelected] = useState("all")

  return (
    <aside className="lg:w-64 flex-shrink-0">
      <div className="glass-card rounded-xl p-6 sticky top-32">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Category Filter</h2>

        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selected === category.id

            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-auto py-3 ${
                  isSelected ? "bg-primary text-primary-foreground glow-border" : "hover:bg-secondary/50"
                }`}
                onClick={() => setSelected(category.id)}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{category.name}</span>
                <Badge variant={isSelected ? "secondary" : "outline"} className="ml-auto">
                  {category.count}
                </Badge>
              </Button>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Free
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Open Source
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Verified
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  )
}
