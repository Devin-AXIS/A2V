#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001'

async function testAPI() {
  console.log('🧪 开始测试应用用户模块...\n')

  // 测试系统模块列表
  console.log('1. 测试获取系统模块列表...')
  try {
    const response = await fetch(`${BASE_URL}/api/modules/system`)
    const data = await response.json()
    console.log('   状态码:', response.status)
    console.log('   响应:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('   错误:', error.message)
  }
  console.log('')

  // 测试应用用户列表（需要认证）
  console.log('2. 测试获取应用用户列表（需要认证）...')
  try {
    const response = await fetch(`${BASE_URL}/api/modules/system/user?applicationId=test-app`)
    const data = await response.json()
    console.log('   状态码:', response.status)
    console.log('   响应:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('   错误:', error.message)
  }
  console.log('')

  // 测试健康检查
  console.log('3. 测试健康检查...')
  try {
    const response = await fetch(`${BASE_URL}/health`)
    const data = await response.text()
    console.log('   状态码:', response.status)
    console.log('   响应:', data)
  } catch (error) {
    console.log('   错误:', error.message)
  }
  console.log('')

  console.log('✅ 测试完成！')
}

// 运行测试
testAPI().catch(console.error)
