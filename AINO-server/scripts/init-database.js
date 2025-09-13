#!/usr/bin/env node

/**
 * AINO 数据库初始化脚本
 * 用于在新服务器上创建完整的数据库结构
 */

import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库配置 - 可以通过环境变量覆盖
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    user: process.env.DB_USER || 'aino',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_NAME || 'aino',
    ssl: false
};

console.log('🚀 AINO 数据库初始化脚本启动');
console.log('📊 数据库配置:', {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    database: DB_CONFIG.database
});

const pool = new Pool(DB_CONFIG);

/**
 * 检查字段是否存在
 */
async function checkColumnExists(tableName, columnName) {
    try {
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = $1 
                AND column_name = $2
            )
        `, [tableName, columnName]);
        return result.rows[0].exists;
    } catch (error) {
        console.error(`检查字段 ${tableName}.${columnName} 时出错:`, error);
        return false;
    }
}

/**
 * 添加字段到表
 */
async function addColumnIfNotExists(tableName, columnName, columnSQL) {
    try {
        const exists = await checkColumnExists(tableName, columnName);
        if (!exists) {
            console.log(`📋 添加字段: ${tableName}.${columnName}`);
            await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnSQL}`);
            console.log(`✅ 字段 ${tableName}.${columnName} 添加成功`);
        } else {
            console.log(`✅ 字段 ${tableName}.${columnName} 已存在`);
        }
    } catch (error) {
        console.error(`添加字段 ${tableName}.${columnName} 失败:`, error.message);
        throw error;
    }
}

/**
 * 通用函数：检查表是否存在，如果不存在则创建
 */
async function ensureTableExists(tableName, createTableSQL, constraints = [], indexes = [], columns = []) {
    try {
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            )
        `, [tableName]);

        if (!tableCheck.rows[0].exists) {
            console.log(`⚠️  ${tableName} 表不存在，开始创建 ${tableName} 表...`);

            // 创建表
            await pool.query(createTableSQL);
            console.log(`✅ ${tableName} 表创建成功`);

            // 添加约束
            for (const constraint of constraints) {
                try {
                    await pool.query(constraint);
                    console.log(`✅ ${tableName} 表约束添加成功`);
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.warn(`⚠️  ${tableName} 表约束添加警告:`, err.message);
                    }
                }
            }

            // 添加索引
            for (const index of indexes) {
                try {
                    await pool.query(index);
                    console.log(`✅ ${tableName} 表索引创建成功`);
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.warn(`⚠️  ${tableName} 表索引创建警告:`, err.message);
                    }
                }
            }

            console.log(`✅ ${tableName} 表及相关约束创建完成`);
        } else {
            console.log(`✅ ${tableName} 表已存在`);

            // 检查并添加缺失的字段
            for (const column of columns) {
                await addColumnIfNotExists(tableName, column.name, column.sql);
            }
        }
    } catch (error) {
        console.error(`❌ 处理 ${tableName} 表时出错:`, error.message);
        throw error;
    }
}

async function initDatabase() {
    try {
        console.log('\n📋 步骤 1: 检查数据库连接...');

        // 测试数据库连接
        const result = await pool.query('SELECT version()');
        console.log('✅ 数据库连接成功:', result.rows[0].version.split(' ')[0]);

        console.log('\n📋 步骤 2: 执行数据库结构创建...');

        // 确保启用 pgcrypto 扩展以支持 gen_random_uuid()
        try {
            await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
            console.log('✅ 已启用扩展: pgcrypto');
        } catch (extErr) {
            console.warn('⚠️  启用扩展 pgcrypto 失败:', extErr.message);
        }

        // 读取并执行SQL文件
        const sqlFile = join(__dirname, 'init-database.sql');
        const sqlContent = readFileSync(sqlFile, 'utf8');

        // 分割SQL语句并执行
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await pool.query(statement);
                } catch (error) {
                    // 忽略已存在的错误
                    if (!error.message.includes('already exists') &&
                        !error.message.includes('relation') &&
                        !error.message.includes('duplicate')) {
                        console.warn('⚠️  SQL执行警告:', error.message);
                    }
                }
            }
        }

        console.log('✅ 数据库结构创建完成');

        console.log('\n📋 步骤 2.5: 确保所有核心表存在...');

        // 确保所有核心表都存在
        await ensureTableExists('application_members', `
            CREATE TABLE application_members (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL,
                user_id UUID NOT NULL,
                role TEXT NOT NULL DEFAULT 'member'::text,
                permissions JSONB NULL DEFAULT '{}'::jsonb,
                joined_at TIMESTAMP NOT NULL DEFAULT now(),
                invited_by UUID NULL,
                status TEXT NOT NULL DEFAULT 'active'::text
            )
        `, [
            'ALTER TABLE application_members ADD CONSTRAINT application_members_pkey PRIMARY KEY (id)',
            'ALTER TABLE application_members ADD CONSTRAINT application_members_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE application_members ADD CONSTRAINT application_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES users(id)',
            'ALTER TABLE application_members ADD CONSTRAINT application_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)'
        ], [
            'CREATE INDEX application_members_application_id_idx ON application_members (application_id)',
            'CREATE INDEX application_members_user_id_idx ON application_members (user_id)',
            'CREATE INDEX application_members_status_idx ON application_members (status)'
        ]);

        await ensureTableExists('application_users', `
            CREATE TABLE application_users (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL,
                phone TEXT NOT NULL,
                password TEXT NULL,
                status TEXT NOT NULL DEFAULT 'active'::text,
                role TEXT NOT NULL DEFAULT 'user'::text,
                metadata JSONB NULL DEFAULT '{}'::jsonb,
                last_login_at TIMESTAMP NULL,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE application_users ADD CONSTRAINT application_users_pkey PRIMARY KEY (id)',
            'ALTER TABLE application_users ADD CONSTRAINT application_users_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE'
        ], [
            'CREATE INDEX application_users_application_id_idx ON application_users (application_id)',
            'CREATE INDEX application_users_app_status_idx ON application_users (application_id, status)',
            'CREATE INDEX application_users_app_phone_idx ON application_users (application_id, phone)',
            'CREATE INDEX application_users_created_at_idx ON application_users (created_at)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'phone_number', sql: 'phone_number TEXT' },
            { name: 'last_login_at', sql: 'last_login_at TIMESTAMP' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP NOT NULL DEFAULT now()' }
        ]);

        await ensureTableExists('audit_logs', `
            CREATE TABLE audit_logs (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NULL,
                user_id UUID NULL,
                action TEXT NOT NULL,
                resource TEXT NOT NULL,
                resource_id TEXT NULL,
                details JSONB DEFAULT '{}'::jsonb,
                ip_address TEXT NULL,
                user_agent TEXT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id)',
            'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)'
        ], [
            'CREATE INDEX audit_logs_app_user_idx ON audit_logs (application_id, user_id)',
            'CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at)',
            'CREATE INDEX audit_logs_action_idx ON audit_logs (action)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'resource', sql: 'resource TEXT NOT NULL' },
            { name: 'resource_id', sql: 'resource_id TEXT' }
        ]);

        await ensureTableExists('directories', `
            CREATE TABLE directories (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL,
                name TEXT NOT NULL,
                slug TEXT NOT NULL,
                description TEXT NULL,
                config JSONB NULL DEFAULT '{}'::jsonb,
                is_active BOOLEAN NULL DEFAULT true,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE directories ADD CONSTRAINT directories_pkey PRIMARY KEY (id)',
            'ALTER TABLE directories ADD CONSTRAINT directories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE directories ADD CONSTRAINT directories_slug_unique UNIQUE (slug)'
        ], [
            'CREATE INDEX directories_application_id_idx ON directories (application_id)',
            'CREATE INDEX directories_slug_idx ON directories (slug)',
            'CREATE INDEX directories_is_active_idx ON directories (is_active)'
        ]);

        await ensureTableExists('directory_defs', `
            CREATE TABLE directory_defs (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                slug TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                version INTEGER NOT NULL DEFAULT 1,
                status TEXT NOT NULL DEFAULT 'active'::text,
                application_id UUID NULL,
                directory_id UUID NULL,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            )
        `, [
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_pkey PRIMARY KEY (id)',
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id)',
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_slug_unique UNIQUE (slug)'
        ], [
            'CREATE INDEX directory_defs_application_id_idx ON directory_defs (application_id)',
            'CREATE INDEX directory_defs_directory_id_idx ON directory_defs (directory_id)',
            'CREATE INDEX directory_defs_slug_idx ON directory_defs (slug)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'title', sql: 'title TEXT NOT NULL' },
            { name: 'version', sql: 'version INTEGER NOT NULL DEFAULT 1' },
            { name: 'status', sql: 'status TEXT NOT NULL DEFAULT \'active\'::text' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMPTZ DEFAULT now()' }
        ]);

        await ensureTableExists('field_categories', `
            CREATE TABLE field_categories (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL,
                directory_id UUID NOT NULL,
                name TEXT NOT NULL,
                description TEXT NULL,
                "order" INTEGER DEFAULT 0,
                enabled BOOLEAN DEFAULT true,
                system BOOLEAN DEFAULT false,
                predefined_fields JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_pkey PRIMARY KEY (id)',
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id)',
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES field_categories(id)'
        ], [
            'CREATE INDEX field_categories_app_dir_idx ON field_categories (application_id, directory_id)',
            'CREATE INDEX field_categories_parent_idx ON field_categories (parent_id)',
            'CREATE INDEX field_categories_created_at_idx ON field_categories (created_at)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'description', sql: 'description TEXT' },
            { name: 'order', sql: '"order" INTEGER DEFAULT 0' },
            { name: 'enabled', sql: 'enabled BOOLEAN DEFAULT true' },
            { name: 'system', sql: 'system BOOLEAN DEFAULT false' },
            { name: 'predefined_fields', sql: 'predefined_fields JSONB DEFAULT \'[]\'::jsonb' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP NOT NULL DEFAULT now()' }
        ]);

        await ensureTableExists('field_defs', `
            CREATE TABLE field_defs (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                directory_id UUID NOT NULL,
                key TEXT NOT NULL,
                kind TEXT NOT NULL,
                type TEXT NOT NULL,
                schema JSONB NULL,
                relation JSONB NULL,
                lookup JSONB NULL,
                computed JSONB NULL,
                validators JSONB NULL,
                read_roles JSONB DEFAULT '["admin", "member"]'::jsonb,
                write_roles JSONB DEFAULT '["admin"]'::jsonb,
                required BOOLEAN DEFAULT false,
                category_id UUID NULL
            )
        `, [
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_pkey PRIMARY KEY (id)',
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id)',
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_category_id_fkey FOREIGN KEY (category_id) REFERENCES field_categories(id)'
        ], [
            'CREATE INDEX field_defs_directory_id_idx ON field_defs (directory_id)',
            'CREATE INDEX field_defs_category_idx ON field_defs (category_id)',
            'CREATE INDEX field_defs_key_idx ON field_defs (key)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'kind', sql: 'kind TEXT NOT NULL' },
            { name: 'schema', sql: 'schema JSONB' },
            { name: 'relation', sql: 'relation JSONB' },
            { name: 'lookup', sql: 'lookup JSONB' },
            { name: 'computed', sql: 'computed JSONB' },
            { name: 'validators', sql: 'validators JSONB' },
            { name: 'read_roles', sql: 'read_roles JSONB DEFAULT \'["admin", "member"]\'::jsonb' },
            { name: 'write_roles', sql: 'write_roles JSONB DEFAULT \'["admin"]\'::jsonb' },
            { name: 'required', sql: 'required BOOLEAN DEFAULT false' },
            { name: 'category_id', sql: 'category_id UUID' }
        ]);

        await ensureTableExists('field_indexes', `
            CREATE TABLE field_indexes (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                field_def_id UUID NOT NULL,
                index_type TEXT NOT NULL,
                config JSONB NULL DEFAULT '{}'::jsonb,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE field_indexes ADD CONSTRAINT field_indexes_pkey PRIMARY KEY (id)',
            'ALTER TABLE field_indexes ADD CONSTRAINT field_indexes_field_def_id_fkey FOREIGN KEY (field_def_id) REFERENCES field_defs(id)'
        ], [
            'CREATE INDEX field_indexes_field_def_id_idx ON field_indexes (field_def_id)',
            'CREATE INDEX field_indexes_type_idx ON field_indexes (index_type)'
        ]);

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
                install_status TEXT DEFAULT 'active'::text,
                install_error TEXT NULL,
                installed_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now(),
                created_by UUID NULL
            )
        `, [
            'ALTER TABLE module_installs ADD CONSTRAINT module_installs_pkey PRIMARY KEY (id)',
            'ALTER TABLE module_installs ADD CONSTRAINT module_installs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE module_installs ADD CONSTRAINT module_installs_application_id_module_key_key UNIQUE (application_id, module_key)'
        ], [
            'CREATE INDEX module_installs_application_id_idx ON module_installs (application_id)',
            'CREATE INDEX module_installs_module_key_idx ON module_installs (module_key)',
            'CREATE INDEX module_installs_is_active_idx ON module_installs (is_active)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'module_name', sql: 'module_name TEXT NOT NULL' },
            { name: 'module_version', sql: 'module_version TEXT NOT NULL' },
            { name: 'module_type', sql: 'module_type TEXT NOT NULL' },
            { name: 'install_type', sql: 'install_type TEXT NOT NULL' },
            { name: 'install_config', sql: 'install_config JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'install_status', sql: 'install_status TEXT DEFAULT \'active\'::text' },
            { name: 'install_error', sql: 'install_error TEXT' },
            { name: 'installed_at', sql: 'installed_at TIMESTAMP DEFAULT now()' },
            { name: 'created_by', sql: 'created_by UUID' }
        ]);

        await ensureTableExists('record_categories', `
            CREATE TABLE record_categories (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL,
                directory_id UUID NOT NULL,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                level INTEGER NOT NULL,
                parent_id UUID NULL,
                "order" INTEGER DEFAULT 0,
                enabled BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            )
        `, [
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_pkey PRIMARY KEY (id)',
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id)',
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES record_categories(id)'
        ], [
            'CREATE INDEX record_categories_app_dir_idx ON record_categories (application_id, directory_id)',
            'CREATE INDEX record_categories_parent_idx ON record_categories (parent_id)',
            'CREATE INDEX record_categories_created_at_idx ON record_categories (created_at)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'order', sql: '"order" INTEGER DEFAULT 0' },
            { name: 'enabled', sql: 'enabled BOOLEAN DEFAULT true' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMPTZ DEFAULT now()' }
        ]);

        await ensureTableExists('relation_records', `
            CREATE TABLE relation_records (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL,
                from_directory_id UUID NOT NULL,
                from_record_id UUID NOT NULL,
                from_field_key TEXT NOT NULL,
                to_directory_id UUID NOT NULL,
                to_record_id UUID NOT NULL,
                to_field_key TEXT NULL,
                relation_type TEXT NOT NULL,
                bidirectional BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now(),
                created_by UUID NULL
            )
        `, [
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_pkey PRIMARY KEY (id)',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_from_directory_id_fkey FOREIGN KEY (from_directory_id) REFERENCES directory_defs(id)',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_to_directory_id_fkey FOREIGN KEY (to_directory_id) REFERENCES directory_defs(id)',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_unique UNIQUE (from_directory_id, from_record_id, from_field_key, to_directory_id, to_record_id)'
        ], [
            'CREATE INDEX relation_records_app_idx ON relation_records (application_id)',
            'CREATE INDEX relation_records_from_idx ON relation_records (from_directory_id, from_record_id)',
            'CREATE INDEX relation_records_to_idx ON relation_records (to_directory_id, to_record_id)',
            'CREATE INDEX idx_rel_from_field ON relation_records (from_field_key)',
            'CREATE INDEX idx_rel_idempotent ON relation_records (from_directory_id, from_record_id, from_field_key, to_directory_id, to_record_id)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'to_field_key', sql: 'to_field_key TEXT' },
            { name: 'relation_type', sql: 'relation_type TEXT NOT NULL' },
            { name: 'bidirectional', sql: 'bidirectional BOOLEAN DEFAULT false' },
            { name: 'created_by', sql: 'created_by UUID' }
        ]);

        await ensureTableExists('dir_jobs', `
            CREATE TABLE dir_jobs (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                tenant_id UUID NOT NULL,
                job_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending'::text,
                config JSONB NULL DEFAULT '{}'::jsonb,
                result JSONB NULL DEFAULT '{}'::jsonb,
                error_message TEXT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE dir_jobs ADD CONSTRAINT dir_jobs_pkey PRIMARY KEY (id)'
        ], [
            'CREATE INDEX dir_jobs_created_at_idx ON dir_jobs (created_at)',
            'CREATE INDEX dir_jobs_tenant_idx ON dir_jobs (tenant_id)',
            'CREATE INDEX dir_jobs_status_idx ON dir_jobs (status)'
        ]);

        await ensureTableExists('dir_users', `
            CREATE TABLE dir_users (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                tenant_id UUID NOT NULL,
                user_id UUID NOT NULL,
                role TEXT NOT NULL DEFAULT 'user'::text,
                permissions JSONB NULL DEFAULT '{}'::jsonb,
                status TEXT NOT NULL DEFAULT 'active'::text,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE dir_users ADD CONSTRAINT dir_users_pkey PRIMARY KEY (id)',
            'ALTER TABLE dir_users ADD CONSTRAINT dir_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)'
        ], [
            'CREATE INDEX dir_users_created_at_idx ON dir_users (created_at)',
            'CREATE INDEX dir_users_tenant_idx ON dir_users (tenant_id)',
            'CREATE INDEX dir_users_user_id_idx ON dir_users (user_id)'
        ]);

        console.log('✅ 所有核心表检测完成');

        console.log('\n📋 步骤 3: 创建基础数据...');

        // 确保 users 表存在
        await ensureTableExists('users', `
            CREATE TABLE users (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                roles TEXT[] NOT NULL DEFAULT '{user}'::text[],
                avatar TEXT NULL,
                status TEXT NOT NULL DEFAULT 'active'::text,
                last_login_at TIMESTAMP NULL,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id)',
            'ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email)'
        ], [
            'CREATE INDEX users_email_unique_idx ON users (email)',
            'CREATE INDEX users_status_idx ON users (status)',
            'CREATE INDEX users_created_at_idx ON users (created_at)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'avatar', sql: 'avatar TEXT' },
            { name: 'last_login_at', sql: 'last_login_at TIMESTAMP' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP NOT NULL DEFAULT now()' }
        ]);

        // 创建默认管理员用户
        const adminPassword = await bcrypt.hash('admin123', 10);
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
    `, [adminPassword]);

        console.log('✅ 默认管理员用户创建完成 (admin@aino.com / admin123)');

        // 确保 applications 表存在
        await ensureTableExists('applications', `
            CREATE TABLE applications (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                description TEXT NULL,
                slug TEXT NOT NULL,
                owner_id UUID NOT NULL,
                status TEXT NOT NULL DEFAULT 'active'::text,
                template TEXT NULL DEFAULT 'blank'::text,
                config JSONB NULL DEFAULT '{}'::jsonb,
                database_config JSONB NULL DEFAULT '{}'::jsonb,
                is_public BOOLEAN NULL DEFAULT false,
                version TEXT NULL DEFAULT '1.0.0'::text,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE applications ADD CONSTRAINT applications_pkey PRIMARY KEY (id)',
            'ALTER TABLE applications ADD CONSTRAINT applications_slug_unique UNIQUE (slug)'
        ], [
            'CREATE INDEX applications_owner_status_idx ON applications (owner_id, status)',
            'CREATE INDEX applications_slug_unique_idx ON applications (slug)',
            'CREATE INDEX applications_created_at_idx ON applications (created_at)'
        ], [
            // 如果表已存在，检查并添加可能缺失的字段
            { name: 'database_config', sql: 'database_config JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'is_public', sql: 'is_public BOOLEAN DEFAULT false' },
            { name: 'version', sql: 'version TEXT DEFAULT \'1.0.0\'::text' },
            { name: 'updated_at', sql: 'updated_at TIMESTAMP NOT NULL DEFAULT now()' }
        ]);

        // 创建默认应用
        const adminUser = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@aino.com']);
        if (adminUser.rows.length > 0) {
            const adminUserId = adminUser.rows[0].id;

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
      `, [adminUserId]);

            console.log('✅ 默认应用创建完成');

            // 确保 directories 表存在
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
                    created_at TIMESTAMP NOT NULL DEFAULT now(),
                    updated_at TIMESTAMP NOT NULL DEFAULT now()
                )
            `, [
                'ALTER TABLE directories ADD CONSTRAINT directories_pkey PRIMARY KEY (id)',
                'ALTER TABLE directories ADD CONSTRAINT directories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE',
                'ALTER TABLE directories ADD CONSTRAINT directories_module_id_fkey FOREIGN KEY (module_id) REFERENCES modules(id)',
                'ALTER TABLE directories ADD CONSTRAINT directories_slug_unique UNIQUE (slug)'
            ], [
                'CREATE INDEX directories_application_id_idx ON directories (application_id)',
                'CREATE INDEX directories_app_module_idx ON directories (application_id, module_id)',
                'CREATE INDEX directories_created_at_idx ON directories (created_at)'
            ], [
                // 如果表已存在，检查并添加可能缺失的字段
                { name: 'module_id', sql: 'module_id UUID NOT NULL' },
                { name: 'type', sql: 'type TEXT NOT NULL' },
                { name: 'supports_category', sql: 'supports_category BOOLEAN DEFAULT false' },
                { name: 'order', sql: '"order" INTEGER DEFAULT 0' },
                { name: 'is_enabled', sql: 'is_enabled BOOLEAN DEFAULT true' },
                { name: 'updated_at', sql: 'updated_at TIMESTAMP NOT NULL DEFAULT now()' }
            ]);

            // 确保 modules 表存在
            await ensureTableExists('modules', `
                CREATE TABLE modules (
                    id UUID NOT NULL DEFAULT gen_random_uuid(),
                    application_id UUID NOT NULL,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    icon TEXT NULL,
                    config JSONB NULL DEFAULT '{}'::jsonb,
                    "order" INTEGER NULL DEFAULT 0,
                    is_enabled BOOLEAN NULL DEFAULT true,
                    created_at TIMESTAMP NOT NULL DEFAULT now(),
                    updated_at TIMESTAMP NOT NULL DEFAULT now()
                )
            `, [
                'ALTER TABLE modules ADD CONSTRAINT modules_pkey PRIMARY KEY (id)',
                'ALTER TABLE modules ADD CONSTRAINT modules_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE'
            ], [
                'CREATE INDEX modules_app_enabled_idx ON modules (application_id, is_enabled)',
                'CREATE INDEX modules_created_at_idx ON modules (created_at)'
            ], [
                // 如果表已存在，检查并添加可能缺失的字段
                { name: 'icon', sql: 'icon TEXT' },
                { name: 'order', sql: '"order" INTEGER DEFAULT 0' },
                { name: 'is_enabled', sql: 'is_enabled BOOLEAN DEFAULT true' },
                { name: 'updated_at', sql: 'updated_at TIMESTAMP NOT NULL DEFAULT now()' }
            ]);

            // 创建默认模块
            const defaultApp = await pool.query('SELECT id FROM applications WHERE slug = $1', ['default-app']);
            if (defaultApp.rows.length > 0) {
                const appId = defaultApp.rows[0].id;

                await pool.query(`
          INSERT INTO modules (id, application_id, name, type, config, "order", is_enabled) 
          VALUES 
            (gen_random_uuid(), $1, '用户管理', 'user-management', '{"permissions": ["read", "write"]}'::jsonb, 1, true),
            (gen_random_uuid(), $1, '数据管理', 'data-management', '{"permissions": ["read", "write"]}'::jsonb, 2, true),
            (gen_random_uuid(), $1, '系统设置', 'system-settings', '{"permissions": ["read", "write"]}'::jsonb, 3, true)
          ON CONFLICT DO NOTHING
        `, [appId]);

                console.log('✅ 默认模块创建完成');
            }
        }

        console.log('\n📋 步骤 4: 验证数据库结构...');

        // 验证表是否创建成功
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

        console.log(`✅ 成功创建 ${tables.rows.length} 个表:`);
        tables.rows.forEach(table => {
            console.log(`   - ${table.table_name}`);
        });

        // 验证索引
        const indexes = await pool.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
    `);

        console.log(`✅ 成功创建 ${indexes.rows[0].count} 个索引`);

        // 验证外键约束
        const foreignKeys = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
    `);

        console.log(`✅ 成功创建 ${foreignKeys.rows[0].count} 个外键约束`);

        console.log('\n🎉 数据库初始化完成！');
        console.log('\n📝 重要信息:');
        console.log('   - 默认管理员账号: admin@aino.com');
        console.log('   - 默认密码: admin123');
        console.log('   - 默认应用: default-app');
        console.log('\n⚠️  请在生产环境中修改默认密码！');

    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        console.error('错误详情:', error);
        // process.exit(1);
    } finally {
        await pool.end();
    }
}

// 执行初始化
initDatabase().catch(error => {
    console.error('❌ 初始化过程出错:', error);
    // process.exit(1);
});