#!/usr/bin/env node

/**
 * 修复城市字段预设
 * 为现有的城市字段添加预设信息
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

// 修复城市字段
async function fixCityField() {
  console.log('🔧 修复城市字段预设...\n')

  try {
    // 1. 获取应用列表
    console.log('1️⃣ 获取应用列表...')
    const applications = await apiRequest('/api/applications')
    if (!applications.success) {
      throw new Error('获取应用列表失败')
    }
    console.log('✅ 应用列表获取成功')
    console.log('')

    const appId = applications.data.applications[0].id
    console.log(`📱 使用应用ID: ${appId}`)
    console.log('')

    // 2. 获取目录列表
    console.log('2️⃣ 获取目录列表...')
    const directories = await apiRequest(`/api/directories?applicationId=${appId}`)
    if (!directories.success) {
      throw new Error('获取目录列表失败')
    }
    console.log('✅ 目录列表获取成功')
    console.log('')

    // 3. 查找并修复城市字段
    for (const directory of directories.data.directories) {
      console.log(`3️⃣ 检查目录: ${directory.name}`)
      
      if (directory.config && directory.config.fields) {
        let hasCityField = false
        let needsUpdate = false
        
        // 检查是否有城市字段
        for (const field of directory.config.fields) {
          if (field.label === '城市1' || field.key === 'c_89a6' || 
              (field.type === 'text' && field.label.includes('城市'))) {
            hasCityField = true
            console.log(`   找到城市字段: ${field.label} (${field.key})`)
            
            // 检查是否已有预设
            if (!field.preset) {
              console.log('   ❌ 缺少预设信息，正在修复...')
              field.preset = 'city'
              needsUpdate = true
            } else {
              console.log(`   ✅ 已有预设: ${field.preset}`)
            }
            break
          }
        }
        
        if (hasCityField && needsUpdate) {
          console.log('   🔧 更新目录配置...')
          
          // 更新目录配置
          const updateResult = await apiRequest(`/api/directories/${directory.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              config: directory.config
            })
          })
          
          if (updateResult.success) {
            console.log('   ✅ 城市字段预设修复成功')
          } else {
            console.log('   ❌ 城市字段预设修复失败:', updateResult.error)
          }
        } else if (!hasCityField) {
          console.log('   ℹ️  未找到城市字段')
        }
        console.log('')
      }
    }

    // 4. 创建新的城市字段（如果不存在）
    console.log('4️⃣ 创建新的城市字段...')
    const firstDirectory = directories.data.directories[0]
    if (firstDirectory) {
      const newCityField = {
        id: `city_${Date.now()}`,
        key: 'city',
        type: 'text',
        label: '居住城市',
        required: false,
        showInForm: true,
        showInList: true,
        showInDetail: true,
        enabled: true,
        options: [],
        validators: {},
        description: '当前居住城市',
        placeholder: '请选择省/市/区',
        preset: 'city'
      }
      
      // 添加到目录配置
      if (!firstDirectory.config) {
        firstDirectory.config = { fields: [] }
      }
      if (!firstDirectory.config.fields) {
        firstDirectory.config.fields = []
      }
      
      // 检查是否已存在城市字段
      const existingCityField = firstDirectory.config.fields.find(f => f.key === 'city')
      if (!existingCityField) {
        firstDirectory.config.fields.push(newCityField)
        
        const createResult = await apiRequest(`/api/directories/${firstDirectory.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            config: firstDirectory.config
          })
        })
        
        if (createResult.success) {
          console.log('✅ 新城市字段创建成功')
        } else {
          console.log('❌ 新城市字段创建失败:', createResult.error)
        }
      } else {
        console.log('ℹ️  城市字段已存在')
      }
    }

    console.log('🎉 城市字段预设修复完成！')

  } catch (error) {
    console.error('❌ 修复失败:', error.message)
  }
}

// 运行修复
fixCityField().catch(console.error)
