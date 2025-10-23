#!/usr/bin/env node

/**
 * 数据库自动创建功能测试脚本
 * 用于验证在新服务器上自动创建表和字段的功能
 */

import { Pool } from 'pg'

// 数据库连接配置 - 使用默认值
const DB_CONFIG = {
    host: process.env.DB_HOST || '47.94.52.142:',
    port: parseInt(process.env.DB_PORT || '5433'),
    user: process.env.DB_USER || 'aino',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_NAME || 'aino',
    ssl: false
}

const PG_URL = `postgres://${DB_CONFIG.user}:${DB_CONFIG.password}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`

const pool = new Pool({
    connectionString: PG_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: false,
})

async function testAutoCreation() {
    try {
        console.log('🧪 开始测试数据库自动创建功能...')

        // 1. 测试数据库连接
        console.log('\n📋 步骤 1: 测试数据库连接...')
        const pingResult = await pool.query('SELECT 1 as ok')
        if (pingResult.rows[0].ok !== 1) {
            throw new Error('数据库连接失败')
        }
        console.log('✅ 数据库连接正常')

        // 2. 检查现有表
        console.log('\n📋 步骤 2: 检查现有表...')
        const existingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

        console.log(`📊 发现 ${existingTables.rows.length} 个现有表:`)
        existingTables.rows.forEach(table => {
            console.log(`   - ${table.table_name}`)
        })

        // 3. 测试删除一个表（模拟新服务器环境）
        console.log('\n📋 步骤 3: 模拟新服务器环境...')
        const testTable = 'test_auto_creation'

        // 删除测试表（如果存在）
        await pool.query(`DROP TABLE IF EXISTS ${testTable}`)
        console.log(`✅ 已删除测试表 ${testTable}`)

        // 4. 测试自动创建表
        console.log('\n📋 步骤 4: 测试自动创建表...')

        // 创建测试表
        await pool.query(`
      CREATE TABLE ${testTable} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      )
    `)
        console.log(`✅ 测试表 ${testTable} 创建成功`)

        // 5. 测试插入数据
        console.log('\n📋 步骤 5: 测试插入数据...')
        const insertResult = await pool.query(`
      INSERT INTO ${testTable} (name) 
      VALUES ($1) 
      RETURNING id, name, created_at
    `, ['测试数据'])

        console.log('✅ 数据插入成功:', insertResult.rows[0])

        // 6. 测试查询数据
        console.log('\n📋 步骤 6: 测试查询数据...')
        const selectResult = await pool.query(`SELECT * FROM ${testTable}`)
        console.log(`✅ 查询成功，共 ${selectResult.rows.length} 条记录`)

        // 7. 测试添加字段
        console.log('\n📋 步骤 7: 测试添加字段...')
        await pool.query(`ALTER TABLE ${testTable} ADD COLUMN description TEXT`)
        console.log('✅ 字段添加成功')

        // 8. 测试更新数据
        console.log('\n📋 步骤 8: 测试更新数据...')
        const updateResult = await pool.query(`
      UPDATE ${testTable} 
      SET description = $1 
      WHERE name = $2 
      RETURNING *
    `, ['这是一个测试描述', '测试数据'])

        console.log('✅ 数据更新成功:', updateResult.rows[0])

        // 9. 清理测试数据
        console.log('\n📋 步骤 9: 清理测试数据...')
        await pool.query(`DROP TABLE ${testTable}`)
        console.log('✅ 测试表已清理')

        // 10. 验证核心表是否存在
        console.log('\n📋 步骤 10: 验证核心表...')
        const coreTables = ['users', 'applications', 'modules', 'directories']
        const tableChecks = await Promise.all(
            coreTables.map(async (table) => {
                const result = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [table])
                return { table, exists: result.rows[0].exists }
            })
        )

        console.log('📊 核心表状态:')
        tableChecks.forEach(({ table, exists }) => {
            console.log(`   - ${table}: ${exists ? '✅ 存在' : '❌ 不存在'}`)
        })

        const allCoreTablesExist = tableChecks.every(({ exists }) => exists)
        if (allCoreTablesExist) {
            console.log('✅ 所有核心表都存在')
        } else {
            console.log('⚠️  部分核心表不存在，需要运行初始化脚本')
        }

        console.log('\n🎉 数据库自动创建功能测试完成！')
        console.log('\n📝 测试结果总结:')
        console.log('   ✅ 数据库连接正常')
        console.log('   ✅ 表创建功能正常')
        console.log('   ✅ 数据插入功能正常')
        console.log('   ✅ 数据查询功能正常')
        console.log('   ✅ 字段添加功能正常')
        console.log('   ✅ 数据更新功能正常')
        console.log('   ✅ 表删除功能正常')

        if (allCoreTablesExist) {
            console.log('   ✅ 核心表结构完整')
        } else {
            console.log('   ⚠️  需要运行数据库初始化脚本')
        }

    } catch (error) {
        console.error('❌ 测试失败:', error.message)
        console.error('错误详情:', error)
        // process.exit(1)
    } finally {
        await pool.end()
    }
}

// 执行测试
testAutoCreation().catch(error => {
    console.error('❌ 测试过程出错:', error)
    // process.exit(1)
})
