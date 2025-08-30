#!/usr/bin/env node

/**
 * 测试运行时字段处理器获取
 * 检查getProcessor方法在运行时的行为
 */

const { fieldProcessorManager } = require('../src/lib/field-processors.ts')

console.log('🔍 测试运行时字段处理器获取...\n')

try {
  // 测试各种字段类型的处理器获取
  const testTypes = ['text', 'number', 'experience', 'tags', 'nonexistent']
  
  for (const type of testTypes) {
    console.log(`\n🧪 测试字段类型: ${type}`)
    
    try {
      const processor = fieldProcessorManager.getProcessor(type)
      console.log(`  - 获取结果: ${processor ? '成功' : '失败'}`)
      console.log(`  - 处理器类型: ${typeof processor?.validate}`)
      
      if (processor && processor.validate) {
        // 测试验证方法
        const testData = type === 'experience' ? 
          [{ id: 'test', type: 'work', title: 'test', organization: 'test', startDate: '2023-01-01' }] :
          'test value'
          
        const fieldDef = {
          id: '1',
          key: 'test',
          kind: 'primitive',
          type: type,
          required: false
        }
        
        const result = processor.validate(testData, fieldDef)
        console.log(`  - 验证测试: ${result.valid ? '通过' : '失败'}`)
        if (!result.valid) {
          console.log(`  - 错误信息: ${result.error}`)
        }
      }
    } catch (error) {
      console.log(`  - 获取错误: ${error.message}`)
    }
  }
  
  // 测试processors对象直接访问
  console.log('\n🔍 直接访问processors对象:')
  console.log('  - experience处理器存在:', !!fieldProcessorManager.processors.experience)
  console.log('  - 所有处理器键:', Object.keys(fieldProcessorManager.processors))
  
} catch (error) {
  console.error('❌ 错误:', error.message)
  console.error('📋 错误堆栈:', error.stack)
}
