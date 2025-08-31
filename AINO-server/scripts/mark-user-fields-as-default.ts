#!/usr/bin/env node

/**
 * 将用户列表目录的现有字段标记为默认字段
 * 默认字段的 key 和 type 不允许修改
 */

import { db } from '../src/db/index.ts'
import { fieldDefs, directoryDefs } from '../src/db/schema.ts'
import { eq } from 'drizzle-orm'

async function markUserFieldsAsDefault() {
  try {
    console.log('🔍 开始查找用户列表目录的字段...')
    
    // 1. 查找用户列表目录
    const userDirectories = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.title, '用户列表'))
      .limit(1)
    
    if (userDirectories.length === 0) {
      console.log('❌ 未找到用户列表目录')
      return
    }
    
    const userDirectory = userDirectories[0]
    console.log(`✅ 找到用户列表目录: ${userDirectory.title} (${userDirectory.slug})`)
    
    // 2. 获取该目录下的所有字段
    const fields = await db.select()
      .from(fieldDefs)
      .where(eq(fieldDefs.directoryId, userDirectory.id))
      .orderBy(fieldDefs.key)
    
    console.log(`📋 找到 ${fields.length} 个字段:`)
    fields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.key} (${field.type}) - 默认: ${field.isDefault ? '是' : '否'}`)
    })
    
    if (fields.length === 0) {
      console.log('❌ 该目录下没有字段')
      return
    }
    
    // 3. 将所有字段标记为默认字段
    console.log('\n🔄 开始标记字段为默认字段...')
    
    const updateResult = await db.update(fieldDefs)
      .set({ isDefault: true })
      .where(eq(fieldDefs.directoryId, userDirectory.id))
      .returning()
    
    console.log(`✅ 成功标记 ${updateResult.length} 个字段为默认字段`)
    
    // 4. 验证结果
    console.log('\n🔍 验证结果:')
    const verifyFields = await db.select()
      .from(fieldDefs)
      .where(eq(fieldDefs.directoryId, userDirectory.id))
      .orderBy(fieldDefs.key)
    
    verifyFields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.key} (${field.type}) - 默认: ${field.isDefault ? '✅ 是' : '❌ 否'}`)
    })
    
    console.log('\n🎉 完成！现在这些字段的 key 和 type 将受到保护，不允许修改。')
    console.log('💡 用户后续添加的新字段仍然可以自由编辑。')
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
  }
}

// 执行脚本
markUserFieldsAsDefault()
