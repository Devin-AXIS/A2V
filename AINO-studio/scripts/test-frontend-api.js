#!/usr/bin/env node

// 测试前端API调用
const BASE_URL = 'http://localhost:3001'

async function testFrontendAPI() {
  console.log('🧪 测试前端 API 调用...\n')

  // 模拟前端API调用
  const testToken = 'test-token'
  
  try {
    // 1. 测试应用列表API
    console.log('1. 测试应用列表API...')
    const appsResponse = await fetch(`${BASE_URL}/api/applications`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('   状态码:', appsResponse.status)
    
    if (appsResponse.ok) {
      const appsData = await appsResponse.json()
      console.log('   响应:', JSON.stringify(appsData, null, 2))
      
      if (appsData.success && appsData.data.applications.length > 0) {
        const appId = appsData.data.applications[0].id
        console.log('   找到应用:', appsData.data.applications[0].name, 'ID:', appId)
        
        // 2. 测试应用模块API
        console.log('\n2. 测试应用模块API...')
        const modulesResponse = await fetch(`${BASE_URL}/api/applications/${appId}/modules`, {
          headers: {
            'Authorization': `Bearer ${testToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('   状态码:', modulesResponse.status)
        
        if (modulesResponse.ok) {
          const modulesData = await modulesResponse.json()
          console.log('   响应:', JSON.stringify(modulesData, null, 2))
          
          if (modulesData.success && modulesData.data.modules) {
            console.log('\n✅ 前端API调用成功！')
            console.log('   模块数量:', modulesData.data.modules.length)
            modulesData.data.modules.forEach((module, index) => {
              console.log(`   ${index + 1}. ${module.name} (${module.type}) - ${module.icon}`)
            })
          }
        } else {
          console.log('   错误:', modulesResponse.statusText)
        }
      }
    } else {
      console.log('   错误:', appsResponse.statusText)
    }
    
  } catch (error) {
    console.log('   网络错误:', error.message)
  }
  
  console.log('\n🎯 测试完成！')
}

// 运行测试
testFrontendAPI().catch(console.error)
