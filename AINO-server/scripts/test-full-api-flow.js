#!/usr/bin/env node

/**
 * 测试完整的API调用流程
 * 模拟记录创建API的完整流程
 */

const { fieldProcessorManager } = require('../src/lib/field-processors.ts')

console.log('🔍 测试完整API调用流程...\n')

try {
  // 模拟从数据库获取的字段定义
  const fieldDefinitions = [
    {
      id: '33fb6ac6-d807-406e-95f5-df68302175da',
      key: 'g_hcj1',
      kind: 'primitive',
      type: 'experience',
      schema: {
        label: '工作经历',
        preset: 'work_experience',
        options: [],
        required: false,
        showInForm: true,
        showInList: true,
        description: '',
        placeholder: '',
        showInDetail: true
      },
      relation: null,
      lookup: null,
      computed: null,
      validators: {},
      readRoles: ['admin', 'member'],
      writeRoles: ['admin'],
      required: false
    }
  ]
  
  // 模拟输入数据
  const inputData = {
    y_4nzv: 'test@example.com',
    g_hcj1: [
      {
        id: 'exp_1',
        type: 'work',
        title: '测试职位',
        organization: '测试公司',
        startDate: '2023-01-01'
      }
    ]
  }
  
  console.log('📝 字段定义:', fieldDefinitions.map(fd => ({ key: fd.key, type: fd.type })))
  console.log('📝 输入数据:', inputData)
  
  // 测试字段处理器获取
  console.log('\n🔍 测试字段处理器获取...')
  for (const fieldDef of fieldDefinitions) {
    const processor = fieldProcessorManager.getProcessor(fieldDef.type)
    console.log(`💼 字段 ${fieldDef.key} (${fieldDef.type}):`, processor ? '处理器存在' : '处理器不存在')
    
    if (processor) {
      console.log(`💼 处理器类型:`, typeof processor.validate)
      console.log(`💼 处理器方法:`, Object.keys(processor))
    }
  }
  
  // 测试记录验证
  console.log('\n🧪 测试记录验证...')
  const validation = fieldProcessorManager.validateRecord(inputData, fieldDefinitions)
  console.log('✅ 验证结果:', validation)
  
  if (!validation.valid) {
    console.log('❌ 验证错误详情:')
    for (const [key, error] of Object.entries(validation.errors)) {
      console.log(`  - ${key}: ${error}`)
    }
  }
  
} catch (error) {
  console.error('❌ 错误:', error.message)
  console.error('📋 错误堆栈:', error.stack)
}
