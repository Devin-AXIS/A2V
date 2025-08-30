// 字段处理器架构
// 支持复杂字段类型：primitive、composite、relation、lookup、computed

export interface FieldDef {
  id: string
  directoryId: string
  key: string
  kind: 'primitive' | 'composite' | 'relation' | 'lookup' | 'computed'
  type: string
  schema?: any
  relation?: any
  lookup?: any
  computed?: any
  validators?: any
  readRoles?: string[]
  writeRoles?: string[]
  required?: boolean
}

export interface Ctx {
  tenantId: string
  now: Date
}

// 字段处理器
export const processors = {
  primitive: {
    async serialize(v: any, f: FieldDef, _ctx: Ctx) { 
      return v 
    },
    async deserialize(v: any) { 
      return v 
    },
  },
  composite: {
    async serialize(v: any, f: FieldDef, _ctx: Ctx) {
      // 按 f.schema 做结构校验/标准化
      if (f.schema && typeof f.schema === 'object') {
        // 简单的schema验证
        if (f.schema.type === 'array' && !Array.isArray(v)) {
          throw new Error(`Field ${f.key} must be an array`)
        }
        if (f.schema.type === 'object' && (typeof v !== 'object' || Array.isArray(v))) {
          throw new Error(`Field ${f.key} must be an object`)
        }
      }
      return v
    },
    async deserialize(v: any) { 
      return v 
    },
  },
  relation: {
    async serialize(v: any, f: FieldDef, _ctx: Ctx) {
      // 允许传单个ID/URN或数组，统一为数组形式存储
      const arr = Array.isArray(v) ? v : [v]
      return arr.filter(Boolean) // 过滤空值
    },
    async deserialize(v: any) { 
      return v 
    },
  },
  lookup: {
    async serialize(v: any, f: FieldDef, _ctx: Ctx) {
      // 同步"假装归一化"；生产中接入缓存/第三方API并带 TTL
      if (typeof v === 'string') {
        return { 
          code: v, 
          name: v, 
          source: f.lookup?.source || 'manual' 
        }
      }
      return v
    },
    async deserialize(v: any) { 
      return v 
    },
  },
  computed: {
    async serialize(_v: any, f: FieldDef, _ctx: Ctx) {
      // writeThrough 模式在写入时计算
      // 这里可以根据computed配置进行计算
      if (f.computed?.expr) {
        // 简单的计算表达式处理
        return _v
      }
      return _v
    },
    async deserialize(v: any) { 
      return v 
    },
  },
}

// 运行序列化处理器
export async function runSerialize(
  kind: keyof typeof processors, 
  value: any, 
  field: FieldDef, 
  ctx: Ctx
): Promise<any> {
  const processor = processors[kind]
  if (!processor) {
    throw new Error(`Unknown field kind: ${kind}`)
  }
  return processor.serialize(value, field, ctx)
}

// 运行反序列化处理器
export async function runDeserialize(
  kind: keyof typeof processors, 
  value: any
): Promise<any> {
  const processor = processors[kind]
  if (!processor) {
    throw new Error(`Unknown field kind: ${kind}`)
  }
  return processor.deserialize(value)
}
