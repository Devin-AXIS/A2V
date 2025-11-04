"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { X, Upload, Check, ChevronRight, Sparkles, Code, Loader2, CheckCircle2, AlertCircle, Key } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const tagsTemp = ["AI", "Trading", "DeFi",
  "Analytics", "Data",
  "Wallet", "DeFi",
  "Security", "Monitoring",
  "DeFi", "Yield",
  "Analytics", "Social",
  "Token", "Launch",
  "AI", "Advisory",
  "Portfolio", "Tracking",
  "DeFi", "Liquidity",
  "NFT", "Marketplace",
  "DAO", "Governance",
  "Bridge", "Cross-chain",
  "Staking", "Rewards",
  "AI", "Prediction",
  "Gas", "Optimization",
  "Social", "Trading",
  "Security", "Audit",
  "DeFi", "Yield",
  "Swap", "DEX",
]
const chartDataTemplate = [
  [20, 35, 28, 45, 38, 52, 48, 65],
  [30, 25, 40, 35, 50, 45, 60, 55],
  [15, 22, 30, 28, 42, 50, 48, 62],
  [40, 38, 45, 42, 48, 52, 50, 58],
  [25, 30, 28, 45, 50, 55, 60, 70],
  [50, 48, 42, 45, 40, 38, 35, 32],
  [18, 25, 35, 42, 50, 58, 65, 75],
  [32, 35, 40, 38, 48, 52, 58, 62],
  [28, 32, 30, 38, 42, 45, 48, 52],
  [22, 28, 35, 40, 48, 55, 62, 68],
  [35, 38, 42, 40, 48, 52, 58, 60],
  [18, 25, 32, 40, 50, 58, 65, 72],
  [30, 32, 38, 42, 45, 50, 55, 58],
  [20, 28, 38, 45, 55, 62, 70, 78],
  [25, 30, 35, 42, 48, 55, 60, 65],
  [40, 42, 45, 48, 50, 52, 55, 58],
  [28, 32, 38, 42, 48, 52, 58, 62],
  [35, 38, 40, 45, 48, 52, 55, 60],
  [22, 30, 38, 48, 55, 62, 68, 75],
  [32, 35, 40, 45, 50, 55, 60, 65],
]

interface UserProfile {
  avatar: string
  name: string
  website?: string
  profession?: string
  bio?: string
}

interface UploadProtocolModalProps {
  isOpen: boolean
  onClose: () => void
  connectedWallet?: string | null
  userProfile?: UserProfile | null
}

export function UploadProtocolModal({ isOpen, onClose, connectedWallet, userProfile }: UploadProtocolModalProps) {
  const [step, setStep] = useState(1)
  const [isConverting, setIsConverting] = useState(false)
  const [tools, setTools] = useState([])
  const [resources, setResources] = useState([])
  const [prompts, setPrompts] = useState([])
  const [mcpConnected, setMcpConnected] = useState(false);
  const [savedMcpConfig, setSavedMcpConfig] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    category: "",
    mcpProtocol: "",
    mcpUrl: "",
    proxyUrl: "",
    mcpInputType: "url",//"manual" as "url" | "manual",
    convertedProtocol: "",
    tools: [] as { name: string; description: string; parameters: string[] }[],
    apiKey: "",
    chain: "ethereum",
    walletAddress: "",
    pricing: "free" as "free" | "paid",
    price: "",
  })

  const categories = ["Charts", "Application", "AI", "Marketing", "E-commerce", "DeFi", "Analytics"]

  const chains = [
    { id: "ethereum", name: "Ethereum", logo: "⟠", color: "#627EEA" },
    { id: "polygon", name: "Polygon", logo: "◈", color: "#8247E5" },
    { id: "bsc", name: "BSC", logo: "◆", color: "#F3BA2F" },
    { id: "arbitrum", name: "Arbitrum", logo: "◢", color: "#28A0F0" },
  ]

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB")
        return
      }

      // Read and preview the image
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, icon: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleConvert = async () => {
    setIsConverting(true)

    const response = await fetch('/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: formData.mcpUrl }),
    });

    let { isProxy, configId, connectionId, success } = await response.json();
    let newConnectionId = connectionId;
    if (success) {
      if (isProxy && configId) {
        newConnectionId = `proxy_${configId}`;
        console.log(`[Frontend] 确保代理连接ID格式正确: ${newConnectionId}`);
      } else if (!isProxy && configId) {
        // 如果服务器返回了 configId 但没有标记为代理，手动设置为代理
        newConnectionId = `proxy_${configId}`;
        isProxy = true;
        console.log(`[Frontend] 手动设置为代理连接: ${newConnectionId}`);
      }

      setTimeout(async () => {
        // addLog('info', '正在自动获取可用资源...');
        try {
          let toolsRes, resourcesRes, promptsRes;

          // 如果是代理连接，使用代理API端点
          if (isProxy && configId) {
            [toolsRes, resourcesRes, promptsRes] = await Promise.all([
              fetch(`/api/proxy/${configId}/tools`),
              fetch(`/api/proxy/${configId}/resources`),
              fetch(`/api/proxy/${configId}/prompts`),
            ]);
          } else {
            // 普通连接，使用标准API端点
            [toolsRes, resourcesRes, promptsRes] = await Promise.all([
              fetch(`/api/tools/${newConnectionId}`),
              fetch(`/api/resources/${newConnectionId}`),
              fetch(`/api/prompts/${newConnectionId}`),
            ]);
          }

          const toolsData = await toolsRes.json();
          if (toolsData.success) {
            setFormData({ ...formData, tools: toolsData.tools || [] });
          } else {
            addLog('error', `获取工具失败: ${toolsData.error || toolsData.message}`);
          }

          const resourcesData = await resourcesRes.json();
          if (resourcesData.success) {
            setResources(resourcesData.resources || []);
          } else {
            addLog('error', `获取资源失败: ${resourcesData.error || resourcesData.message}`);
          }

          const promptsData = await promptsRes.json();
          if (promptsData.success) {
            setPrompts(promptsData.prompts || []);
          } else {
            addLog('error', `获取提示词失败: ${promptsData.error || promptsData.message}`);
          }
          setFormData({ ...formData, convertedProtocol: true, tools: toolsData.tools || [] });
        } catch (error: any) {
          console.error('自动获取资源错误:', error);
        }
        // setStep(3);
      }, 500)
    } else {
      throw new Error(data.error || data.message || '连接失败');
    }

    //     // Simulate realistic conversion process
    //     await new Promise((resolve) => setTimeout(resolve, 2000))

    //     // Parse MCP protocol and extract tools
    //     const mockTools = [
    //       {
    //         name: "calculateValue",
    //         description: "Calculate AI model value based on usage metrics and performance data",
    //         parameters: ["modelId", "timeRange", "metrics"],
    //       },
    //       {
    //         name: "trackUsage",
    //         description: "Monitor and record API call statistics with blockchain verification",
    //         parameters: ["apiKey", "endpoint", "timestamp"],
    //       },
    //       {
    //         name: "generateReport",
    //         description: "Create comprehensive value assessment reports with on-chain data",
    //         parameters: ["reportType", "dateRange", "format"],
    //       },
    //       {
    //         name: "verifyTransaction",
    //         description: "Verify value transfer transactions on the blockchain network",
    //         parameters: ["txHash", "chainId"],
    //       },
    //     ]

    //     // Generate A2V protocol extension
    //     const a2vExtension = `
    // // A2V Protocol Extension
    // // Generated from MCP Protocol

    // import { A2VProtocol } from '@a2v/core'

    // export const a2vConfig = {
    //   version: '1.0.0',
    //   valueTracking: true,
    //   blockchain: {
    //     network: 'ethereum',
    //     contractAddress: '0x...',
    //   },
    //   pricing: {
    //     model: 'pay-per-call',
    //     currency: 'USD',
    //   },
    //   tools: ${JSON.stringify(
    //       mockTools.map((t) => ({ name: t.name, description: t.description })),
    //       null,
    //       2,
    //     )}
    // }

    // // Original MCP Protocol
    // ${formData.mcpProtocol}

    // // A2V Value Calculation Wrapper
    // export async function executeWithValueTracking(toolName: string, params: any) {
    //   const startTime = Date.now()
    //   const result = await executeMCPTool(toolName, params)
    //   const executionTime = Date.now() - startTime

    //   // Record value metrics on-chain
    //   await A2VProtocol.recordExecution({
    //     tool: toolName,
    //     executionTime,
    //     timestamp: Date.now(),
    //     valueGenerated: calculateValue(result)
    //   })

    //   return result
    // }`

    //     setFormData({
    //       ...formData,
    //       tools: mockTools,
    //       convertedProtocol: a2vExtension,
    //     })
    setIsConverting(false)
  }

  const handleSaveMcpProxy = async () => {
    const tags = [];
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      tags.push(tagsTemp[Math.floor(Math.random() * tagsTemp.length)]);
    }

    // 获取用户资料
    let currentUserProfile = userProfile;

    // 如果没有通过 props 传入用户资料，尝试从其他地方获取
    if (!currentUserProfile && connectedWallet) {
      // 方式1: 从 localStorage 获取（app/[id]/page.tsx 使用的方式）
      if (typeof window !== 'undefined') {
        const localProfileKey = `profile_${connectedWallet}`;
        const localProfile = window.localStorage.getItem(localProfileKey);
        if (localProfile) {
          try {
            const parsed = JSON.parse(localProfile);
            if (parsed && parsed.name) {
              currentUserProfile = {
                name: parsed.name,
                avatar: parsed.avatar || '',
              };
            }
          } catch (e) {
            console.error('解析 localStorage 用户资料失败:', e);
          }
        }
      }

      // 方式2: 如果 localStorage 没有，从 API 获取（marketplace-header.tsx 使用的方式）
      if (!currentUserProfile) {
        try {
          const response = await fetch(`/api/user-profile?address=${encodeURIComponent(connectedWallet)}`);
          const data = await response.json();
          if (data.success && data.profile && data.profile.name) {
            currentUserProfile = {
              name: data.profile.name,
              avatar: data.profile.avatar || '',
              website: data.profile.website || "",
              profession: data.profile.profession || "",
              bio: data.profile.bio || "",
            };
          }
        } catch (e) {
          console.error('从 API 获取用户资料失败:', e);
        }
      }
    }

    const connectionConfig: any = {
      url: formData.mcpUrl,
      formData,
      st: {
        installs: Math.floor(Math.random() * 10000) + "K",
        rating: `${Math.random() * 5}`.slice(0, 3),
        trending: true,
        verified: true,
        tags,
        valueChange: `${Math.random() * 100}`.slice(0, 5) + "%",
        chartData: chartDataTemplate[Math.floor(Math.random() * chartDataTemplate.length)],
      }
    };

    // 如果有用户资料，添加到 connectionConfig
    if (currentUserProfile) {
      connectionConfig.user = currentUserProfile;
      // connectionConfig.userName = currentUserProfile.name || "";
      // connectionConfig.userAvatar = currentUserProfile.avatar || "";
      // connectionConfig.website = currentUserProfile.website || "";
      // connectionConfig.profession = currentUserProfile.profession || "";
      // connectionConfig.bio = currentUserProfile.bio || "";
    }

    const body = {
      connectionConfig,
      connectionType: formData.mcpInputType,
      description: formData.description,
      title: formData.name,
      icon: formData.icon,
    };
    const response = await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.success) {
      setSavedMcpConfig(data);
      setStep(3);
    }
  }

  const handleSubmit = () => {
    console.log("Submitting A2V Protocol:", formData)
    onClose()
    setStep(1)
  }

  const handleNextStep = useCallback(async () => {
    if (step === 1) {
      setStep(step + 1)
    } else if (step === 2) {
      handleSaveMcpProxy();
    }
  }, [step])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-[40px] bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.04] border border-white/30 rounded-2xl sm:rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_80px_rgba(79,209,197,0.08)] before:absolute before:inset-0 before:rounded-2xl sm:before:rounded-[32px] before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none">
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl sm:rounded-[32px]">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-primary/15 via-primary/80 to-transparent rounded-full blur-[80px] opacity-60" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-400/12 via-blue-500/8 to-transparent rounded-full blur-[80px] opacity-50" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-[60px] opacity-40" />
        </div>

        <div className="sticky top-0 z-10 backdrop-blur-[40px] bg-gradient-to-b from-black/60 to-black/40 border-b border-white/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-[32px] shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_4px_16px_rgba(79,209,197,0.3)]">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-semibold text-white">Upload A2V Protocol</h2>
              <p className="text-xs text-gray-400 hidden sm:block">Convert MCP to A2V Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-300 hover:bg-white/10 rounded-lg p-1.5"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
          <div className="flex items-center justify-between max-w-xs sm:max-w-md mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500 ${step >= s
                    ? "bg-gradient-to-br from-primary to-primary/80 text-black shadow-[0_4px_16px_rgba(79,209,197,0.4)]"
                    : "bg-white/5 text-gray-500 backdrop-blur-xl"
                    }`}
                >
                  {step > s ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-all duration-500 rounded-full ${step > s
                      ? "bg-gradient-to-r from-primary to-primary/60 shadow-[0_0_8px_rgba(79,209,197,0.3)]"
                      : "bg-white/10"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between max-w-xs sm:max-w-md mx-auto mt-2">
            <span className="text-[10px] sm:text-xs text-gray-400">Basic Info</span>
            <span className="text-[10px] sm:text-xs text-gray-400">Convert</span>
            <span className="text-[10px] sm:text-xs text-gray-400">Configure</span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {step === 1 && (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Application Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your A2V application name"
                  className="backdrop-blur-xl bg-white/5 border-white/20 text-white text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(79,209,197,0.15)] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Icon</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-16 h-16 rounded-xl backdrop-blur-xl bg-white/8 border border-white/20 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden">
                    {formData.icon ? (
                      <Image
                        src={formData.icon || "/placeholder.svg"}
                        alt="Icon"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/20 text-xs text-white hover:bg-white/10 hover:shadow-[0_4px_16px_rgba(255,255,255,0.1)] transition-all duration-300"
                    >
                      Upload Icon
                    </button>
                    {formData.icon && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: "" })}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-all duration-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 w-full sm:w-auto">PNG, JPG or GIF (max 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-3">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setFormData({ ...formData, category })}
                      className={`px-3 py-2 rounded-lg backdrop-blur-xl border text-xs font-medium transition-all duration-300 ${formData.category === category
                        ? "bg-primary/15 border-primary/40 text-white shadow-[0_4px_16px_rgba(79,209,197,0.2)]"
                        : "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/25"
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what your A2V protocol does..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/20 text-white text-sm placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(79,209,197,0.15)] transition-all duration-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">MCP URL</label>
                {/* <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mcpInputType: "url" })}
                    className={`flex-1 px-4 py-2 rounded-lg backdrop-blur-xl border text-xs font-medium transition-all duration-300 ${formData.mcpInputType === "url"
                      ? "bg-primary/15 border-primary/40 text-white shadow-[0_4px_16px_rgba(79,209,197,0.2)]"
                      : "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/25"
                      }`}
                  >
                    MCP URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mcpInputType: "manual" })}
                    className={`flex-1 px-4 py-2 rounded-lg backdrop-blur-xl border text-xs font-medium transition-all duration-300 ${formData.mcpInputType === "manual"
                      ? "bg-primary/15 border-primary/40 text-white shadow-[0_4px_16px_rgba(79,209,197,0.2)]"
                      : "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/25"
                      }`}
                  >
                    MCP Protocol
                  </button>
                </div> */}
                {formData.mcpInputType === "url" ? (
                  <Input
                    type="url"
                    value={formData.mcpUrl}
                    onChange={(e) => setFormData({ ...formData, mcpUrl: e.target.value })}
                    placeholder="https://example.com/mcp-protocol/sse"
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-black/50 border border-white/20 text-white text-sm font-mono placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(79,209,197,0.15)] transition-all duration-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                  />
                ) : (
                  <textarea
                    value={formData.mcpProtocol}
                    onChange={(e) => setFormData({ ...formData, mcpProtocol: e.target.value })}
                    placeholder="Paste your MCP protocol or HTTP API specification here..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-black/50 border border-white/20 text-white text-xs font-mono placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(79,209,197,0.15)] transition-all duration-300 resize-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                  />
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-5">
              {!formData.convertedProtocol ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-[0_8px_24px_rgba(79,209,197,0.2)] backdrop-blur-xl">
                    {isConverting ? (
                      <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin" />
                    ) : (
                      <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-white mb-2">
                    {isConverting ? "Converting Protocol..." : "Ready to Convert"}
                  </h3>
                  <p className="text-xs text-gray-400 mb-6 px-4">
                    {isConverting
                      ? "Analyzing MCP protocol and generating A2V extensions..."
                      : "Click the button below to convert your MCP protocol to A2V"}
                  </p>
                  {!isConverting && (
                    <button
                      onClick={handleConvert}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-black text-sm font-medium hover:shadow-[0_8px_32px_rgba(79,209,197,0.4)] transition-all duration-300 hover:scale-105"
                    >
                      Convert to A2V Protocol
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-2 p-3 rounded-xl backdrop-blur-xl bg-primary/10 border border-primary/30 shadow-[0_4px_16px_rgba(79,209,197,0.15)]">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">Conversion Successful</p>
                      <p className="text-xs text-gray-400">Your MCP protocol has been converted to A2V format</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <Code className="w-3.5 h-3.5" />
                      Extracted Tools ({formData.tools.length})
                    </label>
                    <div className="backdrop-blur-xl bg-white/[0.04] border border-white/20 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="border-b border-white/15 bg-white/5">
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 whitespace-nowrap">
                                Tool Name
                              </th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400">
                                Description
                              </th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 whitespace-nowrap">
                                Parameters
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.tools.map((tool, index) => (
                              <tr
                                key={index}
                                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all duration-300"
                              >
                                <td className="px-3 sm:px-4 py-3">
                                  <code className="text-xs font-medium text-primary whitespace-nowrap">
                                    {tool.name}
                                  </code>
                                </td>
                                <td className="px-3 sm:px-4 py-3">
                                  <p className="text-xs text-gray-300">{tool.description}</p>
                                </td>
                                <td className="px-3 sm:px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {Object.keys(tool.inputSchema.properties).map((param, i) => (
                                      <div
                                        key={i}
                                        className="bg-white/5 text-gray-400 border-white/15 text-xs backdrop-blur-xl whitespace-nowrap"
                                      >
                                        {param} - {tool.inputSchema.properties[param].type}
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Code className="w-3.5 h-3.5" />
                      A2V Protocol Code
                    </label>
                    <div className="relative rounded-xl backdrop-blur-xl bg-black/60 border border-primary/30 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12),0_0_40px_rgba(79,209,197,0.08)]">
                      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-white/15 bg-black/50 backdrop-blur-xl">
                        <span className="text-xs text-gray-400 font-mono">a2v-protocol.ts</span>
                        <button className="text-xs text-primary hover:text-primary/80 transition-all duration-300 hover:bg-primary/10 px-2 py-1 rounded">
                          Copy
                        </button>
                      </div>
                      <div className="p-3 sm:p-4 overflow-x-auto max-h-64">
                        <pre className="text-[10px] sm:text-xs text-gray-300 font-mono leading-relaxed">
                          {formData.convertedProtocol}
                        </pre>
                      </div>
                    </div>
                  </div> */}

                  <div className="flex items-start gap-2 p-3 rounded-xl backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 shadow-[0_4px_16px_rgba(59,130,246,0.1)]">
                    <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-white mb-1">Next: Configure Deployment</p>
                      <p className="text-xs text-gray-400">
                        Choose your blockchain network, set pricing, and configure wallet settings in the next step.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" />
                  {/* API Key (Required) */}
                  MCP proxy connection link
                </label>
                <Input
                  // type="password"
                  value={savedMcpConfig.proxyUrl}
                  disabled={true}
                  // onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Enter your MCP API authentication key"
                  className="backdrop-blur-xl bg-white/5 border-white/20 text-white text-sm font-mono focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(79,209,197,0.15)] transition-all duration-300"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {/* This key will be used to authenticate API calls to your MCP protocol */}
                  By using this MCP connection for calling, the token distribution function can be completed
                </p>
              </div>
              {/* 
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-3">Blockchain Network</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {chains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setFormData({ ...formData, chain: chain.id })}
                      className={`p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 ${formData.chain === chain.id
                        ? "bg-white/10 border-primary/40 shadow-[0_4px_16px_rgba(79,209,197,0.2)]"
                        : "bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/25"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl" style={{ color: chain.color }}>
                          {chain.logo}
                        </div>
                        <span className="text-sm font-medium text-white">{chain.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">X402 Wallet Address</label>
                <Input
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  placeholder="0x..."
                  className="backdrop-blur-xl bg-white/5 border-white/20 text-white text-sm font-mono focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(79,209,197,0.15)] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-3">Pricing Model</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, pricing: "free" })}
                    className={`p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 ${formData.pricing === "free"
                      ? "bg-white/10 border-primary/40 shadow-[0_4px_16px_rgba(79,209,197,0.2)]"
                      : "bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/25"
                      }`}
                  >
                    <div className="text-sm font-medium text-white mb-1">Free</div>
                    <div className="text-xs text-gray-400">No cost to use</div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, pricing: "paid" })}
                    className={`p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 ${formData.pricing === "paid"
                      ? "bg-white/10 border-primary/40 shadow-[0_4px_16px_rgba(79,209,197,0.2)]"
                      : "bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/25"
                      }`}
                  >
                    <div className="text-sm font-medium text-white mb-1">Paid</div>
                    <div className="text-xs text-gray-400">Set your price</div>
                  </button>
                </div>
              </div>

              {formData.pricing === "paid" && (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">Price per Call</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="backdrop-blur-xl bg-white/5 border-white/20 text-white text-sm pl-12 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(79,209,197,0.15)] transition-all duration-300"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                  </div>
                </div>
              )} */}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 backdrop-blur-[40px] bg-gradient-to-t from-black/60 to-black/40 border-t border-white/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-b-2xl sm:rounded-b-[32px] shadow-[0_-4px_16px_rgba(0,0,0,0.1)]">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="px-3 sm:px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {/* ||
          (step === 3 && !formData.apiKey) */}
          <button
            onClick={() => (step < 3 ? handleNextStep() : handleSubmit())}
            disabled={
              (step === 1 && (!formData.name || !formData.category || (formData.mcpInputType === "url" ? !formData.mcpUrl : !formData.mcpProtocol))) ||
              (step === 2 && !formData.convertedProtocol)
            }
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-black text-xs font-medium hover:shadow-[0_8px_32px_rgba(79,209,197,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
          >
            {step === 3 ? "Finish" : "Next"}
            {step < 3 && <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
