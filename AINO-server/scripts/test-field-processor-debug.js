#!/usr/bin/env node

/**
 * 测试字段处理器调试
 * 检查experience字段处理器在运行时的问题
 */

const { fieldProcessorManager } = require('../src/lib/field-processors.ts')

console.log('🔍 测试字段处理器调试...\n')

try {
  // 测试字段定义
  const fieldDef = {
    id: '1',
    key: 'g_hcj1',
    kind: 'primitive',
    type: 'experience',
    required: false
  }
  
  const testData = [
    {
      id: 'exp1',
      type: 'work',
      title: 'test',
      organization: 'test',
      startDate: '2023-01-01'
    }
  ]
  
  console.log('📝 字段定义:', fieldDef)
  console.log('📝 测试数据:', testData)
  
  // 检查处理器获取
  console.log('\n🔍 检查处理器获取...')
  const processor = fieldProcessorManager.getProcessor(fieldDef.type)
  console.log('💼 获取的处理器类型:', processor ? '存在' : '不存在')
  console.log('💼 处理器验证方法:', typeof processor.validate)
  
  // 直接测试验证
  console.log('\n🧪 直接测试验证...')
  const result = fieldProcessorManager.validateField(testData, fieldDef)
  console.log('✅ 验证结果:', result)
  
  // 测试记录验证
  console.log('\n🧪 测试记录验证...')
  const recordData = { g_hcj1: testData }
  const recordResult = fieldProcessorManager.validateRecord(recordData, [fieldDef])
  console.log('✅ 记录验证结果:', recordResult)
  
} catch (error) {
  console.error('❌ 错误:', error.message)
  console.error('📋 错误堆栈:', error.stack)
}
