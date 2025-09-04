#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001'

async function testModulesAPI() {
  console.log('🧪 测试应用模块 API...\n')

  // 1. 先获取应用列表
  console.log('1. 获取应用列表...')
  try {
    const appsResponse = await fetch(`${BASE_URL}/api/applications`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    })
    
    const appsData = await appsResponse.json()
    console.log('   状态码:', appsResponse.status)
    
    if (appsData.success && appsData.data.applications.length > 0) {
      const appId = appsData.data.applications[0].id
      console.log('   找到应用:', appsData.data.applications[0].name, 'ID:', appId)
      
      // 2. 获取该应用的模块列表
      console.log('\n2. 获取应用模块列表...')
      const modulesResponse = await fetch(`${BASE_URL}/api/applications/${appId}/modules`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })
      
      const modulesData = await modulesResponse.json()
      console.log('   状态码:', modulesResponse.status)
      console.log('   响应:', JSON.stringify(modulesData, null, 2))
      
      if (modulesData.success && modulesData.data.modules) {
        console.log('\n✅ 应用模块获取成功！')
        console.log('   模块数量:', modulesData.data.modules.length)
        modulesData.data.modules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.name} (${module.type}) - ${module.icon}`)
        })
      }
    } else {
      console.log('   没有找到应用，需要先创建应用')
    }
    
  } catch (error) {
    console.log('   错误:', error.message)
  }
  
  console.log('\n🎯 测试完成！')
}

// 运行测试
testModulesAPI().catch(console.error)
