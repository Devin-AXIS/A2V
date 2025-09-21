"use client"

import { useState, useEffect } from "react"

export default function TestPage() {
  const [status, setStatus] = useState("初始化中...")

  useEffect(() => {
    setStatus("页面加载完成")
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">测试页面</h1>
        <p className="text-gray-600">状态: {status}</p>
        <p className="text-gray-600 mt-2">时间: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}
