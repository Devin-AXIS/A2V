"use client"

import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Star,
  TrendingUp,
  CheckCircle2,
  Activity,
  Code2,
  Key,
  Copy,
  User,
  Globe,
  Github,
  Upload,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import Image from "next/image"
import { UploadProtocolModal } from "@/components/upload-protocol-modal"
import { WalletConnectModal } from "@/components/wallet-connect-modal"
import { UserProfileModal } from "@/components/user-profile-modal"
import { CallToolModal } from "@/components/call-tool-modal"

interface UserProfile {
  avatar: string
  name: string
  website: string
  profession: string
  bio: string
}

const appDetails = {
  1: {
    name: "AI Trading Bot",
    category: "AI Intelligence",
    description: "MCP-based AI trading bot for decentralized finance and blockchain analytics",
    icon: "/ai-robot-trading-bot-logo-with-circuit-patterns-bl.jpg",
    rating: 4.8,
    installs: "125K",
    verified: true,
    trending: true,
    price: "Free",
    priceChange: "+24.5%",
    chartData: [8500, 8800, 8600, 9200, 9500, 9800, 10100, 10370],
    chain: {
      name: "Ethereum",
      logo: "⟠",
      color: "#627EEA",
    },
    author: {
      name: "A2V Protocol Labs",
      avatar: "🏢",
      verified: true,
      apps: 12,
      website: "https://a2vprotocol.com",
      github: "https://github.com/a2vprotocol",
    },
    overview:
      "Built on the Model Context Protocol (MCP), the AI Trading Bot enables seamless integration of AI-powered trading strategies into any application. This protocol leverages advanced machine learning models to analyze blockchain data, execute trades, and provide real-time market predictions for DeFi protocols with institutional-grade accuracy.",
    features: [
      {
        title: "MCP Protocol Integration",
        description:
          "Native support for Model Context Protocol, enabling standardized AI model communication and trading execution across different blockchain networks.",
      },
      {
        title: "Real-time Market Analysis",
        description:
          "Processes on-chain data in real-time to analyze market conditions with 95% prediction accuracy for major DeFi protocols.",
      },
      {
        title: "Multi-chain Compatibility",
        description:
          "Works seamlessly across Ethereum, Polygon, BSC, and other major blockchain networks through unified MCP interface.",
      },
    ],
    apiExample: `{
  "endpoint": "https://api.a2v.protocol/v1/trade",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
    "X-MCP-Version": "1.0"
  },
  "body": {
    "protocol": "mcp",
    "asset": "ETH",
    "action": "buy",
    "amount": "1.5",
    "strategy": "ai_optimized"
  }
}`,
  },
  2: {
    name: "Value Analytics",
    category: "Data Analytics",
    description: "MCP-based real-time value tracking and analysis protocol for A2V ecosystem",
    icon: "/analytics-dashboard-chart-logo-with-data-visualiza.jpg",
    rating: 4.9,
    installs: "83K",
    verified: true,
    trending: true,
    price: "$299/mo",
    priceChange: "+18.2%",
    chartData: [7200, 7500, 7300, 7800, 8100, 8400, 8700, 9000],
    chain: {
      name: "Polygon",
      logo: "⬡",
      color: "#8247E5",
    },
    author: {
      name: "A2V Analytics Team",
      avatar: "📊",
      verified: true,
      apps: 8,
      website: "https://analytics.a2v.com",
      github: "https://github.com/a2v-analytics",
    },
    overview:
      "Value Analytics provides comprehensive real-time tracking and analysis of value flows in the A2V protocol through MCP integration. Monitor asset movements, calculate value metrics, and generate detailed reports with institutional-grade accuracy.",
    features: [
      {
        title: "Real-time Value Tracking",
        description: "Monitor value flows across multiple chains with sub-second latency and 99.9% accuracy.",
      },
      {
        title: "Advanced Analytics Dashboard",
        description: "Comprehensive visualization tools for deep insights into protocol performance and trends.",
      },
      {
        title: "Custom Report Generation",
        description: "Generate detailed reports with customizable metrics and export options for stakeholders.",
      },
    ],
    apiExample: `{
  "endpoint": "https://api.a2v.protocol/v1/analytics",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY",
    "X-MCP-Version": "1.0"
  },
  "params": {
    "metric": "value_flow",
    "timeframe": "24h",
    "chain": "polygon"
  }
}`,
  },
}

export default function AppDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("features")
  const [copied, setCopied] = useState(false)

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false)
  const [appData, setAppData] = useState<any>({});
  const [tools, setTools] = useState<any[]>([])
  const [isCallToolModalOpen, setIsCallToolModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<any>(null)
  const [isMock, setIsMock] = useState(false)

  // 将 MockTools 转换为工具对象数组
  // MockTools 可能是字符串数组（旧格式）或对象数组（新格式，包含name和description）
  const convertMockToolsToToolObjects = (mockTools: any[]): any[] => {
    return mockTools.map((tool) => {
      // 如果是字符串，使用旧格式处理
      if (typeof tool === 'string') {
        return {
          name: tool,
          description: `${tool}. It provides simulated functionality for testing purposes.`,
          inputSchema: {
            type: "object",
            properties: {
              input: {
                type: "string",
                description: `Input parameter for ${tool}`,
              },
            },
            required: ["input"],
          },
        }
      }
      // 如果是对象，使用新格式（包含name和description）
      return {
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: "object",
          properties: {
            input: {
              type: "string",
              description: `Input parameter for ${tool.name}`,
            },
          },
          required: ["input"],
        },
      }
    })
  }

  const getAppDetail = async (id: string) => {
    const res = await fetch(`/api/config/${id}`)
    const { config } = await res.json()
    // 优先使用配置的顶级 icon 字段（URL），如果没有则回退到 formData.icon（兼容旧数据）
    const icon = config.icon || config.connectionConfig?.formData?.icon
    const formData = config.connectionConfig?.formData || {}
    const isMockApp = formData.isMock === true

    setAppData({
      ...config.connectionConfig,
      title: config.title,
      icon: icon, // 添加 icon 字段
      isMock: isMockApp,
    })
    setIsMock(isMockApp)

    // 如果是 mock 应用，使用 MockTools 生成工具列表
    if (isMockApp && formData.MockTools && Array.isArray(formData.MockTools)) {
      const mockTools = convertMockToolsToToolObjects(formData.MockTools)
      setTools(mockTools)
    }

    // 返回 isMockApp 以便调用者知道是否需要连接
    return isMockApp
  }

  const connectionAndGetTools = async (id: string) => {
    try {
      // 先尝试建立连接（如果不存在的话）
      const proxyUrl = `/api/proxy/${id}/sse`;
      try {
        await fetch('/api/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: proxyUrl,
          }),
        });
      } catch (connectError) {
        console.warn('建立连接时出错（可能已存在连接）:', connectError);
        // 继续执行，因为连接可能已经存在
      }

      // 然后调用 proxy API
      const [toolsRes, resourcesRes, promptsRes] = await Promise.all([
        fetch(`/api/proxy/${id}/tools`),
        fetch(`/api/proxy/${id}/resources`),
        fetch(`/api/proxy/${id}/prompts`),
      ]);

      const toolsData = await toolsRes.json();
      if (toolsData.success !== false) {
        const { tools } = toolsData;
        setTools(tools || [])
      } else {
        console.error('获取工具失败:', toolsData.error);
        setTools([])
      }
    } catch (error) {
      console.error('连接或获取工具失败:', error);
      setTools([])
    }
  }

  useEffect(() => {
    const id = params.id as string
    const loadApp = async () => {
      const isMockApp = await getAppDetail(id)
      // 只有在非 mock 应用时才连接和获取工具
      if (!isMockApp) {
        connectionAndGetTools(id)
      }
    }
    loadApp()
  }, [params.id])

  const handleCallTool = (tool: any) => {
    setSelectedTool(tool)
    setIsCallToolModalOpen(true)
  }

  // const appId = Number(params.id)
  const app = appDetails[1]

  // /api/config/id

  // 获取用户信息，返回是否需要显示设置弹窗
  const fetchUserProfile = async (address: string): Promise<boolean> => {
    try {
      // 先从 API 获取用户资料
      const response = await fetch(`/api/user-profile?address=${encodeURIComponent(address)}`)
      const data = await response.json()

      if (data.success && data.profile) {
        setUserProfile(data.profile)
        // 同时保存到 localStorage
        localStorage.setItem(`profile_${address}`, JSON.stringify(data.profile))
        setIsFirstTimeSetup(false)
        return false // 不需要显示设置弹窗
      } else {
        // 如果 API 没有数据，尝试从 localStorage 读取
        const existingProfile = localStorage.getItem(`profile_${address}`)
        if (existingProfile) {
          try {
            const parsed = JSON.parse(existingProfile)
            if (parsed && parsed.name) {
              setUserProfile(parsed)
              setIsFirstTimeSetup(false)
              return false
            }
          } catch (e) {
            console.error('解析 localStorage 用户资料失败:', e)
          }
        }
        // 用户首次使用，需要设置个人资料
        setIsFirstTimeSetup(true)
        setUserProfile(null)
        return true // 需要显示设置弹窗
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 出错时尝试从 localStorage 读取
      const existingProfile = localStorage.getItem(`profile_${address}`)
      if (existingProfile) {
        try {
          const parsed = JSON.parse(existingProfile)
          if (parsed && parsed.name) {
            setUserProfile(parsed)
            setIsFirstTimeSetup(false)
            return false
          }
        } catch (e) {
          console.error('解析 localStorage 用户资料失败:', e)
        }
      }
      setIsFirstTimeSetup(true)
      setUserProfile(null)
      return true // 出错时也需要显示设置弹窗
    }
  }

  // 页面加载时恢复登录状态
  useEffect(() => {
    const restoreWalletConnection = async () => {
      // 从 localStorage 恢复钱包信息
      const savedWallet = localStorage.getItem('connectedWallet')
      const savedWalletType = localStorage.getItem('walletType')

      if (savedWallet && savedWalletType) {
        // 验证钱包是否仍然连接（通过钱包扩展 API）
        try {
          let provider: any = null

          if (savedWalletType === 'metamask') {
            provider = typeof window !== 'undefined' ? (window as any).ethereum : null
          } else if (savedWalletType === 'okx') {
            provider = typeof window !== 'undefined' ? (window as any).okxwallet : null
          }

          if (provider) {
            // 使用 eth_accounts 检查连接（不需要用户授权）
            const accounts = await provider.request({ method: 'eth_accounts' })
            if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === savedWallet.toLowerCase()) {
              // 钱包仍然连接，恢复状态
              setConnectedWallet(savedWallet)
              setWalletType(savedWalletType)
              // 从 API 获取用户资料
              await fetchUserProfile(savedWallet)
            } else {
              // 钱包已断开，清除保存的信息
              localStorage.removeItem('connectedWallet')
              localStorage.removeItem('walletType')
            }
          } else {
            // 钱包扩展未安装或不可用，清除保存的信息
            localStorage.removeItem('connectedWallet')
            localStorage.removeItem('walletType')
          }
        } catch (error) {
          console.error('恢复钱包连接失败:', error)
          localStorage.removeItem('connectedWallet')
          localStorage.removeItem('walletType')
        }
      }
    }

    restoreWalletConnection()
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(app.apiExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWalletConnect = async (address: string, type: string) => {
    setConnectedWallet(address)
    setWalletType(type)

    // 保存到 localStorage
    localStorage.setItem('connectedWallet', address)
    localStorage.setItem('walletType', type)

    // 从 API 获取用户资料
    const shouldShowSetup = await fetchUserProfile(address)

    // 如果是首次使用，显示个人资料设置弹窗
    if (shouldShowSetup) {
      setIsProfileModalOpen(true)
    }
  }

  const handleProfileSave = async (profile: UserProfile) => {
    if (connectedWallet) {
      try {
        // 保存到 API
        const response = await fetch('/api/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: connectedWallet,
            ...profile,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setUserProfile(data.profile)
          // 同时保存到 localStorage
          localStorage.setItem(`profile_${connectedWallet}`, JSON.stringify(data.profile))
          setIsFirstTimeSetup(false)
        } else {
          throw new Error(data.message || '保存失败')
        }
      } catch (error: any) {
        console.error('保存用户信息失败:', error)
        // 即使 API 保存失败，也先保存到本地
        setUserProfile(profile)
        localStorage.setItem(`profile_${connectedWallet}`, JSON.stringify(profile))
        setIsFirstTimeSetup(false)
      }
    }
  }

  const handleWalletDisconnect = () => {
    setConnectedWallet(null)
    setWalletType(null)
    setUserProfile(null)
    // 清除 localStorage 中的保存信息
    localStorage.removeItem('connectedWallet')
    localStorage.removeItem('walletType')
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const generateChartPath = (data: number[]) => {
    const width = 100
    const height = 30
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - (value / Math.max(...data)) * height
      return `${x},${y}`
    })
    return `M ${points.join(" L ")}`
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/10 via-transparent via-40% to-cyan-950/8 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-bl from-primary/8 via-transparent via-50% to-blue-900/6 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 via-60% to-transparent pointer-events-none" />
      <div className="fixed top-10 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 left-1/5 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[130px] pointer-events-none" />

      <header className="border-b border-white/10 backdrop-blur-[40px] bg-gradient-to-b from-black/30 to-black/10 sticky top-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center">
                  <Image
                    src="/a2v-logo.png"
                    alt="A2V Logo"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <h1 className="text-lg md:text-xl font-bold text-white bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                    A2V
                  </h1>
                  <div className="hidden md:block h-6 w-px bg-white/20" />
                  <div className="hidden md:block">
                    <p className="text-xs text-gray-400">AI Value Protocol Marketplace</p>
                  </div>
                </div>
              </div>

              <div className="h-6 md:h-8 w-px bg-white/10" />
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-primary/30 text-gray-400 hover:text-primary transition-all duration-300 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-xs font-medium hidden md:inline">Back</span>
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {connectedWallet ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/20 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(79,209,197,0.15)] transition-all duration-300 group"
                  >
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden backdrop-blur-xl bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-white/30 flex items-center justify-center shadow-inner">
                      {userProfile?.avatar ? (
                        <img
                          src={userProfile.avatar || "/placeholder.svg"}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      )}
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="text-xs font-semibold text-white group-hover:text-primary transition-colors">
                        {userProfile?.name || "User"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">{formatAddress(connectedWallet)}</div>
                    </div>
                  </button>

                  <button
                    onClick={handleWalletDisconnect}
                    className="p-2 md:p-2.5 rounded-xl backdrop-blur-xl bg-white/[0.03] border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group"
                    title="Disconnect"
                  >
                    <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/20 text-white text-xs font-semibold hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(79,209,197,0.15)] hover:scale-[1.02] transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Login / Register</span>
                </button>
              )}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 md:gap-2.5 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl backdrop-blur-xl bg-gradient-to-br from-primary/25 via-primary/15 to-primary/10 border border-primary/40 text-white text-xs font-semibold hover:from-primary/35 hover:via-primary/25 hover:to-primary/15 hover:border-primary/60 hover:shadow-[0_8px_32px_rgba(79,209,197,0.25)] hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <Upload className="w-4 h-4 relative z-10" />
                <span className="relative z-10 hidden md:inline">Build A2V App</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="backdrop-blur-2xl bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-5 shadow-2xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-3xl group-hover:from-primary/25 transition-all duration-500" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-blue-500/12 to-transparent rounded-full blur-2xl group-hover:from-blue-500/20 transition-all duration-500" />
                <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl group-hover:from-cyan-500/18 transition-all duration-500" />
              </div>

              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-5">
                  {/* Left: App Info */}
                  <div className="lg:col-span-3">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-xl shadow-lg shadow-primary/40 flex-shrink-0 overflow-hidden">
                        <Image
                          src={appData.icon || appData.formData?.icon || "/placeholder.svg"}
                          alt={`app logo`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h1 className="text-sm font-semibold text-white">{appData.formData?.name || appData.title || "AI App"}</h1>
                          {app.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                          <div className="flex items-center gap-1">
                            <span className="text-base" style={{ color: app.chain.color }}>
                              {app.chain.logo}
                            </span>
                            <span className="text-[10px] font-medium" style={{ color: app.chain.color }}>
                              {appData.title}
                            </span>
                          </div>
                          {app.trending && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 backdrop-blur-sm px-2 py-0.5 text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">{appData.formData?.description || appData.formData?.intro}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs flex-row mt-5">
                      <div className="flex items-center gap-1.5 backdrop-blur-xl bg-black/30 px-2.5 py-1 rounded-lg">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-white">{appData.st?.rating}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Activity className="w-3 h-3 text-primary" />
                        <span className="font-medium">{appData.st?.installs} calls</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-white/10 text-gray-400 hover:border-primary/30 hover:text-primary backdrop-blur-sm px-2 py-0 text-xs"
                      >
                        {appData.formData?.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Right: Price Chart */}
                  <div className="lg:col-span-2">
                    <div className="h-full flex flex-col justify-center">
                      <div className="mb-2">
                        {/* <div className="flex items-center gap-2 mb-1">
                          {app.price === "Free" ? (
                            <span className="text-sm font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-lg backdrop-blur-xl">
                              Free
                            </span>
                          ) : (
                            <>
                              <span className="text-sm font-bold text-white">{app.price}</span>
                              <span className="text-primary text-[10px] font-bold bg-primary/20 px-1.5 py-0.5 rounded-md backdrop-blur-xl">
                                {app.priceChange}
                              </span>
                            </>
                          )}
                        </div> */}
                        <p className="text-[10px] text-gray-400">
                          {/* {app.price === "Free" ? "Pricing Model" : "Pricing"} */}
                          Pricing Model
                        </p>
                      </div>

                      {appData.st?.chartData && (
                        <div className="relative w-full">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-primary" />
                              <span className="text-xs text-gray-400">Call Trends</span>
                            </div>
                            {appData.st?.valueChange && (
                              <span
                                className={`text-xs font-medium ${appData.st.valueChange.startsWith("+") ? "text-primary" : "text-red-400"}`}
                              >
                                {appData.st.valueChange}
                              </span>
                            )}
                          </div>
                          <div className="p-3 rounded-xl backdrop-blur-xl bg-black/30 group-hover:bg-black/40 transition-all duration-500 w-full">
                            <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" className="overflow-visible">
                              <defs>
                                <linearGradient id={`gradient-${params.id as string}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#4FD1C5" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#4FD1C5" stopOpacity="0.8" />
                                </linearGradient>
                              </defs>
                              <path
                                d={generateChartPath(appData.st.chartData)}
                                fill="none"
                                stroke={`url(#gradient-${params.id as string})`}
                                strokeWidth="2"
                                className="transition-all duration-500"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${activeTab === "overview"
                      ? "bg-primary/20 text-primary backdrop-blur-xl shadow-lg shadow-primary/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("features")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${activeTab === "features"
                      ? "bg-primary/20 text-primary backdrop-blur-xl shadow-lg shadow-primary/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    Tools
                  </button>
                  {/* <button
                    onClick={() => setActiveTab("api")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${activeTab === "api"
                      ? "bg-primary/20 text-primary backdrop-blur-xl shadow-lg shadow-primary/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    API Reference
                  </button> */}
                </div>
              </div>
            </div>

            {/* <div className="flex gap-2 pt-3 border-t border-white/5">Tools</div> */}

            {/* Content Sections */}
            {activeTab === "overview" && (
              <div className="backdrop-blur-2xl bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-5 shadow-2xl transition-all duration-500">
                <h2 className="text-sm font-semibold text-white mb-3">Service Overview</h2>
                <p className="text-xs text-gray-400 leading-relaxed">{appData.formData?.appDetail || "This application has not filled in the details"}</p>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-3">
                {tools.map((feature, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-2xl bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-5 shadow-2xl transition-all duration-500"
                  >
                    <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary/30 flex items-center justify-center backdrop-blur-xl">
                        {index + 1}
                      </span>
                      {feature.name}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed ml-8">{feature.description}</p>
                    <Button
                      onClick={() => handleCallTool(feature)}
                      size="sm"
                      className="cursor-pointer float-right absolute right-[20px] top-[14px] text-xs px-2 py-1 h-7"
                    >
                      Call Tool
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "api" && (
              <div className="backdrop-blur-2xl bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-5 shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" />
                    API Example
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="border-0 backdrop-blur-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 text-xs h-6 px-2.5"
                  >
                    <Copy className="w-3 h-3 mr-1.5" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <pre className="backdrop-blur-xl bg-black/30 rounded-xl p-3 overflow-x-auto">
                  <code className="text-xs text-gray-300 font-mono leading-relaxed">{app.apiExample}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Author Information Card */}
            <div className="backdrop-blur-2xl bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-4 shadow-2xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:from-primary/15 transition-all duration-500" />
              </div>

              <div className="relative z-10">
                <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Created By
                </h3>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xl rounded-lg backdrop-blur-xl flex-shrink-0">
                    <img src={appData.user?.avatar || appData.formData?.avatar} alt={appData.user?.name || appData.formData?.username} className="w-10 h-10 rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-white">{appData.user?.name || appData.formData?.username}</span>
                      {app.author.verified && <CheckCircle2 className="w-3 h-3 text-primary" />}
                    </div>
                    <p className="text-[10px] text-gray-400">{app.author.apps} applications published</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={appData.user?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 backdrop-blur-xl bg-black/30 hover:bg-black/50 rounded-lg transition-all duration-300 text-xs text-gray-400 hover:text-primary"
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </a>
                  <a
                    href={appData.user?.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 backdrop-blur-xl bg-black/30 hover:bg-black/50 rounded-lg transition-all duration-300 text-xs text-gray-400 hover:text-primary"
                  >
                    <Github className="w-3 h-3" />
                    GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-2xl bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 shadow-2xl shadow-primary/20 transition-all duration-500 hover:shadow-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/30 flex items-center justify-center backdrop-blur-xl">
                  <Key className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-xs font-semibold text-white">Call Tools</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                {/* Sign up to receive your authentication key and start integrating this MCP protocol into your
                application. */}
                Trial tool call to confirm if the current tool is available
              </p>
              <Button className="w-full bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/30 font-semibold py-2 rounded-lg transition-all duration-300 hover:shadow-primary/50 text-xs h-7">
                Sign Up for API Key
              </Button>
            </div>

            <div className="backdrop-blur-2xl bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-4 shadow-2xl transition-all duration-500">
              <h3 className="text-xs font-semibold text-white mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 backdrop-blur-xl bg-black/30 rounded-lg">
                  <span className="text-xs text-gray-400">Total Calls</span>
                  <span className="text-xs font-semibold text-white">{appData.st?.installs}</span>
                </div>
                <div className="flex justify-between items-center p-2 backdrop-blur-xl bg-black/30 rounded-lg">
                  <span className="text-xs text-gray-400">Success Rate</span>
                  <span className="text-xs font-semibold text-primary">99.8%</span>
                </div>
                <div className="flex justify-between items-center p-2 backdrop-blur-xl bg-black/30 rounded-lg">
                  <span className="text-xs text-gray-400">Avg Response</span>
                  <span className="text-xs font-semibold text-white">120ms</span>
                </div>
                <div className="flex justify-between items-center p-2 backdrop-blur-xl bg-black/30 rounded-lg">
                  <span className="text-xs text-gray-400">Uptime</span>
                  <span className="text-xs font-semibold text-primary">99.99%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UploadProtocolModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        connectedWallet={connectedWallet}
        userProfile={userProfile}
      />
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleProfileSave}
        initialProfile={userProfile}
        isFirstTime={isFirstTimeSetup}
      />
      <CallToolModal
        isOpen={isCallToolModalOpen}
        onClose={() => {
          setIsCallToolModalOpen(false)
          setSelectedTool(null)
        }}
        tool={selectedTool}
        appName={appData.title || app.name || "App"}
        configId={params.id as string}
        walletAddress={connectedWallet}
        isMock={isMock}
      />
    </div>
  )
}
