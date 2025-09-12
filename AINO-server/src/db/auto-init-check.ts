import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../env'
import * as schema from './schema'

// 数据库连接配置
const PG_URL = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`

// 创建连接池
const pool = new Pool({
    connectionString: PG_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: false,
})

// 创建 Drizzle 实例
export const db = drizzle(pool, { schema })

/**
 * 检查表是否存在
 */
async function checkTableExists(tableName: string): Promise<boolean> {
    try {
        const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName])
        return result.rows[0].exists
    } catch (error) {
        console.error(`检查表 ${tableName} 时出错:`, error)
        return false
    }
}

/**
 * 检查数据库是否已初始化
 */
async function isDatabaseInitialized(): Promise<boolean> {
    try {
        // 检查核心表是否存在
        const coreTables = ['users', 'applications', 'modules', 'directories']
        const tableChecks = await Promise.all(
            coreTables.map(table => checkTableExists(table))
        )

        // 如果所有核心表都存在，认为数据库已初始化
        return tableChecks.every(exists => exists)
    } catch (error) {
        console.error('检查数据库初始化状态时出错:', error)
        return false
    }
}

/**
 * 自动初始化数据库
 */
export async function autoInitDatabase(): Promise<boolean> {
    try {
        console.log('🔍 检查数据库初始化状态...')

        // 检查数据库连接
        const pingResult = await pool.query('SELECT 1 as ok')
        if (pingResult.rows[0].ok !== 1) {
            throw new Error('数据库连接失败')
        }
        console.log('✅ 数据库连接正常')

        // 检查是否已初始化
        const isInitialized = await isDatabaseInitialized()
        if (isInitialized) {
            console.log('✅ 数据库已初始化，跳过自动创建')
            return true
        }

        console.log('🚀 数据库未初始化，需要手动运行初始化脚本')
        console.log('📋 请执行以下命令初始化数据库:')
        console.log('   node scripts/init-database.js')
        console.log('   或者')
        console.log('   ./scripts/setup-database.sh')

        return false

    } catch (error) {
        console.error('❌ 数据库检查失败:', error.message)
        console.error('错误详情:', error)
        return false
    }
}

/**
 * 验证数据库结构
 */
export async function validateDatabase(): Promise<boolean> {
    try {
        console.log('🔍 验证数据库结构...')

        // 验证表是否创建成功
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

        console.log(`✅ 发现 ${tables.rows.length} 个表:`)
        tables.rows.forEach(table => {
            console.log(`   - ${table.table_name}`)
        })

        // 验证索引
        const indexes = await pool.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
    `)

        console.log(`✅ 发现 ${indexes.rows[0].count} 个索引`)

        // 验证外键约束
        const foreignKeys = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
    `)

        console.log(`✅ 发现 ${foreignKeys.rows[0].count} 个外键约束`)

        return true

    } catch (error) {
        console.error('❌ 数据库验证失败:', error.message)
        return false
    }
}

/**
 * 数据库健康检查
 */
export async function pingDB(): Promise<boolean> {
    try {
        const result = await pool.query('SELECT 1 as ok')
        return result.rows[0].ok === 1
    } catch (error) {
        console.error('Database ping failed:', error)
        return false
    }
}

/**
 * 关闭数据库连接
 */
export async function closeDB(): Promise<void> {
    await pool.end()
}

// 导出数据库实例
export { pool }
