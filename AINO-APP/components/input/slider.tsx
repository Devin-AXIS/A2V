"use client"

import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

type SliderProps = React.ComponentProps<typeof Slider> & {
  color?: "default" | "primary" | "success" | "warning" | "danger"
  label?: string
}

export function SliderDemo({ className, color = "default", label, ...props }: SliderProps) {
  const colorClasses = {
    default: "border-blue-500 bg-blue-500",
    primary: "border-blue-600 bg-blue-600", 
    success: "border-green-500 bg-green-500",
    warning: "border-yellow-500 bg-yellow-500",
    danger: "border-red-500 bg-red-500"
  }

  const trackColorClasses = {
    default: "bg-blue-100",
    primary: "bg-blue-100",
    success: "bg-green-100", 
    warning: "bg-yellow-100",
    danger: "bg-red-100"
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <Slider
        defaultValue={[50]}
        max={100}
        step={1}
        className={cn("w-full", className)}
        {...props}
      />
      <style jsx>{`
        .slider-track {
          background-color: ${color === "default" ? "#dbeafe" : 
                           color === "primary" ? "#dbeafe" :
                           color === "success" ? "#dcfce7" :
                           color === "warning" ? "#fef3c7" :
                           "#fee2e2"};
        }
        .slider-range {
          background-color: ${color === "default" ? "#3b82f6" :
                           color === "primary" ? "#2563eb" :
                           color === "success" ? "#22c55e" :
                           color === "warning" ? "#f59e0b" :
                           "#ef4444"};
        }
        .slider-thumb {
          border-color: ${color === "default" ? "#3b82f6" :
                        color === "primary" ? "#2563eb" :
                        color === "success" ? "#22c55e" :
                        color === "warning" ? "#f59e0b" :
                        "#ef4444"};
        }
      `}</style>
    </div>
  )
}
