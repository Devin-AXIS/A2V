#!/usr/bin/env node

/**
 * 紧急数据隔离修复脚本
 * 解决不同目录数据共享同一个tenant_id的严重问题
 */

import { db } from '../src/db/index.js'
import { sql } from 'drizzle-orm'
import { dirUsers } from '../drizzle/schema.js'

async function fixDataIsolation() {
  console.log('🚨 开始修复数据隔离问题...')
  
  try {
    // 1. 检查当前数据状态
    console.log('\n📊 检查当前数据状态...')
    const currentData = await db.execute(sql`
      SELECT 
        id, 
        tenant_id, 
        props,
        created_at,
        updated_at,
        deleted_at
      FROM dir_users 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `)
    
    console.log(`当前活跃记录数量: ${currentData.rows.length}`)
    
    // 2. 分析数据，确定每个记录应该属于哪个目录
    console.log('\n🔍 分析数据归属...')
    
    const recordsByDirectory = {
      'user_list': [],      // 用户列表目录
      'user_tier': [],      // 用户分层目录
      'unknown': []         // 无法确定归属的记录
    }
    
    for (const record of currentData.rows) {
      const props = record.props
      
      // 根据记录内容判断归属
      if (props.l_86zx === '47bea03b-4837-4733-a8d2-99f787ede79d') {
        // 包含用户分层关联的记录，属于用户列表
        recordsByDirectory.user_list.push(record)
      } else if (props.h_1hr7) {
        // 包含h_1hr7字段的记录，属于用户分层
        recordsByDirectory.user_tier.push(record)
      } else {
        // 无法确定归属
        recordsByDirectory.unknown.push(record)
      }
    }
    
    console.log('数据归属分析结果:')
    console.log(`- 用户列表目录: ${recordsByDirectory.user_list.length} 条记录`)
    console.log(`- 用户分层目录: ${recordsByDirectory.user_tier.length} 条记录`)
    console.log(`- 未知归属: ${recordsByDirectory.unknown.length} 条记录`)
    
    // 3. 生成新的tenant_id (使用目录ID作为tenant_id)
    const tenantIds = {
      'user_list': '9cba325e-fe99-40d2-a699-a38a8fcbfba8',  // 用户列表目录ID
      'user_tier': '47bea03b-4837-4733-a8d2-99f787ede79d'   // 用户分层目录ID
    }
    
    // 4. 更新用户列表目录的记录
    if (recordsByDirectory.user_list.length > 0) {
      console.log('\n🔄 更新用户列表目录的记录...')
      
      for (const record of recordsByDirectory.user_list) {
        await db.execute(sql`
          UPDATE dir_users 
          SET tenant_id = ${tenantIds.user_list}
          WHERE id = ${record.id}
        `)
      }
      
      console.log(`✅ 已更新 ${recordsByDirectory.user_list.length} 条用户列表记录`)
    }
    
    // 5. 更新用户分层目录的记录
    if (recordsByDirectory.user_tier.length > 0) {
      console.log('\n🔄 更新用户分层目录的记录...')
      
      for (const record of recordsByDirectory.user_tier) {
        await db.execute(sql`
          UPDATE dir_users 
          SET tenant_id = ${tenantIds.user_tier}
          WHERE id = ${record.id}
        `)
      }
      
      console.log(`✅ 已更新 ${recordsByDirectory.user_tier.length} 条用户分层记录`)
    }
    
    // 6. 处理未知归属的记录
    if (recordsByDirectory.unknown.length > 0) {
      console.log('\n⚠️  处理未知归属的记录...')
      
      // 将未知记录标记为已删除，避免数据混乱
      const unknownIds = recordsByDirectory.unknown.map(r => r.id)
      await db.execute(sql`
        UPDATE dir_users 
        SET deleted_at = NOW()
        WHERE id = ANY(${unknownIds})
      `)
      
      console.log(`⚠️  已将 ${unknownIds.length} 条未知记录标记为已删除`)
    }
    
    // 7. 验证修复结果
    console.log('\n✅ 验证修复结果...')
    
    const verification = await db.execute(sql`
      SELECT 
        tenant_id,
        COUNT(*) as count
      FROM dir_users 
      WHERE deleted_at IS NULL
      GROUP BY tenant_id
      ORDER BY tenant_id
    `)
    
    console.log('修复后的数据分布:')
    verification.rows.forEach(row => {
      console.log(`- tenant_id: ${row.tenant_id} (记录数: ${row.count})`)
    })
    
    console.log('\n🎉 数据隔离修复完成！')
    console.log('\n📋 修复总结:')
    console.log(`- 用户列表目录 (${tenantIds.user_list}): ${recordsByDirectory.user_list.length} 条记录`)
    console.log(`- 用户分层目录 (${tenantIds.user_tier}): ${recordsByDirectory.user_tier.length} 条记录`)
    console.log(`- 已删除未知记录: ${recordsByDirectory.unknown.length} 条`)
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error)
    throw error
  }
}

// 执行修复
fixDataIsolation()
  .then(() => {
    console.log('\n✅ 数据隔离修复脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 数据隔离修复脚本执行失败:', error)
    process.exit(1)
  })
