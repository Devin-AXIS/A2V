"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TypewriterProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  speed?: number
  delay?: number
  onComplete?: () => void
  cursor?: boolean
  cursorChar?: string
}

const Typewriter = React.forwardRef<HTMLDivElement, TypewriterProps>(
  ({ className, text, speed = 50, delay = 0, onComplete, cursor = true, cursorChar = "|", ...props }, ref) => {
    const [displayText, setDisplayText] = React.useState("")
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isComplete, setIsComplete] = React.useState(false)
    const [showCursor, setShowCursor] = React.useState(true)

    React.useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(
          () => {
            setDisplayText((prev) => prev + text[currentIndex])
            setCurrentIndex((prev) => prev + 1)
          },
          currentIndex === 0 ? delay : speed,
        )

        return () => clearTimeout(timeout)
      } else if (!isComplete) {
        setIsComplete(true)
        onComplete?.()
      }
    }, [currentIndex, text, speed, delay, isComplete, onComplete])

    React.useEffect(() => {
      if (cursor) {
        const cursorInterval = setInterval(() => {
          setShowCursor((prev) => !prev)
        }, 500)

        return () => clearInterval(cursorInterval)
      }
    }, [cursor])

    return (
      <div ref={ref} className={cn("inline-block", className)} {...props}>
        {displayText}
        {cursor && (
          <span
            className={cn(
              "inline-block ml-0.5 transition-opacity duration-100",
              showCursor ? "opacity-100" : "opacity-0",
            )}
          >
            {cursorChar}
          </span>
        )}
      </div>
    )
  },
)
Typewriter.displayName = "Typewriter"

export { Typewriter }
