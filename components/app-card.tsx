"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, CheckCircle2, Activity } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface AppCardProps {
  app: {
    id: number
    name: string
    category: string
    description: string
    icon: string
    installs: string
    rating: number
    trending: boolean
    verified: boolean
    tags: string[]
    valueChange?: string
    chartData?: number[]
  }
}

export function AppCard({ app }: AppCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const generateChartPath = (data: number[]) => {
    const width = 100
    const height = 30
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - (value / Math.max(...data)) * height
      return `${x},${y}`
    })
    return `M ${points.join(" L ")}`
  }

  const handleCardClick = () => {
    router.push(`/app/${app.id}`)
  }

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-500 hover:scale-[1.02] cursor-pointer group relative overflow-hidden backdrop-blur-2xl bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orb top-right */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-3xl group-hover:from-primary/25 transition-all duration-500" />

        {/* Gradient orb bottom-left */}
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-blue-500/12 to-transparent rounded-full blur-2xl group-hover:from-blue-500/20 transition-all duration-500" />

        {/* Center gradient for depth */}
        <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl group-hover:from-cyan-500/18 transition-all duration-500" />
      </div>

      {/* Content with relative positioning to stay above background */}
      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 transition-all duration-500 rounded-xl overflow-hidden ${isHovered ? "shadow-lg shadow-primary/40 scale-110" : "shadow-md shadow-primary/20"}`}
          >
            <Image
              src={app.icon || "/placeholder.svg"}
              alt={`${app.name} logo`}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white text-sm truncate group-hover:text-primary transition-colors">
                {app.name}
              </h3>
              {app.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
            </div>
            <p className="text-xs text-gray-400">{app.category}</p>
          </div>

          {app.trending && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 backdrop-blur-sm text-xs px-2 py-0.5"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>

        {app.chartData && (
          <div className="mb-3 p-3 rounded-xl backdrop-blur-xl bg-black/30 group-hover:bg-black/40 transition-all duration-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-gray-400">Call Trends</span>
              </div>
              {app.valueChange && (
                <span
                  className={`text-xs font-medium ${app.valueChange.startsWith("+") ? "text-primary" : "text-red-400"}`}
                >
                  {app.valueChange}
                </span>
              )}
            </div>
            <svg width="100%" height="30" className="overflow-visible">
              <defs>
                <linearGradient id={`gradient-${app.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4FD1C5" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4FD1C5" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path
                d={generateChartPath(app.chartData)}
                fill="none"
                stroke={`url(#gradient-${app.id})`}
                strokeWidth="2"
                className="transition-all duration-500"
              />
              {app.chartData.map((value, index) => (
                <circle
                  key={index}
                  cx={(index / (app.chartData!.length - 1)) * 100}
                  cy={30 - (value / Math.max(...app.chartData!)) * 30}
                  r="2"
                  fill="#4FD1C5"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              ))}
            </svg>
          </div>
        )}

        <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{app.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {(app.tags || []).slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs border-white/10 text-gray-400 hover:border-primary/30 hover:text-primary transition-all backdrop-blur-sm px-2 py-0"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-white">{app.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Activity className="w-3.5 h-3.5" />
              <span>{app.installs}</span>
            </div>
          </div>

          <Button
            size="sm"
            className={`transition-all duration-500 rounded-lg text-xs h-6 px-2.5 ${isHovered
              ? "bg-primary text-black shadow-lg shadow-primary/40 scale-105"
              : "bg-primary/80 text-black hover:bg-primary"
              }`}
          >
            Call
          </Button>
        </div>
      </div>
    </div>
  )
}
