import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const timelineVariants = cva("relative flex flex-col")

const timelineItemVariants = cva("relative flex items-start pb-8 last:pb-0", {
  variants: {
    variant: {
      default: "",
      compact: "pb-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const timelineConnectorVariants = cva("absolute left-4 top-8 h-full w-0.5 -translate-x-1/2", {
  variants: {
    status: {
      default: "bg-border",
      active: "bg-primary",
      completed: "bg-primary",
    },
  },
  defaultVariants: {
    status: "default",
  },
})

const timelineMarkerVariants = cva("relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2", {
  variants: {
    status: {
              default: "border-gray-200 bg-background",
      active: "border-primary bg-primary text-primary-foreground",
      completed: "border-primary bg-primary text-primary-foreground",
      pending: "border-muted bg-muted",
    },
  },
  defaultVariants: {
    status: "default",
  },
})

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof timelineVariants> {}

export interface TimelineItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineItemVariants> {
  status?: "default" | "active" | "completed" | "pending"
  marker?: React.ReactNode
  showConnector?: boolean
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn(timelineVariants(), className)} {...props} />
})
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, variant, status = "default", marker, showConnector = true, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(timelineItemVariants({ variant }), className)} {...props}>
        {showConnector && <div className={cn(timelineConnectorVariants({ status }))} />}
        <div className={cn(timelineMarkerVariants({ status }))}>
          {marker || <div className="h-2 w-2 rounded-full bg-current" />}
        </div>
        <div className="ml-6 flex-1">{children}</div>
      </div>
    )
  },
)
TimelineItem.displayName = "TimelineItem"

export { Timeline, TimelineItem, timelineVariants, timelineItemVariants }
