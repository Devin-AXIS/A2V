"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const [result, setResult] = useState<string>("")

  const testDirectFetch = async () => {
    try {
      setResult("测试直接 fetch...")
      
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@aino.com',
          password: 'admin123'
        })
      })
      
      const data = await response.json()
      setResult(`状态: ${response.status}\n数据: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const testApiService = async () => {
    try {
      setResult("测试 API 服务...")
      
      // 动态导入 API 服务
      const { api } = await import('@/lib/api')
      const response = await api.auth.login({
        email: 'admin@aino.com',
        password: 'admin123'
      })
      
      setResult(`API 服务结果: ${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      setResult(`API 服务错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">调试页面</h1>
      
      <div className="space-y-4">
        <Button onClick={testDirectFetch}>测试直接 Fetch</Button>
        <Button onClick={testApiService} variant="outline">测试 API 服务</Button>
        
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
