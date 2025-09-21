import { db } from '../src/db/index.ts'
import { dirUsers } from '../src/db/schema.ts'

async function createTestRecords() {
  try {
    console.log('开始创建测试记录...')
    
    // 创建测试的dirUsers记录
    const [userRecord] = await db.insert(dirUsers)
      .values({
        tenantId: 'f09ebe12-f517-42a2-b41a-7092438b79c3', // 使用有效的UUID
        version: 1,
        props: {
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138000',
          age: 25,
          roles: ['user', 'editor']
        },
        createdBy: 'f09ebe12-f517-42a2-b41a-7092438b79c3',
        updatedBy: 'f09ebe12-f517-42a2-b41a-7092438b79c3'
      })
      .returning()
    
    console.log('创建的dirUsers记录:', userRecord)
    
    console.log('测试记录创建完成！')
    console.log('可以使用以下ID查询记录:', userRecord.id)
    
  } catch (error) {
    console.error('创建测试记录失败:', error)
  } finally {
    process.exit(0)
  }
}

createTestRecords()
