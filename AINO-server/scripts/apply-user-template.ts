#!/usr/bin/env tsx

// 应用用户模块模板的便捷脚本
// 使用方法: npx tsx scripts/apply-user-template.ts <applicationId>

import { applyTemplate } from './templates/index'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('使用方法: npx tsx scripts/apply-user-template.ts <applicationId>')
    console.log('')
    console.log('示例:')
    console.log('  npx tsx scripts/apply-user-template.ts 123e4567-e89b-12d3-a456-426614174000')
    return
  }

  const applicationId = args[0]

  console.log('🎯 应用用户模块模板')
  console.log(`📱 应用ID: ${applicationId}`)
  console.log('')

  const result = await applyTemplate(applicationId, 'user-module')

  if (result.success) {
    console.log('')
    console.log('🎉 用户模块模板应用成功！')
    console.log('')
    console.log('📋 创建的内容:')
    console.log('  ✅ 用户列表目录')
    console.log('  ✅ 3个字段分类: 基础信息、用户履历、实名与认证')
    console.log('  ✅ 19个默认字段')
    console.log('')
    console.log('🔗 现在你可以在前端看到完整的用户管理功能了！')
  } else {
    console.error('')
    console.error('❌ 应用模板失败:')
    console.error(`   ${result.message}`)
    // process.exit(1)
  }
}

main().catch(console.error)
