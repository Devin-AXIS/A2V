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
 * 通用函数：检查表是否存在，如果不存在则创建
 */
async function ensureTableExists(tableName, createTableSQL, constraints = [], indexes = []) {
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
            'ALTER TABLE application_members ADD CONSTRAINT application_members_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
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
                updated_at TIMESTAMP NOT NULL DEFAULT now(),
                phone_number TEXT NULL
            )
        `, [
            'ALTER TABLE application_users ADD CONSTRAINT application_users_pkey PRIMARY KEY (id)',
            'ALTER TABLE application_users ADD CONSTRAINT application_users_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)'
        ], [
            'CREATE INDEX application_users_application_id_idx ON application_users (application_id)',
            'CREATE INDEX application_users_phone_idx ON application_users (phone)',
            'CREATE INDEX application_users_status_idx ON application_users (status)'
        ]);

        await ensureTableExists('audit_logs', `
            CREATE TABLE audit_logs (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NULL,
                user_id UUID NULL,
                action TEXT NOT NULL,
                resource_type TEXT NULL,
                resource_id UUID NULL,
                details JSONB NULL DEFAULT '{}'::jsonb,
                ip_address TEXT NULL,
                user_agent TEXT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id)',
            'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
            'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)'
        ], [
            'CREATE INDEX audit_logs_app_user_idx ON audit_logs (application_id, user_id)',
            'CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at)',
            'CREATE INDEX audit_logs_action_idx ON audit_logs (action)'
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
            'ALTER TABLE directories ADD CONSTRAINT directories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
            'ALTER TABLE directories ADD CONSTRAINT directories_slug_unique UNIQUE (slug)'
        ], [
            'CREATE INDEX directories_application_id_idx ON directories (application_id)',
            'CREATE INDEX directories_slug_idx ON directories (slug)',
            'CREATE INDEX directories_is_active_idx ON directories (is_active)'
        ]);

        await ensureTableExists('directory_defs', `
            CREATE TABLE directory_defs (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL,
                directory_id UUID NOT NULL,
                name TEXT NOT NULL,
                slug TEXT NOT NULL,
                description TEXT NULL,
                config JSONB NULL DEFAULT '{}'::jsonb,
                is_active BOOLEAN NULL DEFAULT true,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_pkey PRIMARY KEY (id)',
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id)',
            'ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_slug_unique UNIQUE (slug)'
        ], [
            'CREATE INDEX directory_defs_application_id_idx ON directory_defs (application_id)',
            'CREATE INDEX directory_defs_directory_id_idx ON directory_defs (directory_id)',
            'CREATE INDEX directory_defs_slug_idx ON directory_defs (slug)'
        ]);

        await ensureTableExists('field_categories', `
            CREATE TABLE field_categories (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL,
                directory_id UUID NOT NULL,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                level INTEGER NOT NULL,
                parent_id UUID NULL,
                config JSONB NULL DEFAULT '{}'::jsonb,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_pkey PRIMARY KEY (id)',
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id)',
            'ALTER TABLE field_categories ADD CONSTRAINT field_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES field_categories(id)'
        ], [
            'CREATE INDEX field_categories_app_dir_idx ON field_categories (application_id, directory_id)',
            'CREATE INDEX field_categories_parent_idx ON field_categories (parent_id)',
            'CREATE INDEX field_categories_created_at_idx ON field_categories (created_at)'
        ]);

        await ensureTableExists('field_defs', `
            CREATE TABLE field_defs (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL,
                directory_id UUID NOT NULL,
                category_id UUID NULL,
                name TEXT NOT NULL,
                key TEXT NOT NULL,
                type TEXT NOT NULL,
                config JSONB NULL DEFAULT '{}'::jsonb,
                is_required BOOLEAN NULL DEFAULT false,
                is_indexed BOOLEAN NULL DEFAULT false,
                "order" INTEGER NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_pkey PRIMARY KEY (id)',
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id)',
            'ALTER TABLE field_defs ADD CONSTRAINT field_defs_category_id_fkey FOREIGN KEY (category_id) REFERENCES field_categories(id)'
        ], [
            'CREATE INDEX field_defs_app_dir_idx ON field_defs (application_id, directory_id)',
            'CREATE INDEX field_defs_category_idx ON field_defs (category_id)',
            'CREATE INDEX field_defs_key_idx ON field_defs (key)'
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
                version TEXT NOT NULL,
                config JSONB NULL DEFAULT '{}'::jsonb,
                is_active BOOLEAN NULL DEFAULT true,
                installed_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE module_installs ADD CONSTRAINT module_installs_pkey PRIMARY KEY (id)',
            'ALTER TABLE module_installs ADD CONSTRAINT module_installs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
            'ALTER TABLE module_installs ADD CONSTRAINT module_installs_application_id_module_key_key UNIQUE (application_id, module_key)'
        ], [
            'CREATE INDEX module_installs_application_id_idx ON module_installs (application_id)',
            'CREATE INDEX module_installs_module_key_idx ON module_installs (module_key)',
            'CREATE INDEX module_installs_is_active_idx ON module_installs (is_active)'
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
                config JSONB NULL DEFAULT '{}'::jsonb,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_pkey PRIMARY KEY (id)',
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id)',
            'ALTER TABLE record_categories ADD CONSTRAINT record_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES record_categories(id)'
        ], [
            'CREATE INDEX record_categories_app_dir_idx ON record_categories (application_id, directory_id)',
            'CREATE INDEX record_categories_parent_idx ON record_categories (parent_id)',
            'CREATE INDEX record_categories_created_at_idx ON record_categories (created_at)'
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
                config JSONB NULL DEFAULT '{}'::jsonb,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `, [
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_pkey PRIMARY KEY (id)',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_from_directory_id_fkey FOREIGN KEY (from_directory_id) REFERENCES directory_defs(id)',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_to_directory_id_fkey FOREIGN KEY (to_directory_id) REFERENCES directory_defs(id)',
            'ALTER TABLE relation_records ADD CONSTRAINT relation_records_unique UNIQUE (from_directory_id, from_record_id, from_field_key, to_directory_id, to_record_id)'
        ], [
            'CREATE INDEX relation_records_app_idx ON relation_records (application_id)',
            'CREATE INDEX relation_records_from_idx ON relation_records (from_directory_id, from_record_id)',
            'CREATE INDEX relation_records_to_idx ON relation_records (to_directory_id, to_record_id)',
            'CREATE INDEX idx_rel_from_field ON relation_records (from_field_key)',
            'CREATE INDEX idx_rel_idempotent ON relation_records (from_directory_id, from_record_id, from_field_key, to_directory_id, to_record_id)'
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
            'CREATE INDEX users_status_idx ON users (status)'
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
            'CREATE INDEX applications_slug_unique_idx ON applications (slug)'
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
                'ALTER TABLE directories ADD CONSTRAINT directories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)',
                'ALTER TABLE directories ADD CONSTRAINT directories_slug_unique UNIQUE (slug)'
            ], [
                'CREATE INDEX directories_application_id_idx ON directories (application_id)',
                'CREATE INDEX directories_slug_idx ON directories (slug)',
                'CREATE INDEX directories_is_active_idx ON directories (is_active)'
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
                'ALTER TABLE modules ADD CONSTRAINT modules_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id)'
            ], [
                'CREATE INDEX modules_app_enabled_idx ON modules (application_id, is_enabled)',
                'CREATE INDEX modules_created_at_idx ON modules (created_at)'
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
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// 执行初始化
initDatabase().catch(error => {
    console.error('❌ 初始化过程出错:', error);
    process.exit(1);
});