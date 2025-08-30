#!/usr/bin/env node

/**
 * 调试字段处理器
 * 测试experience字段处理器是否正确工作
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

async function debugFieldProcessor() {
  console.log('🔍 调试字段处理器...\n')

  try {
    // 1. 获取字段定义
    console.log('📋 获取字段定义...')
    const fieldDefsResponse = await apiRequest('/api/field-defs?directoryId=785a2b81-46d1-4fc6-b342-430758a2f23a')
    
    if (!fieldDefsResponse.success) {
      console.error('❌ 获取字段定义失败:', fieldDefsResponse.error)
      return
    }
    
    const experienceField = fieldDefsResponse.data.find(f => f.key === 'g_hcj1')
    if (!experienceField) {
      console.error('❌ 未找到工作经历字段')
      return
    }
    
    console.log('✅ 找到工作经历字段:')
    console.log('  - key:', experienceField.key)
    console.log('  - type:', experienceField.type)
    console.log('  - kind:', experienceField.kind)
    console.log('  - schema:', JSON.stringify(experienceField.schema, null, 2))
    
    // 2. 测试字段处理器
    console.log('\n🧪 测试字段处理器...')
    
    // 模拟字段处理器验证
    const testData = [
      {
        id: "exp_1",
        type: "work",
        title: "测试职位",
        organization: "测试公司",
        startDate: "2023-01-01"
      }
    ]
    
    console.log('📝 测试数据:', JSON.stringify(testData, null, 2))
    
    // 3. 测试记录创建
    console.log('\n💾 测试记录创建...')
    const createResponse = await apiRequest('/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6', {
      method: 'POST',
      body: {
        y_4nzv: "test@example.com",
        g_hcj1: testData
      }
    })
    
    if (createResponse.success) {
      console.log('✅ 记录创建成功:', createResponse.data.id)
    } else {
      console.error('❌ 记录创建失败:', createResponse.error)
      if (createResponse.data && createResponse.data.details) {
        console.log('📋 错误详情:', JSON.stringify(createResponse.data.details, null, 2))
      }
    }

  } catch (error) {
    console.error('❌ 调试过程中出错:', error)
  }
}

// 运行调试
debugFieldProcessor()
