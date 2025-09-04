#!/usr/bin/env node

/**
 * 测试工作经历字段保存功能
 * 验证experience字段类型是否能正确保存和验证
 */

// 简单的API请求函数
async function apiRequest(endpoint, options = {}) {
  const baseUrl = 'http://localhost:3001'
  const url = `${baseUrl}${endpoint}`
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    }
  }
  
  const finalOptions = { ...defaultOptions, ...options }
  
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body)
  }
  
  try {
    const response = await fetch(url, finalOptions)
    const data = await response.json()
    
    return {
      success: response.ok,
      data: data.data || data,
      error: data.error || (response.ok ? null : `HTTP ${response.status}`)
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

async function testExperienceField() {
  console.log('🧪 测试工作经历字段保存功能...\n')

  try {
    // 1. 获取应用和目录信息
    console.log('📋 获取应用和目录信息...')
    const appsResponse = await apiRequest('/api/applications')
    if (!appsResponse.success || !appsResponse.data?.applications?.length) {
      console.error('❌ 获取应用列表失败:', appsResponse.error)
      return
    }
    
    const app = appsResponse.data.applications[0]
    console.log(`✅ 找到应用: ${app.name} (${app.id})`)
    
    const dirsResponse = await apiRequest(`/api/directories?applicationId=${app.id}`)
    if (!dirsResponse.success || !dirsResponse.data?.directories?.length) {
      console.error('❌ 获取目录列表失败:', dirsResponse.error)
      return
    }
    
    const dir = dirsResponse.data.directories[0]
    console.log(`✅ 找到目录: ${dir.name} (${dir.id})`)

    // 2. 测试创建记录（包含工作经历字段）
    console.log('\n💼 测试创建工作经历记录...')
    
    const testExperienceData = [
      {
        id: `exp_${Date.now()}_1`,
        type: "work",
        title: "高级前端开发工程师",
        organization: "AINO科技有限公司",
        startDate: "2023-01-01",
        endDate: "2024-12-31",
        isCurrent: false,
        description: "负责前端架构设计和开发工作",
        location: "北京",
        skills: ["React", "TypeScript", "Node.js"],
        achievements: ["项目成功上线", "团队技术提升"],
        department: "技术部",
        salary: "25K-35K"
      },
      {
        id: `exp_${Date.now()}_2`,
        type: "education",
        title: "计算机科学与技术",
        organization: "清华大学",
        startDate: "2019-09-01",
        endDate: "2023-06-30",
        isCurrent: false,
        description: "主修计算机科学与技术专业",
        location: "北京",
        skills: ["算法", "数据结构", "机器学习"],
        achievements: ["优秀毕业生", "奖学金获得者"],
        degree: "本科",
        major: "计算机科学与技术",
        gpa: "3.8"
      }
    ]
    
    const recordData = {
      // 添加一些基本字段
      y_4nzv: "zhangsan@example.com", // 邮箱字段
      // 工作经历字段
      g_hcj1: testExperienceData
    }
    
    const createResponse = await apiRequest(`/api/records/${dir.id}`, {
      method: 'POST',
      body: recordData
    })
    
    if (createResponse.success) {
      console.log('✅ 工作经历记录创建成功:', createResponse.data.id)
      
      // 3. 验证记录是否正确保存
      console.log('\n📋 验证记录保存结果...')
      const getResponse = await apiRequest(`/api/records/${dir.id}/${createResponse.data.id}`)
      
      if (getResponse.success) {
        const savedRecord = getResponse.data
        console.log('✅ 记录获取成功')
        
        // 检查工作经历字段
        if (savedRecord.g_hcj1 && Array.isArray(savedRecord.g_hcj1)) {
          console.log(`📊 工作经历字段保存正确，包含 ${savedRecord.g_hcj1.length} 条经历:`)
          savedRecord.g_hcj1.forEach((exp, index) => {
            console.log(`  ${index + 1}. ${exp.title} - ${exp.organization} (${exp.startDate} ~ ${exp.endDate || '至今'})`)
          })
        } else {
          console.error('❌ 工作经历字段未正确保存')
          console.log('📋 实际保存的字段:', Object.keys(savedRecord))
        }
      } else {
        console.error('❌ 获取保存的记录失败:', getResponse.error)
      }
    } else {
      console.error('❌ 工作经历记录创建失败:', createResponse.error)
      
      // 如果创建失败，尝试分析错误原因
      if (createResponse.error && createResponse.error.includes('400')) {
        console.log('\n🔍 分析400错误原因...')
        
        // 尝试创建只有基本字段的记录
        console.log('📝 尝试创建只有基本字段的记录...')
        const basicRecordData = {
          name: "李四",
          email: "lisi@example.com"
        }
        
        const basicCreateResponse = await apiRequest(`/api/records/${dir.id}`, {
          method: 'POST',
          body: basicRecordData
        })
        
        if (basicCreateResponse.success) {
          console.log('✅ 基本记录创建成功，说明问题出在工作经历字段上')
        } else {
          console.error('❌ 基本记录创建也失败:', basicCreateResponse.error)
        }
      }
    }

    // 4. 测试无效的工作经历数据
    console.log('\n🚫 测试无效工作经历数据...')
    const invalidExperienceData = [
      {
        // 缺少必需字段
        id: "invalid_exp",
        type: "work"
        // 缺少 title, organization, startDate
      }
    ]
    
    const invalidRecordData = {
      y_4nzv: "wangwu@example.com", // 邮箱字段
      g_hcj1: invalidExperienceData // 工作经历字段
    }
    
    const invalidCreateResponse = await apiRequest(`/api/records/${dir.id}`, {
      method: 'POST',
      body: invalidRecordData
    })
    
    if (!invalidCreateResponse.success) {
      console.log('✅ 无效数据正确被拒绝:', invalidCreateResponse.error)
    } else {
      console.error('❌ 无效数据应该被拒绝但通过了验证')
    }

    console.log('\n🎉 测试完成！')

  } catch (error) {
    console.error('❌ 测试过程中出错:', error)
  }
}

// 运行测试
testExperienceField()
