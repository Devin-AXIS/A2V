#!/usr/bin/env node

/**
 * 测试前端API数据
 * 检查前端实际获取的目录数据
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

// 测试前端API数据
async function testFrontendApiData() {
  console.log('🧪 测试前端API数据...\n')

  try {
    // 1. 检查前端使用的API端点
    console.log('1️⃣ 检查前端使用的API端点...')
    console.log('前端在 use-api-builder-controller.tsx 中使用的API:')
    console.log('api.directories.getDirectories({')
    console.log('  applicationId: appId,')
    console.log('  moduleId: moduleId,')
    console.log('})')
    console.log('')

    // 2. 模拟前端API调用
    console.log('2️⃣ 模拟前端API调用...')
    const response = await apiRequest('/api/directories?applicationId=test-app&moduleId=test-module')
    
    if (response.success && response.data) {
      console.log('✅ API调用成功')
      console.log('返回的目录数量:', response.data.directories?.length || 0)
      console.log('')
      
      // 3. 检查目录数据
      if (response.data.directories && response.data.directories.length > 0) {
        const directory = response.data.directories[0]
        console.log('3️⃣ 检查第一个目录数据...')
        console.log('目录ID:', directory.id)
        console.log('目录名称:', directory.name)
        console.log('配置字段数量:', directory.config?.fields?.length || 0)
        console.log('')
        
        // 4. 检查城市字段
        if (directory.config?.fields) {
          const cityField = directory.config.fields.find(f => f.key === 'c_89a6')
          if (cityField) {
            console.log('4️⃣ 检查城市字段...')
            console.log('✅ 找到城市字段:')
            console.log(`   标签: ${cityField.label}`)
            console.log(`   键: ${cityField.key}`)
            console.log(`   类型: ${cityField.type}`)
            console.log(`   预设: ${cityField.preset}`)
            console.log(`   启用: ${cityField.enabled}`)
            console.log('')
            
            // 5. 检查前端数据转换
            console.log('5️⃣ 检查前端数据转换...')
            const transformedDirectory = {
              id: directory.id,
              name: directory.name,
              type: directory.type,
              fields: directory.config?.fields || [],
              categories: directory.config?.categories || [],
              records: [],
            }
            
            const transformedCityField = transformedDirectory.fields.find(f => f.key === 'c_89a6')
            if (transformedCityField) {
              console.log('✅ 转换后的城市字段:')
              console.log(`   预设: ${transformedCityField.preset}`)
              console.log(`   启用: ${transformedCityField.enabled}`)
              console.log(`   类型: ${transformedCityField.type}`)
              console.log('')
              
              // 6. 检查字段过滤
              console.log('6️⃣ 检查字段过滤...')
              const basicFields = transformedDirectory.fields.filter(
                (f) =>
                  (f.enabled && f.type !== "relation_many" && f.type !== "relation_one") ||
                  (f.preset && ["constellation", "skills", "city", "country", "phone", "email", "url", "map", "currency", "rating", "progress", "work_experience", "education_experience", "certificate_experience", "custom_experience", "identity_verification", "other_verification", "barcode", "cascader"].includes(f.preset)),
              )
              
              const cityFieldInBasic = basicFields.find(f => f.key === 'c_89a6')
              console.log(`城市字段是否在基础字段中: ${cityFieldInBasic ? '是' : '否'}`)
              
              if (cityFieldInBasic) {
                console.log('✅ 城市字段会被包含在基础字段中')
                console.log('   应该使用 CitySelect 组件')
              } else {
                console.log('❌ 城市字段不会被包含在基础字段中')
                console.log('   会使用默认的文本输入组件')
              }
            }
          } else {
            console.log('❌ 未找到城市字段')
          }
        }
      } else {
        console.log('❌ 没有找到目录数据')
      }
    } else {
      console.log('❌ API调用失败:', response.error || '未知错误')
    }
    console.log('')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testFrontendApiData().catch(console.error)
