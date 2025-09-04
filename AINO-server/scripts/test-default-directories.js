#!/usr/bin/env node

/**
 * 测试用户模块默认目录创建
 * 使用方法: node scripts/test-default-directories.js
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

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || '登录失败')
    }
    return data.token || data.data?.token
  } catch (error) {
    console.error('登录失败:', error.message)
    return null
  }
}

// 创建测试应用
async function createTestApplication(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '测试用户管理应用',
        description: '用于测试用户模块默认目录的应用',
        template: 'blank',
        isPublic: false,
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`创建应用失败: ${response.status} - ${errorData.error}`)
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('创建应用失败:', error.message)
    return null
  }
}

// 获取应用模块列表
async function getApplicationModules(token, applicationId) {
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

// 获取目录列表
async function getDirectories(token, applicationId, moduleId) {
  try {
    const response = await fetch(`${BASE_URL}/api/directories?applicationId=${applicationId}&moduleId=${moduleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`获取目录列表失败: ${response.status}`)
    }

    const data = await response.json()
    return data.data.directories
  } catch (error) {
    console.error('获取目录列表失败:', error.message)
    return []
  }
}

// 测试默认目录创建
async function testDefaultDirectories() {
  console.log('🚀 开始测试用户模块默认目录创建...\n')

  // 1. 登录获取token
  console.log('1. 用户登录...')
  const token = await login()
  if (!token) {
    console.error('❌ 登录失败，无法继续测试')
    return
  }
  console.log('✅ 登录成功\n')

  // 2. 创建测试应用
  console.log('2. 创建测试应用...')
  const application = await createTestApplication(token)
  if (!application) {
    console.error('❌ 创建应用失败，无法继续测试')
    return
  }
  console.log(`✅ 创建应用成功: ${application.name} (ID: ${application.id})\n`)

  // 3. 获取应用模块列表
  console.log('3. 获取应用模块列表...')
  const modules = await getApplicationModules(token, application.id)
  if (modules.length === 0) {
    console.error('❌ 没有找到模块，无法继续测试')
    return
  }
  console.log(`✅ 找到 ${modules.length} 个模块:`)
  modules.forEach(module => {
    console.log(`   - ${module.name} (${module.type})`)
  })
  console.log()

  // 4. 查找用户管理模块
  const userModule = modules.find(m => m.name === '用户管理')
  if (!userModule) {
    console.error('❌ 没有找到用户管理模块')
    return
  }
  console.log(`4. 找到用户管理模块: ${userModule.name} (ID: ${userModule.id})\n`)

  // 5. 获取用户模块的目录列表
  console.log('5. 获取用户模块的目录列表...')
  const directories = await getDirectories(token, application.id, userModule.id)
  console.log(`✅ 找到 ${directories.length} 个目录:`)
  
  if (directories.length === 0) {
    console.log('   ⚠️  没有找到默认目录，可能需要检查数据库迁移')
  } else {
    directories.forEach(directory => {
      console.log(`   - ${directory.name} (${directory.type})`)
      if (directory.config && directory.config.description) {
        console.log(`     描述: ${directory.config.description}`)
      }
      if (directory.config && directory.config.fields) {
        console.log(`     字段数: ${directory.config.fields.length}`)
      }
    })
  }
  console.log()

  // 6. 验证默认目录
  console.log('6. 验证默认目录...')
  const expectedDirectories = ['用户列表', '部门管理', '用户注册']
  const foundDirectories = directories.map(d => d.name)
  
  for (const expected of expectedDirectories) {
    if (foundDirectories.includes(expected)) {
      console.log(`   ✅ ${expected}`)
    } else {
      console.log(`   ❌ ${expected} (未找到)`)
    }
  }
  console.log()

  console.log('🎉 用户模块默认目录测试完成！')
  console.log(`📝 应用ID: ${application.id}`)
  console.log(`📝 用户模块ID: ${userModule.id}`)
  console.log(`📝 目录数量: ${directories.length}`)
}

// 运行测试
testDefaultDirectories().catch(console.error)
