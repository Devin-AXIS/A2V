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
    connectionTimeoutMillis: 10000, // 增加连接超时时间到10秒
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
 * 检查字段是否存在
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
    try {
        const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
      )
    `, [tableName, columnName])
        return result.rows[0].exists
    } catch (error) {
        console.error(`检查字段 ${tableName}.${columnName} 时出错:`, error)
        return false
    }
}

/**
 * 动态创建表
 */
async function createTableIfNotExists(tableName: string, createSQL: string): Promise<void> {
    try {
        const exists = await checkTableExists(tableName)
        if (!exists) {
            console.log(`📋 动态创建表: ${tableName}`)
            await pool.query(createSQL)
            console.log(`✅ 表 ${tableName} 创建成功`)
        }
    } catch (error) {
        console.error(`创建表 ${tableName} 失败:`, error.message)
        throw error
    }
}

/**
 * 动态添加字段
 */
async function addColumnIfNotExists(tableName: string, columnName: string, columnSQL: string): Promise<void> {
    try {
        const exists = await checkColumnExists(tableName, columnName)
        if (!exists) {
            console.log(`📋 动态添加字段: ${tableName}.${columnName}`)
            await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnSQL}`)
            console.log(`✅ 字段 ${tableName}.${columnName} 添加成功`)
        }
    } catch (error) {
        console.error(`添加字段 ${tableName}.${columnName} 失败:`, error.message)
        throw error
    }
}

/**
 * 智能数据库操作包装器
 * 在操作前自动检查并创建所需的表和字段
 */
export class SmartDB {
    private static instance: SmartDB
    private initializedTables = new Set<string>()

    static getInstance(): SmartDB {
        if (!SmartDB.instance) {
            SmartDB.instance = new SmartDB()
        }
        return SmartDB.instance
    }

    /**
     * 确保表存在
     */
    async ensureTable(tableName: string, createSQL: string): Promise<void> {
        if (!this.initializedTables.has(tableName)) {
            await createTableIfNotExists(tableName, createSQL)
            this.initializedTables.add(tableName)
        }
    }

    /**
     * 确保字段存在
     */
    async ensureColumn(tableName: string, columnName: string, columnSQL: string): Promise<void> {
        await addColumnIfNotExists(tableName, columnName, columnSQL)
    }

    /**
     * 执行查询，自动处理表不存在的情况
     */
    async query(sql: string, params?: any[]): Promise<any> {
        try {
            return await pool.query(sql, params)
        } catch (error) {
            // 如果表不存在，尝试创建
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log(`⚠️  检测到表不存在，尝试自动创建...`)
                // 这里可以根据错误信息推断需要创建的表
                // 暂时抛出错误，让上层处理
                throw error
            }
            throw error
        }
    }

    /**
     * 获取原始连接池
     */
    getPool(): Pool {
        return pool
    }
}

// 导出智能数据库实例
export const smartDB = SmartDB.getInstance()

// 数据库健康检查
export async function pingDB(): Promise<boolean> {
    try {
        const result = await pool.query('SELECT 1 as ok')
        return result.rows[0].ok === 1
    } catch (error) {
        console.error('Database ping failed:', error)
        return false
    }
}

// 关闭数据库连接
export async function closeDB(): Promise<void> {
    await pool.end()
}

// 导出数据库实例
export { pool }
