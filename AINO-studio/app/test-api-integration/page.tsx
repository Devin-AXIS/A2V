"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApiBuilderController } from "@/hooks/use-api-builder-controller"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions"

export default function TestApiIntegrationPage() {
  const [applicationId, setApplicationId] = useState("")
  const [testAppId, setTestAppId] = useState("")
  const { toast } = useToast()
  const { can } = usePermissions()
  
  const {
    app,
    modules,
    currentModule,
    currentDir,
    moduleId,
    setModuleId,
    isLoading,
    error,
    refresh,
  } = useApiBuilderController({
    appId: testAppId,
    can,
    toast,
  })

  const handleTest = () => {
    if (applicationId.trim()) {
      setTestAppId(applicationId.trim())
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">测试 API 集成</h1>
      
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
        {app && (
          <Card>
            <CardHeader>
              <CardTitle>应用信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>名称:</strong> {app.name}</div>
                <div><strong>描述:</strong> {app.desc}</div>
                <div><strong>模块数量:</strong> {modules.length}</div>
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
                  <div 
                    key={module.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      moduleId === module.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setModuleId(module.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{module.name}</h3>
                        <p className="text-sm text-gray-600">类型: {module.type}</p>
                        <p className="text-sm text-gray-600">图标: {module.icon}</p>
                        <p className="text-sm text-gray-600">目录数量: {module.directories.length}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {moduleId === module.id ? "✓ 已选中" : "点击选择"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 当前选中的模块 */}
        {currentModule && (
          <Card>
            <CardHeader>
              <CardTitle>当前选中的模块</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>名称:</strong> {currentModule.name}</div>
                <div><strong>类型:</strong> {currentModule.type}</div>
                <div><strong>图标:</strong> {currentModule.icon}</div>
                <div><strong>目录数量:</strong> {currentModule.directories.length}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 当前选中的目录 */}
        {currentDir && (
          <Card>
            <CardHeader>
              <CardTitle>当前选中的目录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>名称:</strong> {currentDir.name}</div>
                <div><strong>字段数量:</strong> {currentDir.fields.length}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <Card>
          <CardHeader>
            <CardTitle>操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={refresh} disabled={isLoading}>
                刷新数据
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
