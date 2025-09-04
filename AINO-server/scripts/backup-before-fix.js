#!/usr/bin/env node

/**
 * 数据备份脚本 - 在修复数据隔离问题前备份所有数据
 */

import { db } from '../src/db/index.js'
import { sql } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'

async function backupData() {
  console.log('💾 开始备份数据...')
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(process.cwd(), 'backups', timestamp)
    
    // 创建备份目录
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    console.log(`📁 备份目录: ${backupDir}`)
    
    // 1. 备份所有记录
    console.log('\n📊 备份所有记录...')
    const allRecords = await db.execute(sql`
      SELECT 
        id, 
        tenant_id, 
        props,
        created_at,
        updated_at,
        deleted_at
      FROM dir_users 
      ORDER BY created_at DESC
    `)
    
    const recordsBackup = {
      timestamp: new Date().toISOString(),
      totalRecords: allRecords.rows.length,
      records: allRecords.rows
    }
    
    fs.writeFileSync(
      path.join(backupDir, 'records-backup.json'),
      JSON.stringify(recordsBackup, null, 2)
    )
    
    console.log(`✅ 已备份 ${allRecords.rows.length} 条记录`)
    
    // 2. 备份目录信息
    console.log('\n📁 备份目录信息...')
    const directories = await db.execute(sql`
      SELECT 
        id,
        name,
        type,
        application_id,
        created_at,
        updated_at
      FROM directories 
      ORDER BY created_at DESC
    `)
    
    const dirsBackup = {
      timestamp: new Date().toISOString(),
      totalDirectories: directories.rows.length,
      directories: directories.rows
    }
    
    fs.writeFileSync(
      path.join(backupDir, 'directories-backup.json'),
      JSON.stringify(dirsBackup, null, 2)
    )
    
    console.log(`✅ 已备份 ${directories.rows.length} 个目录`)
    
    // 3. 备份字段定义
    console.log('\n🔧 备份字段定义...')
    const fieldDefs = await db.execute(sql`
      SELECT 
        id,
        key,
        kind,
        type,
        directory_id,
        schema,
        relation,
        lookup,
        computed,
        validators,
        read_roles,
        write_roles,
        required
      FROM field_defs 
      ORDER BY id
    `)
    
    const fieldsBackup = {
      timestamp: new Date().toISOString(),
      totalFieldDefs: fieldDefs.rows.length,
      fieldDefs: fieldDefs.rows
    }
    
    fs.writeFileSync(
      path.join(backupDir, 'field-defs-backup.json'),
      JSON.stringify(fieldsBackup, null, 2)
    )
    
    console.log(`✅ 已备份 ${fieldDefs.rows.length} 个字段定义`)
    
    // 4. 创建备份摘要
    const summary = {
      timestamp: new Date().toISOString(),
      backupLocation: backupDir,
      summary: {
        totalRecords: allRecords.rows.length,
        totalDirectories: directories.rows.length,
        totalFieldDefs: fieldDefs.rows.length
      },
      files: [
        'records-backup.json',
        'directories-backup.json',
        'field-defs-backup.json'
      ]
    }
    
    fs.writeFileSync(
      path.join(backupDir, 'backup-summary.json'),
      JSON.stringify(summary, null, 2)
    )
    
    console.log('\n🎉 数据备份完成！')
    console.log(`📁 备份位置: ${backupDir}`)
    console.log('📄 备份文件:')
    console.log('  - records-backup.json (所有记录)')
    console.log('  - directories-backup.json (目录信息)')
    console.log('  - field-defs-backup.json (字段定义)')
    console.log('  - backup-summary.json (备份摘要)')
    
  } catch (error) {
    console.error('❌ 备份失败:', error)
    process.exit(1)
  }
}

backupData()
