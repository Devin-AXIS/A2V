const { Pool } = require('pg');

async function checkSpecificField() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'aino',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_NAME || 'aino'
  });

  try {
    console.log('🔍 检查 r_2k04 字段的完整定义...');
    
    // 查询 r_2k04 字段的完整定义
    const result = await pool.query(`
      SELECT 
        fd.*,
        dd.title as directory_title,
        dd.slug as directory_slug
      FROM field_defs fd
      JOIN directory_defs dd ON fd.directory_id = dd.id
      WHERE fd.key = 'r_2k04'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ 未找到 r_2k04 字段');
      return;
    }
    
    const field = result.rows[0];
    console.log('📊 r_2k04 字段定义:');
    console.log('='.repeat(80));
    console.log(`ID: ${field.id}`);
    console.log(`Key: ${field.key}`);
    console.log(`Type: ${field.type}`);
    console.log(`Kind: ${field.kind}`);
    console.log(`Schema: ${JSON.stringify(field.schema, null, 2)}`);
    console.log(`Validators: ${JSON.stringify(field.validators, null, 2)}`);
    console.log(`Required: ${field.required}`);
    console.log(`Directory: ${field.directory_title} (${field.directory_slug})`);
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await pool.end();
  }
}

checkSpecificField();
