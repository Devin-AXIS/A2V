import { Context, Next } from 'hono'
import { pool } from '../db'

/**
 * 数据库中间件
 * 自动处理表不存在的情况，尝试创建所需的表
 */
export async function databaseMiddleware(c: Context, next: Next) {
  // 添加重试计数器，避免无限循环
  const retryCount = c.get('dbRetryCount') || 0
  const maxRetries = 1 // 最多重试1次

  if (retryCount >= maxRetries) {
    console.error('❌ 数据库中间件重试次数超限，停止重试')
    throw new Error('数据库操作重试次数超限')
  }

  try {
    await next()
  } catch (error) {
    // 检查是否是表不存在的错误
    if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('⚠️  检测到表不存在错误，尝试自动创建...')

      // 尝试从错误信息中提取表名
      const tableMatch = error.message.match(/relation "([^"]+)" does not exist/)
      if (tableMatch) {
        const tableName = tableMatch[1]
        console.log(`📋 尝试创建表: ${tableName}`)

        try {
          // 根据表名创建对应的表
          await createTableByName(tableName)
          console.log(`✅ 表 ${tableName} 创建成功`)

          // 设置重试计数器并重新执行请求
          c.set('dbRetryCount', retryCount + 1)
          await next()
          return
        } catch (createError) {
          console.error(`❌ 创建表 ${tableName} 失败:`, createError.message)
        }
      }
    }

    // 如果不是表不存在的错误，或者创建失败，则抛出原始错误
    throw error
  }
}

/**
 * 根据表名创建对应的表
 */
async function createTableByName(tableName: string): Promise<void> {
  const tableDefinitions: Record<string, string> = {
    // 核心表定义
    'users': `
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        roles TEXT[] NOT NULL DEFAULT '{user}'::text[],
        avatar TEXT,
        status TEXT NOT NULL DEFAULT 'active'::text,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `,
    'applications': `
      CREATE TABLE applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        slug TEXT UNIQUE NOT NULL,
        owner_id UUID NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'::text,
        template TEXT DEFAULT 'blank'::text,
        config JSONB DEFAULT '{}'::jsonb,
        database_config JSONB DEFAULT '{}'::jsonb,
        is_public BOOLEAN DEFAULT false,
        version TEXT DEFAULT '1.0.0'::text,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `,
    'modules': `
      CREATE TABLE modules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT,
        config JSONB DEFAULT '{}'::jsonb,
        "order" INTEGER DEFAULT 0,
        is_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `,
    'directories': `
      CREATE TABLE directories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL,
        module_id UUID NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        supports_category BOOLEAN DEFAULT false,
        config JSONB DEFAULT '{}'::jsonb,
        "order" INTEGER DEFAULT 0,
        is_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `,
    'application_users': `
      CREATE TABLE application_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL,
        phone TEXT NOT NULL,
        password TEXT,
        status TEXT NOT NULL DEFAULT 'active'::text,
        role TEXT NOT NULL DEFAULT 'user'::text,
        metadata JSONB DEFAULT '{}'::jsonb,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `,
    'field_categories': `
      CREATE TABLE field_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL,
        directory_id UUID NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        "order" INTEGER DEFAULT 0,
        enabled BOOLEAN DEFAULT true,
        system BOOLEAN DEFAULT false,
        predefined_fields JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `,
    'record_categories': `
      CREATE TABLE record_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL,
        directory_id UUID NOT NULL,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        level INTEGER NOT NULL,
        parent_id UUID,
        "order" INTEGER DEFAULT 0,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `,
    'directory_defs': `
      CREATE TABLE directory_defs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        name TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'active'::text,
        application_id UUID,
        directory_id UUID,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `,
    'field_defs': `
      CREATE TABLE field_defs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        directory_id UUID NOT NULL,
        key TEXT NOT NULL,
        kind TEXT NOT NULL,
        type TEXT NOT NULL,
        schema JSONB,
        relation JSONB,
        lookup JSONB,
        computed JSONB,
        validators JSONB,
        read_roles JSONB DEFAULT '["admin", "member"]'::jsonb,
        write_roles JSONB DEFAULT '["admin"]'::jsonb,
        required BOOLEAN DEFAULT false,
        category_id UUID
      )
    `,
    'relation_records': `
      CREATE TABLE relation_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL,
        from_directory_id UUID NOT NULL,
        from_record_id UUID NOT NULL,
        from_field_key TEXT NOT NULL,
        to_directory_id UUID NOT NULL,
        to_record_id UUID NOT NULL,
        to_field_key TEXT,
        relation_type TEXT NOT NULL,
        bidirectional BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        created_by UUID
      )
    `,
    'module_installs': `
      CREATE TABLE module_installs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL,
        module_key TEXT NOT NULL,
        module_name TEXT NOT NULL,
        module_version TEXT NOT NULL,
        module_type TEXT NOT NULL,
        install_type TEXT NOT NULL,
        install_config JSONB DEFAULT '{}'::jsonb,
        install_status TEXT DEFAULT 'active'::text,
        install_error TEXT,
        installed_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        created_by UUID
      )
    `,
    'audit_logs': `
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID,
        user_id UUID,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        resource_id TEXT,
        details JSONB DEFAULT '{}'::jsonb,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `
  }

  const createSQL = tableDefinitions[tableName]
  if (!createSQL) {
    throw new Error(`未知的表名: ${tableName}`)
  }

  await pool.query(createSQL)

  // 创建基础索引
  await createBasicIndexes(tableName)
}

/**
 * 为表创建基础索引
 */
async function createBasicIndexes(tableName: string): Promise<void> {
  const indexDefinitions: Record<string, string[]> = {
    'users': [
      'CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at)',
      'CREATE INDEX IF NOT EXISTS users_status_idx ON users (status)',
      'CREATE INDEX IF NOT EXISTS users_email_unique_idx ON users (email)'
    ],
    'applications': [
      'CREATE INDEX IF NOT EXISTS applications_created_at_idx ON applications (created_at)',
      'CREATE INDEX IF NOT EXISTS applications_owner_status_idx ON applications (owner_id, status)',
      'CREATE INDEX IF NOT EXISTS applications_slug_unique_idx ON applications (slug)'
    ],
    'modules': [
      'CREATE INDEX IF NOT EXISTS modules_created_at_idx ON modules (created_at)',
      'CREATE INDEX IF NOT EXISTS modules_app_enabled_idx ON modules (application_id, is_enabled)'
    ],
    'directories': [
      'CREATE INDEX IF NOT EXISTS directories_created_at_idx ON directories (created_at)',
      'CREATE INDEX IF NOT EXISTS directories_app_module_idx ON directories (application_id, module_id)'
    ],
    'application_users': [
      'CREATE INDEX IF NOT EXISTS application_users_created_at_idx ON application_users (created_at)',
      'CREATE INDEX IF NOT EXISTS application_users_app_status_idx ON application_users (application_id, status)',
      'CREATE INDEX IF NOT EXISTS application_users_app_phone_idx ON application_users (application_id, phone)'
    ]
  }

  const indexes = indexDefinitions[tableName] || []
  for (const indexSQL of indexes) {
    try {
      await pool.query(indexSQL)
    } catch (error) {
      console.warn(`创建索引失败: ${indexSQL}`, error.message)
    }
  }
}
