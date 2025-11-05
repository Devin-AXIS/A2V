"use client"

import { useState, useEffect } from "react"
import { MarketplaceHeader } from "@/components/marketplace-header"
import { AppGrid } from "@/components/app-grid"
import { Pagination } from "@/components/pagination"

type App = {
  id: number
  name: string
  category: string
  description: string
  icon: string
  installs: string
  rating: number
  trending: boolean
  verified: boolean
  tags: string[]
  valueChange: string
  chartData: number[]
}

export default function MarketplacePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [apps, setApps] = useState<App[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const appsPerPage = 8

  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, searchTerm])

  const handleRefreshApps = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleWalletChange = (wallet: string | null) => {
    setConnectedWallet(wallet)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Diagonal linear gradient from top-left to bottom-right */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/10 via-transparent via-40% to-cyan-950/8 pointer-events-none" />

      {/* Diagonal linear gradient from top-right to bottom-left */}
      <div className="fixed inset-0 bg-gradient-to-bl from-primary/8 via-transparent via-50% to-blue-900/6 pointer-events-none" />

      {/* Vertical linear gradient with multiple color stops */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 via-60% to-transparent pointer-events-none" />

      {/* Existing radial gradients for depth */}
      <div className="fixed top-10 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 left-1/5 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10">
        <MarketplaceHeader
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefreshApps={handleRefreshApps}
          onWalletChange={handleWalletChange}
        />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <AppGrid
            currentPage={currentPage}
            appsPerPage={appsPerPage}
            selectedCategory={activeCategory}
            searchTerm={searchTerm}
            connectedWallet={connectedWallet}
            onAppsChange={setApps}
            refreshTrigger={refreshTrigger}
          />
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            appsPerPage={appsPerPage}
            selectedCategory={activeCategory}
            searchTerm={searchTerm}
            apps={apps}
          />
        </main>
      </div>
    </div>
  )
}
