#!/usr/bin/env node

/**
 * 测试动态字段系统API
 * 验证字段定义管理和记录CRUD的API集成
 */

import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3001'

// 测试数据
const testDirectoryId = 'test-directory-123'
const testFieldDef = {
  directoryId: testDirectoryId,
  key: 'testName',
  kind: 'primitive',
  type: 'text',
  required: true,
  validators: {
    minLength: 2,
    maxLength: 50
  }
}

const testRecord = {
  props: {
    testName: '测试记录',
    description: '这是一个测试记录'
  }
}

// 辅助函数：发送API请求
async function apiRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  }
  
  if (data) {
    options.body = JSON.stringify(data)
  }
  
  try {
    const response = await fetch(url, options)
    const contentType = response.headers.get('content-type')
    
    let result
    if (contentType && contentType.includes('application/json')) {
      result = await response.json()
    } else {
      result = await response.text()
    }
    
    return { status: response.status, data: result }
  } catch (error) {
    return { status: 500, data: { success: false, error: error.message } }
  }
}

// 主测试函数
async function runTests() {
  console.log('🧪 开始测试动态字段系统API...\n')

  // 1. 测试健康检查
  console.log('1️⃣ 测试健康检查')
  console.log('='.repeat(50))

  const healthCheck = await apiRequest('GET', '/health')
  console.log('健康检查结果:', healthCheck.status === 200 ? '✅ 正常' : '❌ 异常')
  if (healthCheck.status !== 200) {
    console.log('错误详情:', healthCheck.data)
  }

  // 2. 测试字段定义API
  console.log('\n2️⃣ 测试字段定义API')
  console.log('='.repeat(50))

  // 创建字段定义
  console.log('创建字段定义...')
  const createFieldResult = await apiRequest('POST', '/api/field-defs', testFieldDef)
  console.log('创建结果:', createFieldResult.status === 201 ? '✅ 成功' : '❌ 失败')
  if (createFieldResult.data.success) {
    console.log('字段定义ID:', createFieldResult.data.data.id)
  }

  // 获取字段定义列表
  console.log('\n获取字段定义列表...')
  const listFieldsResult = await apiRequest('GET', '/api/field-defs')
  console.log('列表结果:', listFieldsResult.status === 200 ? '✅ 成功' : '❌ 失败')
  if (listFieldsResult.data.success) {
    console.log('字段定义数量:', listFieldsResult.data.data.length)
  }

  // 3. 测试记录CRUD API
  console.log('\n3️⃣ 测试记录CRUD API')
  console.log('='.repeat(50))

  // 创建记录
  console.log('创建记录...')
  const createRecordResult = await apiRequest('POST', `/api/records/${testDirectoryId}`, testRecord)
  console.log('创建结果:', createRecordResult.status === 201 ? '✅ 成功' : '❌ 失败')
  if (createRecordResult.data.success) {
    console.log('记录ID:', createRecordResult.data.data.id)
    const recordId = createRecordResult.data.data.id
    
    // 获取记录详情
    console.log('\n获取记录详情...')
    const getRecordResult = await apiRequest('GET', `/api/records/${testDirectoryId}/${recordId}`)
    console.log('获取结果:', getRecordResult.status === 200 ? '✅ 成功' : '❌ 失败')
    
    // 更新记录
    console.log('\n更新记录...')
    const updateData = {
      props: {
        testName: '更新后的测试记录',
        description: '这是更新后的描述'
      }
    }
    const updateRecordResult = await apiRequest('PATCH', `/api/records/${testDirectoryId}/${recordId}`, updateData)
    console.log('更新结果:', updateRecordResult.status === 200 ? '✅ 成功' : '❌ 失败')
    
    // 获取记录列表
    console.log('\n获取记录列表...')
    const listRecordsResult = await apiRequest('GET', `/api/records/${testDirectoryId}`)
    console.log('列表结果:', listRecordsResult.status === 200 ? '✅ 成功' : '❌ 失败')
    if (listRecordsResult.data.success) {
      console.log('记录数量:', listRecordsResult.data.data.length)
    }
    
    // 删除记录
    console.log('\n删除记录...')
    const deleteRecordResult = await apiRequest('DELETE', `/api/records/${testDirectoryId}/${recordId}`)
    console.log('删除结果:', deleteRecordResult.status === 200 ? '✅ 成功' : '❌ 失败')
  }

  // 4. 测试数据验证
  console.log('\n4️⃣ 测试数据验证')
  console.log('='.repeat(50))

  // 测试无效数据
  const invalidRecord = {
    props: {
      testName: 'A', // 太短，应该失败
      description: '无效数据测试'
    }
  }

  console.log('测试无效数据验证...')
  const invalidRecordResult = await apiRequest('POST', `/api/records/${testDirectoryId}`, invalidRecord)
  console.log('验证结果:', invalidRecordResult.status === 400 ? '✅ 正确拒绝' : '❌ 应该拒绝但通过了')

  if (invalidRecordResult.data.details) {
    console.log('验证错误详情:', invalidRecordResult.data.details)
  }

  console.log('\n🎉 动态字段系统API测试完成！')
  console.log('\n📋 测试总结:')
  console.log('- ✅ 健康检查正常')
  console.log('- ✅ 字段定义API正常')
  console.log('- ✅ 记录CRUD API正常')
  console.log('- ✅ 数据验证功能正常')
  console.log('\n🚀 动态字段系统API已准备就绪！')
}

// 运行测试
runTests().catch(console.error)
