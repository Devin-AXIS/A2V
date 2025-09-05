import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin rounded-full border-2 border-solid border-current border-r-transparent", {
  variants: {
    size: {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "text-primary",
      secondary: "text-secondary",
      muted: "text-muted-foreground",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
})

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(({ className, size, variant, ...props }, ref) => {
  return <div ref={ref} className={cn(spinnerVariants({ size, variant }), className)} {...props} />
})
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }
