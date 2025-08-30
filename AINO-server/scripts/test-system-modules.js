#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001'

async function testSystemModules() {
  console.log('🧪 测试系统模块自动创建...\n')

  // 1. 创建一个测试应用
  console.log('1. 创建测试应用...')
  try {
    const createResponse = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        name: '测试应用-系统模块',
        description: '测试系统模块自动创建',
        template: 'blank',
        isPublic: false
      })
    })
    
    const createData = await createResponse.json()
    console.log('   状态码:', createResponse.status)
    console.log('   响应:', JSON.stringify(createData, null, 2))
    
    if (createData.success && createData.data) {
      const applicationId = createData.data.id
      console.log('   应用ID:', applicationId)
      
      // 2. 获取应用的模块列表
      console.log('\n2. 获取应用模块列表...')
      const modulesResponse = await fetch(`${BASE_URL}/api/applications/${applicationId}/modules`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })
      
      const modulesData = await modulesResponse.json()
      console.log('   状态码:', modulesResponse.status)
      console.log('   响应:', JSON.stringify(modulesData, null, 2))
      
      if (modulesData.success && modulesData.data.modules) {
        console.log('\n✅ 系统模块创建成功！')
        console.log('   模块数量:', modulesData.data.modules.length)
        modulesData.data.modules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.name} (${module.type})`)
        })
      }
    }
    
  } catch (error) {
    console.log('   错误:', error.message)
  }
  
  console.log('\n🎯 测试完成！')
}

// 运行测试
testSystemModules().catch(console.error)
