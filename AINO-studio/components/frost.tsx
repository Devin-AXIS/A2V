"use client"

import type React from "react"
import { cn } from "@/lib/utils"

/**
 * Frost components provide specialized glassmorphism variants for different use cases.
 * Use Glass component for simple containers, Frost components for specialized layouts.
 */

// A stronger glassmorphism panel
export function FrostPanel({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        // rounded + glass + inner highlight + soft drop
        "rounded-2xl border border-white/20 bg-white/20 backdrop-blur-xl",
        "shadow-[0_4px_20px_rgba(31,38,135,0.12)] ring-1 ring-black/5",
        "bg-[linear-gradient(135deg,rgba(255,255,255,0.4),rgba(255,255,255,0.15))]",
        "before:pointer-events-none before:content-[''] before:absolute before:inset-0 before:rounded-2xl",
        "before:[background:radial-gradient(800px_300px_at_-10%_-20%,rgba(255,255,255,0.25),transparent)]",
        "relative overflow-hidden p-6",
        className,
      )}
    >
      {/* subtle top inner light */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.7)]" />
      {children}
    </div>
  )
}

// A lighter aside/card variant (for side lists)
export function FrostAside({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/40 bg-white/35 backdrop-blur-xl",
        "shadow-[0_6px_24px_rgba(31,38,135,0.16)] ring-1 ring-black/5 relative",
        "min-h-[400px]", // Add minimum height for better layout
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.75)]" />
      {children}
    </div>
  )
}

// The vertical rail shell
export function FrostRail({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between w-[76px] rounded-3xl",
        "bg-[rgba(18,19,22,0.92)] text-white p-2 border border-white/10",
        "shadow-[0_20px_48px_rgba(0,0,0,0.35)] ring-1 ring-black/40",
        className,
      )}
    >
      {children}
    </div>
  )
}

// Icon tile with glow for rail items
export function IconTile({
  active,
  children,
  onClick,
  title,
}: {
  active?: boolean
  children?: React.ReactNode
  onClick?: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log("[v0] IconTile clicked", { title, onClick: !!onClick })
        onClick?.()
      }}
      className={cn(
        "w-11 h-11 rounded-2xl grid place-items-center transition cursor-pointer",
        "bg-white/10 hover:bg-white/20 border border-white/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_18px_rgba(0,0,0,0.25)]",
        "focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:bg-white/25",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        active && "bg-white/25 ring-2 ring-sky-300/60",
      )}
      disabled={!onClick}
    >
      {children}
    </button>
  )
}

// Small frosted chip (for top-right tiny badge if needed)
export function FrostChip({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-2 py-1 text-xs",
        "border border-white/40 bg-white/40 backdrop-blur-md",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  )
}
