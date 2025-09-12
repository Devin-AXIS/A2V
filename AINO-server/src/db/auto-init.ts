import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import bcrypt from 'bcryptjs'
import { env } from '../env'
import * as schema from './schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
 * 检查索引是否存在
 */
async function checkIndexExists(indexName: string): Promise<boolean> {
    try {
        const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = $1
      )
    `, [indexName])
        return result.rows[0].exists
    } catch (error) {
        console.error(`检查索引 ${indexName} 时出错:`, error)
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
            console.log(`📋 创建表: ${tableName}`)
            await pool.query(createSQL)
            console.log(`✅ 表 ${tableName} 创建成功`)
        } else {
            console.log(`✅ 表 ${tableName} 已存在`)
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
            console.log(`📋 添加字段: ${tableName}.${columnName}`)
            await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnSQL}`)
            console.log(`✅ 字段 ${tableName}.${columnName} 添加成功`)
        } else {
            console.log(`✅ 字段 ${tableName}.${columnName} 已存在`)
        }
    } catch (error) {
        console.error(`添加字段 ${tableName}.${columnName} 失败:`, error.message)
        throw error
    }
}

/**
 * 动态创建索引
 */
async function createIndexIfNotExists(indexName: string, createSQL: string): Promise<void> {
    try {
        const exists = await checkIndexExists(indexName)
        if (!exists) {
            console.log(`📋 创建索引: ${indexName}`)
            await pool.query(createSQL)
            console.log(`✅ 索引 ${indexName} 创建成功`)
        } else {
            console.log(`✅ 索引 ${indexName} 已存在`)
        }
    } catch (error) {
        console.error(`创建索引 ${indexName} 失败:`, error.message)
        throw error
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
 * 执行SQL语句
 */
async function executeSQL(sql: string): Promise<void> {
    try {
        await pool.query(sql)
    } catch (error) {
        // 忽略已存在的错误
        if (!error.message.includes('already exists') &&
            !error.message.includes('relation') &&
            !error.message.includes('duplicate') &&
            !error.message.includes('constraint')) {
            console.warn('SQL执行警告:', error.message)
        }
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

        console.log('🚀 开始自动初始化数据库...')

        // 启用UUID扩展
        await executeSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        console.log('✅ UUID扩展已启用')

        // 读取并执行SQL文件
        const sqlFile = join(__dirname, '../../scripts/init-database.sql')
        const sqlContent = readFileSync(sqlFile, 'utf8')

        // 分割SQL语句并执行
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

        console.log(`📋 执行 ${statements.length} 个SQL语句...`)

        // 分批执行SQL语句，确保表创建完成
        const batchSize = 10
        for (let i = 0; i < statements.length; i += batchSize) {
            const batch = statements.slice(i, i + batchSize)
            console.log(`📋 执行批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(statements.length / batchSize)}...`)

            for (const statement of batch) {
                if (statement.trim()) {
                    await executeSQL(statement)
                }
            }

            // 每批次后等待一小段时间，确保表创建完成
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        console.log('✅ 数据库结构创建完成')

        // 验证表是否创建成功
        console.log('🔍 验证表创建状态...')
        const coreTables = ['users', 'applications', 'modules']
        const tableChecks = await Promise.all(
            coreTables.map(table => checkTableExists(table))
        )

        const allTablesExist = tableChecks.every(exists => exists)
        if (!allTablesExist) {
            console.warn('⚠️  部分核心表未创建成功，跳过默认数据创建')
            console.log('🎉 数据库自动初始化完成！')
            return true
        }

        console.log('✅ 核心表验证通过')

        // 创建基础数据
        await createDefaultData()

        console.log('🎉 数据库自动初始化完成！')
        return true

    } catch (error) {
        console.error('❌ 数据库自动初始化失败:', error.message)
        console.error('错误详情:', error)
        return false
    }
}

/**
 * 创建默认数据
 */
async function createDefaultData(): Promise<void> {
    try {
        console.log('📋 创建默认数据...')

        // 再次验证 users 表是否存在
        const usersTableExists = await checkTableExists('users')
        if (!usersTableExists) {
            console.warn('⚠️  users 表不存在，跳过默认数据创建')
            return
        }

        // 创建默认管理员用户
        const adminPassword = await bcrypt.hash('admin123', 10)
        await pool.query(`
      INSERT INTO users (id, name, email, password, roles, status) 
      VALUES (
        gen_random_uuid(),
        '系统管理员',
        'admin@aino.com',
        $1,
        ARRAY['admin', 'user'],
        'active'
      )
      ON CONFLICT (email) DO NOTHING
    `, [adminPassword])

        console.log('✅ 默认管理员用户创建完成 (admin@aino.com / admin123)')

        // 创建默认应用
        const adminUser = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@aino.com'])
        if (adminUser.rows.length > 0) {
            const adminUserId = adminUser.rows[0].id

            await pool.query(`
        INSERT INTO applications (id, name, description, slug, owner_id, status, template, config) 
        VALUES (
          gen_random_uuid(),
          '默认应用',
          '系统默认应用',
          'default-app',
          $1,
          'active',
          'blank',
          '{"theme": "default", "features": ["user-management", "data-management"]}'::jsonb
        )
        ON CONFLICT (slug) DO NOTHING
      `, [adminUserId])

            console.log('✅ 默认应用创建完成')

            // 创建默认模块
            const defaultApp = await pool.query('SELECT id FROM applications WHERE slug = $1', ['default-app'])
            if (defaultApp.rows.length > 0) {
                const appId = defaultApp.rows[0].id

                await pool.query(`
          INSERT INTO modules (id, application_id, name, type, config, "order", is_enabled) 
          VALUES 
            (gen_random_uuid(), $1, '用户管理', 'user-management', '{"permissions": ["read", "write"]}'::jsonb, 1, true),
            (gen_random_uuid(), $1, '数据管理', 'data-management', '{"permissions": ["read", "write"]}'::jsonb, 2, true),
            (gen_random_uuid(), $1, '系统设置', 'system-settings', '{"permissions": ["read", "write"]}'::jsonb, 3, true)
          ON CONFLICT DO NOTHING
        `, [appId])

                console.log('✅ 默认模块创建完成')
            }
        }

        console.log('✅ 默认数据创建完成')

    } catch (error) {
        console.error('❌ 创建默认数据失败:', error.message)
        throw error
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
 * 智能创建表和字段
 * 当服务需要访问某个表或字段时，如果不存在则自动创建
 */
export async function ensureTableExists(tableName: string, createSQL: string): Promise<void> {
    await createTableIfNotExists(tableName, createSQL)
}

export async function ensureColumnExists(tableName: string, columnName: string, columnSQL: string): Promise<void> {
    await addColumnIfNotExists(tableName, columnName, columnSQL)
}

export async function ensureIndexExists(indexName: string, createSQL: string): Promise<void> {
    await createIndexIfNotExists(indexName, createSQL)
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