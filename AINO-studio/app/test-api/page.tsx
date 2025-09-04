"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

export default function TestApiPage() {
  const [email, setEmail] = useState("admin@aino.com")
  const [password, setPassword] = useState("admin123")
  const [loginResult, setLoginResult] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      console.log("🔐 测试登录...")
      const result = await api.auth.login({ email, password })
      setLoginResult(result)
      console.log("✅ 登录结果:", result)
    } catch (error) {
      console.error("❌ 登录失败:", error)
      setLoginResult({ error: error instanceof Error ? error.message : "未知错误" })
    } finally {
      setLoading(false)
    }
  }

  const testGetApplications = async () => {
    setLoading(true)
    try {
      console.log("📋 测试获取应用列表...")
      const result = await api.applications.getApplications()
      setApplications(result.data?.applications || [])
      console.log("✅ 应用列表结果:", result)
    } catch (error) {
      console.error("❌ 获取应用列表失败:", error)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const testCreateApplication = async () => {
    setLoading(true)
    try {
      console.log("➕ 测试创建应用...")
      const result = await api.applications.createApplication({
        name: `测试应用 ${Date.now()}`,
        description: "这是一个测试应用",
        template: "blank"
      })
      console.log("✅ 创建应用结果:", result)
      // 刷新应用列表
      await testGetApplications()
    } catch (error) {
      console.error("❌ 创建应用失败:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API 集成测试</h1>
      
      <div className="grid gap-6">
        {/* 登录测试 */}
        <Card>
          <CardHeader>
            <CardTitle>登录测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">邮箱</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aino.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">密码</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                />
              </div>
              <Button onClick={testLogin} disabled={loading}>
                {loading ? "测试中..." : "测试登录"}
              </Button>
              {loginResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">登录结果:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(loginResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 应用管理测试 */}
        <Card>
          <CardHeader>
            <CardTitle>应用管理测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testGetApplications} disabled={loading}>
                  {loading ? "加载中..." : "获取应用列表"}
                </Button>
                <Button onClick={testCreateApplication} disabled={loading}>
                  {loading ? "创建中..." : "创建测试应用"}
                </Button>
              </div>
              
              {applications.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">应用列表 ({applications.length}):</h3>
                  <div className="space-y-2">
                    {applications.map((app) => (
                      <div key={app.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="font-medium">{app.name}</div>
                        <div className="text-sm text-gray-600">{app.description}</div>
                        <div className="text-xs text-gray-500">ID: {app.id}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 状态信息 */}
        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>后端 API: <span className="text-green-600">http://localhost:3001</span></div>
              <div>前端地址: <span className="text-green-600">http://localhost:3000</span></div>
              <div>Token: <span className="text-gray-600">{localStorage.getItem('aino_token') || '未设置'}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
