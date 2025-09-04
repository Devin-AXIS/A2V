#!/usr/bin/env node

/**
 * 测试目录API
 * 使用方法: node scripts/test-directories-api.js
 */

const BASE_URL = 'http://localhost:3001'

// 模拟用户登录获取token
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    })

    if (!response.ok) {
      throw new Error(`登录失败: ${response.status}`)
    }

    const data = await response.json()
    console.log('登录响应:', JSON.stringify(data, null, 2))
    if (!data.success) {
      throw new Error(data.message || '登录失败')
    }
    return data.token || data.data?.token
  } catch (error) {
    console.error('登录失败:', error.message)
    return null
  }
}

// 获取应用列表
async function getApplications(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`获取应用列表失败: ${response.status}`)
    }

    const data = await response.json()
    return data.data.applications
  } catch (error) {
    console.error('获取应用列表失败:', error.message)
    return []
  }
}

// 获取模块列表
async function getModules(token, applicationId) {
  try {
    const response = await fetch(`${BASE_URL}/api/applications/${applicationId}/modules`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`获取模块列表失败: ${response.status}`)
    }

    const data = await response.json()
    return data.data.modules
  } catch (error) {
    console.error('获取模块列表失败:', error.message)
    return []
  }
}

// 测试目录API
async function testDirectoriesAPI() {
  console.log('🚀 开始测试目录API...\n')

  // 1. 登录获取token
  console.log('1. 用户登录...')
  const token = await login()
  if (!token) {
    console.error('❌ 登录失败，无法继续测试')
    return
  }
  console.log('✅ 登录成功\n')

  // 2. 获取应用列表
  console.log('2. 获取应用列表...')
  const applications = await getApplications(token)
  if (applications.length === 0) {
    console.error('❌ 没有找到应用，无法继续测试')
    return
  }
  const application = applications[0]
  console.log(`✅ 找到应用: ${application.name} (ID: ${application.id})\n`)

  // 3. 获取模块列表
  console.log('3. 获取模块列表...')
  const modules = await getModules(token, application.id)
  if (modules.length === 0) {
    console.error('❌ 没有找到模块，无法继续测试')
    return
  }
  const module = modules[0]
  console.log(`✅ 找到模块: ${module.name} (ID: ${module.id})\n`)

  // 4. 测试获取目录列表
  console.log('4. 测试获取目录列表...')
  try {
    const response = await fetch(`${BASE_URL}/api/directories?applicationId=${application.id}&moduleId=${module.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`获取目录列表失败: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ 获取目录列表成功，共 ${data.data.directories.length} 个目录`)
    console.log('分页信息:', data.data.pagination)
  } catch (error) {
    console.error('❌ 获取目录列表失败:', error.message)
  }
  console.log()

  // 5. 测试创建目录
  console.log('5. 测试创建目录...')
  try {
    const createData = {
      name: '测试目录',
      type: 'table',
      supportsCategory: true,
      config: { description: '这是一个测试目录' },
      order: 1
    }

    const response = await fetch(`${BASE_URL}/api/directories?applicationId=${application.id}&moduleId=${module.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`创建目录失败: ${response.status} - ${errorData.error}`)
    }

    const data = await response.json()
    console.log('✅ 创建目录成功:', data.data.name)
    const directoryId = data.data.id

    // 6. 测试获取目录详情
    console.log('\n6. 测试获取目录详情...')
    const detailResponse = await fetch(`${BASE_URL}/api/directories/${directoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!detailResponse.ok) {
      throw new Error(`获取目录详情失败: ${detailResponse.status}`)
    }

    const detailData = await detailResponse.json()
    console.log('✅ 获取目录详情成功:', detailData.data.name)

    // 7. 测试更新目录
    console.log('\n7. 测试更新目录...')
    const updateData = {
      name: '更新后的测试目录',
      config: { description: '这是更新后的测试目录' }
    }

    const updateResponse = await fetch(`${BASE_URL}/api/directories/${directoryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      throw new Error(`更新目录失败: ${updateResponse.status} - ${errorData.error}`)
    }

    const updateResult = await updateResponse.json()
    console.log('✅ 更新目录成功:', updateResult.data.name)

    // 8. 测试删除目录
    console.log('\n8. 测试删除目录...')
    const deleteResponse = await fetch(`${BASE_URL}/api/directories/${directoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json()
      throw new Error(`删除目录失败: ${deleteResponse.status} - ${errorData.error}`)
    }

    const deleteResult = await deleteResponse.json()
    console.log('✅ 删除目录成功:', deleteResult.message)

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }

  console.log('\n🎉 目录API测试完成！')
}

// 运行测试
testDirectoriesAPI().catch(console.error)
