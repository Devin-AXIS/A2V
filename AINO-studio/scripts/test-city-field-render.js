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

// 测试城市字段渲染
async function testCityFieldRender() {
  console.log('🧪 测试城市字段渲染...\n')

  try {
    // 1. 获取目录信息
    console.log('1️⃣ 获取目录信息...')
    const directory = await apiRequest('/api/directories/047f40ea-13ff-4ede-92e9-85694329f5f6')
    if (!directory.success) {
      throw new Error('获取目录信息失败')
    }
    console.log('✅ 目录信息获取成功')
    console.log('')

    // 2. 检查城市字段配置
    console.log('2️⃣ 检查城市字段配置...')
    const cityField = directory.data.config.fields.find(f => f.key === 'c_89a6')
    if (cityField) {
      console.log('✅ 找到城市字段:')
      console.log(`   标签: ${cityField.label}`)
      console.log(`   键: ${cityField.key}`)
      console.log(`   类型: ${cityField.type}`)
      console.log(`   预设: ${cityField.preset}`)
      console.log(`   启用: ${cityField.enabled}`)
      console.log('')
      
      if (cityField.preset === 'city') {
        console.log('✅ 城市字段预设配置正确')
      } else {
        console.log('❌ 城市字段预设配置错误')
      }
    } else {
      console.log('❌ 未找到城市字段')
    }
    console.log('')

    // 3. 测试记录创建
    console.log('3️⃣ 测试记录创建...')
    const testRecord = {
      props: {
        c_89a6: '广东省 / 深圳市 / 南山区'
      }
    }
    
    const createRecord = await apiRequest('/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6', {
      method: 'POST',
      body: JSON.stringify(testRecord)
    })
    
    if (createRecord.success) {
      console.log('✅ 记录创建成功')
      console.log(`   城市字段值: ${testRecord.props.c_89a6}`)
      console.log('')
      
      // 4. 测试记录更新
      console.log('4️⃣ 测试记录更新...')
      const updateRecord = {
        props: {
          c_89a6: '北京市 / 北京市 / 朝阳区'
        }
      }
      
      const updateResult = await apiRequest(`/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6/${createRecord.data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateRecord)
      })
      
      if (updateResult.success) {
        console.log('✅ 记录更新成功')
        console.log(`   城市字段值: ${updateRecord.props.c_89a6}`)
        console.log('')
      } else {
        console.log('❌ 记录更新失败:', updateResult.error)
        console.log('')
      }
      
      // 5. 测试记录查询
      console.log('5️⃣ 测试记录查询...')
      const getRecord = await apiRequest(`/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6/${createRecord.data.id}`)
      
      if (getRecord.success) {
        console.log('✅ 记录查询成功')
        console.log(`   城市字段值: ${getRecord.data.props?.c_89a6 || '未找到'}`)
        console.log('')
      } else {
        console.log('❌ 记录查询失败:', getRecord.error)
        console.log('')
      }
      
      // 6. 清理测试数据
      console.log('6️⃣ 清理测试数据...')
      const deleteResult = await apiRequest(`/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6/${createRecord.data.id}`, {
        method: 'DELETE'
      })
      
      if (deleteResult.success) {
        console.log('✅ 测试数据清理成功')
      } else {
        console.log('❌ 测试数据清理失败:', deleteResult.error)
      }
    } else {
      console.log('❌ 记录创建失败:', createRecord.error)
    }

    console.log('🎉 城市字段渲染测试完成！')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testCityFieldRender().catch(console.error)
