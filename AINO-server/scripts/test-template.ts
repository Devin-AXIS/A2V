#!/usr/bin/env tsx

// 测试模板系统的脚本
// 使用方法: npx tsx scripts/test-template.ts

import { applyTemplate, listTemplates } from './templates/index'

async function testTemplateSystem() {
  console.log('🧪 测试模板系统')
  console.log('')
  
  // 1. 测试列出模板
  console.log('1️⃣ 测试列出模板:')
  listTemplates()
  console.log('')
  
  // 2. 测试模板验证
  console.log('2️⃣ 测试模板验证:')
  const testApplicationId = 'test-app-id-123'
  
  // 测试不存在的模板
  console.log('   - 测试不存在的模板:')
  const invalidResult = await applyTemplate(testApplicationId, 'non-existent-template')
  console.log(`     结果: ${invalidResult.success ? '✅' : '❌'} ${invalidResult.message}`)
  
  // 测试存在的模板（但不实际创建，因为应用ID无效）
  console.log('   - 测试存在的模板:')
  const validResult = await applyTemplate(testApplicationId, 'user-module')
  console.log(`     结果: ${validResult.success ? '✅' : '❌'} ${validResult.message}`)
  
  console.log('')
  console.log('🎉 模板系统测试完成！')
  console.log('')
  console.log('📝 使用说明:')
  console.log('   1. 创建新应用后，获取应用ID')
  console.log('   2. 运行: npx tsx scripts/apply-user-template.ts <应用ID>')
  console.log('   3. 检查前端是否显示用户列表目录和字段')
}

testTemplateSystem().catch(console.error)
