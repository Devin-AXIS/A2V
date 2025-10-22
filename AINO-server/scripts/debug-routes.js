#!/usr/bin/env node

import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3001'
const TEST_TOKEN = 'test-token'

async function debugRoutes() {
  console.log('🔍 调试路由问题...\n')

  try {
    // 测试所有可能的路由
    const routes = [
      '/api/modules',
      '/api/modules/',
      '/api/modules/list',
      '/api/modules/remote',
      '/api/modules/user',
      '/api/modules/config',
      '/api/modules/audit',
      '/api/modules/system',
      '/api/modules/system/user',
      '/api/modules/system/config',
      '/api/modules/system/audit',
    ]

    for (const route of routes) {
      console.log(`测试路由: ${route}`)
      try {
        const response = await fetch(`${BASE_URL}${route}`, {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
          },
        })
        const data = await response.json()
        console.log(`✅ ${route}: ${response.status} - ${JSON.stringify(data).substring(0, 100)}...`)
      } catch (error) {
        console.log(`❌ ${route}: ${error.message}`)
      }
      console.log('')
    }

  } catch (error) {
    console.error('❌ 调试失败:', error.message)
  }
}

debugRoutes().catch(console.error)
