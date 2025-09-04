import { cn } from "@/lib/utils"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-2", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <Link
            href={item.href}
            className={cn(
              "text-sm font-medium",
              index === items.length - 1
                ? "text-gray-900 pointer-events-none" // Last item is the current page
                : "text-gray-500 hover:text-gray-800 transition-colors",
            )}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  )
}
