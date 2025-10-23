#!/usr/bin/env node

/**
 * 修复外键约束，添加级联删除
 * 用于更新现有数据库的外键约束
 */

import { Pool } from 'pg';

// 数据库配置
const DB_CONFIG = {
    host: process.env.DB_HOST || '47.94.52.142:',
    port: parseInt(process.env.DB_PORT || '5433'),
    user: process.env.DB_USER || 'aino',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_NAME || 'aino',
    ssl: false
};

const pool = new Pool(DB_CONFIG);

async function fixForeignKeyConstraints() {
    try {
        console.log('🔧 开始修复外键约束，添加级联删除...');

        // 需要修复的外键约束列表
        const constraintsToFix = [
            {
                table: 'application_members',
                constraint: 'application_members_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            },
            {
                table: 'application_users',
                constraint: 'application_users_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            },
            {
                table: 'audit_logs',
                constraint: 'audit_logs_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            },
            {
                table: 'directories',
                constraint: 'directories_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            },
            {
                table: 'directory_defs',
                constraint: 'directory_defs_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            },
            {
                table: 'field_categories',
                constraint: 'field_categories_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            },
            {
                table: 'module_installs',
                constraint: 'module_installs_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            },
            {
                table: 'modules',
                constraint: 'modules_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            },
            {
                table: 'record_categories',
                constraint: 'record_categories_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            },
            {
                table: 'relation_records',
                constraint: 'relation_records_application_id_fkey',
                column: 'application_id',
                referencedTable: 'applications',
                referencedColumn: 'id'
            }
        ];

        for (const constraintInfo of constraintsToFix) {
            try {
                console.log(`📋 修复约束: ${constraintInfo.constraint}`);

                // 1. 删除旧的外键约束
                await pool.query(`
                    ALTER TABLE ${constraintInfo.table} 
                    DROP CONSTRAINT IF EXISTS ${constraintInfo.constraint}
                `);
                console.log(`✅ 删除旧约束: ${constraintInfo.constraint}`);

                // 2. 添加新的带级联删除的外键约束
                await pool.query(`
                    ALTER TABLE ${constraintInfo.table} 
                    ADD CONSTRAINT ${constraintInfo.constraint} 
                    FOREIGN KEY (${constraintInfo.column}) 
                    REFERENCES ${constraintInfo.referencedTable}(${constraintInfo.referencedColumn}) 
                    ON DELETE CASCADE
                `);
                console.log(`✅ 添加新约束: ${constraintInfo.constraint} (带级联删除)`);

            } catch (error) {
                console.warn(`⚠️  修复约束 ${constraintInfo.constraint} 时出错:`, error.message);
            }
        }

        console.log('🎉 外键约束修复完成！');
        console.log('现在删除应用时会自动级联删除相关记录。');

    } catch (error) {
        console.error('❌ 修复外键约束失败:', error.message);
        console.error('错误详情:', error);
        // process.exit(1);
    } finally {
        await pool.end();
    }
}

// 执行修复
fixForeignKeyConstraints().catch(error => {
    console.error('❌ 修复过程出错:', error);
    // process.exit(1);
});
