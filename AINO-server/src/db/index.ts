import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
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
  ssl: false, // 禁用 SSL
})

// 创建 Drizzle 实例
export const db = drizzle(pool, { schema })

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
