import type React from "react"
import { cn } from "@/lib/utils"

export function Glass(props: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08),_0_4px_12px_rgba(0,0,0,0.06)]",
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}
