#!/usr/bin/env node

/**
 * 调试字段处理器
 * 检查experience字段处理器是否正确加载
 */

const { fieldProcessorManager } = require('../src/lib/field-processors.ts')

console.log('🔍 调试字段处理器...\n')

try {
  // 检查可用的处理器
  console.log('📋 可用处理器:', Object.keys(fieldProcessorManager.processors))
  console.log('💼 Experience处理器存在:', !!fieldProcessorManager.processors.experience)
  
  // 测试字段定义
  const fieldDef = {
    id: '1',
    key: 'test',
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
  
  console.log('\n🧪 测试验证...')
  console.log('📝 字段定义:', fieldDef)
  console.log('📝 测试数据:', testData)
  
  const result = fieldProcessorManager.validateField(testData, fieldDef)
  console.log('✅ 验证结果:', result)
  
} catch (error) {
  console.error('❌ 错误:', error.message)
  console.error('📋 错误堆栈:', error.stack)
}
