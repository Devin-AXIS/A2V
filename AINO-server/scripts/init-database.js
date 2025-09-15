#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于创建和更新数据库表结构
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'aino',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
}

// 创建数据库连接
const client = new Client(dbConfig)

// 确保表存在的函数
async function ensureTableExists(tableName, createSQL, constraints = [], indexes = [], columns = []) {
  try {
    // 检查表是否存在
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName])

    if (!tableExists.rows[0].exists) {
      console.log(`📋 创建表: ${tableName}`)
      await client.query(createSQL)
      
      // 创建约束
      for (const constraint of constraints) {
        await client.query(constraint)
      }
      
      // 创建索引
      for (const index of indexes) {
        await client.query(index)
      }
      
      console.log(`✅ 表 ${tableName} 创建成功`)
    } else {
      console.log(`ℹ️  表 ${tableName} 已存在，检查字段...`)
      
      // 检查并添加缺失的字段
      for (const column of columns) {
        const columnExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1 
            AND column_name = $2
          );
        `, [tableName, column.name])

        if (!columnExists.rows[0].exists) {
          console.log(`📝 添加字段: ${tableName}.${column.name}`)
          await client.query(`ALTER TABLE ${tableName} ADD COLUMN ${column.sql}`)
        }
      }
    }
  } catch (error) {
    console.error(`❌ 处理表 ${tableName} 时出错:`, error.message)
    throw error
  }
}

// 主函数
async function initDatabase() {
  try {
    console.log('🚀 开始初始化数据库...')
    
    // 连接数据库
    await client.connect()
    console.log('✅ 数据库连接成功')

    // 1. users 表
    await ensureTableExists('users', `
        CREATE TABLE users (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT,
            avatar TEXT,
            roles JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
        'ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id)',
        'ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email)'
    ], [
        'CREATE INDEX idx_users_email ON users (email)',
        'CREATE INDEX idx_users_created_at ON users (created_at)'
    ], [
        { name: 'email', sql: 'email TEXT NOT NULL' },
        { name: 'name', sql: 'name TEXT NOT NULL' },
        { name: 'password_hash', sql: 'password_hash TEXT' },
        { name: 'avatar', sql: 'avatar TEXT' },
        { name: 'roles', sql: 'roles JSONB DEFAULT \'[]\'::jsonb' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' }
    ])

    // 2. applications 表
    await ensureTableExists('applications', `
        CREATE TABLE applications (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            status TEXT DEFAULT 'active',
            config JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            created_by UUID
        )
    `, [
        'ALTER TABLE applications ADD CONSTRAINT applications_pkey PRIMARY KEY (id)',
        'ALTER TABLE applications ADD CONSTRAINT applications_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)'
    ], [
        'CREATE INDEX idx_applications_created_by ON applications (created_by)',
        'CREATE INDEX idx_applications_created_at ON applications (created_at)',
        'CREATE INDEX idx_applications_status ON applications (status)'
    ], [
        { name: 'name', sql: 'name TEXT NOT NULL' },
        { name: 'description', sql: 'description TEXT' },
        { name: 'icon', sql: 'icon TEXT' },
        { name: 'status', sql: 'status TEXT DEFAULT \'active\'' },
        { name: 'config', sql: 'config JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' },
        { name: 'created_by', sql: 'created_by UUID' }
    ])

    // 3. directories 表
    await ensureTableExists('directories', `
        CREATE TABLE directories (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            slug TEXT,
            icon TEXT,
            config JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            created_by UUID
        )
    `, [
        'ALTER TABLE directories ADD CONSTRAINT directories_pkey PRIMARY KEY (id)',
        'ALTER TABLE directories ADD CONSTRAINT directories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
        'ALTER TABLE directories ADD CONSTRAINT directories_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)'
    ], [
        'CREATE INDEX idx_directories_app ON directories (application_id)',
        'CREATE INDEX idx_directories_created_at ON directories (created_at)',
        'CREATE INDEX idx_directories_slug ON directories (slug)'
    ], [
        { name: 'application_id', sql: 'application_id UUID NOT NULL' },
        { name: 'name', sql: 'name TEXT NOT NULL' },
        { name: 'description', sql: 'description TEXT' },
        { name: 'slug', sql: 'slug TEXT' },
        { name: 'icon', sql: 'icon TEXT' },
        { name: 'config', sql: 'config JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' },
        { name: 'created_by', sql: 'created_by UUID' }
    ])

    // 4. field_categories 表
    await ensureTableExists('field_categories', `
        CREATE TABLE field_categories (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            created_by UUID
        )
    `, [
        'ALTER TABLE field_categories ADD CONSTRAINT field_categories_pkey PRIMARY KEY (id)',
        'ALTER TABLE field_categories ADD CONSTRAINT field_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
        'ALTER TABLE field_categories ADD CONSTRAINT field_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)'
    ], [
        'CREATE INDEX idx_field_categories_app ON field_categories (application_id)',
        'CREATE INDEX idx_field_categories_created_at ON field_categories (created_at)',
        'CREATE INDEX idx_field_categories_sort ON field_categories (sort_order)'
    ], [
        { name: 'application_id', sql: 'application_id UUID NOT NULL' },
        { name: 'name', sql: 'name TEXT NOT NULL' },
        { name: 'description', sql: 'description TEXT' },
        { name: 'icon', sql: 'icon TEXT' },
        { name: 'sort_order', sql: 'sort_order INTEGER DEFAULT 0' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' },
        { name: 'created_by', sql: 'created_by UUID' }
    ])

    // 5. field_definitions 表
    await ensureTableExists('field_definitions', `
        CREATE TABLE field_definitions (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            category_id UUID,
            key TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            config JSONB DEFAULT '{}'::jsonb,
            validation JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            created_by UUID
        )
    `, [
        'ALTER TABLE field_definitions ADD CONSTRAINT field_definitions_pkey PRIMARY KEY (id)',
        'ALTER TABLE field_definitions ADD CONSTRAINT field_definitions_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
        'ALTER TABLE field_definitions ADD CONSTRAINT field_definitions_category_id_fkey FOREIGN KEY (category_id) REFERENCES field_categories(id) ON DELETE SET NULL',
        'ALTER TABLE field_definitions ADD CONSTRAINT field_definitions_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)'
    ], [
        'CREATE INDEX idx_field_definitions_app ON field_definitions (application_id)',
        'CREATE INDEX idx_field_definitions_category ON field_definitions (category_id)',
        'CREATE INDEX idx_field_definitions_created_at ON field_definitions (created_at)',
        'CREATE INDEX idx_field_definitions_key ON field_definitions (key)'
    ], [
        { name: 'application_id', sql: 'application_id UUID NOT NULL' },
        { name: 'category_id', sql: 'category_id UUID' },
        { name: 'key', sql: 'key TEXT NOT NULL' },
        { name: 'name', sql: 'name TEXT NOT NULL' },
        { name: 'type', sql: 'type TEXT NOT NULL' },
        { name: 'config', sql: 'config JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'validation', sql: 'validation JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' },
        { name: 'created_by', sql: 'created_by UUID' }
    ])

    // 6. records 表
    await ensureTableExists('records', `
        CREATE TABLE records (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            directory_id UUID NOT NULL,
            props JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            created_by UUID
        )
    `, [
        'ALTER TABLE records ADD CONSTRAINT records_pkey PRIMARY KEY (id)',
        'ALTER TABLE records ADD CONSTRAINT records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES applications(id) ON DELETE CASCADE',
        'ALTER TABLE records ADD CONSTRAINT records_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id) ON DELETE CASCADE',
        'ALTER TABLE records ADD CONSTRAINT records_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)'
    ], [
        'CREATE INDEX idx_records_tenant ON records (tenant_id)',
        'CREATE INDEX idx_records_directory ON records (directory_id)',
        'CREATE INDEX idx_records_created_at ON records (created_at)',
        'CREATE INDEX idx_records_created_by ON records (created_by)'
    ], [
        { name: 'tenant_id', sql: 'tenant_id UUID NOT NULL' },
        { name: 'directory_id', sql: 'directory_id UUID NOT NULL' },
        { name: 'props', sql: 'props JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' },
        { name: 'created_by', sql: 'created_by UUID' }
    ])

    // 7. modules 表
    await ensureTableExists('modules', `
        CREATE TABLE modules (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            key TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            version TEXT NOT NULL,
            type TEXT NOT NULL,
            config JSONB DEFAULT '{}'::jsonb,
            manifest JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
        'ALTER TABLE modules ADD CONSTRAINT modules_pkey PRIMARY KEY (id)',
        'ALTER TABLE modules ADD CONSTRAINT modules_key_key UNIQUE (key)'
    ], [
        'CREATE INDEX idx_modules_key ON modules (key)',
        'CREATE INDEX idx_modules_type ON modules (type)',
        'CREATE INDEX idx_modules_created_at ON modules (created_at)'
    ], [
        { name: 'key', sql: 'key TEXT NOT NULL' },
        { name: 'name', sql: 'name TEXT NOT NULL' },
        { name: 'description', sql: 'description TEXT' },
        { name: 'version', sql: 'version TEXT NOT NULL' },
        { name: 'type', sql: 'type TEXT NOT NULL' },
        { name: 'config', sql: 'config JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'manifest', sql: 'manifest JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' }
    ])

    // 8. module_installs 表
    await ensureTableExists('module_installs', `
        CREATE TABLE module_installs (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            module_key TEXT NOT NULL,
            module_name TEXT NOT NULL,
            module_version TEXT NOT NULL,
            module_type TEXT NOT NULL,
            module_icon TEXT NULL,
            install_type TEXT NOT NULL,
            install_config JSONB NULL DEFAULT '{}'::jsonb,
            install_status TEXT NULL DEFAULT 'active'::text,
            install_error TEXT NULL,
            installed_at TIMESTAMP NULL DEFAULT now(),
            updated_at TIMESTAMP NULL DEFAULT now(),
            created_by UUID NULL
        )
    `, [
        'ALTER TABLE module_installs ADD CONSTRAINT module_installs_pkey PRIMARY KEY (id)',
        'ALTER TABLE module_installs ADD CONSTRAINT module_installs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
        'ALTER TABLE module_installs ADD CONSTRAINT module_installs_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)',
        'ALTER TABLE module_installs ADD CONSTRAINT module_installs_application_id_module_key_key UNIQUE (application_id, module_key)'
    ], [
        'CREATE INDEX idx_module_installs_app ON module_installs (application_id)',
        'CREATE INDEX idx_module_installs_created_at ON module_installs (installed_at)',
        'CREATE INDEX idx_module_installs_status ON module_installs (install_status)',
        'CREATE INDEX idx_module_installs_type ON module_installs (module_type)'
    ], [
        { name: 'application_id', sql: 'application_id UUID NOT NULL' },
        { name: 'module_key', sql: 'module_key TEXT NOT NULL' },
        { name: 'module_name', sql: 'module_name TEXT NOT NULL' },
        { name: 'module_version', sql: 'module_version TEXT NOT NULL' },
        { name: 'module_type', sql: 'module_type TEXT NOT NULL' },
        { name: 'module_icon', sql: 'module_icon TEXT' },
        { name: 'install_type', sql: 'install_type TEXT NOT NULL' },
        { name: 'install_config', sql: 'install_config JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'install_status', sql: 'install_status TEXT DEFAULT \'active\'::text' },
        { name: 'install_error', sql: 'install_error TEXT' },
        { name: 'installed_at', sql: 'installed_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' },
        { name: 'created_by', sql: 'created_by UUID' }
    ])

    // 9. application_users 表
    await ensureTableExists('application_users', `
        CREATE TABLE application_users (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            user_id UUID NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            permissions JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
        'ALTER TABLE application_users ADD CONSTRAINT application_users_pkey PRIMARY KEY (id)',
        'ALTER TABLE application_users ADD CONSTRAINT application_users_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
        'ALTER TABLE application_users ADD CONSTRAINT application_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
        'ALTER TABLE application_users ADD CONSTRAINT application_users_application_id_user_id_key UNIQUE (application_id, user_id)'
    ], [
        'CREATE INDEX idx_application_users_app ON application_users (application_id)',
        'CREATE INDEX idx_application_users_user ON application_users (user_id)',
        'CREATE INDEX idx_application_users_role ON application_users (role)',
        'CREATE INDEX idx_application_users_created_at ON application_users (created_at)'
    ], [
        { name: 'application_id', sql: 'application_id UUID NOT NULL' },
        { name: 'user_id', sql: 'user_id UUID NOT NULL' },
        { name: 'role', sql: 'role TEXT NOT NULL DEFAULT \'user\'' },
        { name: 'permissions', sql: 'permissions JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' }
    ])

    // 10. record_categories 表
    await ensureTableExists('record_categories', `
        CREATE TABLE record_categories (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            directory_id UUID NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            created_by UUID
        )
    `, [
        'ALTER TABLE record_categories ADD CONSTRAINT record_categories_pkey PRIMARY KEY (id)',
        'ALTER TABLE record_categories ADD CONSTRAINT record_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
        'ALTER TABLE record_categories ADD CONSTRAINT record_categories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id) ON DELETE CASCADE',
        'ALTER TABLE record_categories ADD CONSTRAINT record_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)'
    ], [
        'CREATE INDEX idx_record_categories_app ON record_categories (application_id)',
        'CREATE INDEX idx_record_categories_directory ON record_categories (directory_id)',
        'CREATE INDEX idx_record_categories_created_at ON record_categories (created_at)',
        'CREATE INDEX idx_record_categories_sort ON record_categories (sort_order)'
    ], [
        { name: 'application_id', sql: 'application_id UUID NOT NULL' },
        { name: 'directory_id', sql: 'directory_id UUID NOT NULL' },
        { name: 'name', sql: 'name TEXT NOT NULL' },
        { name: 'description', sql: 'description TEXT' },
        { name: 'icon', sql: 'icon TEXT' },
        { name: 'sort_order', sql: 'sort_order INTEGER DEFAULT 0' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' },
        { name: 'created_by', sql: 'created_by UUID' }
    ])

    // 11. relation_records 表
    await ensureTableExists('relation_records', `
        CREATE TABLE relation_records (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            source_record_id UUID NOT NULL,
            target_record_id UUID NOT NULL,
            relation_type TEXT NOT NULL,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT now(),
            created_by UUID
        )
    `, [
        'ALTER TABLE relation_records ADD CONSTRAINT relation_records_pkey PRIMARY KEY (id)',
        'ALTER TABLE relation_records ADD CONSTRAINT relation_records_source_record_id_fkey FOREIGN KEY (source_record_id) REFERENCES records(id) ON DELETE CASCADE',
        'ALTER TABLE relation_records ADD CONSTRAINT relation_records_target_record_id_fkey FOREIGN KEY (target_record_id) REFERENCES records(id) ON DELETE CASCADE',
        'ALTER TABLE relation_records ADD CONSTRAINT relation_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)'
    ], [
        'CREATE INDEX idx_relation_records_source ON relation_records (source_record_id)',
        'CREATE INDEX idx_relation_records_target ON relation_records (target_record_id)',
        'CREATE INDEX idx_relation_records_type ON relation_records (relation_type)',
        'CREATE INDEX idx_relation_records_created_at ON relation_records (created_at)'
    ], [
        { name: 'source_record_id', sql: 'source_record_id UUID NOT NULL' },
        { name: 'target_record_id', sql: 'target_record_id UUID NOT NULL' },
        { name: 'relation_type', sql: 'relation_type TEXT NOT NULL' },
        { name: 'metadata', sql: 'metadata JSONB DEFAULT \'{}\'::jsonb' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
        { name: 'created_by', sql: 'created_by UUID' }
    ])

    console.log('🎉 数据库初始化完成！')

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// 运行初始化
if (require.main === module) {
  initDatabase()
}

module.exports = { initDatabase }