import { Pool } from 'pg'

const pool = new Pool({ 
  host: 'localhost',
  port: 5433,
  user: 'aino',
  password: 'pass',
  database: 'aino',
  ssl: false
})

async function initDatabase() {
  try {
    console.log('🔧 初始化数据库...')
    
    // 创建 users 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        roles TEXT[] DEFAULT '{"user"}' NOT NULL,
        avatar TEXT,
        status VARCHAR(50) DEFAULT 'active' NOT NULL,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ users 表创建成功')
    
    // 创建 applications 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        owner_id UUID NOT NULL,
        status VARCHAR(50) DEFAULT 'active' NOT NULL,
        template VARCHAR(100) DEFAULT 'blank',
        config JSONB DEFAULT '{}',
        database_config JSONB DEFAULT '{}',
        is_public BOOLEAN DEFAULT false,
        version VARCHAR(50) DEFAULT '1.0.0',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ applications 表创建成功')
    
    // 插入测试用户
    const testUser = await pool.query(`
      INSERT INTO users (name, email, password, roles) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['Admin', 'admin@aino.com', 'mock-password-hash', ['admin']])
    
    if (testUser.rows.length > 0) {
      console.log('✅ 测试用户创建成功:', testUser.rows[0].id)
      
      // 插入示例应用
      const sampleApp = await pool.query(`
        INSERT INTO applications (name, description, slug, owner_id, template) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `, ['示例应用', '这是一个示例应用', 'example-app', testUser.rows[0].id, 'default'])
      
      if (sampleApp.rows.length > 0) {
        console.log('✅ 示例应用创建成功:', sampleApp.rows[0].id)
      }
    } else {
      console.log('ℹ️ 测试用户已存在')
    }
    
    console.log('🎉 数据库初始化完成')
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    throw error
  } finally {
    await pool.end()
  }
}

initDatabase()
