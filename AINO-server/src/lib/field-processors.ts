import { z } from 'zod'

// 字段类型定义
export type FieldKind = 'primitive' | 'composite' | 'relation' | 'lookup' | 'computed'
export type FieldType = 'text' | 'number' | 'email' | 'phone' | 'select' | 'multiselect' | 'date' | 'datetime' | 'daterange' | 'multidate' | 'time' | 'boolean' | 'textarea' | 'image' | 'profile' | 'multiimage' | 'file' | 'json' | 'table' | 'tags' | 'progress' | 'percent' | 'experience' | 'identity_verification' | 'other_verification' | 'video' | 'multivideo' | 'richtext' | 'barcode' | 'checkbox' | 'cascader' | 'relation_one' | 'relation_many'

// 字段定义接口
export interface FieldDef {
  id: string
  key: string
  kind: FieldKind
  type: FieldType
  schema?: any
  relation?: any
  lookup?: any
  computed?: any
  validators?: any
  readRoles?: string[]
  writeRoles?: string[]
  required?: boolean
}

// 字段处理器接口
export interface FieldProcessor {
  validate: (value: any, fieldDef: FieldDef) => { valid: boolean; error?: string }
  transform: (value: any, fieldDef: FieldDef) => any
  format: (value: any, fieldDef: FieldDef) => any
}

// 基础字段处理器
export const baseFieldProcessors: Record<FieldType, FieldProcessor> = {
  // 文本字段
  text: {
    validate: (value, fieldDef) => {
      // 检查是否是实名认证字段（通过preset判断）
      if (fieldDef.schema?.preset === 'identity_verification') {
        // 使用实名认证字段的验证逻辑
        return baseFieldProcessors.identity_verification.validate(value, fieldDef)
      }
      
      // 检查是否是其他认证字段（通过preset判断）
      if (fieldDef.schema?.preset === 'other_verification') {
        // 使用其他认证字段的验证逻辑
        return baseFieldProcessors.other_verification.validate(value, fieldDef)
      }
      
      // 检查是否是图片字段（通过preset判断）
      if (fieldDef.schema?.preset === 'image' || fieldDef.schema?.imageConfig?.multiple) {
        // 使用图片字段的验证逻辑
        return baseFieldProcessors.image.validate(value, fieldDef)
      }
      
      // 检查是否是视频字段（通过preset判断）
      if (fieldDef.schema?.preset === 'video' || fieldDef.schema?.videoConfig?.multiple) {
        // 使用视频字段的验证逻辑
        return baseFieldProcessors.video.validate(value, fieldDef)
      }
      
      // 默认文本字段验证
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && typeof value !== 'string') {
        return { valid: false, error: '必须是文本类型' }
      }
      
      // 验证长度限制
      if (value && fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.minLength && value.length < validators.minLength) {
          return { valid: false, error: `文本长度不能少于${validators.minLength}个字符` }
        }
        if (validators.maxLength && value.length > validators.maxLength) {
          return { valid: false, error: `文本长度不能超过${validators.maxLength}个字符` }
        }
        if (validators.pattern) {
          const regex = new RegExp(validators.pattern)
          if (!regex.test(value)) {
            return { valid: false, error: '文本格式不符合要求' }
          }
        }
      }
      
      return { valid: true }
    },
    transform: (value, fieldDef) => {
      // 检查是否是实名认证字段（通过preset判断）
      if (fieldDef.schema?.preset === 'identity_verification') {
        // 使用实名认证字段的转换逻辑
        return baseFieldProcessors.identity_verification.transform(value, fieldDef)
      }
      
      // 检查是否是其他认证字段（通过preset判断）
      if (fieldDef.schema?.preset === 'other_verification') {
        // 使用其他认证字段的转换逻辑
        return baseFieldProcessors.other_verification.transform(value, fieldDef)
      }
      
      // 检查是否是图片字段（通过preset判断）
      if (fieldDef.schema?.preset === 'image' || fieldDef.schema?.imageConfig?.multiple) {
        // 使用图片字段的转换逻辑
        return baseFieldProcessors.image.transform(value, fieldDef)
      }
      
      // 检查是否是视频字段（通过preset判断）
      if (fieldDef.schema?.preset === 'video' || fieldDef.schema?.videoConfig?.multiple) {
        // 使用视频字段的转换逻辑
        return baseFieldProcessors.video.transform(value, fieldDef)
      }
      
      // 默认文本字段转换
      return value ? String(value).trim() : value
    },
    format: (value) => value
  },

  // 数字字段
  number: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (value === null || value === undefined || value === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value !== null && value !== undefined && value !== '') {
        const num = Number(value)
        if (isNaN(num)) {
          return { valid: false, error: '必须是数字类型' }
        }
        
        // 验证数值范围
        if (fieldDef.validators) {
          const validators = fieldDef.validators
          if (validators.min !== undefined && num < validators.min) {
            return { valid: false, error: `数值不能小于${validators.min}` }
          }
          if (validators.max !== undefined && num > validators.max) {
            return { valid: false, error: `数值不能大于${validators.max}` }
          }
          if (validators.step !== undefined) {
            const remainder = (num - (validators.min || 0)) % validators.step
            if (Math.abs(remainder) > 0.0001) {
              return { valid: false, error: `数值必须是${validators.step}的倍数` }
            }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (value === null || value === undefined || value === '') return null
      return Number(value)
    },
    format: (value) => value
  },

  // 进度字段
  progress: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (value === null || value === undefined || value === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value !== null && value !== undefined && value !== '') {
        const num = Number(value)
        if (isNaN(num)) {
          return { valid: false, error: '必须是数字类型' }
        }
        
        // 进度字段默认范围是0-100，但可以通过配置修改
        const maxValue = fieldDef.schema?.maxValue || 100
        if (num < 0) {
          return { valid: false, error: '进度值不能小于0' }
        }
        if (num > maxValue) {
          return { valid: false, error: `进度值不能大于${maxValue}` }
        }
        
        // 验证数值范围
        if (fieldDef.validators) {
          const validators = fieldDef.validators
          if (validators.min !== undefined && num < validators.min) {
            return { valid: false, error: `进度值不能小于${validators.min}` }
          }
          if (validators.max !== undefined && num > validators.max) {
            return { valid: false, error: `进度值不能大于${validators.max}` }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (value === null || value === undefined || value === '') return null
      return Number(value)
    },
    format: (value) => value
  },

  // 百分比字段
  percent: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (value === null || value === undefined || value === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value !== null && value !== undefined && value !== '') {
        const num = Number(value)
        if (isNaN(num)) {
          return { valid: false, error: '必须是数字类型' }
        }
        
        // 百分比字段默认范围是0-100
        if (num < 0) {
          return { valid: false, error: '百分比值不能小于0' }
        }
        if (num > 100) {
          return { valid: false, error: '百分比值不能大于100' }
        }
        
        // 验证数值范围
        if (fieldDef.validators) {
          const validators = fieldDef.validators
          if (validators.min !== undefined && num < validators.min) {
            return { valid: false, error: `百分比值不能小于${validators.min}` }
          }
          if (validators.max !== undefined && num > validators.max) {
            return { valid: false, error: `百分比值不能大于${validators.max}` }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (value === null || value === undefined || value === '') return null
      return Number(value)
    },
    format: (value) => value
  },

  // 邮箱字段
  email: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return { valid: false, error: '邮箱格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim().toLowerCase() : value,
    format: (value) => value
  },

  // 手机号字段
  phone: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        const phoneRegex = /^1[3-9]\d{9}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return { valid: false, error: '手机号格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).replace(/\s/g, '') : value,
    format: (value) => value
  },

  // 选择字段
  select: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      // 对于preset字段，跳过options验证，因为选项由前端组件提供
      if (value && fieldDef.schema?.options && fieldDef.schema.options.length > 0 && !fieldDef.schema.preset && !fieldDef.schema.options.includes(value)) {
        return { valid: false, error: '选择的值不在允许的选项中' }
      }
      return { valid: true }
    },
    transform: (value) => value,
    format: (value) => value
  },

  // 多选字段
  multiselect: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || !Array.isArray(value) || value.length === 0)) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && Array.isArray(value)) {
        // 技能字段特殊处理
        if (fieldDef.schema?.preset === 'skills') {
          // 获取所有允许的技能ID
          const allowedSkillIds = []
          
          // 添加预定义技能ID（从skillsData中获取）
          const predefinedSkills = [
            'vue', 'react', 'angular', 'nodejs', 'python', 'java', 'php', 'go', 'rust',
            'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
            'photoshop', 'illustrator', 'figma', 'sketch', 'after-effects', 'premiere',
            'project-management', 'team-leadership', 'agile', 'scrum', 'kanban'
          ]
          allowedSkillIds.push(...predefinedSkills)
          
          // 添加自定义技能ID
          if (fieldDef.schema?.skillsConfig?.customSkills) {
            const customSkillIds = fieldDef.schema.skillsConfig.customSkills.map((skill: any) => skill.id)
            allowedSkillIds.push(...customSkillIds)
          }
          
          // 验证选择的技能ID是否在允许范围内
          const invalidValues = value.filter(v => !allowedSkillIds.includes(v))
          if (invalidValues.length > 0) {
            return { valid: false, error: '包含不允许的技能选项' }
          }
        } else {
          // 普通多选字段验证
          if (fieldDef.schema?.options) {
            const invalidValues = value.filter(v => !fieldDef.schema.options.includes(v))
            if (invalidValues.length > 0) {
              return { valid: false, error: '包含不允许的选项' }
            }
          }
        }
        
        // 验证数量限制
        if (fieldDef.validators) {
          const validators = fieldDef.validators
          if (validators.minItems && value.length < validators.minItems) {
            return { valid: false, error: `至少需要选择${validators.minItems}项` }
          }
          if (validators.maxItems && value.length > validators.maxItems) {
            return { valid: false, error: `最多只能选择${validators.maxItems}项` }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => Array.isArray(value) ? value : value ? [value] : [],
    format: (value) => Array.isArray(value) ? value : []
  },

  // 日期字段
  date: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          return { valid: false, error: '日期格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value || value.trim() === '') return null
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
    },
    format: (value) => value
  },

  // 日期时间字段
  datetime: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          return { valid: false, error: '日期时间格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value || value.trim() === '') return null
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date.toISOString()
    },
    format: (value) => value
  },

  // 布尔字段
  boolean: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && value === null && value === undefined) {
        return { valid: false, error: '此字段为必填项' }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (value === null || value === undefined) return null
      return Boolean(value)
    },
    format: (value) => value
  },

  // 文本域字段
  textarea: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && typeof value !== 'string') {
        return { valid: false, error: '必须是文本类型' }
      }
      
      // 验证长度限制
      if (value && fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.minLength && value.length < validators.minLength) {
          return { valid: false, error: `文本长度不能少于${validators.minLength}个字符` }
        }
        if (validators.maxLength && value.length > validators.maxLength) {
          return { valid: false, error: `文本长度不能超过${validators.maxLength}个字符` }
        }
      }
      
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 图片字段
  image: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value) {
        // 如果是字符串，进行URL验证
        if (typeof value === 'string' && value.trim() !== '') {
          try {
            new URL(value)
          } catch {
            return { valid: false, error: '图片URL格式不正确' }
          }
        }
        
        // 验证文件大小（如果提供了文件大小信息）
        if (fieldDef.validators?.maxSizeMB && typeof value === 'object' && value.size) {
          const maxSizeBytes = fieldDef.validators.maxSizeMB * 1024 * 1024
          if (value.size > maxSizeBytes) {
            return { valid: false, error: `图片大小不能超过${fieldDef.validators.maxSizeMB}MB` }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 头像字段（圆形头像/logo）
  profile: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value) {
        // 如果是字符串，进行URL验证
        if (typeof value === 'string' && value.trim() !== '') {
          try {
            new URL(value)
          } catch {
            return { valid: false, error: '图片URL格式不正确' }
          }
        }
        
        // 验证文件大小（如果提供了文件大小信息）
        if (fieldDef.validators?.maxSizeMB && typeof value === 'object' && value.size) {
          const maxSizeBytes = fieldDef.validators.maxSizeMB * 1024 * 1024
          if (value.size > maxSizeBytes) {
            return { valid: false, error: `图片大小不能超过${fieldDef.validators.maxSizeMB}MB` }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 文件字段
  file: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value) {
        // 如果是字符串，进行URL验证
        if (typeof value === 'string' && value.trim() !== '') {
          try {
            new URL(value)
          } catch {
            return { valid: false, error: '文件URL格式不正确' }
          }
        }
        
        // 验证文件大小（如果提供了文件大小信息）
        if (fieldDef.validators?.maxSizeMB && typeof value === 'object' && value.size) {
          const maxSizeBytes = fieldDef.validators.maxSizeMB * 1024 * 1024
          if (value.size > maxSizeBytes) {
            return { valid: false, error: `文件大小不能超过${fieldDef.validators.maxSizeMB}MB` }
          }
        }
        
        // 验证文件类型（如果提供了接受的文件类型）
        if (fieldDef.validators?.accept && typeof value === 'object' && value.type) {
          const acceptTypes = fieldDef.validators.accept.split(',').map((t: string) => t.trim())
          const fileType = value.type
          const isAccepted = acceptTypes.some((acceptType: string) => {
            if (acceptType.endsWith('/*')) {
              return fileType.startsWith(acceptType.slice(0, -1))
            }
            return fileType === acceptType
          })
          if (!isAccepted) {
            return { valid: false, error: '不支持的文件类型' }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // JSON字段
  json: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (value === null || value === undefined)) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value !== null && value !== undefined) {
        try {
          if (typeof value === 'string') {
            JSON.parse(value)
          }
        } catch {
          return { valid: false, error: 'JSON格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (value === null || value === undefined) return null
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
      return value
    },
    format: (value) => value
  },

  // 表格字段（兼容text类型）
  table: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && typeof value !== 'string') {
        return { valid: false, error: '必须是文本类型' }
      }
      
      // 验证长度限制
      if (value && fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.minLength && value.length < validators.minLength) {
          return { valid: false, error: `文本长度不能少于${validators.minLength}个字符` }
        }
        if (validators.maxLength && value.length > validators.maxLength) {
          return { valid: false, error: `文本长度不能超过${validators.maxLength}个字符` }
        }
        if (validators.pattern) {
          const regex = new RegExp(validators.pattern)
          if (!regex.test(value)) {
            return { valid: false, error: '文本格式不符合要求' }
          }
        }
      }
      
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 标签字段
  tags: {
    validate: (value, fieldDef) => {
      // 标签字段可以为空
      if (!value) {
        return { valid: true }
      }
      
      // 验证是否为数组
      if (!Array.isArray(value)) {
        return { valid: false, error: '标签必须是数组格式' }
      }
      
      // 验证每个标签
      for (let i = 0; i < value.length; i++) {
        const tag = value[i]
        if (typeof tag !== 'string') {
          return { valid: false, error: `标签${i + 1}必须是文本类型` }
        }
        if (tag.trim() === '') {
          return { valid: false, error: `标签${i + 1}不能为空` }
        }
        if (tag.length > 50) {
          return { valid: false, error: `标签${i + 1}长度不能超过50个字符` }
        }
      }
      
      // 验证标签数量限制
      if (fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.maxTags && value.length > validators.maxTags) {
          return { valid: false, error: `标签数量不能超过${validators.maxTags}个` }
        }
        if (validators.minTags && value.length < validators.minTags) {
          return { valid: false, error: `标签数量不能少于${validators.minTags}个` }
        }
      }
      
      return { valid: true }
    },
    transform: (value) => {
      // 确保返回数组格式
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map(tag => tag.trim()).filter(tag => tag.length > 0)
      }
      return []
    },
    format: (value) => value
  },

  // 经历字段
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
        
        // 标题和组织信息可以为空（当经历还在编辑中时）
        if (experience.title && typeof experience.title !== 'string') {
          return { valid: false, error: `经历${i + 1}的标题格式不正确` }
        }
        
        if (experience.organization && typeof experience.organization !== 'string') {
          return { valid: false, error: `经历${i + 1}的组织信息格式不正确` }
        }
        
        // 开始日期可以为空（当经历还在编辑中时）
        if (experience.startDate && typeof experience.startDate !== 'string') {
          return { valid: false, error: `经历${i + 1}的开始日期格式不正确` }
        }
        
        // 验证日期格式（只有当startDate不为空时才验证）
        if (experience.startDate && experience.startDate.trim() !== '') {
          const startDate = new Date(experience.startDate)
          if (isNaN(startDate.getTime())) {
            return { valid: false, error: `经历${i + 1}的开始日期格式不正确` }
          }
        }
        
        // 如果有结束日期，验证格式
        if (experience.endDate && experience.endDate.trim() !== '') {
          const endDate = new Date(experience.endDate)
          if (isNaN(endDate.getTime())) {
            return { valid: false, error: `经历${i + 1}的结束日期格式不正确` }
          }
        }
        
        // 验证技能数组（如果存在）
        if (experience.skills && !Array.isArray(experience.skills)) {
          return { valid: false, error: `经历${i + 1}的技能必须是数组格式` }
        }
        
        // 验证成就数组（如果存在）
        if (experience.achievements && !Array.isArray(experience.achievements)) {
          return { valid: false, error: `经历${i + 1}的成就必须是数组格式` }
        }
      }
      
      // 验证经历数量限制
      if (fieldDef.validators) {
        const validators = fieldDef.validators
        if (validators.maxItems && value.length > validators.maxItems) {
          return { valid: false, error: `经历数量不能超过${validators.maxItems}个` }
        }
        if (validators.minItems && value.length < validators.minItems) {
          return { valid: false, error: `经历数量不能少于${validators.minItems}个` }
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
            skills: Array.isArray(experience.skills) ? experience.skills.filter((s: string) => s && s.trim()) : [],
            achievements: Array.isArray(experience.achievements) ? experience.achievements.filter((a: string) => a && a.trim()) : [],
            // 教育经历特有字段
            degree: experience.degree?.trim() || null,
            major: experience.major?.trim() || null,
            gpa: experience.gpa?.trim() || null,
            // 工作经历特有字段
            department: experience.department?.trim() || null,
            salary: experience.salary?.trim() || null,
            // 项目经历特有字段
            projectUrl: experience.projectUrl?.trim() || null,
            teamSize: typeof experience.teamSize === 'number' ? experience.teamSize : null,
            // 证书特有字段
            issuer: experience.issuer?.trim() || null,
            credentialId: experience.credentialId?.trim() || null,
            expiryDate: experience.expiryDate?.trim() || null
          }
          
          // 移除空值字段
          Object.keys(cleaned).forEach(key => {
            if ((cleaned as any)[key] === null || (cleaned as any)[key] === '') {
              delete (cleaned as any)[key]
            }
          })
          
          return cleaned
        })
      }
      return []
    },
    format: (value) => value
  },

  // 实名认证字段
  identity_verification: {
    validate: (value, fieldDef) => {
      // 实名认证字段可以为空
      if (!value) {
        return { valid: true }
      }
      
      // 验证是否为对象
      if (typeof value !== 'object' || value === null) {
        return { valid: false, error: '实名认证必须是对象格式' }
      }
      
      // 验证各个字段
      if (value.name && typeof value.name !== 'string') {
        return { valid: false, error: '姓名必须是文本类型' }
      }
      
      if (value.idNumber && typeof value.idNumber !== 'string') {
        return { valid: false, error: '身份证号必须是文本类型' }
      }
      
      if (value.frontPhoto && typeof value.frontPhoto !== 'string') {
        return { valid: false, error: '正面照片必须是文本类型' }
      }
      
      if (value.backPhoto && typeof value.backPhoto !== 'string') {
        return { valid: false, error: '反面照片必须是文本类型' }
      }
      
      return { valid: true }
    },
    transform: (value) => {
      if (!value) return null
      return {
        name: value.name?.trim() || null,
        idNumber: value.idNumber?.trim() || null,
        frontPhoto: value.frontPhoto?.trim() || null,
        backPhoto: value.backPhoto?.trim() || null
      }
    },
    format: (value) => value
  },

  // 其他认证字段
  other_verification: {
    validate: (value, fieldDef) => {
      // 其他认证字段可以为空
      if (!value) {
        return { valid: true }
      }
      
      // 验证是否为对象
      if (typeof value !== 'object' || value === null) {
        return { valid: false, error: '其他认证必须是对象格式' }
      }
      
      // 验证各个字段
      for (const [key, val] of Object.entries(value)) {
        if (typeof val === 'string') {
          // 文字字段
          if (val.trim() === '') {
            continue // 空字符串是允许的
          }
        } else if (Array.isArray(val)) {
          // 图片字段
          for (let i = 0; i < val.length; i++) {
            if (typeof val[i] !== 'string') {
              return { valid: false, error: `图片${i + 1}必须是文本类型` }
            }
          }
        } else {
          return { valid: false, error: `字段${key}格式不正确` }
        }
      }
      
      return { valid: true }
    },
    transform: (value) => {
      if (!value) return null
      const transformed: any = {}
      
      for (const [key, val] of Object.entries(value)) {
        if (typeof val === 'string') {
          transformed[key] = val.trim() || null
        } else if (Array.isArray(val)) {
          transformed[key] = val.filter((item: string) => item && item.trim())
        } else {
          transformed[key] = val
        }
      }
      
      return transformed
    },
    format: (value) => value
  },

  // 视频字段
  video: {
    validate: (value, fieldDef) => {
      // 视频字段可以为空
      if (!value) {
        return { valid: true }
      }
      
      // 验证是否为字符串或字符串数组
      if (typeof value === 'string') {
        if (value.trim() === '') {
          return { valid: true }
        }
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] !== 'string') {
            return { valid: false, error: `视频${i + 1}必须是文本类型` }
          }
        }
      } else {
        return { valid: false, error: '视频必须是文本类型或文本数组' }
      }
      
      return { valid: true }
    },
    transform: (value) => {
      if (!value) return null
      if (typeof value === 'string') {
        return value.trim() || null
      }
      if (Array.isArray(value)) {
        return value.filter((item: string) => item && item.trim())
      }
      return value
    },
    format: (value) => value
  },

  // 多视频字段
  multivideo: {
    validate: (value, fieldDef) => {
      // 多视频字段可以为空
      if (!value) {
        return { valid: true }
      }
      
      // 验证是否为字符串数组
      if (!Array.isArray(value)) {
        return { valid: false, error: '多视频必须是数组格式' }
      }
      
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] !== 'string') {
          return { valid: false, error: `视频${i + 1}必须是文本类型` }
        }
      }
      
      return { valid: true }
    },
    transform: (value) => {
      if (!value) return []
      if (Array.isArray(value)) {
        return value.filter((item: string) => item && item.trim())
      }
      return []
    },
    format: (value) => value
  },

  // 日期范围字段
  daterange: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || !value.start || !value.end)) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && (value.start || value.end)) {
        if (value.start) {
          const startDate = new Date(value.start)
          if (isNaN(startDate.getTime())) {
            return { valid: false, error: '开始日期格式不正确' }
          }
        }
        if (value.end) {
          const endDate = new Date(value.end)
          if (isNaN(endDate.getTime())) {
            return { valid: false, error: '结束日期格式不正确' }
          }
        }
        if (value.start && value.end) {
          const startDate = new Date(value.start)
          const endDate = new Date(value.end)
          if (startDate > endDate) {
            return { valid: false, error: '开始日期不能晚于结束日期' }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value) return null
      const transformed: any = {}
      if (value.start) {
        const startDate = new Date(value.start)
        transformed.start = isNaN(startDate.getTime()) ? null : startDate.toISOString().split('T')[0]
      }
      if (value.end) {
        const endDate = new Date(value.end)
        transformed.end = isNaN(endDate.getTime()) ? null : endDate.toISOString().split('T')[0]
      }
      return transformed
    },
    format: (value) => value
  },

  // 多日期字段
  multidate: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || !Array.isArray(value) || value.length === 0)) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && Array.isArray(value)) {
        for (const dateStr of value) {
          if (typeof dateStr === 'string' && dateStr.trim() !== '') {
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) {
              return { valid: false, error: '日期格式不正确' }
            }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map(dateStr => {
          if (typeof dateStr === 'string' && dateStr.trim() !== '') {
            const date = new Date(dateStr)
            return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
          }
          return null
        }).filter(date => date !== null)
      }
      return []
    },
    format: (value) => value
  },

  // 时间字段
  time: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(value.trim())) {
          return { valid: false, error: '时间格式不正确，应为HH:mm格式' }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value || value.trim() === '') return null
      return value.trim()
    },
    format: (value) => value
  },

  // 多图片字段
  multiimage: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || !Array.isArray(value) || value.length === 0)) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string' && item.trim() !== '') {
            try {
              new URL(item)
            } catch {
              return { valid: false, error: '图片URL格式不正确' }
            }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value) return []
      if (Array.isArray(value)) {
        return value.filter(item => item && typeof item === 'string' && item.trim() !== '')
      }
      return []
    },
    format: (value) => value
  },

  // 富文本字段
  richtext: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 条形码字段
  barcode: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        // 简单的条形码格式验证（数字和字母）
        const barcodeRegex = /^[A-Za-z0-9]+$/
        if (!barcodeRegex.test(value.trim())) {
          return { valid: false, error: '条形码格式不正确，只能包含字母和数字' }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim().toUpperCase() : value,
    format: (value) => value
  },

  // 复选框字段
  checkbox: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (value === null || value === undefined)) {
        return { valid: false, error: '此字段为必填项' }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (value === null || value === undefined) return false
      return Boolean(value)
    },
    format: (value) => value
  },

  // 级联选择字段
  cascader: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || (Array.isArray(value) && value.length === 0))) {
        return { valid: false, error: '此字段为必填项' }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value) return null
      if (Array.isArray(value)) {
        return value.filter(item => item !== null && item !== undefined)
      }
      return value
    },
    format: (value) => value
  },

  // 一对一关联字段
  relation_one: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || value.trim() === '')) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && value.trim() !== '') {
        // 验证UUID格式
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(value.trim())) {
          return { valid: false, error: '关联ID格式不正确' }
        }
      }
      return { valid: true }
    },
    transform: (value) => value ? String(value).trim() : value,
    format: (value) => value
  },

  // 一对多关联字段
  relation_many: {
    validate: (value, fieldDef) => {
      if (fieldDef.required && (!value || !Array.isArray(value) || value.length === 0)) {
        return { valid: false, error: '此字段为必填项' }
      }
      if (value && Array.isArray(value)) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        for (const item of value) {
          if (typeof item === 'string' && item.trim() !== '') {
            if (!uuidRegex.test(item.trim())) {
              return { valid: false, error: '关联ID格式不正确' }
            }
          }
        }
      }
      return { valid: true }
    },
    transform: (value) => {
      if (!value) return []
      if (Array.isArray(value)) {
        return value.filter(item => item && typeof item === 'string' && item.trim() !== '')
      }
      return []
    },
    format: (value) => value
  }
}

// 字段处理器管理器
export class FieldProcessorManager {
  private processors: Record<FieldType, FieldProcessor> = baseFieldProcessors

  // 注册自定义处理器
  registerProcessor(type: FieldType, processor: FieldProcessor) {
    this.processors[type] = processor
  }

  // 获取处理器
  getProcessor(type: FieldType): FieldProcessor {
    return this.processors[type] || baseFieldProcessors.text
  }

  // 验证字段值
  validateField(value: any, fieldDef: FieldDef): { valid: boolean; error?: string } {
    const processor = this.getProcessor(fieldDef.type)
    return processor.validate(value, fieldDef)
  }

  // 转换字段值
  transformField(value: any, fieldDef: FieldDef): any {
    const processor = this.getProcessor(fieldDef.type)
    return processor.transform(value, fieldDef)
  }

  // 格式化字段值
  formatField(value: any, fieldDef: FieldDef): any {
    const processor = this.getProcessor(fieldDef.type)
    return processor.format(value, fieldDef)
  }

  // 批量验证记录
  validateRecord(record: Record<string, any>, fieldDefs: FieldDef[]): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}
    let valid = true

    for (const fieldDef of fieldDefs) {
      const value = record[fieldDef.key]
      const validation = this.validateField(value, fieldDef)
      
      if (!validation.valid) {
        errors[fieldDef.key] = validation.error!
        valid = false
      }
    }

    return { valid, errors }
  }

  // 批量转换记录
  transformRecord(record: Record<string, any>, fieldDefs: FieldDef[]): Record<string, any> {
    const transformed: Record<string, any> = {}

    for (const fieldDef of fieldDefs) {
      const value = record[fieldDef.key]
      transformed[fieldDef.key] = this.transformField(value, fieldDef)
    }

    return transformed
  }
}

// 导出默认实例
export const fieldProcessorManager = new FieldProcessorManager()
