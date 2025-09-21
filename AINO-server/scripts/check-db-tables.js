#!/usr/bin/env node

/**
 * 检查数据库表是否存在
 */

const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'aino',
  password: 'pass',
  database: 'aino',
})

async function checkTables() {
  try {
    console.log('🔍 检查数据库表...')
    
    // 检查应用表
    const appsResult = await pool.query("SELECT COUNT(*) FROM applications")
    console.log(`✅ applications 表: ${appsResult.rows[0].count} 条记录`)
    
    // 检查模块表
    const modulesResult = await pool.query("SELECT COUNT(*) FROM modules")
    console.log(`✅ modules 表: ${modulesResult.rows[0].count} 条记录`)
    
    // 检查目录表
    try {
      const directoriesResult = await pool.query("SELECT COUNT(*) FROM directories")
      console.log(`✅ directories 表: ${directoriesResult.rows[0].count} 条记录`)
    } catch (error) {
      console.log(`❌ directories 表不存在: ${error.message}`)
    }
    
    // 检查字段表
    try {
      const fieldsResult = await pool.query("SELECT COUNT(*) FROM fields")
      console.log(`✅ fields 表: ${fieldsResult.rows[0].count} 条记录`)
    } catch (error) {
      console.log(`❌ fields 表不存在: ${error.message}`)
    }
    
    // 检查应用用户表
    try {
      const appUsersResult = await pool.query("SELECT COUNT(*) FROM application_users")
      console.log(`✅ application_users 表: ${appUsersResult.rows[0].count} 条记录`)
    } catch (error) {
      console.log(`❌ application_users 表不存在: ${error.message}`)
    }
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
  } finally {
    await pool.end()
  }
}

checkTables()
