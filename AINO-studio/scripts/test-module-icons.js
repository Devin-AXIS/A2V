#!/usr/bin/env node

// 测试模块图标映射
const testModules = [
  {
    id: "1",
    name: "用户管理",
    type: "system",
    icon: "users"
  },
  {
    id: "2", 
    name: "系统配置",
    type: "system",
    icon: "settings"
  },
  {
    id: "3",
    name: "审计日志",
    type: "system", 
    icon: "activity"
  },
  {
    id: "4",
    name: "数据分析",
    type: "custom",
    icon: ""
  },
  {
    id: "5",
    name: "订单管理",
    type: "ecom",
    icon: ""
  }
]

console.log('🧪 测试模块图标映射...\n')

testModules.forEach((module, index) => {
  console.log(`${index + 1}. ${module.name}`)
  console.log(`   类型: ${module.type}`)
  console.log(`   图标: ${module.icon || '无'}`)
  
  // 模拟图标映射逻辑
  const name = module.name.toLowerCase()
  const iconName = module.icon?.toLowerCase()
  
  let icon = null
  
  // 系统模块图标映射
  const systemModuleIcons = {
    'users': '👥 Users',
    'user': '👥 Users', 
    'settings': '⚙️ Settings',
    'setting': '⚙️ Settings',
    'activity': '📊 BarChart3',
    'audit': '📊 BarChart3',
    'log': '📊 BarChart3',
    'config': '⚙️ Settings',
    'configuration': '⚙️ Settings',
  }
  
  // 1. 检查系统模块图标名称
  if (iconName && systemModuleIcons[iconName]) {
    icon = systemModuleIcons[iconName]
  }
  // 2. 根据名称关键词匹配
  else if (name.includes('用户') || name.includes('user')) {
    icon = '👥 Users'
  }
  else if (name.includes('系统配置') || name.includes('系统设置') || name.includes('settings') || name.includes('config')) {
    icon = '⚙️ Settings'
  }
  else if (name.includes('审计') || name.includes('日志') || name.includes('audit') || name.includes('log') || name.includes('activity')) {
    icon = '📊 BarChart3'
  }
  else if (name.includes('数据') || name.includes('data')) {
    icon = '🗄️ Database'
  }
  else if (name.includes('分析') || name.includes('analytics')) {
    icon = '📊 BarChart3'
  }
  else if (name.includes('订单') || name.includes('order')) {
    icon = '🛒 ShoppingCart'
  }
  // 3. 根据类型返回默认图标
  else {
    const typeIcons = {
      'system': '🛡️ Shield',
      'ecom': '🛒 ShoppingCart',
      'edu': '🎓 GraduationCap',
      'content': '📄 FileText',
      'project': '🎯 Target',
      'custom': '🧩 Puzzle'
    }
    icon = typeIcons[module.type] || '🧩 Puzzle'
  }
  
  console.log(`   映射图标: ${icon}`)
  console.log('')
})

console.log('✅ 图标映射测试完成！')
