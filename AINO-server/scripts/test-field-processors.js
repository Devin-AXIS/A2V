const { fieldProcessorManager } = require('../src/lib/field-processors.ts')

// 测试字段定义
const testFieldDefs = [
  {
    id: 'name',
    key: 'name',
    kind: 'primitive',
    type: 'text',
    required: true,
    validators: {
      minLength: 2,
      maxLength: 50
    }
  },
  {
    id: 'email',
    key: 'email',
    kind: 'primitive',
    type: 'email',
    required: true
  },
  {
    id: 'age',
    key: 'age',
    kind: 'primitive',
    type: 'number',
    required: false,
    validators: {
      min: 0,
      max: 120
    }
  },
  {
    id: 'phone',
    key: 'phone',
    kind: 'primitive',
    type: 'phone',
    required: false
  },
  {
    id: 'department',
    key: 'department',
    kind: 'primitive',
    type: 'select',
    required: false,
    schema: {
      options: ['技术部', '产品部', '设计部', '运营部']
    }
  },
  {
    id: 'skills',
    key: 'skills',
    kind: 'primitive',
    type: 'multiselect',
    required: false,
    schema: {
      options: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Python']
    },
    validators: {
      maxItems: 3
    }
  }
]

// 测试数据
const testRecords = [
  {
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25,
    phone: '13800138000',
    department: '技术部',
    skills: ['JavaScript', 'React']
  },
  {
    name: '李四',
    email: 'lisi@example.com',
    age: 30,
    phone: '13900139000',
    department: '产品部',
    skills: ['TypeScript', 'Vue', 'Node.js']
  },
  {
    name: '王五',
    email: 'invalid-email',
    age: 150,
    phone: '123456789',
    department: '销售部',
    skills: ['JavaScript', 'React', 'Vue', 'Node.js', 'Python']
  },
  {
    name: 'A',
    email: 'wangwu@example.com',
    age: -5,
    phone: '13800138000',
    department: '技术部',
    skills: []
  }
]

console.log('🧪 开始测试字段处理器...\n')

// 测试每个记录
testRecords.forEach((record, index) => {
  console.log(`📝 测试记录 ${index + 1}:`, record)
  
  // 验证记录
  const validation = fieldProcessorManager.validateRecord(record, testFieldDefs)
  
  if (validation.valid) {
    console.log('✅ 验证通过')
  } else {
    console.log('❌ 验证失败:')
    Object.entries(validation.errors).forEach(([field, error]) => {
      console.log(`   - ${field}: ${error}`)
    })
  }
  
  // 转换记录
  const transformed = fieldProcessorManager.transformRecord(record, testFieldDefs)
  console.log('🔄 转换后:', transformed)
  console.log('---\n')
})

console.log('🎉 字段处理器测试完成！')