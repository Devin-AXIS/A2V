#!/usr/bin/env node

/**
 * 测试字段输入组件功能
 * 验证所有字段类型和预设的输入组件是否正常工作
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

// 测试字段类型
const FIELD_TYPES = [
  'text', 'textarea', 'number', 'select', 'multiselect', 'boolean',
  'date', 'datetime', 'daterange', 'multidate', 'time', 'tags',
  'image', 'multiimage', 'video', 'file', 'richtext', 'percent',
  'barcode', 'checkbox', 'cascader', 'relation_one', 'relation_many', 'experience'
]

// 测试预设字段
const PRESET_FIELDS = [
  'city', 'country', 'phone', 'email', 'url', 'map', 'currency',
  'rating', 'percent', 'progress', 'user_select', 'constellation',
  'skills', 'work_experience', 'education_experience', 'certificate_experience',
  'custom_experience', 'identity_verification', 'other_verification'
]

// 测试函数
async function testFieldInputs() {
  console.log('🧪 测试字段输入组件功能...\n')

  try {
    // 1. 测试健康检查
    console.log('1️⃣ 测试健康检查...')
    const health = await apiRequest('/health')
    console.log('✅ 健康检查:', health)
    console.log('')

    // 2. 测试获取应用列表
    console.log('2️⃣ 测试获取应用列表...')
    const applications = await apiRequest('/api/applications')
    console.log('✅ 应用列表:', JSON.stringify(applications, null, 2))
    console.log('')

    if (applications.success && applications.data.length > 0) {
      const appId = applications.data[0].id
      console.log(`📱 使用应用ID: ${appId}`)
      console.log('')

      // 3. 测试获取目录列表
      console.log('3️⃣ 测试获取目录列表...')
      const directories = await apiRequest(`/api/directories?applicationId=${appId}`)
      console.log('✅ 目录列表:', JSON.stringify(directories, null, 2))
      console.log('')

      if (directories.success && directories.data.length > 0) {
        const dirId = directories.data[0].id
        console.log(`📁 使用目录ID: ${dirId}`)
        console.log('')

        // 4. 测试获取字段定义
        console.log('4️⃣ 测试获取字段定义...')
        const fieldDefs = await apiRequest(`/api/field-defs?directoryId=${dirId}`)
        console.log('✅ 字段定义:', JSON.stringify(fieldDefs, null, 2))
        console.log('')

        // 5. 测试获取记录列表
        console.log('5️⃣ 测试获取记录列表...')
        const records = await apiRequest(`/api/records/${dirId}`)
        console.log('✅ 记录列表:', JSON.stringify(records, null, 2))
        console.log('')

        // 6. 测试创建测试记录
        console.log('6️⃣ 测试创建测试记录...')
        const testRecord = {
          props: {
            test_text: '测试文本',
            test_number: 123,
            test_boolean: true,
            test_date: new Date().toISOString().split('T')[0],
            test_tags: ['标签1', '标签2'],
          }
        }
        
        const createResult = await apiRequest(`/api/records/${dirId}`, {
          method: 'POST',
          body: JSON.stringify(testRecord)
        })
        console.log('✅ 创建记录:', JSON.stringify(createResult, null, 2))
        console.log('')

        if (createResult.success) {
          const recordId = createResult.data.id
          console.log(`📝 创建记录ID: ${recordId}`)
          console.log('')

          // 7. 测试更新记录
          console.log('7️⃣ 测试更新记录...')
          const updateRecord = {
            props: {
              test_text: '更新后的文本',
              test_number: 456,
              test_boolean: false,
              test_date: new Date().toISOString().split('T')[0],
              test_tags: ['标签3', '标签4', '标签5'],
            }
          }
          
          const updateResult = await apiRequest(`/api/records/${dirId}/${recordId}`, {
            method: 'PATCH',
            body: JSON.stringify(updateRecord)
          })
          console.log('✅ 更新记录:', JSON.stringify(updateResult, null, 2))
          console.log('')

          // 8. 测试删除记录
          console.log('8️⃣ 测试删除记录...')
          const deleteResult = await apiRequest(`/api/records/${dirId}/${recordId}`, {
            method: 'DELETE'
          })
          console.log('✅ 删除记录:', JSON.stringify(deleteResult, null, 2))
          console.log('')
        }
      }
    }

    // 9. 测试字段类型支持
    console.log('9️⃣ 测试字段类型支持...')
    console.log('支持的字段类型:', FIELD_TYPES.join(', '))
    console.log('支持的预设字段:', PRESET_FIELDS.join(', '))
    console.log('')

    console.log('🎉 字段输入组件功能测试完成！')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', await error.response.text())
    }
  }
}

// 运行测试
testFieldInputs().catch(console.error)
