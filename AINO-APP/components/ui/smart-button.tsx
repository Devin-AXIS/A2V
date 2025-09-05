import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { getButtonTextColor, createButtonStyles } from "@/lib/contrast-utils"

const smartButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SmartButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof smartButtonVariants> {
  asChild?: boolean
  /**
   * 自定义背景颜色（支持hex、rgb、hsl、CSS变量等格式）
   * 当提供此属性时，会自动计算最佳的文字颜色
   */
  customBackgroundColor?: string
  /**
   * 自定义文字颜色
   * 如果提供，将覆盖自动计算的文字颜色
   */
  customTextColor?: string
  /**
   * 是否启用智能对比度计算
   * 默认为true，设为false时使用原始样式
   */
  enableSmartContrast?: boolean
}

const SmartButton = React.forwardRef<HTMLButtonElement, SmartButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    customBackgroundColor,
    customTextColor,
    enableSmartContrast = true,
    style,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // 计算智能样式
    const smartStyles = React.useMemo(() => {
      if (!enableSmartContrast || !customBackgroundColor) {
        return style
      }
      
      const buttonStyles = createButtonStyles(
        variant || 'default',
        customBackgroundColor,
        customTextColor
      )
      
      return {
        ...style,
        ...buttonStyles
      }
    }, [variant, customBackgroundColor, customTextColor, enableSmartContrast, style])
    
    return (
      <Comp
        className={cn(smartButtonVariants({ variant, size, className }))}
        ref={ref}
        style={smartStyles}
        {...props}
      />
    )
  }
)
SmartButton.displayName = "SmartButton"

export { SmartButton, smartButtonVariants }
