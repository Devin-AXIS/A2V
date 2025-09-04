#!/usr/bin/env node

/**
 * 调试前端参数
 * 检查前端实际使用的应用ID和模块ID
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

// 调试前端参数
async function debugFrontendParams() {
  console.log('🔍 调试前端参数...\n')

  try {
    // 1. 获取应用列表
    console.log('1️⃣ 获取应用列表...')
    const appsResponse = await apiRequest('/api/applications')
    if (appsResponse.success && appsResponse.data.applications.length > 0) {
      const app = appsResponse.data.applications[0]
      console.log('✅ 找到应用:')
      console.log(`   名称: ${app.name}`)
      console.log(`   ID: ${app.id}`)
      console.log('')
      
      // 2. 获取应用模块
      console.log('2️⃣ 获取应用模块...')
      const modulesResponse = await apiRequest(`/api/applications/${app.id}/modules`)
      if (modulesResponse.success && modulesResponse.data.modules.length > 0) {
        const module = modulesResponse.data.modules[0]
        console.log('✅ 找到模块:')
        console.log(`   名称: ${module.name}`)
        console.log(`   ID: ${module.id}`)
        console.log('')
        
        // 3. 使用正确的参数获取目录
        console.log('3️⃣ 使用正确的参数获取目录...')
        const directoriesResponse = await apiRequest(`/api/directories?applicationId=${app.id}&moduleId=${module.id}`)
        if (directoriesResponse.success && directoriesResponse.data.directories.length > 0) {
          const directory = directoriesResponse.data.directories[0]
          console.log('✅ 找到目录:')
          console.log(`   名称: ${directory.name}`)
          console.log(`   ID: ${directory.id}`)
          console.log(`   字段数量: ${directory.config?.fields?.length || 0}`)
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
          console.log('❌ 获取目录失败')
        }
      } else {
        console.log('❌ 获取模块失败')
      }
    } else {
      console.log('❌ 获取应用失败')
    }
    console.log('')

  } catch (error) {
    console.error('❌ 调试失败:', error.message)
  }
}

// 运行调试
debugFrontendParams().catch(console.error)
