import { Pool } from 'pg'

const pool = new Pool({ 
  host: 'localhost',
  port: 5433,
  user: 'aino',
  password: 'pass',
  database: 'aino',
  ssl: false
})

async function testDatabase() {
  try {
    console.log('🔧 测试数据库连接...')
    
    // 测试连接
    const result = await pool.query('SELECT NOW() as current_time')
    console.log('✅ 数据库连接成功:', result.rows[0].current_time)
    
    // 检查表是否存在
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    console.log('📋 现有表:', tables.rows.map(r => r.table_name))
    
    // 创建简单的测试表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ 测试表创建成功')
    
    // 插入测试数据
    const insertResult = await pool.query(`
      INSERT INTO test_table (name) VALUES ($1) RETURNING id, name
    `, ['测试数据'])
    console.log('✅ 测试数据插入成功:', insertResult.rows[0])
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error)
  } finally {
    await pool.end()
  }
}

testDatabase()
