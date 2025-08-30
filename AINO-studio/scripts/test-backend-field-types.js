#!/usr/bin/env node

/**
 * 测试后端字段类型
 * 检查后端是否正确识别字段类型
 */

// 简单的API请求函数
async function apiRequest(endpoint, options = {}) {
  const baseUrl = 'http://localhost:3001'
  const url = `${baseUrl}${endpoint}`
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    }
  }
  
  const finalOptions = { ...defaultOptions, ...options }
  
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body)
  }
  
  try {
    const response = await fetch(url, finalOptions)
    const data = await response.json()
    
    return {
      success: response.ok,
      data: data.data || data,
      error: data.error || (response.ok ? null : `HTTP ${response.status}`)
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

async function testBackendFieldTypes() {
  console.log('🔍 测试后端字段类型...\n')

  try {
    // 1. 获取所有字段定义
    console.log('📋 获取字段定义...')
    const fieldDefsResponse = await apiRequest('/api/field-defs?directoryId=785a2b81-46d1-4fc6-b342-430758a2f23a')
    
    if (!fieldDefsResponse.success) {
      console.error('❌ 获取字段定义失败:', fieldDefsResponse.error)
      return
    }
    
    console.log('✅ 获取字段定义成功，共', fieldDefsResponse.data.length, '个字段')
    
    // 2. 分析字段类型
    const fieldTypes = {}
    fieldDefsResponse.data.forEach(field => {
      if (!fieldTypes[field.type]) {
        fieldTypes[field.type] = []
      }
      fieldTypes[field.type].push(field.key)
    })
    
    console.log('\n📊 字段类型统计:')
    Object.keys(fieldTypes).forEach(type => {
      console.log(`  - ${type}: ${fieldTypes[type].length} 个字段`)
      if (type === 'experience') {
        console.log(`    字段: ${fieldTypes[type].join(', ')}`)
      }
    })
    
    // 3. 检查experience字段
    const experienceFields = fieldDefsResponse.data.filter(f => f.type === 'experience')
    if (experienceFields.length > 0) {
      console.log('\n💼 工作经历字段详情:')
      experienceFields.forEach(field => {
        console.log(`  - ${field.key}: ${field.schema.label}`)
        console.log(`    类型: ${field.type}`)
        console.log(`    预设: ${field.schema.preset || 'none'}`)
      })
    } else {
      console.log('\n❌ 未找到experience类型字段')
    }
    
    // 4. 测试不同类型的字段
    console.log('\n🧪 测试不同字段类型...')
    
    // 测试文本字段
    console.log('📝 测试文本字段...')
    const textField = fieldDefsResponse.data.find(f => f.type === 'text')
    if (textField) {
      const textResponse = await apiRequest('/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6', {
        method: 'POST',
        body: {
          [textField.key]: "测试文本"
        }
      })
      console.log(`  ${textField.key}: ${textResponse.success ? '✅' : '❌'} ${textResponse.success ? '成功' : textResponse.error}`)
    }
    
    // 测试标签字段
    console.log('🏷️ 测试标签字段...')
    const tagsField = fieldDefsResponse.data.find(f => f.type === 'tags')
    if (tagsField) {
      const tagsResponse = await apiRequest('/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6', {
        method: 'POST',
        body: {
          [tagsField.key]: ["标签1", "标签2"]
        }
      })
      console.log(`  ${tagsField.key}: ${tagsResponse.success ? '✅' : '❌'} ${tagsResponse.success ? '成功' : tagsResponse.error}`)
    }
    
    // 测试工作经历字段
    console.log('💼 测试工作经历字段...')
    const experienceField = fieldDefsResponse.data.find(f => f.type === 'experience')
    if (experienceField) {
      const experienceResponse = await apiRequest('/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6', {
        method: 'POST',
        body: {
          [experienceField.key]: [
            {
              id: "exp_1",
              type: "work",
              title: "测试职位",
              organization: "测试公司",
              startDate: "2023-01-01"
            }
          ]
        }
      })
      console.log(`  ${experienceField.key}: ${experienceResponse.success ? '✅' : '❌'} ${experienceResponse.success ? '成功' : experienceResponse.error}`)
      if (!experienceResponse.success && experienceResponse.data && experienceResponse.data.details) {
        console.log(`    错误详情: ${JSON.stringify(experienceResponse.data.details)}`)
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error)
  }
}

// 运行测试
testBackendFieldTypes()
