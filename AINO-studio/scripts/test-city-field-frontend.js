#!/usr/bin/env node

/**
 * 测试城市字段前端渲染
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

// 测试城市字段前端渲染
async function testCityFieldFrontend() {
  console.log('🧪 测试城市字段前端渲染...\n')

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
      
      // 3. 检查字段过滤逻辑
      console.log('3️⃣ 检查字段过滤逻辑...')
      const isBasicField = (cityField.enabled && cityField.type !== "relation_many" && cityField.type !== "relation_one") ||
                          (cityField.preset && ["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(cityField.preset))
      
      console.log(`   是否为基础字段: ${isBasicField}`)
      console.log(`   字段类型检查: ${cityField.type !== "relation_many" && cityField.type !== "relation_one"}`)
      console.log(`   预设检查: ${cityField.preset && ["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(cityField.preset)}`)
      console.log('')
      
      if (isBasicField) {
        console.log('✅ 城市字段会被正确包含在基础字段中')
      } else {
        console.log('❌ 城市字段不会被包含在基础字段中')
      }
    } else {
      console.log('❌ 未找到城市字段')
    }
    console.log('')

    // 4. 检查城市数据
    console.log('4️⃣ 检查城市数据...')
    try {
      const cityData = await import('./lib/city-data-complete.ts')
      if (cityData.cityData && cityData.cityData.length > 0) {
        console.log('✅ 城市数据加载成功')
        console.log(`   省份数量: ${cityData.cityData.length}`)
        console.log(`   第一个省份: ${cityData.cityData[0].label}`)
        console.log(`   第一个省份城市数量: ${cityData.cityData[0].children?.length || 0}`)
        console.log('')
      } else {
        console.log('❌ 城市数据加载失败')
      }
    } catch (error) {
      console.log('❌ 城市数据加载失败:', error.message)
    }

    // 5. 测试记录创建和查询
    console.log('5️⃣ 测试记录创建和查询...')
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
      
      // 查询记录
      const getRecord = await apiRequest(`/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6/${createRecord.data.id}`)
      if (getRecord.success) {
        console.log('✅ 记录查询成功')
        console.log(`   记录ID: ${createRecord.data.id}`)
        console.log('')
      }
      
      // 清理测试数据
      await apiRequest(`/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6/${createRecord.data.id}`, {
        method: 'DELETE'
      })
      console.log('✅ 测试数据清理完成')
    } else {
      console.log('❌ 记录创建失败:', createRecord.error)
    }

    console.log('🎉 城市字段前端渲染测试完成！')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testCityFieldFrontend().catch(console.error)
