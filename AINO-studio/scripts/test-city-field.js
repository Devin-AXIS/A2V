#!/usr/bin/env node

/**
 * 测试城市字段渲染
 * 验证城市字段是否正确使用CitySelect组件
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
async function testCityField() {
  console.log('🧪 测试城市字段渲染...\n')

  try {
    // 1. 测试健康检查
    console.log('1️⃣ 测试健康检查...')
    const health = await apiRequest('/health')
    console.log('✅ 健康检查:', health)
    console.log('')

    // 2. 获取应用列表
    console.log('2️⃣ 获取应用列表...')
    const applications = await apiRequest('/api/applications')
    console.log('✅ 应用列表获取成功')
    console.log('')

    if (applications.success && applications.data.applications.length > 0) {
      const appId = applications.data.applications[0].id
      console.log(`📱 使用应用ID: ${appId}`)
      console.log('')

      // 3. 获取目录列表
      console.log('3️⃣ 获取目录列表...')
      const directories = await apiRequest(`/api/directories?applicationId=${appId}`)
      console.log('✅ 目录列表获取成功')
      console.log('')

      if (directories.success && directories.data.length > 0) {
        const dirId = directories.data[0].id
        console.log(`📁 使用目录ID: ${dirId}`)
        console.log('')

        // 4. 获取字段定义
        console.log('4️⃣ 获取字段定义...')
        const fieldDefs = await apiRequest(`/api/field-defs?directoryId=${dirId}`)
        console.log('✅ 字段定义获取成功')
        
        if (fieldDefs.success && fieldDefs.data.length > 0) {
          console.log('字段列表:')
          fieldDefs.data.forEach(field => {
            console.log(`  - ${field.label} (${field.key}): ${field.type}${field.preset ? ` [预设: ${field.preset}]` : ''}`)
          })
          console.log('')

          // 5. 检查是否有城市字段
          console.log('5️⃣ 检查城市字段...')
          const cityField = fieldDefs.data.find(f => f.key === 'city' || f.preset === 'city')
          if (cityField) {
            console.log('✅ 找到城市字段:')
            console.log(`  标签: ${cityField.label}`)
            console.log(`  键: ${cityField.key}`)
            console.log(`  类型: ${cityField.type}`)
            console.log(`  预设: ${cityField.preset}`)
            console.log('')
          } else {
            console.log('❌ 未找到城市字段')
            console.log('')

            // 6. 创建城市字段
            console.log('6️⃣ 创建城市字段...')
            const newCityField = {
              key: 'city',
              label: '居住城市',
              type: 'text',
              preset: 'city',
              required: false,
              description: '当前居住城市'
            }
            
            const createField = await apiRequest(`/api/field-defs`, {
              method: 'POST',
              body: JSON.stringify({
                directoryId: dirId,
                ...newCityField
              })
            })
            
            if (createField.success) {
              console.log('✅ 城市字段创建成功')
              console.log('')
            } else {
              console.log('❌ 城市字段创建失败:', createField.error)
              console.log('')
            }
          }

          // 7. 测试记录创建
          console.log('7️⃣ 测试记录创建...')
          const testRecord = {
            props: {
              city: '广东省 / 深圳市 / 南山区'
            }
          }
          
          const createRecord = await apiRequest(`/api/records/${dirId}`, {
            method: 'POST',
            body: JSON.stringify(testRecord)
          })
          
          if (createRecord.success) {
            console.log('✅ 记录创建成功，城市字段值:', testRecord.props.city)
            console.log('')
          } else {
            console.log('❌ 记录创建失败:', createRecord.error)
            console.log('')
          }
        }
      }
    }

    console.log('🎉 城市字段测试完成！')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', await error.response.text())
    }
  }
}

// 运行测试
testCityField().catch(console.error)
