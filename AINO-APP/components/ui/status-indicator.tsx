import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusIndicatorVariants = cva("inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium", {
  variants: {
    status: {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      paused: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    },
    size: {
      sm: "px-1.5 py-0.5 text-xs",
      default: "px-2 py-1 text-xs",
      lg: "px-3 py-1.5 text-sm",
    },
  },
  defaultVariants: {
    status: "pending",
    size: "default",
  },
})

const statusDotVariants = cva("h-2 w-2 rounded-full", {
  variants: {
    status: {
      pending: "bg-yellow-500",
      "in-progress": "bg-blue-500 animate-pulse",
      completed: "bg-green-500",
      failed: "bg-red-500",
      paused: "bg-gray-500",
    },
  },
  defaultVariants: {
    status: "pending",
  },
})

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  showDot?: boolean
  label?: string
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ className, status, size, showDot = true, label, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(statusIndicatorVariants({ status, size }), className)} {...props}>
        {showDot && <div className={cn(statusDotVariants({ status }))} />}
        {label || children}
      </div>
    )
  },
)
StatusIndicator.displayName = "StatusIndicator"

export { StatusIndicator, statusIndicatorVariants }
