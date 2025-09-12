#!/usr/bin/env node

/**
 * AINO 数据库初始化脚本
 * 用于在新服务器上创建完整的数据库结构
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

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

async function initDatabase() {
    try {
        console.log('\n📋 步骤 1: 检查数据库连接...');

        // 测试数据库连接
        const result = await pool.query('SELECT version()');
        console.log('✅ 数据库连接成功:', result.rows[0].version.split(' ')[0]);

        console.log('\n📋 步骤 2: 执行数据库结构创建...');

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

        console.log('\n📋 步骤 3: 创建基础数据...');

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
