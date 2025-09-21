#!/usr/bin/env node

/**
 * 直接查询数据库调试
 */

const { Pool } = require('pg')

async function debugDatabase() {
  console.log('🔍 直接查询数据库调试...')
  
  // 使用默认的PostgreSQL连接
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'aino',
    user: 'aino',
    password: 'pass'
  })
  
  try {
    // 1. 查询目录数据
    console.log('\n1. 查询目录数据...')
    const dirsResult = await pool.query('SELECT * FROM directories LIMIT 5')
    console.log('📋 目录数据:')
    dirsResult.rows.forEach((dir, index) => {
      console.log(`  ${index + 1}. ID: ${dir.id}, Name: ${dir.name}, ModuleId: ${dir.module_id}, ApplicationId: ${dir.application_id}`)
    })
    
    // 2. 查询模块数据
    console.log('\n2. 查询模块数据...')
    const modulesResult = await pool.query('SELECT * FROM modules LIMIT 5')
    console.log('📋 模块数据:')
    modulesResult.rows.forEach((module, index) => {
      console.log(`  ${index + 1}. ID: ${module.id}, Name: ${module.name}, ApplicationId: ${module.application_id}`)
    })
    
    // 3. 查询目录定义数据
    console.log('\n3. 查询目录定义数据...')
    const dirDefsResult = await pool.query('SELECT * FROM directory_defs LIMIT 5')
    console.log('📋 目录定义数据:')
    dirDefsResult.rows.forEach((dirDef, index) => {
      console.log(`  ${index + 1}. ID: ${dirDef.id}, DirectoryId: ${dirDef.directory_id}, Title: ${dirDef.title}`)
    })
    
    // 4. 查询字段定义数据
    console.log('\n4. 查询字段定义数据...')
    const fieldDefsResult = await pool.query('SELECT * FROM field_defs LIMIT 5')
    console.log('📋 字段定义数据:')
    fieldDefsResult.rows.forEach((fieldDef, index) => {
      console.log(`  ${index + 1}. ID: ${fieldDef.id}, Key: ${fieldDef.key}, Type: ${fieldDef.type}, DirectoryId: ${fieldDef.directory_id}`)
      if (fieldDef.schema) {
        try {
          const schema = JSON.parse(fieldDef.schema)
          if (schema.customExperienceConfig) {
            console.log(`      CustomExperienceConfig: ${JSON.stringify(schema.customExperienceConfig)}`)
          }
        } catch (e) {
          // 忽略JSON解析错误
        }
      }
    })
    
  } catch (error) {
    console.error('❌ 数据库查询失败:', error)
  } finally {
    await pool.end()
  }
}

// 运行调试
debugDatabase()
