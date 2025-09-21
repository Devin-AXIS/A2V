"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, BookOpen, Briefcase, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppCard } from "@/components/layout/app-card"
import { useCardTheme } from "@/components/providers/card-theme-provider"
import { useMemo } from "react"

// Helper to check if a color is dark
function isColorDark(hexColor: string): boolean {
  if (!hexColor.startsWith("#")) return false
  const color = hexColor.substring(1)
  const rgb = Number.parseInt(color, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luma < 128
}

interface EducationBottomNavigationProps {
  locale: string
}

export function EducationBottomNavigation({ locale }: EducationBottomNavigationProps) {
  const pathname = usePathname()
  const { theme } = useCardTheme()

  // Determine a good highlight color based on the card's background
  const activeBgColor = useMemo(() => {
    return isColorDark(theme.background) ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
  }, [theme.background])

  const navItems = [
    { href: `/demo/education`, label: "首页", icon: Home },
    { href: `/demo/education/courses`, label: "课程", icon: BookOpen },
    { href: `/demo/education/jobs`, label: "就业", icon: Briefcase },
    { href: `/demo/education/profile`, label: "个人", icon: User },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <AppCard className="px-4 py-1">
        <div className="flex items-center space-x-2 md:space-x-3">
          {navItems.map(({ href, icon: Icon, label }) => {
            const fullHref = `/${locale}${href}`
            const isActive = pathname === fullHref

            return (
              <Link href={fullHref} key={label}>
                <Button
                  variant="ghost"
                  className="rounded-2xl w-12 h-12 flex flex-col items-center justify-center transition-all duration-300 group"
                  style={{
                    backgroundColor: isActive ? activeBgColor : "transparent",
                  }}
                >
                  <Icon
                    className="w-6 h-6 transition-colors"
                    style={{
                      color: isActive ? theme.titleColor : theme.textColor,
                    }}
                  />
                  <span className="sr-only">{label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </AppCard>
    </div>
  )
}
