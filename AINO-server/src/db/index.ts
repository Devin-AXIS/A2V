import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../env'
import * as schema from './schema'
import { autoInitDatabase, validateDatabase } from './auto-init'
import { smartDB } from './smart-db'

// 数据库连接配置
const PG_URL = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`

// 创建连接池
const pool = new Pool({
  connectionString: PG_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 增加连接超时时间到10秒
  ssl: false, // 禁用 SSL
})

// 创建 Drizzle 实例
export const db = drizzle(pool, { schema })

// 数据库初始化状态
let isInitialized = false

/**
 * 初始化数据库连接并自动创建表结构
 */
export async function initDatabase(): Promise<boolean> {
  if (isInitialized) {
    return true
  }

  try {
    console.log('🚀 初始化数据库连接...')
    console.log(`🔌 连接字符串: host=${env.DB_HOST} port=${env.DB_PORT} db=${env.DB_NAME} user=${env.DB_USER}`)

    // 自动初始化数据库
    const initSuccess = await autoInitDatabase()
    if (!initSuccess) {
      console.error('❌ 数据库自动初始化失败')
      return false
    }

    // 验证数据库结构
    const validationSuccess = await validateDatabase()
    if (!validationSuccess) {
      console.error('❌ 数据库结构验证失败')
      return false
    }

    isInitialized = true
    console.log('✅ 数据库初始化完成')
    return true

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    return false
  }
}

/**
 * 智能数据库操作
 * 在操作前自动检查并创建所需的表和字段
 */
export async function smartQuery(sql: string, params?: any[]): Promise<any> {
  try {
    return await smartDB.query(sql, params)
  } catch (error) {
    // 如果表不存在，尝试自动创建
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log(`⚠️  检测到表不存在，尝试自动创建并重试当前操作...`)
      try {
        const initOk = await autoInitDatabase()
        if (!initOk) {
          console.error('❌ 自动创建表失败：初始化流程未成功')
          throw error
        }
        // 初始化成功后重试一次
        return await smartDB.query(sql, params)
      } catch (retryErr) {
        // 重试失败则抛出原始错误以便上层定位
        throw error
      }
    }
    throw error
  }
}

/**
 * 确保表存在
 */
export async function ensureTable(tableName: string, createSQL: string): Promise<void> {
  await smartDB.ensureTable(tableName, createSQL)
}

/**
 * 确保字段存在
 */
export async function ensureColumn(tableName: string, columnName: string, columnSQL: string): Promise<void> {
  await smartDB.ensureColumn(tableName, columnName, columnSQL)
}

// 数据库健康检查
export async function pingDB() {
  try {
    const result = await pool.query('SELECT 1 as ok')
    return result.rows[0].ok === 1
  } catch (error) {
    console.error('Database ping failed:', error)
    return false
  }
}

// 关闭数据库连接
export async function closeDB() {
  await pool.end()
}

// 导出数据库实例
export { pool }
