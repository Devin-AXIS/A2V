#!/usr/bin/env node

import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3001'
const TEST_TOKEN = 'test-token'

async function testSimpleRoute() {
  console.log('🧪 测试简单路由...\n')

  try {
    // 测试健康检查
    console.log('1️⃣ 测试健康检查...')
    const health = await fetch(`${BASE_URL}/health`)
    const healthText = await health.text()
    console.log('✅ 健康检查:', healthText)
    console.log('')

    // 测试系统模块路由
    console.log('2️⃣ 测试系统模块路由...')
    const systemResponse = await fetch(`${BASE_URL}/api/modules/system`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    })
    const systemData = await systemResponse.json()
    console.log('✅ 系统模块:', JSON.stringify(systemData, null, 2))
    console.log('')

    // 测试根路径路由
    console.log('3️⃣ 测试根路径路由...')
    const rootResponse = await fetch(`${BASE_URL}/api/modules/`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    })
    const rootData = await rootResponse.json()
    console.log('✅ 根路径:', JSON.stringify(rootData, null, 2))
    console.log('')

    // 测试list路由
    console.log('4️⃣ 测试list路由...')
    const listResponse = await fetch(`${BASE_URL}/api/modules/list`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    })
    const listData = await listResponse.json()
    console.log('✅ list路由:', JSON.stringify(listData, null, 2))
    console.log('')

    // 测试用户模块路由
    console.log('5️⃣ 测试用户模块路由...')
    const userResponse = await fetch(`${BASE_URL}/api/modules/user`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    })
    const userData = await userResponse.json()
    console.log('✅ 用户模块:', JSON.stringify(userData, null, 2))
    console.log('')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

testSimpleRoute().catch(console.error)
