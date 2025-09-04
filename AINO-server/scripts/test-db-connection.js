import { db } from '../src/db/index.js'
import { directories } from '../src/db/schema.js'

async function testDBConnection() {
  try {
    console.log('🧪 测试数据库连接...')
    
    // 测试简单查询
    const result = await db.select().from(directories).limit(1)
    console.log('✅ 数据库连接成功')
    console.log('查询结果:', result)
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    console.error('错误详情:', error)
  }
}

testDBConnection()
