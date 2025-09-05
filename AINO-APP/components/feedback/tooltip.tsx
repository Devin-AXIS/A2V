"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  position?: "top" | "bottom" | "left" | "right" | "top-start" | "top-end" | "bottom-start" | "bottom-end"
  delay?: number
  className?: string
  disabled?: boolean
}

const positionConfig = {
  top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
  "top-start": "bottom-full left-0 mb-2",
  "top-end": "bottom-full right-0 mb-2",
  bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
  "bottom-start": "top-full left-0 mt-2",
  "bottom-end": "top-full right-0 mt-2",
  left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
}

const arrowConfig = {
  top: "top-full left-1/2 transform -translate-x-1/2 border-t-gray-800",
  "top-start": "top-full left-4 border-t-gray-800",
  "top-end": "top-full right-4 border-t-gray-800",
  bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800",
  "bottom-start": "bottom-full left-4 border-b-gray-800",
  "bottom-end": "bottom-full right-4 border-b-gray-800",
  left: "left-full top-1/2 transform -translate-y-1/2 border-l-gray-800",
  right: "right-full top-1/2 transform -translate-y-1/2 border-r-gray-800"
}

export function Tooltip({ 
  content, 
  children, 
  position = "top",
  delay = 300,
  className,
  disabled = false
}: TooltipProps) {
  const { isFrosted } = useFrostedEffect()
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const showTooltip = () => {
    if (disabled) return
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setCoords({ x: rect.left, y: rect.top })
        setIsVisible(true)
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const tooltipContent = (
    <div
      className={cn(
        "fixed z-50 pointer-events-none transition-all duration-200",
        positionConfig[position],
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className
      )}
      style={{
        left: coords.x,
        top: coords.y
      }}
    >
      {/* 箭头 */}
      <div className={cn(
        "absolute w-0 h-0 border-4 border-transparent",
        arrowConfig[position]
      )} />
      
      {/* 工具提示内容 */}
      <div className={cn(
        "px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg",
        "max-w-xs break-words",
        isFrosted && "backdrop-blur-sm border border-white/40"
      )}>
        {typeof content === 'string' ? content : content}
      </div>
    </div>
  )

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && createPortal(tooltipContent, document.body)}
    </>
  )
}

// 带触发器的工具提示
interface TooltipTriggerProps {
  children: React.ReactNode
  className?: string
}

export function TooltipTrigger({ children, className }: TooltipTriggerProps) {
  return (
    <div className={cn("inline-block", className)}>
      {children}
    </div>
  )
}

// 工具提示内容
interface TooltipContentProps {
  children: React.ReactNode
  className?: string
}

export function TooltipContent({ children, className }: TooltipContentProps) {
  return (
    <div className={cn("px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg", className)}>
      {children}
    </div>
  )
}

