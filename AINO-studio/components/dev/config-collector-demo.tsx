"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Download, CheckCircle, XCircle, AlertTriangle, Info, Monitor, Smartphone } from 'lucide-react'
import {
    collectAllConfigs,
    collectCompleteConfigs,
    validateConfigs,
    exportConfigsToJson
} from '@/lib/config-collector'
import { runAllTests, quickTest } from '@/lib/config-collector-test'

interface ConfigData {
    system?: any
    local?: any
    api?: any
    summary?: any
}

interface TestResult {
    name: string
    success: boolean
    result?: any
    error?: string
}

export function ConfigCollectorDemo() {
    const [configs, setConfigs] = useState<ConfigData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [testResults, setTestResults] = useState<TestResult[]>([])
    const [activeTab, setActiveTab] = useState('basic')

    // 基础配置采集
    const handleBasicCollection = async () => {
        setLoading(true)
        setError(null)

        try {
            const result = await collectAllConfigs()
            setConfigs({ system: result })
            setActiveTab('basic')
        } catch (err) {
            setError(err instanceof Error ? err.message : '配置采集失败')
        } finally {
            setLoading(false)
        }
    }

    // 完整配置采集
    const handleCompleteCollection = async () => {
        setLoading(true)
        setError(null)

        try {
            const result = await collectCompleteConfigs()
            setConfigs(result)
            setActiveTab('complete')
        } catch (err) {
            setError(err instanceof Error ? err.message : '完整配置采集失败')
        } finally {
            setLoading(false)
        }
    }

    // 运行测试
    const handleRunTests = async () => {
        setLoading(true)
        setError(null)

        try {
            const results = await runAllTests()
            setTestResults(results.results)
            setActiveTab('tests')
        } catch (err) {
            setError(err instanceof Error ? err.message : '测试运行失败')
        } finally {
            setLoading(false)
        }
    }

    // 快速测试
    const handleQuickTest = async () => {
        setLoading(true)
        setError(null)

        try {
            const result = await quickTest()
            setTestResults([{ name: '快速测试', success: result.success, result }])
            setActiveTab('tests')
        } catch (err) {
            setError(err instanceof Error ? err.message : '快速测试失败')
        } finally {
            setLoading(false)
        }
    }

    // 导出配置
    const handleExportConfigs = () => {
        if (!configs) return

        try {
            if (configs.system) {
                exportConfigsToJson(configs.system, 'aino-studio-system-configs.json')
            } else if (configs.local || configs.api) {
                exportConfigsToJson(configs, 'aino-studio-complete-configs.json')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '配置导出失败')
        }
    }

    // 验证配置
    const validateCurrentConfigs = () => {
        if (!configs?.system) return

        try {
            const validation = validateConfigs(configs.system)
            if (!validation.isValid) {
                setError(`配置验证失败: ${validation.errors.join(', ')}`)
            } else {
                setError(null)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '配置验证失败')
        }
    }

    // 获取配置统计信息
    const getConfigStats = () => {
        if (!configs) return null

        const stats = {
            system: configs.system?.metadata?.totalConfigs || 0,
            local: Object.keys(configs.local || {}).length,
            api: Object.keys(configs.api || {}).length,
            total: 0
        }

        stats.total = stats.system + stats.local + stats.api

        return stats
    }

    const stats = getConfigStats()

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">AINO Studio配置采集器演示</h1>
                    <p className="text-muted-foreground mt-2">
                        采集和管理AINO Studio系统的所有配置信息，包括通过iframe桥接获取APP配置
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleBasicCollection}
                        disabled={loading}
                        variant="outline"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Monitor className="w-4 h-4" />}
                        基础采集
                    </Button>
                    <Button
                        onClick={handleCompleteCollection}
                        disabled={loading}
                        variant="outline"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Monitor className="w-4 h-4" />}
                        完整采集
                    </Button>
                    <Button
                        onClick={handleQuickTest}
                        disabled={loading}
                        variant="outline"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        快速测试
                    </Button>
                    <Button
                        onClick={handleRunTests}
                        disabled={loading}
                        variant="outline"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        完整测试
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">系统配置</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.system}</div>
                            <p className="text-xs text-muted-foreground">Studio + APP配置</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">本地配置</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.local}</div>
                            <p className="text-xs text-muted-foreground">localStorage配置</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">API配置</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.api}</div>
                            <p className="text-xs text-muted-foreground">后端API配置</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">总计</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">所有配置项</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">基础配置</TabsTrigger>
                    <TabsTrigger value="complete">完整配置</TabsTrigger>
                    <TabsTrigger value="tests">测试结果</TabsTrigger>
                    <TabsTrigger value="actions">操作</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>基础配置信息</CardTitle>
                            <CardDescription>
                                系统配置（Studio + APP端配置，通过iframe桥接获取）
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {configs?.system ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Studio配置</h4>
                                            <div className="space-y-1 text-sm">
                                                <div>Manifest: {configs.system.studio?.manifest ? '✅' : '❌'}</div>
                                                <div>认证配置: {configs.system.studio?.auth ? '✅' : '❌'}</div>
                                                <div>页面配置: {configs.system.studio?.pages ? '✅' : '❌'}</div>
                                                <div>数据源: {configs.system.studio?.dataSources ? '✅' : '❌'}</div>
                                                <div>用户配置: {configs.system.studio?.user ? '✅' : '❌'}</div>
                                                <div>模块配置: {configs.system.studio?.modules ? '✅' : '❌'}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">APP配置 (iframe桥接)</h4>
                                            <div className="space-y-1 text-sm">
                                                <div>布局配置: {configs.system.app?.layout ? '✅' : '❌'}</div>
                                                <div>组件配置: {configs.system.app?.components ? '✅' : '❌'}</div>
                                                <div>设计配置: {configs.system.app?.design ? '✅' : '❌'}</div>
                                                <div>动画配置: {configs.system.app?.animation ? '✅' : '❌'}</div>
                                                <div>可访问性: {configs.system.app?.accessibility ? '✅' : '❌'}</div>
                                                <div>主题配置: {configs.system.app?.themes ? '✅' : '❌'}</div>
                                                <div>卡片配置: {configs.system.app?.cards ? '✅' : '❌'}</div>
                                                <div>本地存储: {configs.system.app?.localStorage ? '✅' : '❌'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium mb-2">元数据</h4>
                                        <div className="text-sm space-y-1">
                                            <div>版本: {configs.system.metadata?.version}</div>
                                            <div>采集时间: {configs.system.metadata?.collectedAt}</div>
                                            <div>总配置项: {configs.system.metadata?.totalConfigs}</div>
                                            <div>APP配置来源: {configs.system.metadata?.appConfigSource}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">暂无基础配置数据</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="complete" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>完整配置信息</CardTitle>
                            <CardDescription>
                                包含系统配置、本地存储配置和API配置
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {configs?.local || configs?.api ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium mb-2">本地存储配置</h4>
                                            <div className="text-sm space-y-1">
                                                {Object.keys(configs.local || {}).map(key => (
                                                    <div key={key} className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">{key}</Badge>
                                                    </div>
                                                ))}
                                                {Object.keys(configs.local || {}).length === 0 && (
                                                    <p className="text-muted-foreground">无本地存储配置</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">API配置</h4>
                                            <div className="text-sm space-y-1">
                                                {Object.keys(configs.api || {}).map(key => (
                                                    <div key={key} className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">{key}</Badge>
                                                    </div>
                                                ))}
                                                {Object.keys(configs.api || {}).length === 0 && (
                                                    <p className="text-muted-foreground">无API配置</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {configs.summary && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-medium mb-2">采集摘要</h4>
                                            <div className="text-sm space-y-1">
                                                <div>配置源数量: {configs.summary.totalSources}</div>
                                                <div>总配置项: {configs.summary.totalConfigs}</div>
                                                <div>采集时间: {configs.summary.collectedAt}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">暂无完整配置数据</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tests" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>测试结果</CardTitle>
                            <CardDescription>
                                配置采集器功能测试结果，包括iframe桥接测试
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {testResults.length > 0 ? (
                                <div className="space-y-4">
                                    {testResults.map((test, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {test.success ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                )}
                                                <div>
                                                    <div className="font-medium">{test.name}</div>
                                                    {test.error && (
                                                        <div className="text-sm text-red-600">{test.error}</div>
                                                    )}
                                                    {test.result?.appConfigSource && (
                                                        <div className="text-sm text-blue-600">
                                                            APP配置来源: {test.result.appConfigSource}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant={test.success ? "default" : "destructive"}>
                                                {test.success ? "通过" : "失败"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">暂无测试结果</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>配置操作</CardTitle>
                            <CardDescription>
                                对采集到的配置进行各种操作
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleExportConfigs}
                                    disabled={!configs}
                                    variant="outline"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    导出配置
                                </Button>
                                <Button
                                    onClick={validateCurrentConfigs}
                                    disabled={!configs?.system}
                                    variant="outline"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    验证配置
                                </Button>
                            </div>

                            {configs && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-medium mb-2">配置预览</h4>
                                    <ScrollArea className="h-64 w-full border rounded-lg p-4">
                                        <pre className="text-xs">
                                            {JSON.stringify(configs, null, 2)}
                                        </pre>
                                    </ScrollArea>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
