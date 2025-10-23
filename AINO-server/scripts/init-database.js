#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于创建和更新数据库表结构
 */

import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

// 数据库连接配置
const dbConfig = {
    host: process.env.DB_HOST || '47.94.52.142:',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'aino',
    user: process.env.DB_USER || 'aino',
    password: process.env.DB_PASSWORD || 'pass',
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
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            roles TEXT[] DEFAULT ARRAY['user'],
            avatar TEXT,
            status TEXT DEFAULT 'active',
            last_login_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
            'ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id)',
            'ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email)'
        ], [
            'CREATE INDEX users_created_at_idx ON users (created_at)',
            'CREATE INDEX users_status_idx ON users (status)'
        ], [
            { name: 'name', sql: 'name TEXT NOT NULL' },
            { name: 'email', sql: 'email TEXT NOT NULL' },
            { name: 'password', sql: 'password TEXT NOT NULL' },
            { name: 'roles', sql: 'roles TEXT[] DEFAULT ARRAY[\'user\']' },
            { name: 'avatar', sql: 'avatar TEXT' },
            { name: 'status', sql: 'status TEXT DEFAULT \'active\'' },
            { name: 'last_login_at', sql: 'last_login_at TIMESTAMP' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' }
        ])

        // 2. applications 表
        await ensureTableExists('applications', `
        CREATE TABLE applications (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            slug TEXT NOT NULL,
            owner_id UUID NOT NULL,
            status TEXT DEFAULT 'active',
            template TEXT DEFAULT 'blank',
            config JSONB DEFAULT '{}'::jsonb,
            database_config JSONB DEFAULT '{}'::jsonb,
            is_public BOOLEAN DEFAULT false,
            version TEXT DEFAULT '1.0.0',
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
            'ALTER TABLE applications ADD CONSTRAINT applications_pkey PRIMARY KEY (id)',
            'ALTER TABLE applications ADD CONSTRAINT applications_slug_key UNIQUE (slug)',
            'ALTER TABLE applications ADD CONSTRAINT applications_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id)'
        ], [
            'CREATE INDEX applications_created_at_idx ON applications (created_at)',
            'CREATE INDEX applications_owner_status_idx ON applications (owner_id, status)'
        ], [
            { name: 'name', sql: 'name TEXT NOT NULL' },
            { name: 'description', sql: 'description TEXT' },
            { name: 'slug', sql: 'slug TEXT NOT NULL' },
            { name: 'owner_id', sql: 'owner_id UUID NOT NULL' },
            { name: 'status', sql: 'status TEXT DEFAULT \'active\'' },
            { name: 'template', sql: 'template TEXT DEFAULT \'blank\'' },
            { name: 'config', sql: 'config JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'database_config', sql: 'database_config JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'is_public', sql: 'is_public BOOLEAN DEFAULT false' },
            { name: 'version', sql: 'version TEXT DEFAULT \'1.0.0\'' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' }
        ])

        // 3. directories 表
        await ensureTableExists('directories', `
        CREATE TABLE directories (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            module_id UUID NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            type TEXT NOT NULL,
            supports_category BOOLEAN DEFAULT false,
            config JSONB DEFAULT '{}'::jsonb,
            "order" INTEGER DEFAULT 0,
            is_enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
            'ALTER TABLE directories ADD CONSTRAINT directories_pkey PRIMARY KEY (id)',
            'ALTER TABLE directories ADD CONSTRAINT directories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE'
        ], [
            'CREATE INDEX directories_created_at_idx ON directories (created_at)',
            'CREATE INDEX directories_app_module_idx ON directories (application_id, module_id)',
            'CREATE INDEX directories_slug_idx ON directories (slug)'
        ], [
            { name: 'application_id', sql: 'application_id UUID NOT NULL' },
            { name: 'module_id', sql: 'module_id UUID NOT NULL' },
            { name: 'name', sql: 'name TEXT NOT NULL' },
            { name: 'slug', sql: 'slug TEXT NOT NULL' },
            { name: 'type', sql: 'type TEXT NOT NULL' },
            { name: 'supports_category', sql: 'supports_category BOOLEAN DEFAULT false' },
            { name: 'config', sql: 'config JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'order', sql: '"order" INTEGER DEFAULT 0' },
            { name: 'is_enabled', sql: 'is_enabled BOOLEAN DEFAULT true' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' }
        ])

        // 4. field_categories 表（与 src/db/schema.ts 对齐）
        await ensureTableExists('field_categories', `
        CREATE TABLE field_categories (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            directory_id UUID NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            "order" INTEGER DEFAULT 0,
            enabled BOOLEAN DEFAULT true,
            system BOOLEAN DEFAULT false,
            predefined_fields JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP DEFAULT now() NOT NULL,
            updated_at TIMESTAMP DEFAULT now() NOT NULL
        )
    `, [
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_pkey PRIMARY KEY (id)',
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id) ON DELETE CASCADE'
        ], [
            'CREATE INDEX field_categories_created_at_idx ON field_categories (created_at)',
            'CREATE INDEX field_categories_app_dir_idx ON field_categories (application_id, directory_id)'
        ], [
            { name: 'application_id', sql: 'application_id UUID NOT NULL' },
            { name: 'directory_id', sql: 'directory_id UUID NOT NULL' },
            { name: 'name', sql: 'name TEXT NOT NULL' },
            { name: 'description', sql: 'description TEXT' },
            { name: 'order', sql: '"order" INTEGER DEFAULT 0' },
            { name: 'enabled', sql: 'enabled BOOLEAN DEFAULT true' },
            { name: 'system', sql: 'system BOOLEAN DEFAULT false' },
            { name: 'predefined_fields', sql: 'predefined_fields JSONB DEFAULT \'[]\'::jsonb' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now() NOT NULL' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now() NOT NULL' }
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
            application_id UUID NOT NULL,
            key TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            icon TEXT,
            config JSONB DEFAULT '{}'::jsonb,
            "order" INTEGER DEFAULT 0,
            is_enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
            'ALTER TABLE modules ADD CONSTRAINT modules_pkey PRIMARY KEY (id)',
            'ALTER TABLE modules ADD CONSTRAINT modules_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE'
        ], [
            'CREATE INDEX modules_created_at_idx ON modules (created_at)',
            'CREATE INDEX modules_app_enabled_idx ON modules (application_id, is_enabled)',
            'CREATE INDEX modules_key_idx ON modules (key)'
        ], [
            { name: 'application_id', sql: 'application_id UUID NOT NULL' },
            { name: 'key', sql: 'key TEXT NOT NULL' },
            { name: 'name', sql: 'name TEXT NOT NULL' },
            { name: 'type', sql: 'type TEXT NOT NULL' },
            { name: 'icon', sql: 'icon TEXT' },
            { name: 'config', sql: 'config JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'order', sql: '"order" INTEGER DEFAULT 0' },
            { name: 'is_enabled', sql: 'is_enabled BOOLEAN DEFAULT true' },
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
            install_type TEXT NOT NULL,
            install_config JSONB DEFAULT '{}'::jsonb,
            install_status TEXT DEFAULT 'active',
            install_error TEXT,
            installed_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            created_by UUID
        )
    `, [
            'ALTER TABLE module_installs ADD CONSTRAINT module_installs_pkey PRIMARY KEY (id)',
            'ALTER TABLE module_installs ADD CONSTRAINT module_installs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE module_installs ADD CONSTRAINT module_installs_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)',
            'ALTER TABLE module_installs ADD CONSTRAINT unique_app_module UNIQUE (application_id, module_key)'
        ], [
            'CREATE INDEX module_installs_app_module_idx ON module_installs (application_id, module_key)',
            'CREATE INDEX module_installs_status_idx ON module_installs (install_status)',
            'CREATE INDEX module_installs_type_idx ON module_installs (module_type)',
            'CREATE INDEX module_installs_created_at_idx ON module_installs (installed_at)'
        ], [
            { name: 'application_id', sql: 'application_id UUID NOT NULL' },
            { name: 'module_key', sql: 'module_key TEXT NOT NULL' },
            { name: 'module_name', sql: 'module_name TEXT NOT NULL' },
            { name: 'module_version', sql: 'module_version TEXT NOT NULL' },
            { name: 'module_type', sql: 'module_type TEXT NOT NULL' },
            { name: 'install_type', sql: 'install_type TEXT NOT NULL' },
            { name: 'install_config', sql: 'install_config JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'install_status', sql: 'install_status TEXT DEFAULT \'active\'' },
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
            phone TEXT NOT NULL,
            password TEXT,
            status TEXT DEFAULT 'active',
            role TEXT DEFAULT 'user',
            metadata JSONB DEFAULT '{}'::jsonb,
            last_login_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
            'ALTER TABLE application_users ADD CONSTRAINT application_users_pkey PRIMARY KEY (id)',
            'ALTER TABLE application_users ADD CONSTRAINT application_users_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE'
        ], [
            'CREATE INDEX application_users_created_at_idx ON application_users (created_at)',
            'CREATE INDEX application_users_app_status_idx ON application_users (application_id, status)',
            'CREATE INDEX application_users_app_phone_idx ON application_users (application_id, phone)',
            'CREATE INDEX application_users_phone_idx ON application_users (phone)'
        ], [
            { name: 'application_id', sql: 'application_id UUID NOT NULL' },
            { name: 'phone', sql: 'phone TEXT NOT NULL' },
            { name: 'password', sql: 'password TEXT' },
            { name: 'status', sql: 'status TEXT DEFAULT \'active\'' },
            { name: 'role', sql: 'role TEXT DEFAULT \'user\'' },
            { name: 'metadata', sql: 'metadata JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'last_login_at', sql: 'last_login_at TIMESTAMP' },
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
            path TEXT NOT NULL,
            level INTEGER NOT NULL,
            parent_id UUID,
            "order" INTEGER DEFAULT 0,
            enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_pkey PRIMARY KEY (id)',
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id) ON DELETE CASCADE',
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES record_categories(id) ON DELETE CASCADE'
        ], [
            'CREATE INDEX record_categories_created_at_idx ON record_categories (created_at)',
            'CREATE INDEX record_categories_app_dir_idx ON record_categories (application_id, directory_id)',
            'CREATE INDEX record_categories_parent_idx ON record_categories (parent_id)'
        ], [
            { name: 'application_id', sql: 'application_id UUID NOT NULL' },
            { name: 'directory_id', sql: 'directory_id UUID NOT NULL' },
            { name: 'name', sql: 'name TEXT NOT NULL' },
            { name: 'path', sql: 'path TEXT NOT NULL' },
            { name: 'level', sql: 'level INTEGER NOT NULL' },
            { name: 'parent_id', sql: 'parent_id UUID' },
            { name: 'order', sql: '"order" INTEGER DEFAULT 0' },
            { name: 'enabled', sql: 'enabled BOOLEAN DEFAULT true' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' }
        ])

        // 11. relation_records 表
        await ensureTableExists('relation_records', `
        CREATE TABLE relation_records (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            from_directory_id UUID NOT NULL,
            from_record_id UUID NOT NULL,
            from_field_key TEXT NOT NULL,
            to_directory_id UUID NOT NULL,
            to_record_id UUID NOT NULL,
            to_field_key TEXT,
            relation_type TEXT NOT NULL,
            bidirectional BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            created_by UUID
        )
    `, [
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_pkey PRIMARY KEY (id)',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_unique UNIQUE (from_directory_id, from_record_id, from_field_key, to_directory_id, to_record_id)'
        ], [
            'CREATE INDEX relation_records_created_at_idx ON relation_records (created_at)',
            'CREATE INDEX relation_records_from_idx ON relation_records (from_directory_id, from_record_id, from_field_key)',
            'CREATE INDEX relation_records_to_idx ON relation_records (to_directory_id, to_record_id, to_field_key)',
            'CREATE INDEX relation_records_app_idx ON relation_records (application_id)',
            'CREATE INDEX idx_rel_out ON relation_records (application_id, from_directory_id, from_record_id, relation_type, to_directory_id)',
            'CREATE INDEX idx_rel_in ON relation_records (application_id, to_directory_id, to_record_id, relation_type, from_directory_id)',
            'CREATE INDEX idx_rel_from_field ON relation_records (application_id, from_directory_id, from_field_key, from_record_id)',
            'CREATE INDEX idx_rel_to_field ON relation_records (application_id, to_directory_id, to_field_key, to_record_id)',
            'CREATE INDEX idx_rel_idempotent ON relation_records (application_id, from_directory_id, from_record_id, to_directory_id, to_record_id, relation_type)'
        ], [
            { name: 'application_id', sql: 'application_id UUID NOT NULL' },
            { name: 'from_directory_id', sql: 'from_directory_id UUID NOT NULL' },
            { name: 'from_record_id', sql: 'from_record_id UUID NOT NULL' },
            { name: 'from_field_key', sql: 'from_field_key TEXT NOT NULL' },
            { name: 'to_directory_id', sql: 'to_directory_id UUID NOT NULL' },
            { name: 'to_record_id', sql: 'to_record_id UUID NOT NULL' },
            { name: 'to_field_key', sql: 'to_field_key TEXT' },
            { name: 'relation_type', sql: 'relation_type TEXT NOT NULL' },
            { name: 'bidirectional', sql: 'bidirectional BOOLEAN DEFAULT false' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' },
            { name: 'created_by', sql: 'created_by UUID' }
        ])

        // 12. directory_defs 表
        await ensureTableExists('directory_defs', `
        CREATE TABLE directory_defs (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            slug TEXT NOT NULL,
            title TEXT NOT NULL,
            name TEXT NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            status TEXT NOT NULL DEFAULT 'active',
            application_id UUID,
            directory_id UUID,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    `, [
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_pkey PRIMARY KEY (id)',
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_slug_key UNIQUE (slug)',
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id) ON DELETE CASCADE'
        ], [
            'CREATE INDEX directory_defs_created_at_idx ON directory_defs (created_at)',
            'CREATE INDEX directory_defs_app_status_idx ON directory_defs (application_id, status)'
        ], [
            { name: 'slug', sql: 'slug TEXT NOT NULL' },
            { name: 'title', sql: 'title TEXT NOT NULL' },
            { name: 'name', sql: 'name TEXT NOT NULL' },
            { name: 'version', sql: 'version INTEGER NOT NULL DEFAULT 1' },
            { name: 'status', sql: 'status TEXT NOT NULL DEFAULT \'active\'' },
            { name: 'application_id', sql: 'application_id UUID' },
            { name: 'directory_id', sql: 'directory_id UUID' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' }
        ])

        // 13. field_defs 表
        await ensureTableExists('field_defs', `
        CREATE TABLE field_defs (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
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
    `, [
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_pkey PRIMARY KEY (id)',
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directory_defs(id) ON DELETE CASCADE',
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_category_id_fkey FOREIGN KEY (category_id) REFERENCES field_categories(id) ON DELETE SET NULL'
        ], [
            'CREATE INDEX field_defs_application_id_idx ON field_defs (application_id)',
            'CREATE INDEX field_defs_directory_idx ON field_defs (directory_id)',
            'CREATE INDEX field_defs_category_id_idx ON field_defs (category_id)',
            'CREATE INDEX field_defs_key_idx ON field_defs (key)'
        ], [
            { name: 'application_id', sql: 'application_id UUID NOT NULL' },
            { name: 'directory_id', sql: 'directory_id UUID NOT NULL' },
            { name: 'key', sql: 'key TEXT NOT NULL' },
            { name: 'kind', sql: 'kind TEXT NOT NULL' },
            { name: 'type', sql: 'type TEXT NOT NULL' },
            { name: 'schema', sql: 'schema JSONB' },
            { name: 'relation', sql: 'relation JSONB' },
            { name: 'lookup', sql: 'lookup JSONB' },
            { name: 'computed', sql: 'computed JSONB' },
            { name: 'validators', sql: 'validators JSONB' },
            { name: 'read_roles', sql: 'read_roles JSONB DEFAULT \'["admin", "member"]\'::jsonb' },
            { name: 'write_roles', sql: 'write_roles JSONB DEFAULT \'["admin"]\'::jsonb' },
            { name: 'required', sql: 'required BOOLEAN DEFAULT false' },
            { name: 'category_id', sql: 'category_id UUID' }
        ])

        // 14. dir_users 表
        await ensureTableExists('dir_users', `
        CREATE TABLE dir_users (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            props JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_by UUID,
            updated_by UUID,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            deleted_at TIMESTAMP
        )
    `, [
            'ALTER TABLE dir_users ADD CONSTRAINT dir_users_pkey PRIMARY KEY (id)'
        ], [
            'CREATE INDEX dir_users_created_at_idx ON dir_users (created_at)',
            'CREATE INDEX dir_users_tenant_idx ON dir_users (tenant_id)'
        ], [
            { name: 'tenant_id', sql: 'tenant_id UUID NOT NULL' },
            { name: 'version', sql: 'version INTEGER NOT NULL DEFAULT 1' },
            { name: 'props', sql: 'props JSONB NOT NULL DEFAULT \'{}\'::jsonb' },
            { name: 'created_by', sql: 'created_by UUID' },
            { name: 'updated_by', sql: 'updated_by UUID' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT now()' },
            { name: 'deleted_at', sql: 'deleted_at TIMESTAMP' }
        ])

        // 15. field_indexes 表
        await ensureTableExists('field_indexes', `
        CREATE TABLE field_indexes (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            dir_slug TEXT NOT NULL,
            record_id UUID NOT NULL,
            field_key TEXT NOT NULL,
            search_value TEXT,
            numeric_value INTEGER,
            created_at TIMESTAMP DEFAULT now()
        )
    `, [
            'ALTER TABLE field_indexes ADD CONSTRAINT field_indexes_pkey PRIMARY KEY (id)'
        ], [
            'CREATE INDEX field_indexes_created_at_idx ON field_indexes (created_at)',
            'CREATE INDEX field_indexes_dir_slug_idx ON field_indexes (dir_slug)',
            'CREATE INDEX field_indexes_record_field_idx ON field_indexes (record_id, field_key)'
        ], [
            { name: 'dir_slug', sql: 'dir_slug TEXT NOT NULL' },
            { name: 'record_id', sql: 'record_id UUID NOT NULL' },
            { name: 'field_key', sql: 'field_key TEXT NOT NULL' },
            { name: 'search_value', sql: 'search_value TEXT' },
            { name: 'numeric_value', sql: 'numeric_value INTEGER' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now()' }
        ])

        // 16. audit_logs 表
        await ensureTableExists('audit_logs', `
        CREATE TABLE audit_logs (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            application_id UUID,
            user_id UUID,
            action TEXT NOT NULL,
            resource TEXT NOT NULL,
            resource_id TEXT,
            details JSONB DEFAULT '{}'::jsonb,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT now() NOT NULL
        )
    `, [
            'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id)',
            'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)'
        ], [
            'CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at)',
            'CREATE INDEX audit_logs_app_user_idx ON audit_logs (application_id, user_id)'
        ], [
            { name: 'application_id', sql: 'application_id UUID' },
            { name: 'user_id', sql: 'user_id UUID' },
            { name: 'action', sql: 'action TEXT NOT NULL' },
            { name: 'resource', sql: 'resource TEXT NOT NULL' },
            { name: 'resource_id', sql: 'resource_id TEXT' },
            { name: 'details', sql: 'details JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'ip_address', sql: 'ip_address TEXT' },
            { name: 'user_agent', sql: 'user_agent TEXT' },
            { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT now() NOT NULL' }
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
if (import.meta.url === `file://${process.argv[1]}`) {
    initDatabase()
}

export { initDatabase }