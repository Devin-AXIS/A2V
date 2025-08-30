const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.PG_URL || 'postgresql://aino:pass@localhost:5433/aino'
})

async function testFieldDefsAPI() {
  const client = await pool.connect()
  
  try {
    console.log('🧪 测试字段定义 API...\n')
    
    // 1. 获取目录定义ID
    console.log('1. 获取目录定义...')
    const dirResult = await client.query('SELECT id FROM directory_defs WHERE slug = $1', ['users'])
    if (dirResult.rows.length === 0) {
      console.log('❌ 目录定义不存在，先创建目录定义')
      await client.query(`
        INSERT INTO directory_defs (slug, title, status) 
        VALUES ('users', '用户管理', 'active') 
        ON CONFLICT (slug) DO NOTHING
      `)
      const newDirResult = await client.query('SELECT id FROM directory_defs WHERE slug = $1', ['users'])
      dirResult.rows = newDirResult.rows
    }
    const directoryId = dirResult.rows[0].id
    console.log('✅ 目录定义ID:', directoryId)
    
    // 2. 测试API调用
    console.log('\n2. 测试API调用...')
    
    const baseUrl = 'http://localhost:3001/api/field-defs'
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    }
    
    // 创建字段定义
    console.log('   - 创建字段定义...')
    const createResponse = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        directoryId,
        key: 'name',
        kind: 'primitive',
        type: 'text',
        required: true,
        readRoles: ['admin', 'member'],
        writeRoles: ['admin']
      })
    })
    
    if (createResponse.ok) {
      const createdFieldDef = await createResponse.json()
      console.log('   ✅ 创建成功:', createdFieldDef.data.key)
      
      // 查询字段定义列表
      console.log('   - 查询字段定义列表...')
      const listResponse = await fetch(`${baseUrl}?directoryId=${directoryId}&page=1&limit=10`, { headers })
      if (listResponse.ok) {
        const listResult = await listResponse.json()
        console.log('   ✅ 查询成功，字段数:', listResult.pagination?.total || 0)
      }
      
      // 查询单个字段定义
      console.log('   - 查询单个字段定义...')
      const getResponse = await fetch(`${baseUrl}/${createdFieldDef.data.id}`, { headers })
      if (getResponse.ok) {
        const fieldDef = await getResponse.json()
        console.log('   ✅ 查询成功:', fieldDef.data.key)
      }
      
      // 更新字段定义
      console.log('   - 更新字段定义...')
      const updateResponse = await fetch(`${baseUrl}/${createdFieldDef.data.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          type: 'email',
          required: false
        })
      })
      
      if (updateResponse.ok) {
        const updatedFieldDef = await updateResponse.json()
        console.log('   ✅ 更新成功:', updatedFieldDef.data.type)
      }
      
    } else {
      console.log('   ❌ 创建失败:', await createResponse.text())
    }
    
    console.log('\n🎉 字段定义 API 测试完成！')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

// 运行测试
testFieldDefsAPI()
