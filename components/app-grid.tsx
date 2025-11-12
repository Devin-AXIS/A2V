"use client"

import { AppCard } from "@/components/app-card"
import { useMemo, useEffect, useState, useCallback } from "react"
import { Loader2 } from "lucide-react"

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

// export const apps: App[] = [
//   {
//     id: 1,
//     name: "AI Trading Bot",
//     category: "AI Intelligence",
//     description:
//       "Deep learning-powered intelligent trading bot that analyzes market data in real-time and executes optimal trading strategies",
//     icon: "/ai-robot-trading-bot-logo-with-circuit-patterns-bl.jpg",
//     installs: "12.5K",
//     rating: 4.8,
//     trending: true,
//     verified: true,
//     tags: ["AI", "Trading", "DeFi"],
//     valueChange: "+24.5%",
//     chartData: [20, 35, 28, 45, 38, 52, 48, 65],
//   },
//   {
//     id: 2,
//     name: "Value Analytics",
//     category: "Data Analytics",
//     description:
//       "Real-time tracking and analysis of value flows in the A2V protocol, providing deep insights and visual reports",
//     icon: "/analytics-dashboard-chart-logo-with-data-visualiza.jpg",
//     installs: "8.3K",
//     rating: 4.9,
//     trending: true,
//     verified: true,
//     tags: ["Analytics", "Data"],
//     valueChange: "+18.2%",
//     chartData: [30, 25, 40, 35, 50, 45, 60, 55],
//   },
//   {
//     id: 3,
//     name: "Smart Wallet",
//     category: "DeFi Finance",
//     description: "Multi-chain smart wallet supporting automated asset management and yield optimization strategies",
//     icon: "/digital-wallet-crypto-logo-with-blockchain-element.jpg",
//     installs: "15.2K",
//     rating: 4.7,
//     trending: false,
//     verified: true,
//     tags: ["Wallet", "DeFi"],
//     valueChange: "+32.1%",
//     chartData: [15, 22, 30, 28, 42, 50, 48, 62],
//   },
//   {
//     id: 4,
//     name: "Risk Shield",
//     category: "Security Tools",
//     description:
//       "Intelligent risk monitoring system that detects abnormal transactions in real-time and provides security protection",
//     icon: "/security-shield-protection-logo-with-lock-icon-blu.jpg",
//     installs: "6.8K",
//     rating: 4.9,
//     trending: false,
//     verified: true,
//     tags: ["Security", "Monitoring"],
//     valueChange: "+12.8%",
//     chartData: [40, 38, 45, 42, 48, 52, 50, 58],
//   },
//   {
//     id: 5,
//     name: "Yield Optimizer",
//     category: "DeFi Finance",
//     description: "Automated yield optimization tool that intelligently allocates assets to maximize returns",
//     icon: "/diamond-gem-yield-optimization-logo-with-sparkle-e.jpg",
//     installs: "10.1K",
//     rating: 4.6,
//     trending: true,
//     verified: true,
//     tags: ["DeFi", "Yield"],
//     valueChange: "+41.3%",
//     chartData: [25, 30, 28, 45, 50, 55, 60, 70],
//   },
//   {
//     id: 6,
//     name: "Market Pulse",
//     category: "Data Analytics",
//     description: "Real-time market sentiment analysis tool aggregating social media and news data",
//     icon: "/market-pulse-heartbeat-chart-logo-with-trend-lines.jpg",
//     installs: "9.4K",
//     rating: 4.5,
//     trending: false,
//     verified: false,
//     tags: ["Analytics", "Social"],
//     valueChange: "-5.2%",
//     chartData: [50, 48, 42, 45, 40, 38, 35, 32],
//   },
//   {
//     id: 7,
//     name: "Token Launcher",
//     category: "DeFi Finance",
//     description: "One-click token issuance platform supporting custom economic models and distribution mechanisms",
//     icon: "/rocket-launch-token-logo-with-flames-and-stars-cya.jpg",
//     installs: "5.6K",
//     rating: 4.8,
//     trending: true,
//     verified: true,
//     tags: ["Token", "Launch"],
//     valueChange: "+56.7%",
//     chartData: [18, 25, 35, 42, 50, 58, 65, 75],
//   },
//   {
//     id: 8,
//     name: "AI Advisor",
//     category: "AI Intelligence",
//     description:
//       "Personalized AI investment advisor providing customized recommendations based on user risk preferences",
//     icon: "/ai-brain-neural-network-advisor-logo-with-connecti.jpg",
//     installs: "11.2K",
//     rating: 4.7,
//     trending: false,
//     verified: true,
//     tags: ["AI", "Advisory"],
//     valueChange: "+28.4%",
//     chartData: [32, 35, 40, 38, 48, 52, 58, 62],
//   },
//   {
//     id: 9,
//     name: "Portfolio Tracker",
//     category: "Data Analytics",
//     description: "Multi-chain portfolio tracker monitoring investment performance and returns in real-time",
//     icon: "/mobile-app-portfolio-tracker-logo-with-charts-blue.jpg",
//     installs: "13.7K",
//     rating: 4.6,
//     trending: false,
//     verified: true,
//     tags: ["Portfolio", "Tracking"],
//     valueChange: "+15.9%",
//     chartData: [28, 32, 30, 38, 42, 45, 48, 52],
//   },
//   {
//     id: 10,
//     name: "Liquidity Pool Manager",
//     category: "DeFi Finance",
//     description: "Advanced liquidity pool management with automated rebalancing and impermanent loss protection",
//     icon: "/water-droplet-liquidity-pool-logo-with-waves-cyan-.jpg",
//     installs: "7.9K",
//     rating: 4.8,
//     trending: true,
//     verified: true,
//     tags: ["DeFi", "Liquidity"],
//     valueChange: "+38.6%",
//     chartData: [22, 28, 35, 40, 48, 55, 62, 68],
//   },
//   {
//     id: 11,
//     name: "NFT Marketplace",
//     category: "NFT Platform",
//     description: "Decentralized NFT marketplace with AI-powered pricing and rarity analysis",
//     icon: "/art-palette-nft-marketplace-logo-with-digital-art-.jpg",
//     installs: "14.3K",
//     rating: 4.5,
//     trending: false,
//     verified: true,
//     tags: ["NFT", "Marketplace"],
//     valueChange: "+22.4%",
//     chartData: [35, 38, 42, 40, 48, 52, 58, 60],
//   },
//   {
//     id: 12,
//     name: "Governance Hub",
//     category: "DAO Tools",
//     description: "Comprehensive DAO governance platform with voting, proposals, and treasury management",
//     icon: "/classical-building-governance-dao-logo-with-pillar.jpg",
//     installs: "5.2K",
//     rating: 4.9,
//     trending: true,
//     verified: true,
//     tags: ["DAO", "Governance"],
//     valueChange: "+45.2%",
//     chartData: [18, 25, 32, 40, 50, 58, 65, 72],
//   },
//   {
//     id: 13,
//     name: "Cross-Chain Bridge",
//     category: "Infrastructure",
//     description: "Secure cross-chain asset bridge supporting multiple blockchain networks",
//     icon: "/bridge-connection-cross-chain-logo-with-network-no.jpg",
//     installs: "9.8K",
//     rating: 4.7,
//     trending: false,
//     verified: true,
//     tags: ["Bridge", "Cross-chain"],
//     valueChange: "+19.7%",
//     chartData: [30, 32, 38, 42, 45, 50, 55, 58],
//   },
//   {
//     id: 14,
//     name: "Staking Rewards",
//     category: "DeFi Finance",
//     description: "Optimized staking platform with flexible lock periods and competitive APY rates",
//     icon: "/lightning-bolt-staking-rewards-logo-with-energy-ef.jpg",
//     installs: "16.5K",
//     rating: 4.8,
//     trending: true,
//     verified: true,
//     tags: ["Staking", "Rewards"],
//     valueChange: "+52.3%",
//     chartData: [20, 28, 38, 45, 55, 62, 70, 78],
//   },
//   {
//     id: 15,
//     name: "AI Price Predictor",
//     category: "AI Intelligence",
//     description: "Machine learning model predicting token prices with high accuracy using historical data",
//     icon: "/crystal-ball-prediction-ai-logo-with-mystical-elem.jpg",
//     installs: "8.7K",
//     rating: 4.6,
//     trending: false,
//     verified: true,
//     tags: ["AI", "Prediction"],
//     valueChange: "+31.8%",
//     chartData: [25, 30, 35, 42, 48, 55, 60, 65],
//   },
//   {
//     id: 16,
//     name: "Gas Optimizer",
//     category: "Infrastructure",
//     description: "Smart gas optimization tool that finds the best transaction timing to minimize fees",
//     icon: "/placeholder.svg?height=100&width=100",
//     installs: "12.1K",
//     rating: 4.7,
//     trending: false,
//     verified: true,
//     tags: ["Gas", "Optimization"],
//     valueChange: "+14.2%",
//     chartData: [40, 42, 45, 48, 50, 52, 55, 58],
//   },
//   {
//     id: 17,
//     name: "Social Trading",
//     category: "AI Intelligence",
//     description: "Copy trading platform allowing users to follow and replicate successful traders",
//     icon: "/placeholder.svg?height=100&width=100",
//     installs: "11.4K",
//     rating: 4.5,
//     trending: true,
//     verified: false,
//     tags: ["Social", "Trading"],
//     valueChange: "+27.6%",
//     chartData: [28, 32, 38, 42, 48, 52, 58, 62],
//   },
//   {
//     id: 18,
//     name: "Audit Scanner",
//     category: "Security Tools",
//     description: "Automated smart contract auditing tool detecting vulnerabilities and security risks",
//     icon: "/placeholder.svg?height=100&width=100",
//     installs: "6.3K",
//     rating: 4.9,
//     trending: false,
//     verified: true,
//     tags: ["Security", "Audit"],
//     valueChange: "+18.5%",
//     chartData: [35, 38, 40, 45, 48, 52, 55, 60],
//   },
//   {
//     id: 19,
//     name: "Yield Aggregator",
//     category: "DeFi Finance",
//     description: "Multi-protocol yield aggregator automatically finding the best farming opportunities",
//     icon: "/placeholder.svg?height=100&width=100",
//     installs: "10.9K",
//     rating: 4.8,
//     trending: true,
//     verified: true,
//     tags: ["DeFi", "Yield"],
//     valueChange: "+43.1%",
//     chartData: [22, 30, 38, 48, 55, 62, 68, 75],
//   },
//   {
//     id: 20,
//     name: "Token Swap",
//     category: "DeFi Finance",
//     description: "Decentralized exchange aggregator finding the best swap rates across multiple DEXs",
//     icon: "/placeholder.svg?height=100&width=100",
//     installs: "18.2K",
//     rating: 4.7,
//     trending: false,
//     verified: true,
//     tags: ["Swap", "DEX"],
//     valueChange: "+25.9%",
//     chartData: [32, 35, 40, 45, 50, 55, 60, 65],
//   },
// ]

interface AppGridProps {
  currentPage: number
  appsPerPage: number
  selectedCategory: string
  searchTerm: string
  connectedWallet?: string | null
  onAppsChange?: (apps: App[]) => void
  refreshTrigger?: number
}

export function AppGrid({ currentPage, appsPerPage, selectedCategory, searchTerm, connectedWallet, onAppsChange, refreshTrigger }: AppGridProps) {
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const getAppList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/configs")
      const { configs } = await res.json()
      const newApp = [];
      configs.forEach(item => {
        newApp.push({
          id: item.id,
          name: item.config.title,
          category: item.config?.connectionConfig?.formData?.category || "Charts",
          description: item.config.description,
          // 优先使用配置的顶级 icon 字段（URL），如果没有则回退到 formData.icon（兼容旧数据）
          icon: item.config.icon || item.config.connectionConfig?.formData?.icon,
          creatorWallet: item.config.creatorWallet, // 添加创建者钱包地址
          ...item.config.connectionConfig.st
        })
      })
      setApps(newApp);
      if (onAppsChange) {
        onAppsChange(newApp);
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false);
    }
  }, [onAppsChange])

  useEffect(() => {
    getAppList()
  }, [getAppList])

  // 当 refreshTrigger 变化时，刷新应用列表
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      getAppList()
    }
  }, [refreshTrigger, getAppList])

  const filteredApps = useMemo(() => {
    let filtered = apps

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((app) => {
        // 使用 trim 去除空格，然后进行精确匹配
        const appCategory = (app.category || "").trim();
        const selected = selectedCategory.trim();
        return appCategory === selected;
      })
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (app) => {
          return (app.name || "").toLowerCase().includes(searchLower) ||
            app.description.toLowerCase().includes(searchLower) ||
            app.category.toLowerCase().includes(searchLower) ||
            app.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        }
      )
    }

    return filtered
  }, [selectedCategory, searchTerm, apps])

  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * appsPerPage
    const endIndex = startIndex + appsPerPage
    return filteredApps.slice(startIndex, endIndex)
  }, [filteredApps, currentPage, appsPerPage])

  const startCount = filteredApps.length > 0 ? (currentPage - 1) * appsPerPage + 1 : 0
  const endCount = Math.min(currentPage * appsPerPage, filteredApps.length)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {selectedCategory === "All" ? "A2V Protocol Marketplace" : selectedCategory}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isLoading ? (
              <>Loading applications...</>
            ) : filteredApps.length > 0 ? (
              <>
                Displaying {startCount}-{endCount} of {filteredApps.length} applications
                {searchTerm && ` matching "${searchTerm}"`}
              </>
            ) : (
              <>No applications found. Try adjusting your filters.</>
            )}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 backdrop-blur-2xl bg-white/[0.03] rounded-2xl border border-white/10">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Loading applications...</h3>
          <p className="text-sm text-gray-400">Please wait while we fetch the latest apps</p>
        </div>
      ) : paginatedApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-[1400px] mx-auto">
          {paginatedApps.map((app) => (
            <AppCard 
              key={app.id} 
              app={app} 
              connectedWallet={connectedWallet}
              onDelete={getAppList}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 backdrop-blur-2xl bg-white/[0.03] rounded-2xl border border-white/10">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No apps found</h3>
          <p className="text-sm text-gray-400">Try adjusting your search or category filters</p>
        </div>
      )}
    </div>
  )
}

export const getTotalApps = (appsArray: App[], category: string, search: string) => {
  let filtered = appsArray

  if (category !== "All") {
    filtered = filtered.filter((app) => {
      // 使用 trim 去除空格，然后进行精确匹配
      const appCategory = (app.category || "").trim();
      const selected = category.trim();
      return appCategory === selected;
    })
  }

  if (search.trim()) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(
      (app) =>
        (app.name || "").toLowerCase().includes(searchLower) ||
        app.description.toLowerCase().includes(searchLower) ||
        app.category.toLowerCase().includes(searchLower) ||
        app.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
    )
  }

  return filtered.length
}

