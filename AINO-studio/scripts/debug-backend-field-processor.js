#!/usr/bin/env node

/**
 * 调试后端字段处理器
 * 检查后端实际使用的字段处理器
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
      error: data.error || (response.ok ? null : `HTTP ${response.status}`),
      details: data.details
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

async function debugBackendFieldProcessor() {
  console.log('🔍 调试后端字段处理器...\n')

  try {
    // 1. 测试一个简单的记录创建，看看错误信息
    console.log('📝 测试简单记录创建...')
    const simpleResponse = await apiRequest('/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6', {
      method: 'POST',
      body: {
        y_4nzv: "test@example.com"
      }
    })
    
    if (simpleResponse.success) {
      console.log('✅ 简单记录创建成功')
    } else {
      console.log('❌ 简单记录创建失败:', simpleResponse.error)
    }

    // 2. 测试工作经历字段
    console.log('\n💼 测试工作经历字段...')
    const experienceResponse = await apiRequest('/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6', {
      method: 'POST',
      body: {
        y_4nzv: "test@example.com",
        g_hcj1: [
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
    
    if (experienceResponse.success) {
      console.log('✅ 工作经历记录创建成功')
    } else {
      console.log('❌ 工作经历记录创建失败:', experienceResponse.error)
      if (experienceResponse.details) {
        console.log('📋 错误详情:', JSON.stringify(experienceResponse.details, null, 2))
      }
    }

    // 3. 测试其他字段类型
    console.log('\n🏷️ 测试标签字段...')
    const tagsResponse = await apiRequest('/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6', {
      method: 'POST',
      body: {
        y_4nzv: "test@example.com",
        b_qocn: ["标签1", "标签2"]
      }
    })
    
    if (tagsResponse.success) {
      console.log('✅ 标签记录创建成功')
    } else {
      console.log('❌ 标签记录创建失败:', tagsResponse.error)
      if (tagsResponse.details) {
        console.log('📋 错误详情:', JSON.stringify(tagsResponse.details, null, 2))
      }
    }

    // 4. 测试多选字段
    console.log('\n📋 测试多选字段...')
    const multiselectResponse = await apiRequest('/api/records/047f40ea-13ff-4ede-92e9-85694329f5f6', {
      method: 'POST',
      body: {
        y_4nzv: "test@example.com",
        d_cive: ["选项1", "选项2"]
      }
    })
    
    if (multiselectResponse.success) {
      console.log('✅ 多选记录创建成功')
    } else {
      console.log('❌ 多选记录创建失败:', multiselectResponse.error)
      if (multiselectResponse.details) {
        console.log('📋 错误详情:', JSON.stringify(multiselectResponse.details, null, 2))
      }
    }

  } catch (error) {
    console.error('❌ 调试过程中出错:', error)
  }
}

// 运行调试
debugBackendFieldProcessor()
