"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { AuthAvatar } from "@/components/auth/auth-avatar"

interface AppHeaderProps {
  title: string
  showBackButton?: boolean
  className?: string
}

export function AppHeader({ title, showBackButton = false, className }: AppHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-3 h-14 transition-all duration-300",
        {
          "bg-white/80 backdrop-blur-lg shadow-sm": isScrolled,
          "bg-transparent shadow-none": !isScrolled,
        },
        className,
      )}
    >
      {/* Left side button */}
      <div className="flex-1">
        {showBackButton && (
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100/50">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
        )}
      </div>

      {/* Centered Title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap inline-block">{title}</h1>
      </div>

      {/* Right side buttons */}
      <div className="flex-1 flex justify-end items-center space-x-1">
        <AuthAvatar size="sm" showDropdown={true} />
        <button
          className={cn("p-2 rounded-full hover:bg-gray-100/50 transition-opacity duration-300", {
            "opacity-100": isScrolled,
            "opacity-0 pointer-events-none": !isScrolled,
          })}
        >
          <MoreHorizontal className="w-6 h-6 text-gray-800" />
        </button>
      </div>
    </header>
  )
}
