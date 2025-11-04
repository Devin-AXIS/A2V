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
    onSuccess,
    onError,
}: CallToolModalProps) {
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [isExecuting, setIsExecuting] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen || !tool) return null

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
            setError(`请填写必填字段: ${missingFields.join(", ")}`)
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
                throw new Error(data.error || data.message || "工具调用失败")
            }

            setResult(data.result || data)
            if (onSuccess) {
                onSuccess(data.result || data)
            }
        } catch (err: any) {
            const errorMessage = err.message || "执行失败，请稍后重试"
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
                            调用工具: {tool.name}
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
                                            {property.description} (类型: {propType})
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
                            <p className="text-xs font-medium text-green-400 mb-2">执行成功</p>
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
                        取消
                    </Button>
                    <Button
                        onClick={handleExecute}
                        disabled={isExecuting}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-black text-sm font-semibold hover:shadow-[0_4px_24px_rgba(79,209,197,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                        {isExecuting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isExecuting ? "执行中..." : "执行"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

