const { Pool } = require('pg');

async function checkFieldDefs() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'aino',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_NAME || 'aino'
  });

  try {
    console.log('🔍 检查数据库中的字段定义...');
    
    // 查询所有字段定义
    const result = await pool.query(`
      SELECT 
        fd.id,
        fd.key,
        fd.type,
        fd.kind,
        dd.title as directory_title,
        dd.slug as directory_slug
      FROM field_defs fd
      JOIN directory_defs dd ON fd.directory_id = dd.id
      ORDER BY dd.title, fd.key
    `);
    
    console.log(`📊 找到 ${result.rows.length} 个字段定义:`);
    console.log('='.repeat(80));
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.directory_title} (${row.directory_slug})`);
      console.log(`   字段: ${row.key} | 类型: ${row.type} | 种类: ${row.kind}`);
      console.log('');
    });
    
    // 统计字段类型
    const typeStats = {};
    result.rows.forEach(row => {
      typeStats[row.type] = (typeStats[row.type] || 0) + 1;
    });
    
    console.log('📈 字段类型统计:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} 个`);
    });
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await pool.end();
  }
}

checkFieldDefs();
