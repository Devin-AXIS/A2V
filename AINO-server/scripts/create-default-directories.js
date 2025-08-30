#!/usr/bin/env node

/**
 * 手动创建用户模块的默认目录
 */

const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'aino',
  password: 'pass',
  database: 'aino',
})

async function createDefaultDirectories() {
  try {
    console.log('🚀 开始创建用户模块默认目录...\n')
    
    // 1. 获取最新的应用
    const appResult = await pool.query("SELECT id, name FROM applications ORDER BY created_at DESC LIMIT 1")
    if (appResult.rows.length === 0) {
      console.error('❌ 没有找到应用')
      return
    }
    
    const application = appResult.rows[0]
    console.log(`📝 使用应用: ${application.name} (ID: ${application.id})\n`)
    
    // 2. 获取用户管理模块
    const moduleResult = await pool.query(
      "SELECT id, name FROM modules WHERE application_id = $1 AND name = '用户管理'",
      [application.id]
    )
    
    if (moduleResult.rows.length === 0) {
      console.error('❌ 没有找到用户管理模块')
      return
    }
    
    const userModule = moduleResult.rows[0]
    console.log(`📝 找到用户管理模块: ${userModule.name} (ID: ${userModule.id})\n`)
    
    // 3. 创建默认目录
    const defaultDirectories = [
      {
        name: '用户列表',
        type: 'table',
        supportsCategory: false,
        config: {
          description: '应用内用户管理列表',
          fields: [
            { key: 'name', label: '姓名', type: 'text', required: true, showInList: true, showInForm: true },
            { key: 'email', label: '邮箱', type: 'email', required: true, showInList: true, showInForm: true },
            { key: 'phone', label: '手机号', type: 'phone', required: false, showInList: true, showInForm: true },
            { key: 'role', label: '角色', type: 'select', required: true, showInList: true, showInForm: true, options: ['admin', 'user', 'guest'] },
            { key: 'status', label: '状态', type: 'select', required: true, showInList: true, showInForm: true, options: ['active', 'inactive', 'pending'] },
            { key: 'department', label: '部门', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'position', label: '职位', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'createdAt', label: '创建时间', type: 'datetime', required: false, showInList: true, showInForm: false },
            { key: 'lastLoginAt', label: '最后登录', type: 'datetime', required: false, showInList: true, showInForm: false },
          ]
        },
        order: 0,
      },
      {
        name: '部门管理',
        type: 'category',
        supportsCategory: true,
        config: {
          description: '部门分类管理',
          fields: [
            { key: 'name', label: '部门名称', type: 'text', required: true, showInList: true, showInForm: true },
            { key: 'code', label: '部门编码', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'description', label: '部门描述', type: 'textarea', required: false, showInList: false, showInForm: true },
            { key: 'parentId', label: '上级部门', type: 'relation', required: false, showInList: true, showInForm: true },
            { key: 'manager', label: '部门负责人', type: 'relation', required: false, showInList: true, showInForm: true },
            { key: 'createdAt', label: '创建时间', type: 'datetime', required: false, showInList: true, showInForm: false },
          ]
        },
        order: 1,
      },
      {
        name: '用户注册',
        type: 'form',
        supportsCategory: false,
        config: {
          description: '用户注册表单',
          fields: [
            { key: 'name', label: '姓名', type: 'text', required: true, showInList: false, showInForm: true },
            { key: 'email', label: '邮箱', type: 'email', required: true, showInList: false, showInForm: true },
            { key: 'phone', label: '手机号', type: 'phone', required: false, showInList: false, showInForm: true },
            { key: 'password', label: '密码', type: 'password', required: true, showInList: false, showInForm: true },
            { key: 'confirmPassword', label: '确认密码', type: 'password', required: true, showInList: false, showInForm: true },
            { key: 'department', label: '部门', type: 'select', required: false, showInList: false, showInForm: true },
            { key: 'position', label: '职位', type: 'text', required: false, showInList: false, showInForm: true },
          ]
        },
        order: 2,
      },
    ]
    
    console.log('📝 创建默认目录...')
    for (const directory of defaultDirectories) {
      const result = await pool.query(
        `INSERT INTO directories (
          application_id, module_id, name, type, supports_category, 
          config, "order", is_enabled, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id, name`,
        [
          application.id,
          userModule.id,
          directory.name,
          directory.type,
          directory.supportsCategory,
          JSON.stringify(directory.config),
          directory.order,
          true
        ]
      )
      
      const createdDirectory = result.rows[0]
      console.log(`   ✅ ${createdDirectory.name} (ID: ${createdDirectory.id})`)
    }
    
    console.log('\n🎉 默认目录创建完成！')
    
    // 4. 验证创建的目录
    const verifyResult = await pool.query(
      "SELECT id, name, type, supports_category FROM directories WHERE application_id = $1 AND module_id = $2 ORDER BY \"order\"",
      [application.id, userModule.id]
    )
    
    console.log(`\n📊 验证结果: 共创建 ${verifyResult.rows.length} 个目录`)
    verifyResult.rows.forEach(dir => {
      console.log(`   - ${dir.name} (${dir.type}) - 支持分类: ${dir.supports_category}`)
    })
    
  } catch (error) {
    console.error('❌ 创建默认目录失败:', error.message)
  } finally {
    await pool.end()
  }
}

createDefaultDirectories()
