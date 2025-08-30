#!/usr/bin/env node

/**
 * 测试字段处理器加载
 * 检查字段处理器是否正确加载
 */

// 模拟字段处理器
const baseFieldProcessors = {
  text: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && typeof value !== 'string') {
        return { valid: false, error: '必须是文本类型' }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },
  
  experience: {
    validate: (value, fieldDef) => {
      // 经历字段可以为空
      if (!value) {
        return { valid: true }
      }
      
      // 验证是否为数组
      if (!Array.isArray(value)) {
        return { valid: false, error: '经历必须是数组格式' }
      }
      
      return { valid: true }
    },
    transform: (value) => value,
    format: (value) => value
  }
}

// 字段处理器管理器
class FieldProcessorManager {
  constructor() {
    this.processors = baseFieldProcessors
  }

  getProcessor(type) {
    console.log(`🔍 获取处理器，类型: "${type}" (${typeof type})`)
    console.log(`📋 可用处理器:`, Object.keys(this.processors))
    console.log(`🔍 检查处理器:`, this.processors[type])
    
    const processor = this.processors[type]
    if (!processor) {
      console.log(`⚠️ 未找到处理器，回退到text处理器`)
      return this.processors.text
    }
    console.log(`✅ 找到处理器: ${type}`)
    return processor
  }

  validateField(value, fieldDef) {
    console.log(`🔍 验证字段: ${fieldDef.key}, 类型: "${fieldDef.type}" (${typeof fieldDef.type})`)
    const processor = this.getProcessor(fieldDef.type)
    const result = processor.validate(value, fieldDef)
    console.log(`📋 验证结果:`, result)
    return result
  }
}

async function testFieldProcessorLoading() {
  console.log('🧪 测试字段处理器加载...\n')

  const fieldProcessorManager = new FieldProcessorManager()

  // 测试字段定义
  const fieldDef = {
    id: "33fb6ac6-d807-406e-95f5-df68302175da",
    key: "g_hcj1",
    kind: "primitive",
    type: "experience", // 字符串类型
    schema: {
      label: "工作经历",
      preset: "work_experience",
      options: [],
      required: false,
      showInForm: true,
      showInList: true,
      description: "",
      placeholder: "",
      showInDetail: true
    },
    validators: {},
    readRoles: ["admin", "member"],
    writeRoles: ["admin"],
    required: false
  }

  // 测试数据
  const testData = [
    {
      id: "exp_1",
      type: "work",
      title: "测试职位",
      organization: "测试公司",
      startDate: "2023-01-01"
    }
  ]

  console.log('📝 测试数据:', JSON.stringify(testData, null, 2))
  console.log('📋 字段定义类型:', typeof fieldDef.type, fieldDef.type)

  // 测试验证
  console.log('\n🔍 开始验证...')
  const validation = fieldProcessorManager.validateField(testData, fieldDef)
  
  if (validation.valid) {
    console.log('✅ 验证通过！')
  } else {
    console.log('❌ 验证失败:', validation.error)
  }
}

// 运行测试
testFieldProcessorLoading()
