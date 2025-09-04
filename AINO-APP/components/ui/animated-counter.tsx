"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AnimatedCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  duration?: number
  format?: (value: number) => string
  decimals?: number
}

const AnimatedCounter = React.forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  ({ className, value, duration = 1000, format, decimals = 0, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(0)
    const [isAnimating, setIsAnimating] = React.useState(false)

    React.useEffect(() => {
      setIsAnimating(true)
      const startTime = Date.now()
      const startValue = displayValue

      const animate = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentValue = startValue + (value - startValue) * easeOut

        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animate)
    }, [value, duration, displayValue])

    const formattedValue = format ? format(displayValue) : displayValue.toFixed(decimals)

    return (
      <span ref={ref} className={cn("tabular-nums", isAnimating && "transition-all", className)} {...props}>
        {formattedValue}
      </span>
    )
  },
)
AnimatedCounter.displayName = "AnimatedCounter"

export { AnimatedCounter }
