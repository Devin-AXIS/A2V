#!/usr/bin/env tsx

// 模板系统主入口脚本
// 使用方法: npx tsx scripts/templates/index.ts <applicationId> [templateName]

import { userModuleTemplate } from './user-module-template'
import { createDirectory, createFieldCategories, createFieldDefinitions } from './utils'
import type { ModuleTemplate, TemplateResult } from './types'

// 模板注册表
const templates: Record<string, ModuleTemplate> = {
  'user-module': userModuleTemplate,
  // 未来可以在这里添加更多模板
  // 'product-module': productModuleTemplate,
  // 'order-module': orderModuleTemplate,
}

/**
 * 应用模板到应用
 */
async function applyTemplate(
  applicationId: string,
  templateName: string
): Promise<TemplateResult> {
  try {
    console.log(`🚀 开始应用模板: ${templateName}`)
    
    const template = templates[templateName]
    if (!template) {
      return {
        success: false,
        message: `模板 ${templateName} 不存在。可用模板: ${Object.keys(templates).join(', ')}`
      }
    }

    // 查找用户管理模块
    // 这里需要根据实际的模块表结构来查询
    // 暂时使用一个模拟的模块ID
    const moduleId = 'user-module-id' // 实际使用时需要查询数据库
    
    const results = []
    
    for (const directoryTemplate of template.directories) {
      console.log(`📁 创建目录: ${directoryTemplate.name}`)
      
      // 1. 创建目录
      const { directoryId, directoryDefId } = await createDirectory(
        applicationId,
        moduleId,
        directoryTemplate
      )
      
      // 2. 创建字段分类
      console.log(`📂 创建字段分类...`)
      const categoryMap = await createFieldCategories(
        applicationId,
        directoryId,
        directoryTemplate.categories
      )
      
      // 3. 创建字段定义
      console.log(`📋 创建字段定义...`)
      const fieldIds = await createFieldDefinitions(
        directoryDefId,
        directoryTemplate.fields,
        categoryMap
      )
      
      results.push({
        directoryId,
        categoryIds: categoryMap,
        fieldIds
      })
      
      console.log(`✅ 目录 ${directoryTemplate.name} 创建完成`)
      console.log(`   - 字段分类: ${Object.keys(categoryMap).length} 个`)
      console.log(`   - 字段定义: ${fieldIds.length} 个`)
    }
    
    console.log(`🎉 模板 ${templateName} 应用成功！`)
    
    return {
      success: true,
      message: `模板 ${templateName} 应用成功`,
      data: results[0] // 返回第一个目录的结果
    }
    
  } catch (error) {
    console.error('❌ 应用模板失败:', error)
    return {
      success: false,
      message: `应用模板失败: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

/**
 * 列出所有可用模板
 */
function listTemplates(): void {
  console.log('📋 可用模板:')
  Object.entries(templates).forEach(([name, template]) => {
    console.log(`  - ${name}: ${template.description}`)
    console.log(`    目录数量: ${template.directories.length}`)
    template.directories.forEach(dir => {
      console.log(`      - ${dir.name}: ${dir.fields.length} 个字段, ${dir.categories.length} 个分类`)
    })
  })
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('使用方法:')
    console.log('  npx tsx scripts/templates/index.ts <applicationId> <templateName>')
    console.log('  npx tsx scripts/templates/index.ts list  # 列出所有模板')
    console.log('')
    listTemplates()
    return
  }
  
  if (args[0] === 'list') {
    listTemplates()
    return
  }
  
  if (args.length < 2) {
    console.error('❌ 错误: 需要提供 applicationId 和 templateName')
    console.log('使用方法: npx tsx scripts/templates/index.ts <applicationId> <templateName>')
    return
  }
  
  const [applicationId, templateName] = args
  
  console.log(`🎯 应用ID: ${applicationId}`)
  console.log(`📦 模板名称: ${templateName}`)
  console.log('')
  
  const result = await applyTemplate(applicationId, templateName)
  
  if (result.success) {
    console.log(`✅ ${result.message}`)
    if (result.data) {
      console.log(`📊 创建结果:`)
      console.log(`   - 目录ID: ${result.data.directoryId}`)
      console.log(`   - 分类数量: ${Object.keys(result.data.categoryIds).length}`)
      console.log(`   - 字段数量: ${result.data.fieldIds.length}`)
    }
  } else {
    console.error(`❌ ${result.message}`)
    process.exit(1)
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error)
}

export { applyTemplate, listTemplates, templates }
