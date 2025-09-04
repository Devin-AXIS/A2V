#!/usr/bin/env node

/**
 * 测试自定义经历字段的保存和加载
 */

const API_BASE_URL = 'http://localhost:3001'

async function testCustomExperienceField() {
  console.log('🧪 测试自定义经历字段的保存和加载...')
  
  // 添加认证头
  const headers = {
    'Authorization': 'Bearer test-token',
    'Content-Type': 'application/json'
  }
  
  try {
    // 1. 首先获取应用和目录信息
    console.log('\n1. 获取应用信息...')
    const appsResponse = await fetch(`${API_BASE_URL}/api/applications`, { headers })
    const appsData = await appsResponse.json()
    
    if (!appsData.success || !appsData.data || !appsData.data.applications || appsData.data.applications.length === 0) {
      console.error('❌ 没有找到应用')
      return
    }
    
    // 使用数据库中真实存在的数据
    const app = { id: '6815a842-c47c-486a-813d-d8d058e3f59c', name: '真实应用' }
    console.log('✅ 使用真实应用:', app.name, 'ID:', app.id)
    
    // 使用数据库中真实存在的模块
    const module = { id: '1e43401c-0a79-4f4e-b9c1-630748379d21', name: '用户管理' }
    console.log('✅ 使用真实模块:', module.name, 'ID:', module.id)
    
    // 使用数据库中真实存在的目录
    const dir = { id: '7e92041f-71a9-4dd6-abb5-c4cb1a321fb0', name: '用户列表' }
    console.log('✅ 找到目录:', dir.name)
    
    // 4. 获取或创建目录定义
    console.log('\n4. 获取或创建目录定义...')
    const dirDefResponse = await fetch(`${API_BASE_URL}/api/directory-defs/by-directory/${dir.id}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ applicationId: app.id })
    })
    const dirDefData = await dirDefResponse.json()
    
    if (!dirDefData.success || !dirDefData.data) {
      console.error('❌ 获取目录定义失败:', dirDefData.error)
      return
    }
    
    const dirDefId = dirDefData.data.id
    console.log('✅ 目录定义ID:', dirDefId)
    
    // 5. 创建自定义经历字段
    console.log('\n5. 创建自定义经历字段...')
    const customExperienceConfig = {
      experienceName: "恋爱经历",
      eventName: "约会"
    }
    
    const fieldData = {
      directoryId: dirDefId,
      key: 'test_custom_experience',
      kind: 'primitive',
      type: 'experience',
      schema: {
        label: '测试其他经历',
        placeholder: '请输入经历信息',
        description: '这是一个测试的自定义经历字段',
        required: false,
        showInList: true,
        showInForm: true,
        showInDetail: true,
        preset: 'custom_experience',
        customExperienceConfig: customExperienceConfig
      },
      validators: {},
      required: false
    }
    
    console.log('📝 字段数据:', JSON.stringify(fieldData, null, 2))
    
    const createResponse = await fetch(`${API_BASE_URL}/api/field-defs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(fieldData)
    })
    
    const createData = await createResponse.json()
    
    if (!createData.success) {
      console.error('❌ 创建字段失败:', createData.error)
      return
    }
    
    const fieldId = createData.data.id
    console.log('✅ 字段创建成功, ID:', fieldId)
    console.log('📋 创建的字段数据:', JSON.stringify(createData.data, null, 2))
    
    // 6. 验证字段是否保存了customExperienceConfig
    console.log('\n6. 验证字段配置...')
    if (createData.data.schema && createData.data.schema.customExperienceConfig) {
      console.log('✅ customExperienceConfig 已保存:')
      console.log('   - experienceName:', createData.data.schema.customExperienceConfig.experienceName)
      console.log('   - eventName:', createData.data.schema.customExperienceConfig.eventName)
    } else {
      console.error('❌ customExperienceConfig 未保存')
      console.log('📋 实际保存的schema:', JSON.stringify(createData.data.schema, null, 2))
    }
    
    // 7. 重新获取字段验证数据持久化
    console.log('\n7. 重新获取字段验证数据持久化...')
    const getResponse = await fetch(`${API_BASE_URL}/api/field-defs/${fieldId}`, { headers })
    const getData = await getResponse.json()
    
    if (!getData.success) {
      console.error('❌ 获取字段失败:', getData.error)
      return
    }
    
    console.log('📋 从数据库获取的字段数据:', JSON.stringify(getData.data, null, 2))
    
    if (getData.data.schema && getData.data.schema.customExperienceConfig) {
      console.log('✅ 数据持久化验证成功:')
      console.log('   - experienceName:', getData.data.schema.customExperienceConfig.experienceName)
      console.log('   - eventName:', getData.data.schema.customExperienceConfig.eventName)
    } else {
      console.error('❌ 数据持久化验证失败 - customExperienceConfig 丢失')
    }
    
    // 8. 获取字段列表验证
    console.log('\n8. 获取字段列表验证...')
    const listResponse = await fetch(`${API_BASE_URL}/api/field-defs?directoryId=${dirDefId}`, { headers })
    const listData = await listResponse.json()
    
    if (!listData.success) {
      console.error('❌ 获取字段列表失败:', listData.error)
      return
    }
    
    const testField = listData.data.find(f => f.id === fieldId)
    if (testField && testField.schema && testField.schema.customExperienceConfig) {
      console.log('✅ 字段列表中的配置正确:')
      console.log('   - experienceName:', testField.schema.customExperienceConfig.experienceName)
      console.log('   - eventName:', testField.schema.customExperienceConfig.eventName)
    } else {
      console.error('❌ 字段列表中的配置丢失')
    }
    
    console.log('\n🎉 测试完成!')
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error)
  }
}

// 运行测试
testCustomExperienceField()
