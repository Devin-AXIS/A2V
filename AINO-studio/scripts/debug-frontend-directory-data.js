#!/usr/bin/env node

/**
 * 调试前端目录数据
 * 检查前端实际获取的目录数据结构
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

// 调试前端目录数据
async function debugFrontendDirectoryData() {
  console.log('🔍 调试前端目录数据...\n')

  try {
    // 1. 检查后端API返回的原始数据
    console.log('1️⃣ 检查后端API返回的原始数据...')
    const directory = await apiRequest('/api/directories/047f40ea-13ff-4ede-92e9-85694329f5f6')
    if (!directory.success) {
      throw new Error('获取目录信息失败')
    }
    
    console.log('✅ 后端返回的目录数据结构:')
    console.log('目录ID:', directory.data.id)
    console.log('目录名称:', directory.data.name)
    console.log('配置字段数量:', directory.data.config?.fields?.length || 0)
    console.log('')
    
    // 2. 检查城市字段的原始数据
    const cityField = directory.data.config.fields.find(f => f.key === 'c_89a6')
    if (cityField) {
      console.log('✅ 城市字段原始数据:')
      console.log(JSON.stringify(cityField, null, 2))
      console.log('')
    }

    // 3. 模拟前端数据转换过程
    console.log('3️⃣ 模拟前端数据转换过程...')
    console.log('前端在 use-api-builder-controller.tsx 中的转换逻辑:')
    console.log('')
    console.log('const directories = response.data.directories.map((dir: any) => ({')
    console.log('  id: dir.id,')
    console.log('  name: dir.name,')
    console.log('  type: dir.type,')
    console.log('  fields: dir.config?.fields || [],  // ← 这里可能丢失了preset属性')
    console.log('  categories: dir.config?.categories || [],')
    console.log('  records: [],')
    console.log('}))')
    console.log('')
    
    // 4. 检查转换后的数据结构
    const transformedDirectory = {
      id: directory.data.id,
      name: directory.data.name,
      type: directory.data.type,
      fields: directory.data.config?.fields || [],
      categories: directory.data.config?.categories || [],
      records: [],
    }
    
    const transformedCityField = transformedDirectory.fields.find(f => f.key === 'c_89a6')
    if (transformedCityField) {
      console.log('✅ 转换后的城市字段数据:')
      console.log(JSON.stringify(transformedCityField, null, 2))
      console.log('')
      
      // 5. 检查preset属性是否丢失
      if (transformedCityField.preset) {
        console.log('✅ preset属性存在:', transformedCityField.preset)
      } else {
        console.log('❌ preset属性丢失！')
        console.log('   这可能是前端城市字段显示为文本输入的原因')
      }
    }
    console.log('')

    // 6. 检查字段过滤逻辑
    console.log('6️⃣ 检查字段过滤逻辑...')
    const basicFields = transformedDirectory.fields.filter(
      (f) =>
        (f.enabled && f.type !== "relation_many" && f.type !== "relation_one") ||
        (f.preset && ["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(f.preset)),
    )
    
    const cityFieldInBasic = basicFields.find(f => f.key === 'c_89a6')
    console.log(`城市字段是否在基础字段中: ${cityFieldInBasic ? '是' : '否'}`)
    
    if (cityFieldInBasic) {
      console.log('✅ 城市字段会被包含在基础字段中')
    } else {
      console.log('❌ 城市字段不会被包含在基础字段中')
      console.log('   可能的原因:')
      console.log('   1. 字段未启用')
      console.log('   2. 字段类型为关联类型')
      console.log('   3. preset属性丢失或不在允许列表中')
    }
    console.log('')

    // 7. 检查form-field.tsx渲染逻辑
    console.log('7️⃣ 检查form-field.tsx渲染逻辑...')
    if (transformedCityField?.preset === 'city') {
      console.log('✅ 城市字段应该使用 CitySelect 组件')
      console.log('   渲染路径: field.preset === "city" → CitySelect')
    } else {
      console.log('❌ 城市字段不会使用 CitySelect 组件')
      console.log(`   实际预设值: ${transformedCityField?.preset || 'undefined'}`)
      console.log('   会使用默认的文本输入组件')
    }
    console.log('')

  } catch (error) {
    console.error('❌ 调试失败:', error.message)
  }
}

// 运行调试
debugFrontendDirectoryData().catch(console.error)
