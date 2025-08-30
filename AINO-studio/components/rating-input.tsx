"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function RatingInput({
  value = 0,
  onChange,
  max = 5,
  size = 5,
}: {
  value?: number
  onChange: (v: number) => void
  max?: number
  size?: number
}) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined)
  const stars = Array(max).fill(0)

  const handleMouseOver = (newHoverValue: number) => {
    setHoverValue(newHoverValue)
  }

  const handleMouseLeave = () => {
    setHoverValue(undefined)
  }

  const handleClick = (newValue: number) => {
    onChange(newValue)
  }

  return (
    <div className="flex items-center gap-1">
      {stars.map((_, index) => {
        const starValue = index + 1
        return (
          <Star
            key={index}
            className={cn(
              "cursor-pointer transition-colors",
              (hoverValue || value) >= starValue ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
            )}
            style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
            onMouseOver={() => handleMouseOver(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          />
        )
      })}
    </div>
  )
}
