"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApplicationModules } from "@/hooks/use-application-modules"

export default function TestModulesPage() {
  const [applicationId, setApplicationId] = useState("")
  const [testAppId, setTestAppId] = useState("")
  
  const {
    data,
    application,
    modules,
    isLoading,
    error,
    fetchModules,
  } = useApplicationModules(testAppId, { autoFetch: false })

  const handleTest = () => {
    if (applicationId.trim()) {
      setTestAppId(applicationId.trim())
      fetchModules()
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">测试应用模块 API</h1>
      
      <div className="grid gap-6">
        {/* 输入应用ID */}
        <Card>
          <CardHeader>
            <CardTitle>输入应用ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="输入应用ID进行测试"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
              />
              <Button onClick={handleTest} disabled={isLoading || !applicationId.trim()}>
                {isLoading ? "加载中..." : "测试"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 状态信息 */}
        <Card>
          <CardHeader>
            <CardTitle>状态信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>加载状态: <span className={isLoading ? "text-blue-600" : "text-gray-600"}>{isLoading ? "加载中..." : "空闲"}</span></div>
              <div>错误信息: <span className="text-red-600">{error || "无"}</span></div>
              <div>应用ID: <span className="text-gray-600">{testAppId || "未设置"}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* 应用信息 */}
        {application && (
          <Card>
            <CardHeader>
              <CardTitle>应用信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>名称:</strong> {application.name}</div>
                <div><strong>描述:</strong> {application.description}</div>
                <div><strong>状态:</strong> {application.status}</div>
                <div><strong>模板:</strong> {application.template}</div>
                <div><strong>创建时间:</strong> {new Date(application.createdAt).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 模块列表 */}
        {modules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>模块列表 ({modules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{module.name}</h3>
                        <p className="text-sm text-gray-600">类型: {module.type}</p>
                        <p className="text-sm text-gray-600">图标: {module.icon}</p>
                        <p className="text-sm text-gray-600">排序: {module.order}</p>
                        <p className="text-sm text-gray-600">状态: {module.isEnabled ? "启用" : "禁用"}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(module.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {module.config && Object.keys(module.config).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">配置:</p>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(module.config, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 原始数据 */}
        {data && (
          <Card>
            <CardHeader>
              <CardTitle>原始响应数据</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
