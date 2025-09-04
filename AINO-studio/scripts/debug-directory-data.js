#!/usr/bin/env node

/**
 * 调试目录数据
 */

const API_BASE_URL = 'http://localhost:3001'

async function debugDirectoryData() {
  console.log('🔍 调试目录数据...')
  
  const headers = {
    'Authorization': 'Bearer test-token',
    'Content-Type': 'application/json'
  }
  
  try {
    // 1. 获取应用信息
    console.log('\n1. 获取应用信息...')
    const appsResponse = await fetch(`${API_BASE_URL}/api/applications`, { headers })
    const appsData = await appsResponse.json()
    
    if (!appsData.success || !appsData.data || !appsData.data.applications || appsData.data.applications.length === 0) {
      console.error('❌ 没有找到应用')
      return
    }
    
    const app = appsData.data.applications[0]
    console.log('✅ 找到应用:', app.name, 'ID:', app.id)
    
    // 2. 获取模块信息
    console.log('\n2. 获取模块信息...')
    const modulesResponse = await fetch(`${API_BASE_URL}/api/modules?applicationId=${app.id}`, { headers })
    const modulesData = await modulesResponse.json()
    
    if (!modulesData.success || !modulesData.data || !modulesData.data.modules || modulesData.data.modules.length === 0) {
      console.error('❌ 没有找到模块')
      return
    }
    
    const module = modulesData.data.modules[0]
    console.log('✅ 找到模块:', module.name, 'ID:', module.id)
    
    // 3. 获取目录信息
    console.log('\n3. 获取目录信息...')
    const dirsResponse = await fetch(`${API_BASE_URL}/api/directories?applicationId=${app.id}&moduleId=${module.id}`, { headers })
    const dirsData = await dirsResponse.json()
    
    if (!dirsData.success || !dirsData.data || !dirsData.data.directories || dirsData.data.directories.length === 0) {
      console.error('❌ 没有找到目录')
      return
    }
    
    const dir = dirsData.data.directories[0]
    console.log('✅ 找到目录:', dir.name, 'ID:', dir.id)
    console.log('📋 目录详细信息:', JSON.stringify(dir, null, 2))
    
    // 4. 检查目录定义是否存在
    console.log('\n4. 检查目录定义是否存在...')
    const dirDefsResponse = await fetch(`${API_BASE_URL}/api/directory-defs?directoryId=${dir.id}`, { headers })
    const dirDefsData = await dirDefsResponse.json()
    
    console.log('📋 目录定义查询结果:', JSON.stringify(dirDefsData, null, 2))
    
    if (dirDefsData.success && dirDefsData.data && dirDefsData.data.length > 0) {
      console.log('✅ 找到现有目录定义')
    } else {
      console.log('❌ 没有找到现有目录定义，需要创建')
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error)
  }
}

// 运行调试
debugDirectoryData()
