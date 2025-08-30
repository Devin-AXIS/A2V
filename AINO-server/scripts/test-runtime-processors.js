#!/usr/bin/env node

/**
 * 测试运行时字段处理器
 * 检查字段处理器管理器在运行时的状态
 */

const { fieldProcessorManager } = require('../src/lib/field-processors.ts')

console.log('🔍 测试运行时字段处理器...\n')

try {
  // 检查所有可用的处理器
  console.log('📋 所有可用处理器:')
  const processors = fieldProcessorManager.processors
  for (const [type, processor] of Object.entries(processors)) {
    console.log(`  - ${type}: ${typeof processor.validate}`)
  }
  
  // 特别检查experience处理器
  console.log('\n💼 Experience处理器详情:')
  const experienceProcessor = processors.experience
  if (experienceProcessor) {
    console.log('  - 存在: ✅')
    console.log('  - 验证方法:', typeof experienceProcessor.validate)
    console.log('  - 转换方法:', typeof experienceProcessor.transform)
    console.log('  - 格式化方法:', typeof experienceProcessor.format)
    
    // 测试验证方法
    const testData = [
      {
        id: 'exp1',
        type: 'work',
        title: 'test',
        organization: 'test',
        startDate: '2023-01-01'
      }
    ]
    
    const fieldDef = {
      id: '1',
      key: 'g_hcj1',
      kind: 'primitive',
      type: 'experience',
      required: false
    }
    
    console.log('\n🧪 直接测试experience处理器:')
    const result = experienceProcessor.validate(testData, fieldDef)
    console.log('  - 验证结果:', result)
    
  } else {
    console.log('  - 存在: ❌')
  }
  
  // 测试getProcessor方法
  console.log('\n🔍 测试getProcessor方法:')
  const retrievedProcessor = fieldProcessorManager.getProcessor('experience')
  console.log('  - 获取的处理器:', retrievedProcessor ? '存在' : '不存在')
  console.log('  - 处理器类型:', typeof retrievedProcessor?.validate)
  
  // 测试不存在的处理器
  const nonExistentProcessor = fieldProcessorManager.getProcessor('nonexistent')
  console.log('  - 不存在的处理器回退:', nonExistentProcessor ? '存在' : '不存在')
  console.log('  - 回退处理器类型:', typeof nonExistentProcessor?.validate)
  
} catch (error) {
  console.error('❌ 错误:', error.message)
  console.error('📋 错误堆栈:', error.stack)
}
