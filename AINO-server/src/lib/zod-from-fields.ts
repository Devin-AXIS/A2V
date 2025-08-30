import { z } from 'zod'
import type { FieldDef } from './field-processors'

// 根据字段定义生成Zod校验器
export function zodFromFields(fields: FieldDef[]) {
  const schema: Record<string, z.ZodTypeAny> = {}
  
  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny
    
    // 根据字段类型生成校验规则
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'table':
        fieldSchema = z.string()
        break
      case 'number':
        fieldSchema = z.number()
        break
      case 'progress':
        fieldSchema = z.number()
        break
      case 'percent':
        fieldSchema = z.number().min(0).max(100)
        break
      case 'email':
        fieldSchema = z.string().email()
        break
      case 'phone':
        fieldSchema = z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
        break
      case 'boolean':
        fieldSchema = z.boolean()
        break
      case 'date':
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确')
        break
      case 'datetime':
        fieldSchema = z.string().datetime()
        break
      case 'select':
        fieldSchema = z.string()
        break
      case 'multiselect':
        fieldSchema = z.array(z.string())
        break
      case 'image':
      case 'profile':
      case 'file':
        fieldSchema = z.string().url('URL格式不正确')
        break
      case 'video':
        fieldSchema = z.string().optional()
        break
      case 'multivideo':
        fieldSchema = z.array(z.string())
        break
      case 'daterange':
        fieldSchema = z.object({
          start: z.string().optional(),
          end: z.string().optional()
        }).optional()
        break
      case 'multidate':
        fieldSchema = z.array(z.string())
        break
      case 'time':
        fieldSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '时间格式不正确')
        break
      case 'multiimage':
        fieldSchema = z.array(z.string().url('图片URL格式不正确'))
        break
      case 'richtext':
        fieldSchema = z.string()
        break
      case 'barcode':
        fieldSchema = z.string().regex(/^[A-Za-z0-9]+$/, '条形码格式不正确')
        break
      case 'checkbox':
        fieldSchema = z.boolean()
        break
      case 'cascader':
        fieldSchema = z.array(z.any())
        break
      case 'relation_one':
        fieldSchema = z.string().uuid('关联ID格式不正确')
        break
      case 'relation_many':
        fieldSchema = z.array(z.string().uuid('关联ID格式不正确'))
        break
      case 'tags':
        fieldSchema = z.array(z.string())
        break
      case 'experience':
        fieldSchema = z.array(z.object({
          id: z.string().optional(),
          type: z.string().optional(),
          title: z.string().optional(),
          organization: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          description: z.string().optional(),
          issuer: z.string().optional(),
          credentialId: z.string().optional(),
          credentialUrl: z.string().optional(),
          skills: z.array(z.string()).optional(),
          attachments: z.array(z.string()).optional()
        })).optional()
        break
      case 'identity_verification':
        fieldSchema = z.object({
          name: z.string().optional(),
          idNumber: z.string().optional(),
          frontPhoto: z.string().optional(),
          backPhoto: z.string().optional()
        }).optional()
        break
      case 'other_verification':
        fieldSchema = z.record(z.union([z.string(), z.array(z.string())])).optional()
        break
      case 'json':
        fieldSchema = z.any()
        break
      case 'array':
        fieldSchema = z.array(z.any())
        break
      default:
        fieldSchema = z.any()
    }
    
    // 添加验证规则
    if (field.validators) {
      if (field.validators.min !== undefined && (field.type === 'number' || field.type === 'progress' || field.type === 'percent') && fieldSchema instanceof z.ZodNumber) {
        fieldSchema = fieldSchema.min(field.validators.min)
      }
      if (field.validators.max !== undefined && (field.type === 'number' || field.type === 'progress' || field.type === 'percent') && fieldSchema instanceof z.ZodNumber) {
        fieldSchema = fieldSchema.max(field.validators.max)
      }
      if (field.validators.minLength && (field.type === 'text' || field.type === 'textarea') && fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.min(field.validators.minLength)
      }
      if (field.validators.maxLength && (field.type === 'text' || field.type === 'textarea') && fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.max(field.validators.maxLength)
      }
      if (field.validators.pattern && (field.type === 'text' || field.type === 'textarea') && fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.regex(new RegExp(field.validators.pattern))
      }
      if (field.validators.minItems && field.type === 'multiselect' && fieldSchema instanceof z.ZodArray) {
        fieldSchema = fieldSchema.min(field.validators.minItems)
      }
      if (field.validators.maxItems && field.type === 'multiselect' && fieldSchema instanceof z.ZodArray) {
        fieldSchema = fieldSchema.max(field.validators.maxItems)
      }
    }
    
    // 处理必填字段
    if (field.required) {
      // 必填字段保持原样
    } else {
      fieldSchema = fieldSchema.optional()
    }
    
    schema[field.key] = fieldSchema
  }
  
  return z.object(schema)
}

// 生成部分更新校验器（所有字段都是可选的）
export function zodFromFieldsPartial(fields: FieldDef[]) {
  const schema: Record<string, z.ZodTypeAny> = {}
  
  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny
    
    // 根据字段类型生成校验规则
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'table':
        fieldSchema = z.string()
        break
      case 'number':
        fieldSchema = z.number()
        break
      case 'progress':
        fieldSchema = z.number()
        break
      case 'percent':
        fieldSchema = z.number().min(0).max(100)
        break
      case 'email':
        fieldSchema = z.string().email()
        break
      case 'phone':
        fieldSchema = z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
        break
      case 'boolean':
        fieldSchema = z.boolean()
        break
      case 'date':
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确')
        break
      case 'datetime':
        fieldSchema = z.string().datetime()
        break
      case 'select':
        fieldSchema = z.string()
        break
      case 'multiselect':
        fieldSchema = z.array(z.string())
        break
      case 'image':
      case 'profile':
      case 'file':
        fieldSchema = z.string().url('URL格式不正确')
        break
      case 'video':
        fieldSchema = z.string().optional()
        break
      case 'multivideo':
        fieldSchema = z.array(z.string())
        break
      case 'daterange':
        fieldSchema = z.object({
          start: z.string().optional(),
          end: z.string().optional()
        }).optional()
        break
      case 'multidate':
        fieldSchema = z.array(z.string())
        break
      case 'time':
        fieldSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '时间格式不正确')
        break
      case 'multiimage':
        fieldSchema = z.array(z.string().url('图片URL格式不正确'))
        break
      case 'richtext':
        fieldSchema = z.string()
        break
      case 'barcode':
        fieldSchema = z.string().regex(/^[A-Za-z0-9]+$/, '条形码格式不正确')
        break
      case 'checkbox':
        fieldSchema = z.boolean()
        break
      case 'cascader':
        fieldSchema = z.array(z.any())
        break
      case 'relation_one':
        fieldSchema = z.string().uuid('关联ID格式不正确')
        break
      case 'relation_many':
        fieldSchema = z.array(z.string().uuid('关联ID格式不正确'))
        break
      case 'tags':
        fieldSchema = z.array(z.string())
        break
      case 'experience':
        fieldSchema = z.array(z.object({
          id: z.string().optional(),
          type: z.string().optional(),
          title: z.string().optional(),
          organization: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          description: z.string().optional(),
          issuer: z.string().optional(),
          credentialId: z.string().optional(),
          credentialUrl: z.string().optional(),
          skills: z.array(z.string()).optional(),
          attachments: z.array(z.string()).optional()
        })).optional()
        break
      case 'identity_verification':
        fieldSchema = z.object({
          name: z.string().optional(),
          idNumber: z.string().optional(),
          frontPhoto: z.string().optional(),
          backPhoto: z.string().optional()
        }).optional()
        break
      case 'other_verification':
        fieldSchema = z.record(z.union([z.string(), z.array(z.string())])).optional()
        break
      case 'json':
        fieldSchema = z.any()
        break
      case 'array':
        fieldSchema = z.array(z.any())
        break
      default:
        fieldSchema = z.any()
    }
    
    // 添加验证规则
    if (field.validators) {
      if (field.validators.min !== undefined && (field.type === 'number' || field.type === 'progress' || field.type === 'percent') && fieldSchema instanceof z.ZodNumber) {
        fieldSchema = fieldSchema.min(field.validators.min)
      }
      if (field.validators.max !== undefined && (field.type === 'number' || field.type === 'progress' || field.type === 'percent') && fieldSchema instanceof z.ZodNumber) {
        fieldSchema = fieldSchema.max(field.validators.max)
      }
      if (field.validators.minLength && (field.type === 'text' || field.type === 'textarea') && fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.min(field.validators.minLength)
      }
      if (field.validators.maxLength && (field.type === 'text' || field.type === 'textarea') && fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.max(field.validators.maxLength)
      }
      if (field.validators.pattern && (field.type === 'text' || field.type === 'textarea') && fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.regex(new RegExp(field.validators.pattern))
      }
      if (field.validators.minItems && field.type === 'multiselect' && fieldSchema instanceof z.ZodArray) {
        fieldSchema = fieldSchema.min(field.validators.minItems)
      }
      if (field.validators.maxItems && field.type === 'multiselect' && fieldSchema instanceof z.ZodArray) {
        fieldSchema = fieldSchema.max(field.validators.maxItems)
      }
    }
    
    // 部分更新时所有字段都是可选的
    schema[field.key] = fieldSchema.optional()
  }
  
  return z.object(schema)
}

// 生成字段选项验证器
export function zodFromFieldOptions(field: FieldDef) {
  if (field.type === 'select' && field.schema?.options) {
    return z.enum(field.schema.options as [string, ...string[]])
  }
  if (field.type === 'multiselect' && field.schema?.options) {
    return z.array(z.enum(field.schema.options as [string, ...string[]]))
  }
  return null
}

// 生成记录创建校验器
export function createRecordValidator(fields: FieldDef[]) {
  return zodFromFields(fields)
}

// 生成记录更新校验器
export function updateRecordValidator(fields: FieldDef[]) {
  return zodFromFieldsPartial(fields)
}

// 生成字段值校验器
export function fieldValueValidator(field: FieldDef) {
  const baseSchema = zodFromFields([field])
  return baseSchema.shape[field.key]
}