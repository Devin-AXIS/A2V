const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.PG_URL || 'postgresql://aino:pass@localhost:5433/aino'
})

async function testRecordsAPI() {
  const client = await pool.connect()
  
  try {
    console.log('🧪 测试 Records API...\n')
    
    // 1. 创建目录定义
    console.log('1. 创建目录定义...')
    const dirDefResult = await client.query(`
      INSERT INTO directory_defs (slug, title, status) 
      VALUES ('users', '用户管理', 'active') 
      ON CONFLICT (slug) DO NOTHING 
      RETURNING *
    `)
    console.log('✅ 目录定义:', dirDefResult.rows[0]?.slug || '已存在')
    
    // 2. 创建字段定义
    console.log('\n2. 创建字段定义...')
    const dirId = dirDefResult.rows[0]?.id || (await client.query('SELECT id FROM directory_defs WHERE slug = $1', ['users'])).rows[0].id
    
    await client.query(`
      INSERT INTO field_defs (directory_id, key, kind, type, required) 
      VALUES 
        ($1, 'name', 'primitive', 'text', true),
        ($1, 'email', 'primitive', 'text', true),
        ($1, 'phone', 'primitive', 'text', false),
        ($1, 'role', 'primitive', 'select', true)
      ON CONFLICT DO NOTHING
    `, [dirId])
    console.log('✅ 字段定义创建完成')
    
    // 3. 测试API调用
    console.log('\n3. 测试API调用...')
    
    const baseUrl = 'http://localhost:3001/api/records'
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token' // 修改为test-token
    }
    
    // 创建记录
    console.log('   - 创建用户记录...')
    const createResponse = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        props: {
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138000',
          role: 'admin'
        }
      })
    })
    
    if (createResponse.ok) {
      const createdRecord = await createResponse.json()
      console.log('   ✅ 创建成功:', createdRecord.id)
      console.log('   📄 创建返回数据:', JSON.stringify(createdRecord, null, 2))
      
      // 查询记录
      console.log('   - 查询记录列表...')
      const listResponse = await fetch(`${baseUrl}/users?page=1&limit=10`, { headers })
      if (listResponse.ok) {
        const listResult = await listResponse.json()
        console.log('   📄 列表返回数据:', JSON.stringify(listResult, null, 2))
        console.log('   📊 分页信息:', listResult.pagination)
        console.log('   📊 数据长度:', listResult.data?.length || 0)
        console.log('   ✅ 查询成功，记录数:', listResult.pagination?.total || '未知')
      } else {
        console.log('   ❌ 查询失败:', await listResponse.text())
      }
      
      // 查询单个记录
      console.log('   - 查询单个记录...')
      const getResponse = await fetch(`${baseUrl}/users/${createdRecord.id}`, { headers })
      if (getResponse.ok) {
        const record = await getResponse.json()
        console.log('   ✅ 查询成功:', record.props.name)
      }
      
      // 更新记录
      console.log('   - 更新记录...')
      const updateResponse = await fetch(`${baseUrl}/users/${createdRecord.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          props: {
            name: '张三（已更新）',
            email: 'zhangsan@example.com',
            phone: '13800138001',
            role: 'user'
          },
          version: createdRecord.version
        })
      })
      
      if (updateResponse.ok) {
        const updatedRecord = await updateResponse.json()
        console.log('   ✅ 更新成功:', updatedRecord.props.name)
      }
      
    } else {
      console.log('   ❌ 创建失败:', await createResponse.text())
    }
    
    console.log('\n🎉 Records API 测试完成！')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

// 运行测试
testRecordsAPI()
