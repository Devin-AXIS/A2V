import { db } from '../src/db/index.ts'
import { directoryDefs } from '../src/db/schema.ts'

async function createTestData() {
  try {
    console.log('开始创建测试数据...')
    
    // 创建测试的directory_defs记录
    const [directoryDef] = await db.insert(directoryDefs)
      .values({
        slug: 'test-users',
        title: '测试用户目录',
        version: 1,
        status: 'active',
        applicationId: '2b81d76b-7943-41c7-ba12-ff6e553d5611', // 使用现有的applicationId
        directoryId: '70ff3047-d08c-49cb-b7ec-c04241be6467', // 使用现有的directoryId
      })
      .returning()
    
    console.log('创建的directory_defs记录:', directoryDef)
    
    console.log('测试数据创建完成！')
    console.log('可以使用以下directoryId创建字段定义:', directoryDef.id)
    
  } catch (error) {
    console.error('创建测试数据失败:', error)
  } finally {
    process.exit(0)
  }
}

createTestData()
