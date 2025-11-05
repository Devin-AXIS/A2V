"use client"

import { Search, Upload, LogOut, User, LogIn } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { UploadProtocolModal } from "./upload-protocol-modal"
import { WalletConnectModal } from "./wallet-connect-modal"
import { UserProfileModal } from "./user-profile-modal"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface UserProfile {
  avatar: string
  name: string
  website: string
  profession: string
  bio: string
}

interface MarketplaceHeaderProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  onRefreshApps?: () => void
}

export function MarketplaceHeader({
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  onRefreshApps,
}: MarketplaceHeaderProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const { toast } = useToast()

  const categories = ["All", "Charts", "Application", "AI", "Marketing", "E-commerce", "DeFi", "Analytics"]

  // 获取用户信息，返回是否需要显示设置弹窗
  const fetchUserProfile = async (address: string): Promise<boolean> => {
    try {
      setIsLoadingProfile(true)
      const response = await fetch(`/api/user-profile?address=${encodeURIComponent(address)}`)
      const data = await response.json()

      if (data.success && data.profile) {
        setUserProfile(data.profile)
        setIsFirstTimeSetup(false)
        return false // 不需要显示设置弹窗
      } else {
        // 用户首次使用，需要设置个人资料
        setIsFirstTimeSetup(true)
        setUserProfile(null)
        return true // 需要显示设置弹窗
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      toast({
        title: "获取用户信息失败",
        description: "无法加载您的个人资料信息",
        variant: "destructive",
      })
      setIsFirstTimeSetup(true)
      setUserProfile(null)
      return true // 出错时也需要显示设置弹窗
    } finally {
      setIsLoadingProfile(false)
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
              // 获取用户资料
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 保存用户信息
  const saveUserProfile = async (address: string, profile: UserProfile) => {
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          ...profile,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUserProfile(data.profile)
        setIsFirstTimeSetup(false)
        toast({
          title: "保存成功",
          description: "用户信息已保存",
        })
      } else {
        throw new Error(data.message || '保存失败')
      }
    } catch (error: any) {
      console.error('保存用户信息失败:', error)
      toast({
        title: "保存失败",
        description: error.message || "无法保存您的个人资料信息",
        variant: "destructive",
      })
    }
  }

  const handleUploadClick = () => {
    if (!connectedWallet) {
      toast({
        title: "请先登录",
        description: "您需要先登录才能使用此功能。",
        variant: "destructive",
      })
      setIsWalletModalOpen(true)
      return
    }
    setIsUploadModalOpen(true)
  }

  const handleWalletConnect = async (address: string, type: string) => {
    setConnectedWallet(address)
    setWalletType(type)

    // 保存到 localStorage
    localStorage.setItem('connectedWallet', address)
    localStorage.setItem('walletType', type)

    // 从 API 获取用户信息
    const shouldShowSetup = await fetchUserProfile(address)

    // 如果是首次使用，显示个人资料设置弹窗
    if (shouldShowSetup) {
      setIsProfileModalOpen(true)
    }
  }

  const handleProfileSave = async (profile: UserProfile) => {
    if (connectedWallet) {
      await saveUserProfile(connectedWallet, profile)
      setIsProfileModalOpen(false)
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

  return (
    <>
      <header className="border-b border-white/10 backdrop-blur-[40px] bg-gradient-to-b from-black/30 to-black/10 sticky top-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
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

            <div className="flex items-center gap-2 md:gap-3">
              {connectedWallet ? (
                <div className="flex items-center gap-2 md:gap-3">
                  {/* User Profile Button */}
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

                  {/* Disconnect Button */}
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
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">Login / Register</span>
                </button>
              )}
              <button
                onClick={handleUploadClick}
                className="flex items-center gap-2 md:gap-2.5 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl backdrop-blur-xl bg-gradient-to-br from-primary/25 via-primary/15 to-primary/10 border border-primary/40 text-white text-xs font-semibold hover:from-primary/35 hover:via-primary/25 hover:to-primary/15 hover:border-primary/60 hover:shadow-[0_8px_32px_rgba(79,209,197,0.25)] hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <Upload className="w-4 h-4 relative z-10" />
                <span className="relative z-10 hidden md:inline">Build A2V App</span>
              </button>
            </div>
          </div>

          <div className="relative max-w-2xl mx-auto mb-4">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search apps, categories or developers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 md:pl-11 h-10 md:h-11 glass-card border-white/10 focus:border-primary/50 focus:ring-primary/30 text-sm rounded-xl text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center justify-center max-w-5xl mx-auto overflow-x-auto scrollbar-hide px-4 -mx-4 md:mx-auto md:px-0">
            <div className="inline-flex items-center gap-1 p-1 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative px-3 md:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${activeCategory === category ? "text-black" : "text-gray-400 hover:text-white"
                    }`}
                >
                  {activeCategory === category && (
                    <div className="absolute inset-0 rounded-full bg-primary shadow-lg shadow-primary/30 transition-all duration-300" />
                  )}
                  <span className="relative z-10">{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <UploadProtocolModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        connectedWallet={connectedWallet}
        userProfile={userProfile}
        onSuccess={onRefreshApps}
      />
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false)
          // 如果关闭时还没有保存过信息，且是首次设置，则保持弹窗打开
          if (isFirstTimeSetup && !userProfile?.name) {
            // 可以在这里添加提示，提醒用户需要完成设置
          }
        }}
        onSave={handleProfileSave}
        initialProfile={userProfile}
        isFirstTime={isFirstTimeSetup}
      />
    </>
  )
}
