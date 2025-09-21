#!/usr/bin/env node

/**
 * 检查目录表结构
 */

const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'aino',
  password: 'pass',
  database: 'aino',
})

async function checkDirectoriesTable() {
  try {
    console.log('🔍 检查目录表结构...\n')
    
    // 获取表结构
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'directories' 
      ORDER BY ordinal_position
    `)
    
    console.log('📋 目录表字段结构:')
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
    })
    
    console.log('\n📋 目录表数据示例:')
    const dataResult = await pool.query('SELECT * FROM directories LIMIT 1')
    if (dataResult.rows.length > 0) {
      console.log(JSON.stringify(dataResult.rows[0], null, 2))
    } else {
      console.log('   表为空')
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
  } finally {
    await pool.end()
  }
}

checkDirectoriesTable()
