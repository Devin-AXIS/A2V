"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SimpleTestPage() {
  const [email, setEmail] = useState("admin@aino.com")
  const [password, setPassword] = useState("admin123")
  const [result, setResult] = useState<string>("")

  const testLogin = async () => {
    try {
      setResult("测试中...")
      
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ 登录成功!\n${JSON.stringify(data, null, 2)}`)
        // 存储 token
        localStorage.setItem('aino_token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
      } else {
        setResult(`❌ 登录失败: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ 请求失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const testApplications = async () => {
    try {
      setResult("测试应用列表...")
      
      const token = localStorage.getItem('aino_token')
      if (!token) {
        setResult("❌ 没有 token，请先登录")
        return
      }
      
      const response = await fetch('http://localhost:3001/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ 获取应用列表成功!\n${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ 获取应用列表失败: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ 请求失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">简单 API 测试</h1>
      
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
        
        <div className="flex gap-2">
          <Button onClick={testLogin}>测试登录</Button>
          <Button onClick={testApplications} variant="outline">测试应用列表</Button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">结果:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
