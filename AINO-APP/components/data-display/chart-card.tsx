interface ChartCardProps {
  children: React.ReactNode
  className?: string
}

export function ChartCard({ children, className = "" }: ChartCardProps) {
  return (
    <div className={`p-4 h-full w-full relative ${className}`}>
      {children}
    </div>
  )
}
