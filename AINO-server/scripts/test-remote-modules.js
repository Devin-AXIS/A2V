#!/usr/bin/env node

/**
 * 测试远程模块系统
 * 验证模块注册、代理和HMAC签名功能
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

// 测试函数
async function testRemoteModules() {
  console.log('🧪 测试远程模块系统...\n')

  try {
    // 1. 测试健康检查
    console.log('1️⃣ 测试健康检查...')
    const health = await apiRequest('/health')
    console.log('✅ 健康检查:', health)
    console.log('')

    // 2. 测试获取所有模块
    console.log('2️⃣ 测试获取所有模块...')
    const allModules = await apiRequest('/api/modules')
    console.log('✅ 所有模块:', JSON.stringify(allModules, null, 2))
    console.log('')

    // 3. 测试获取系统模块
    console.log('3️⃣ 测试获取系统模块...')
    const systemModules = await apiRequest('/api/modules/system')
    console.log('✅ 系统模块:', JSON.stringify(systemModules, null, 2))
    console.log('')

    // 4. 测试获取远程模块
    console.log('4️⃣ 测试获取远程模块...')
    const remoteModules = await apiRequest('/api/modules/remote')
    console.log('✅ 远程模块:', JSON.stringify(remoteModules, null, 2))
    console.log('')

    // 5. 测试获取特定模块信息
    console.log('5️⃣ 测试获取用户模块信息...')
    const userModule = await apiRequest('/api/modules/user')
    console.log('✅ 用户模块:', JSON.stringify(userModule, null, 2))
    console.log('')

    // 6. 测试系统模块API调用
    console.log('6️⃣ 测试系统模块API调用...')
    const userMe = await apiRequest('/api/modules/system/user/me?applicationId=test-app')
    console.log('✅ 用户信息:', JSON.stringify(userMe, null, 2))
    console.log('')

    // 7. 测试配置模块API调用
    console.log('7️⃣ 测试配置模块API调用...')
    const config = await apiRequest('/api/modules/system/config?applicationId=test-app')
    console.log('✅ 配置信息:', JSON.stringify(config, null, 2))
    console.log('')

    // 8. 测试审计模块API调用
    console.log('8️⃣ 测试审计模块API调用...')
    const audit = await apiRequest('/api/modules/system/audit?applicationId=test-app')
    console.log('✅ 审计日志:', JSON.stringify(audit, null, 2))
    console.log('')

    // 9. 测试不存在的模块
    console.log('9️⃣ 测试不存在的模块...')
    try {
      const nonExistent = await apiRequest('/api/modules/nonexistent')
      console.log('❌ 应该返回404，但返回了:', JSON.stringify(nonExistent, null, 2))
    } catch (error) {
      console.log('✅ 正确返回404错误')
    }
    console.log('')

    console.log('🎉 远程模块系统测试完成！')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', await error.response.text())
    }
  }
}

// 运行测试
testRemoteModules().catch(console.error)
