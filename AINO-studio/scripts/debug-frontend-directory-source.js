#!/usr/bin/env node

/**
 * 调试前端目录数据源
 * 检查前端实际获取的目录数据来源
 */

import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3001'
const TEST_TOKEN = 'test-token'

// API请求辅助函数
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_TOKEN}`,
    },
  }
  
  const response = await fetch(url, { ...defaultOptions, ...options })
  
  if (response.headers.get('content-type')?.includes('application/json')) {
    return await response.json()
  } else {
    return await response.text()
  }
}

// 调试前端目录数据源
async function debugFrontendDirectorySource() {
  console.log('🔍 调试前端目录数据源...\n')

  try {
    // 1. 检查前端使用的API端点
    console.log('1️⃣ 检查前端使用的API端点...')
    console.log('前端在 use-api-builder-controller.tsx 中使用的API:')
    console.log('api.directories.getDirectories({')
    console.log('  applicationId: appId,')
    console.log('  moduleId: moduleId,')
    console.log('})')
    console.log('')

    // 2. 检查不同的API端点
    console.log('2️⃣ 检查不同的API端点...')
    
    // 端点1: 带参数的目录列表
    console.log('端点1: /api/directories?applicationId=test-app&moduleId=test-module')
    const response1 = await apiRequest('/api/directories?applicationId=test-app&moduleId=test-module')
    console.log('响应:', response1.success ? '成功' : '失败')
    if (response1.success && response1.data) {
      console.log('目录数量:', response1.data.directories?.length || 0)
      if (response1.data.directories && response1.data.directories.length > 0) {
        const dir = response1.data.directories[0]
        console.log('第一个目录字段数量:', dir.config?.fields?.length || 0)
      }
    }
    console.log('')

    // 端点2: 直接获取特定目录
    console.log('端点2: /api/directories/047f40ea-13ff-4ede-92e9-85694329f5f6')
    const response2 = await apiRequest('/api/directories/047f40ea-13ff-4ede-92e9-85694329f5f6')
    console.log('响应:', response2.success ? '成功' : '失败')
    if (response2.success && response2.data) {
      console.log('目录字段数量:', response2.data.config?.fields?.length || 0)
      if (response2.data.config?.fields) {
        const cityField = response2.data.config.fields.find(f => f.key === 'c_89a6')
        if (cityField) {
          console.log('城市字段配置:', {
            type: cityField.type,
            preset: cityField.preset,
            enabled: cityField.enabled
          })
        }
      }
    }
    console.log('')

    // 3. 检查前端可能使用的其他数据源
    console.log('3️⃣ 检查前端可能使用的其他数据源...')
    
    // 检查是否有其他API端点
    const endpoints = [
      '/api/applications/test-app/modules',
      '/api/modules/test-module/directories',
      '/api/directories?applicationId=test-app',
      '/api/directories?moduleId=test-module'
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await apiRequest(endpoint)
        console.log(`${endpoint}: ${response.success ? '成功' : '失败'}`)
        if (response.success && response.data) {
          if (response.data.directories) {
            console.log(`  目录数量: ${response.data.directories.length}`)
          }
          if (response.data.modules) {
            console.log(`  模块数量: ${response.data.modules.length}`)
          }
        }
      } catch (error) {
        console.log(`${endpoint}: 错误 - ${error.message}`)
      }
    }
    console.log('')

    // 4. 检查前端数据转换逻辑
    console.log('4️⃣ 检查前端数据转换逻辑...')
    console.log('前端在 use-api-builder-controller.tsx 中的数据转换:')
    console.log('')
    console.log('const directories = response.data.directories.map((dir: any) => ({')
    console.log('  id: dir.id,')
    console.log('  name: dir.name,')
    console.log('  type: dir.type,')
    console.log('  fields: dir.config?.fields || [],  // ← 关键：这里获取字段数据')
    console.log('  categories: dir.config?.categories || [],')
    console.log('  records: [],')
    console.log('}))')
    console.log('')
    console.log('问题可能是:')
    console.log('1. dir.config 为 null 或 undefined')
    console.log('2. dir.config.fields 为 null 或 undefined')
    console.log('3. 字段数据没有正确传递到前端')
    console.log('')

  } catch (error) {
    console.error('❌ 调试失败:', error.message)
  }
}

// 运行调试
debugFrontendDirectorySource().catch(console.error)
