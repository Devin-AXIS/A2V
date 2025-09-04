#!/usr/bin/env node

/**
 * 直接测试字段处理器
 * 验证experience字段处理器是否正确工作
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
      
      // 验证每个经历项
      for (let i = 0; i < value.length; i++) {
        const experience = value[i]
        if (typeof experience !== 'object' || experience === null) {
          return { valid: false, error: `经历${i + 1}必须是对象格式` }
        }
        
        // 验证必需字段
        if (!experience.id || typeof experience.id !== 'string') {
          return { valid: false, error: `经历${i + 1}缺少有效的ID` }
        }
        
        if (!experience.type || typeof experience.type !== 'string') {
          return { valid: false, error: `经历${i + 1}缺少类型信息` }
        }
        
        if (!experience.title || typeof experience.title !== 'string' || experience.title.trim() === '') {
          return { valid: false, error: `经历${i + 1}缺少标题` }
        }
        
        if (!experience.organization || typeof experience.organization !== 'string' || experience.organization.trim() === '') {
          return { valid: false, error: `经历${i + 1}缺少组织信息` }
        }
        
        if (!experience.startDate || typeof experience.startDate !== 'string' || experience.startDate.trim() === '') {
          return { valid: false, error: `经历${i + 1}缺少开始日期` }
        }
      }
      
      return { valid: true }
    },
    transform: (value) => {
      // 确保返回数组格式
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map(experience => {
          // 清理和标准化经历数据
          const cleaned = {
            id: experience.id?.trim() || '',
            type: experience.type?.trim() || '',
            title: experience.title?.trim() || '',
            organization: experience.organization?.trim() || '',
            startDate: experience.startDate?.trim() || '',
            endDate: experience.endDate?.trim() || null,
            isCurrent: Boolean(experience.isCurrent),
            description: experience.description?.trim() || null,
            location: experience.location?.trim() || null,
            skills: Array.isArray(experience.skills) ? experience.skills.filter((s) => s && s.trim()) : [],
            achievements: Array.isArray(experience.achievements) ? experience.achievements.filter((a) => a && a.trim()) : [],
          }
          
          // 移除空值字段
          Object.keys(cleaned).forEach(key => {
            if (cleaned[key] === null || cleaned[key] === '') {
              delete cleaned[key]
            }
          })
          
          return cleaned
        })
      }
      return []
    },
    format: (value) => value
  }
}

// 字段处理器管理器
class FieldProcessorManager {
  constructor() {
    this.processors = baseFieldProcessors
  }

  getProcessor(type) {
    console.log(`🔍 获取处理器，类型: ${type}`)
    const processor = this.processors[type]
    if (!processor) {
      console.log(`⚠️ 未找到处理器，回退到text处理器`)
      return this.processors.text
    }
    console.log(`✅ 找到处理器: ${type}`)
    return processor
  }

  validateField(value, fieldDef) {
    console.log(`🔍 验证字段: ${fieldDef.key}, 类型: ${fieldDef.type}, 值:`, value)
    const processor = this.getProcessor(fieldDef.type)
    const result = processor.validate(value, fieldDef)
    console.log(`📋 验证结果:`, result)
    return result
  }
}

async function testFieldProcessor() {
  console.log('🧪 测试字段处理器...\n')

  const fieldProcessorManager = new FieldProcessorManager()

  // 测试字段定义
  const fieldDef = {
    id: "33fb6ac6-d807-406e-95f5-df68302175da",
    key: "g_hcj1",
    kind: "primitive",
    type: "experience",
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
  console.log('📋 字段定义:', JSON.stringify(fieldDef, null, 2))

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
testFieldProcessor()
