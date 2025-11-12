"use client"

import type React from "react"
import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ToolInputSchema {
    type: string
    properties: Record<string, {
        type: string
        description?: string
    }>
    required?: string[]
}

interface Tool {
    name: string
    description: string
    inputSchema: ToolInputSchema
}

interface CallToolModalProps {
    isOpen: boolean
    onClose: () => void
    tool: Tool | null
    appName: string
    configId: string
    walletAddress?: string | null
    isMock?: boolean
    onSuccess?: (result: any) => void
    onError?: (error: string) => void
}

export function CallToolModal({
    isOpen,
    onClose,
    tool,
    appName,
    configId,
    walletAddress,
    isMock = false,
    onSuccess,
    onError,
}: CallToolModalProps) {
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [isExecuting, setIsExecuting] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen || !tool) return null

    // 根据工具名称生成真实的返回内容
    const generateRealisticMockResult = (toolName: string, args: Record<string, any>) => {
        const name = toolName.toLowerCase();
        const timestamp = new Date().toISOString();
        const requestId = `req_${Math.random().toString(36).substring(2, 15)}`;

        // 根据工具类型生成不同的返回内容
        if (name.includes('task') || name.includes('planner') || name.includes('plan')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    planId: `plan_${Math.random().toString(36).substring(2, 11)}`,
                    tasks: [
                        { id: 1, name: "Initialize resources", status: "pending", estimatedTime: "2m" },
                        { id: 2, name: "Process input data", status: "pending", estimatedTime: "5m" },
                        { id: 3, name: "Execute main operation", status: "pending", estimatedTime: "10m" },
                        { id: 4, name: "Validate results", status: "pending", estimatedTime: "3m" },
                    ],
                    totalEstimatedTime: "20m",
                    priority: "high",
                    resourceAllocation: {
                        cpu: "4 cores",
                        memory: "8GB",
                        storage: "50GB"
                    }
                },
                metadata: {
                    executionTime: `${(Math.random() * 500 + 100).toFixed(0)}ms`,
                    version: "2.1.0"
                }
            };
        }

        if (name.includes('memory') || name.includes('sync') || name.includes('store')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    operation: "memory_sync",
                    syncedEntries: Math.floor(Math.random() * 1000 + 100),
                    totalSize: `${(Math.random() * 50 + 10).toFixed(2)}MB`,
                    checksum: `0x${Math.random().toString(16).substring(2, 18)}`,
                    nodes: [
                        { nodeId: "node_1", status: "synced", lastSync: timestamp },
                        { nodeId: "node_2", status: "synced", lastSync: timestamp },
                    ],
                    consistency: "verified"
                },
                metadata: {
                    executionTime: `${(Math.random() * 300 + 50).toFixed(0)}ms`,
                    version: "1.8.3"
                }
            };
        }

        if (name.includes('audit') || name.includes('log') || name.includes('track')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    auditId: `audit_${Math.random().toString(36).substring(2, 11)}`,
                    entries: Math.floor(Math.random() * 500 + 50),
                    timeRange: {
                        start: new Date(Date.now() - 86400000).toISOString(),
                        end: timestamp
                    },
                    summary: {
                        totalOperations: Math.floor(Math.random() * 1000 + 200),
                        successful: Math.floor(Math.random() * 900 + 180),
                        failed: Math.floor(Math.random() * 20 + 1),
                        warnings: Math.floor(Math.random() * 50 + 5)
                    },
                    compliance: {
                        status: "compliant",
                        standards: ["ISO 27001", "SOC 2"]
                    }
                },
                metadata: {
                    executionTime: `${(Math.random() * 200 + 30).toFixed(0)}ms`,
                    version: "3.2.1"
                }
            };
        }

        if (name.includes('workflow') || name.includes('builder') || name.includes('orchestrat')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    workflowId: `wf_${Math.random().toString(36).substring(2, 11)}`,
                    status: "active",
                    steps: [
                        { step: 1, name: "Data ingestion", status: "completed", duration: "1.2s" },
                        { step: 2, name: "Processing", status: "completed", duration: "3.5s" },
                        { step: 3, name: "Validation", status: "completed", duration: "0.8s" },
                        { step: 4, name: "Output generation", status: "completed", duration: "2.1s" }
                    ],
                    totalDuration: "7.6s",
                    parallelExecution: true,
                    errorHandling: "enabled"
                },
                metadata: {
                    executionTime: `${(Math.random() * 400 + 100).toFixed(0)}ms`,
                    version: "2.5.0"
                }
            };
        }

        if (name.includes('factor') || name.includes('engine') || name.includes('analyze')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    analysisId: `analysis_${Math.random().toString(36).substring(2, 11)}`,
                    factors: [
                        { name: "Market Volatility", value: (Math.random() * 0.5 + 0.2).toFixed(3), impact: "high" },
                        { name: "Liquidity Index", value: (Math.random() * 0.4 + 0.3).toFixed(3), impact: "medium" },
                        { name: "Volume Trend", value: (Math.random() * 0.6 + 0.1).toFixed(3), impact: "high" },
                        { name: "Price Momentum", value: (Math.random() * 0.5 + 0.25).toFixed(3), impact: "medium" }
                    ],
                    confidence: (Math.random() * 0.2 + 0.8).toFixed(2),
                    recommendation: "proceed_with_caution"
                },
                metadata: {
                    executionTime: `${(Math.random() * 600 + 150).toFixed(0)}ms`,
                    version: "1.9.4"
                }
            };
        }

        if (name.includes('backtest') || name.includes('test') || name.includes('simulat')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    backtestId: `bt_${Math.random().toString(36).substring(2, 11)}`,
                    period: {
                        start: "2024-01-01",
                        end: "2024-12-31"
                    },
                    performance: {
                        totalReturn: `${(Math.random() * 50 - 10).toFixed(2)}%`,
                        sharpeRatio: (Math.random() * 2 + 0.5).toFixed(2),
                        maxDrawdown: `${(Math.random() * 15 + 5).toFixed(2)}%`,
                        winRate: `${(Math.random() * 30 + 55).toFixed(2)}%`
                    },
                    trades: {
                        total: Math.floor(Math.random() * 500 + 100),
                        profitable: Math.floor(Math.random() * 400 + 60),
                        losing: Math.floor(Math.random() * 100 + 20)
                    },
                    status: "completed"
                },
                metadata: {
                    executionTime: `${(Math.random() * 2000 + 500).toFixed(0)}ms`,
                    version: "3.1.2"
                }
            };
        }

        if (name.includes('pool') || name.includes('scanner') || name.includes('scan')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    scanId: `scan_${Math.random().toString(36).substring(2, 11)}`,
                    pools: [
                        {
                            protocol: "Uniswap V3",
                            pool: "ETH/USDC",
                            apy: `${(Math.random() * 15 + 5).toFixed(2)}%`,
                            tvl: `$${(Math.random() * 50 + 10).toFixed(1)}M`,
                            risk: "low"
                        },
                        {
                            protocol: "Curve",
                            pool: "3pool",
                            apy: `${(Math.random() * 10 + 3).toFixed(2)}%`,
                            tvl: `$${(Math.random() * 100 + 20).toFixed(1)}M`,
                            risk: "low"
                        },
                        {
                            protocol: "Aave",
                            pool: "USDC",
                            apy: `${(Math.random() * 8 + 2).toFixed(2)}%`,
                            tvl: `$${(Math.random() * 200 + 50).toFixed(1)}M`,
                            risk: "medium"
                        }
                    ],
                    bestOpportunity: {
                        protocol: "Uniswap V3",
                        apy: `${(Math.random() * 15 + 5).toFixed(2)}%`,
                        recommendation: "high_yield_low_risk"
                    }
                },
                metadata: {
                    executionTime: `${(Math.random() * 800 + 200).toFixed(0)}ms`,
                    version: "2.3.1"
                }
            };
        }

        if (name.includes('price') || name.includes('quote') || name.includes('rate')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    symbol: args.input || "ETH/USD",
                    price: (Math.random() * 2000 + 2000).toFixed(2),
                    change24h: `${(Math.random() * 10 - 5).toFixed(2)}%`,
                    volume24h: `$${(Math.random() * 5 + 1).toFixed(2)}B`,
                    sources: ["CoinGecko", "Binance", "Coinbase"],
                    lastUpdate: timestamp,
                    confidence: "high"
                },
                metadata: {
                    executionTime: `${(Math.random() * 100 + 20).toFixed(0)}ms`,
                    version: "1.5.2"
                }
            };
        }

        if (name.includes('balance') || name.includes('wallet') || name.includes('account')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    address: args.input || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                    balances: [
                        { token: "ETH", amount: (Math.random() * 10 + 0.1).toFixed(4), usdValue: (Math.random() * 20000 + 200).toFixed(2) },
                        { token: "USDC", amount: (Math.random() * 5000 + 100).toFixed(2), usdValue: (Math.random() * 5000 + 100).toFixed(2) },
                        { token: "WBTC", amount: (Math.random() * 0.5 + 0.01).toFixed(4), usdValue: (Math.random() * 15000 + 300).toFixed(2) }
                    ],
                    totalUsdValue: `$${(Math.random() * 50000 + 5000).toFixed(2)}`,
                    lastUpdated: timestamp
                },
                metadata: {
                    executionTime: `${(Math.random() * 500 + 100).toFixed(0)}ms`,
                    version: "2.0.1"
                }
            };
        }

        if (name.includes('transaction') || name.includes('tx') || name.includes('transfer')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
                    status: "confirmed",
                    blockNumber: Math.floor(Math.random() * 1000000 + 18000000),
                    confirmations: Math.floor(Math.random() * 20 + 5),
                    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                    to: "0x8ba1f109551bD432803012645Hac136c22C1725",
                    value: `${(Math.random() * 5 + 0.1).toFixed(4)} ETH`,
                    gasUsed: Math.floor(Math.random() * 100000 + 21000),
                    gasPrice: `${(Math.random() * 50 + 20).toFixed(0)} Gwei`,
                    timestamp: timestamp
                },
                metadata: {
                    executionTime: `${(Math.random() * 300 + 50).toFixed(0)}ms`,
                    version: "1.7.3"
                }
            };
        }

        if (name.includes('predict') || name.includes('forecast') || name.includes('estimate')) {
            return {
                success: true,
                requestId,
                timestamp,
                tool: toolName,
                result: {
                    forecastId: `fc_${Math.random().toString(36).substring(2, 11)}`,
                    predictions: [
                        { timeframe: "1h", value: (Math.random() * 100 + 50).toFixed(2), confidence: 0.85 },
                        { timeframe: "24h", value: (Math.random() * 200 + 100).toFixed(2), confidence: 0.78 },
                        { timeframe: "7d", value: (Math.random() * 500 + 200).toFixed(2), confidence: 0.72 },
                        { timeframe: "30d", value: (Math.random() * 1000 + 400).toFixed(2), confidence: 0.65 }
                    ],
                    model: "LSTM-v2.1",
                    accuracy: (Math.random() * 0.1 + 0.85).toFixed(2),
                    recommendation: "moderate_confidence"
                },
                metadata: {
                    executionTime: `${(Math.random() * 1000 + 300).toFixed(0)}ms`,
                    version: "2.8.0"
                }
            };
        }

        // 默认返回格式
        return {
            success: true,
            requestId,
            timestamp,
            tool: toolName,
            result: {
                operation: "completed",
                data: args.input || "Operation executed successfully",
                status: "success",
                message: `${toolName} operation completed successfully`,
                details: {
                    processed: true,
                    validated: true,
                    outputGenerated: true
                }
            },
            metadata: {
                executionTime: `${(Math.random() * 200 + 50).toFixed(0)}ms`,
                version: "1.0.0"
            }
        };
    };

    const handleInputChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
        setError(null)
        setResult(null)
    }

    const handleExecute = async () => {
        // 验证必填字段
        const requiredFields = tool.inputSchema.required || []
        const missingFields = requiredFields.filter((field) => !formData[field] || !formData[field].trim())

        if (missingFields.length > 0) {
            setError(`Please fill in required fields: ${missingFields.join(", ")}`)
            return
        }

        setIsExecuting(true)
        setError(null)
        setResult(null)

        try {
            // 构建工具参数
            const args: Record<string, any> = {}
            Object.keys(tool.inputSchema.properties).forEach((key) => {
                const value = formData[key]
                if (value !== undefined && value !== null && value !== "") {
                    const propType = tool.inputSchema.properties[key].type
                    // 根据类型转换值
                    if (propType === "number" || propType === "integer") {
                        args[key] = Number(value)
                    } else if (propType === "boolean") {
                        args[key] = value === "true" || value === "1"
                    } else {
                        args[key] = value
                    }
                }
            })

            // 如果是 mock 工具，使用模拟数据
            if (isMock) {
                // 模拟 API 调用的延迟（1-2秒）
                await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

                // 生成真实的模拟结果
                const mockResult = generateRealisticMockResult(tool.name, args)

                setResult(mockResult)
                if (onSuccess) {
                    onSuccess(mockResult)
                }
            } else {
                // 真实工具调用
                const response = await fetch("/api/call-tool", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        connectionId: `proxy_${configId}`,
                        toolName: tool.name,
                        args: args,
                        walletAddress: walletAddress || null,
                    }),
                })

                const data = await response.json()

                if (!response.ok || data.error) {
                    throw new Error(data.error || data.message || "Tool call failed")
                }

                setResult(data.result || data)
                if (onSuccess) {
                    onSuccess(data.result || data)
                }
            }
        } catch (err: any) {
            const errorMessage = err.message || "Execution failed, please try again later"
            setError(errorMessage)
            if (onError) {
                onError(errorMessage)
            }
        } finally {
            setIsExecuting(false)
        }
    }

    const handleClose = () => {
        setFormData({})
        setResult(null)
        setError(null)
        onClose()
    }

    const properties = tool.inputSchema.properties || {}
    const requiredFields = tool.inputSchema.required || []

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="absolute inset-0" onClick={handleClose} />

            <div className="relative w-full max-w-2xl backdrop-blur-[40px] bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.04] border border-white/30 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_80px_rgba(79,209,197,0.08)] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-primary/15 via-primary/8 to-transparent rounded-full blur-[80px] opacity-60" />
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-400/12 via-blue-500/8 to-transparent rounded-full blur-[80px] opacity-50" />
                </div>

                {/* Header */}
                <div className="relative backdrop-blur-xl bg-white/5 border-b border-white/10 px-8 py-6 flex items-center justify-between">
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-white mb-1">
                            Calling Tool: {tool.name}
                        </h2>
                        <p className="text-sm text-gray-400">{appName}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    >
                        <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Content */}
                <div className="relative p-8 space-y-6">
                    {/* Tool Description */}
                    {tool.description && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-400 leading-relaxed">{tool.description}</p>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {Object.keys(properties).map((key) => {
                            const property = properties[key]
                            const isRequired = requiredFields.includes(key)
                            const propType = property.type || "string"

                            return (
                                <div key={key} className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                                        {key}
                                        {isRequired && <span className="text-primary">*</span>}
                                    </label>
                                    <Input
                                        type={propType === "number" || propType === "integer" ? "number" : "text"}
                                        value={formData[key] || ""}
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                        placeholder={property.description || `Enter ${key}`}
                                        className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                    />
                                    {property.description && (
                                        <p className="text-xs text-gray-500">
                                            {property.description} (Type: {propType})
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl">
                            <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-xl">
                            <p className="text-xs font-medium text-green-400 mb-2">Execution successful</p>
                            <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                                {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="relative backdrop-blur-xl bg-white/5 border-t border-white/10 px-8 py-6 flex items-center justify-end gap-3">
                    <Button
                        onClick={handleClose}
                        disabled={isExecuting}
                        className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExecute}
                        disabled={isExecuting}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-black text-sm font-semibold hover:shadow-[0_4px_24px_rgba(79,209,197,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                        {isExecuting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isExecuting ? "Executing..." : "Execute"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

