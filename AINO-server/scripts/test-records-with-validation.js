const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.PG_URL || 'postgresql://aino:pass@localhost:5433/aino'
})

async function testRecordsWithValidation() {
  const client = await pool.connect()
  
  try {
    console.log('🧪 测试带字段验证的 Records API...\n')
    
    // 1. 创建字段定义
    console.log('1. 创建字段定义...')
    const dirResult = await client.query('SELECT id FROM directory_defs WHERE slug = $1', ['users'])
    const directoryId = dirResult.rows[0].id
    
    // 插入字段定义
    await client.query(`
      INSERT INTO field_defs (directory_id, key, kind, type, required, schema) 
      VALUES 
        ($1, 'name', 'primitive', 'text', true, null),
        ($1, 'email', 'primitive', 'email', true, null),
        ($1, 'phone', 'primitive', 'phone', false, null),
        ($1, 'age', 'primitive', 'number', false, null),
        ($1, 'role', 'primitive', 'select', true, '{"options": ["admin", "user", "guest"]}'),
        ($1, 'skills', 'primitive', 'multiselect', false, '{"options": ["JavaScript", "React", "Node.js"]}'),
        ($1, 'birthDate', 'primitive', 'date', false, null),
        ($1, 'isActive', 'primitive', 'boolean', false, null)
      ON CONFLICT DO NOTHING
    `, [directoryId])
    console.log('✅ 字段定义创建完成')
    
    // 2. 测试API调用
    console.log('\n2. 测试API调用...')
    
    const baseUrl = 'http://localhost:3001/api/records'
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    }
    
    // 测试用例1：有效数据
    console.log('   - 测试有效数据...')
    const validData = {
      name: '李四',
      email: 'lisi@example.com',
      phone: '13900139000',
      age: 30,
      role: 'user',
      skills: ['JavaScript', 'React'],
      birthDate: '1993-05-15',
      isActive: true
    }
    
    const createResponse = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ props: validData })
    })
    
    if (createResponse.ok) {
      const createdRecord = await createResponse.json()
      console.log('   ✅ 创建成功:', createdRecord.data.id)
      console.log('   📄 转换后的数据:', createdRecord.data.props)
    } else {
      const error = await createResponse.text()
      console.log('   ❌ 创建失败:', error)
    }
    
    // 测试用例2：无效数据
    console.log('\n   - 测试无效数据...')
    const invalidData = {
      name: '', // 必填字段为空
      email: 'invalid-email', // 无效邮箱
      phone: '123', // 无效手机号
      age: 'not-a-number', // 无效数字
      role: 'invalid-role', // 不在选项中的角色
      skills: ['InvalidSkill'], // 不在选项中的技能
      birthDate: 'invalid-date', // 无效日期
      isActive: 'not-boolean' // 无效布尔值
    }
    
    const invalidResponse = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ props: invalidData })
    })
    
    if (invalidResponse.ok) {
      console.log('   ❌ 应该失败但成功了')
    } else {
      const error = await invalidResponse.text()
      console.log('   ✅ 验证失败（预期）:', error)
    }
    
    // 测试用例3：部分有效数据
    console.log('\n   - 测试部分有效数据...')
    const partialData = {
      name: '王五',
      email: 'wangwu@example.com',
      phone: '138 0013 8000', // 带空格的手机号
      role: 'admin',
      isActive: 'true' // 字符串布尔值
    }
    
    const partialResponse = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ props: partialData })
    })
    
    if (partialResponse.ok) {
      const partialRecord = await partialResponse.json()
      console.log('   ✅ 创建成功:', partialRecord.data.id)
      console.log('   📄 转换后的数据:', partialRecord.data.props)
    } else {
      const error = await partialResponse.text()
      console.log('   ❌ 创建失败:', error)
    }
    
    console.log('\n🎉 带字段验证的 Records API 测试完成！')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

// 运行测试
testRecordsWithValidation()
