#!/usr/bin/env node

/**
 * 测试API字段定义获取
 * 模拟记录创建API中的字段定义获取过程
 */

const { db } = require('../src/db/index.ts')
const { fieldDefs, directoryDefs } = require('../src/db/schema.ts')
const { eq } = require('drizzle-orm')
const { fieldProcessorManager } = require('../src/lib/field-processors.ts')

console.log('🔍 测试API字段定义获取...\n')

async function testApiFieldDefs() {
  try {
    const dir = '047f40ea-13ff-4ede-92e9-85694329f5f6'
    
    // 模拟API中的字段定义获取过程
    console.log('📋 步骤1: 获取目录定义')
    const directoryDef = await db.select().from(directoryDefs).where(eq(directoryDefs.directoryId, dir)).limit(1)
    console.log('  - 目录定义数量:', directoryDef.length)
    
    if (directoryDef.length === 0) {
      console.log('❌ 未找到目录定义')
      return
    }
    
    console.log('📋 步骤2: 获取字段定义')
    const fieldDefsResult = await db.select().from(fieldDefs).where(eq(fieldDefs.directoryId, directoryDef[0].id))
    console.log('  - 字段定义数量:', fieldDefsResult.length)
    
    // 模拟API中的字段定义映射
    console.log('📋 步骤3: 字段定义映射')
    const fieldDefinitions = fieldDefsResult.map(fd => ({
      id: fd.id,
      key: fd.key,
      kind: fd.kind,
      type: fd.type,
      schema: fd.schema,
      relation: fd.relation,
      lookup: fd.lookup,
      computed: fd.computed,
      validators: fd.validators,
      readRoles: fd.readRoles || [],
      writeRoles: fd.writeRoles || [],
      required: fd.required
    }))
    
    console.log('  - 映射后的字段定义数量:', fieldDefinitions.length)
    
    // 查找g_hcj1字段
    const g_hcj1_field = fieldDefinitions.find(fd => fd.key === 'g_hcj1')
    if (g_hcj1_field) {
      console.log('📋 步骤4: g_hcj1字段详情')
      console.log('  - 字段ID:', g_hcj1_field.id)
      console.log('  - 字段类型:', g_hcj1_field.type)
      console.log('  - 字段Schema:', g_hcj1_field.schema)
      
      // 测试字段处理器获取
      console.log('📋 步骤5: 字段处理器获取')
      const processor = fieldProcessorManager.getProcessor(g_hcj1_field.type)
      console.log('  - 获取的处理器:', processor ? '存在' : '不存在')
      console.log('  - 处理器类型:', typeof processor?.validate)
      
      // 测试验证
      console.log('📋 步骤6: 字段验证测试')
      const testData = [
        {
          id: 'exp_1',
          type: 'work',
          title: '测试职位',
          organization: '测试公司',
          startDate: '2023-01-01'
        }
      ]
      
      const validation = fieldProcessorManager.validateField(testData, g_hcj1_field)
      console.log('  - 验证结果:', validation)
      
      // 测试记录验证
      console.log('📋 步骤7: 记录验证测试')
      const recordData = { g_hcj1: testData }
      const recordValidation = fieldProcessorManager.validateRecord(recordData, [g_hcj1_field])
      console.log('  - 记录验证结果:', recordValidation)
      
    } else {
      console.log('❌ 未找到g_hcj1字段')
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message)
    console.error('📋 错误堆栈:', error.stack)
  }
}

testApiFieldDefs()
