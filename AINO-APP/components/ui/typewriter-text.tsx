"use client"

import { useState, useEffect } from "react"
import type { JSX } from "react/jsx-runtime"

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  onComplete?: () => void
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  onComplete,
  className = "",
  as: Component = "span",
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarted(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!isStarted) return

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, isStarted, onComplete])

  return (
    <Component className={className}>
      {displayText}
      {currentIndex < text.length && <span className="animate-pulse">|</span>}
    </Component>
  )
}
