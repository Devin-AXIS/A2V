#!/usr/bin/env node

/**
 * 修复目录表结构
 */

const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'aino',
  password: 'pass',
  database: 'aino',
})

async function fixDirectoriesTable() {
  try {
    console.log('🔧 修复目录表结构...\n')
    
    // 1. 删除现有的目录表
    console.log('1. 删除现有目录表...')
    await pool.query('DROP TABLE IF EXISTS directories CASCADE')
    console.log('   ✅ 目录表已删除\n')
    
    // 2. 重新创建目录表
    console.log('2. 重新创建目录表...')
    await pool.query(`
      CREATE TABLE "directories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "application_id" uuid NOT NULL,
        "module_id" uuid NOT NULL,
        "name" text NOT NULL,
        "type" text NOT NULL,
        "supports_category" boolean DEFAULT false,
        "config" jsonb DEFAULT '{}'::jsonb,
        "order" integer DEFAULT 0,
        "is_enabled" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `)
    console.log('   ✅ 目录表已创建\n')
    
    // 3. 添加外键约束
    console.log('3. 添加外键约束...')
    await pool.query(`
      ALTER TABLE "directories" ADD CONSTRAINT "directories_application_id_applications_id_fk" 
      FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action
    `)
    await pool.query(`
      ALTER TABLE "directories" ADD CONSTRAINT "directories_module_id_modules_id_fk" 
      FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action
    `)
    console.log('   ✅ 外键约束已添加\n')
    
    // 4. 验证表结构
    console.log('4. 验证表结构...')
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'directories' 
      ORDER BY ordinal_position
    `)
    
    console.log('📋 新的目录表字段结构:')
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
    })
    
    console.log('\n🎉 目录表结构修复完成！')
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message)
  } finally {
    await pool.end()
  }
}

fixDirectoriesTable()
