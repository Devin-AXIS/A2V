#!/usr/bin/env node

import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3001'
const TOKEN = 'test-token'

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      return await response.text()
    }
  } catch (error) {
    console.error('API请求失败:', error.message)
    throw error
  }
}

async function testCountryField() {
  console.log('🌍 测试国家字段功能...\n')

  try {
    // 1. 获取应用列表
    console.log('1️⃣ 获取应用列表...')
    const appsResponse = await apiRequest('/api/applications')
    if (!appsResponse.success) {
      throw new Error('获取应用列表失败')
    }
    
    const app = appsResponse.data.applications[0]
    console.log(`✅ 找到应用: ${app.name} (${app.id})`)

    // 2. 获取应用模块
    console.log('\n2️⃣ 获取应用模块...')
    const modulesResponse = await apiRequest(`/api/applications/${app.id}/modules`)
    if (!modulesResponse.success) {
      throw new Error('获取应用模块失败')
    }
    
    const module = modulesResponse.data.modules[0]
    console.log(`✅ 找到模块: ${module.name} (${module.id})`)

    // 3. 获取目录列表
    console.log('\n3️⃣ 获取目录列表...')
    const directoriesResponse = await apiRequest(`/api/directories?applicationId=${app.id}&moduleId=${module.id}`)
    if (!directoriesResponse.success) {
      throw new Error('获取目录列表失败')
    }
    
    const directory = directoriesResponse.data.directories[0]
    console.log(`✅ 找到目录: ${directory.name} (${directory.id})`)
    console.log(`   字段数量: ${directory.config?.fields?.length || 0}`)

    // 4. 查找国家字段
    console.log('\n4️⃣ 查找国家字段...')
    const countryField = directory.config?.fields?.find(f => f.key === 'g_sp19')
    if (!countryField) {
      console.log('❌ 未找到国家字段 (g_sp19)')
      return
    }
    
    console.log('✅ 找到国家字段:')
    console.log(`   标签: ${countryField.label}`)
    console.log(`   键: ${countryField.key}`)
    console.log(`   类型: ${countryField.type}`)
    console.log(`   预设: ${countryField.preset || '无'}`)
    console.log(`   启用: ${countryField.enabled}`)

    // 5. 检查字段配置
    console.log('\n5️⃣ 检查字段配置...')
    if (countryField.preset === 'country') {
      console.log('✅ 国家字段配置正确，应该使用 CountrySelect 组件')
    } else {
      console.log('❌ 国家字段缺少 preset: "country" 配置')
      console.log('   当前配置:', JSON.stringify(countryField, null, 2))
    }

    // 6. 测试创建记录
    console.log('\n6️⃣ 测试创建记录...')
    const testRecord = {
      g_sp19: '中国'
    }
    
    const createResponse = await apiRequest(`/api/records/${directory.id}`, {
      method: 'POST',
      body: JSON.stringify(testRecord)
    })
    
    if (createResponse.success) {
      console.log('✅ 记录创建成功')
      console.log(`   记录ID: ${createResponse.data.id}`)
      console.log(`   国家字段值: ${createResponse.data.props?.g_sp19 || '未设置'}`)
    } else {
      console.log('❌ 记录创建失败:', createResponse.error)
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testCountryField().catch(console.error)
