import { sql } from 'drizzle-orm'

// JSONB 条件查询帮助函数
export function jsonEq(table: any, key: string, value: any) {
  return sql`${table.props}->>${key} = ${value}`
}

export function jsonNeq(table: any, key: string, value: any) {
  return sql`${table.props}->>${key} != ${value}`
}

export function jsonContains(table: any, key: string, value: any) {
  return sql`${table.props}->${key} @> ${JSON.stringify(value)}`
}

export function jsonIn(table: any, key: string, values: any[]) {
  return sql`${table.props}->>${key} = ANY(${values})`
}

export function jsonLike(table: any, key: string, pattern: string) {
  return sql`${table.props}->>${key} LIKE ${pattern}`
}

export function jsonGt(table: any, key: string, value: number) {
  return sql`(${table.props}->>${key})::numeric > ${value}`
}

export function jsonGte(table: any, key: string, value: number) {
  return sql`(${table.props}->>${key})::numeric >= ${value}`
}

export function jsonLt(table: any, key: string, value: number) {
  return sql`(${table.props}->>${key})::numeric < ${value}`
}

export function jsonLte(table: any, key: string, value: number) {
  return sql`(${table.props}->>${key})::numeric <= ${value}`
}

// JSONB 排序帮助函数
export function buildOrderBy(table: any, sort?: string) {
  if (!sort) {
    return [sql`${table.createdAt} DESC`]
  }
  
  const [field, direction] = sort.split(':')
  const order = direction === 'asc' ? 'ASC' : 'DESC'
  
  // 如果是JSONB字段，使用->>操作符
  if (field.includes('.')) {
    return [sql`${table.props}->>${field} ${sql.raw(order)}`]
  }
  
  // 如果是普通字段，直接使用
  return [sql`${table[field]} ${sql.raw(order)}`]
}

// JSONB 投影帮助函数
export function projectProps(props: Record<string, any>, fields?: string) {
  if (!fields) {
    return props
  }
  
  const fieldList = fields.split(',').map(f => f.trim())
  const result: Record<string, any> = {}
  
  for (const field of fieldList) {
    if (props.hasOwnProperty(field)) {
      result[field] = props[field]
    }
  }
  
  return result
}

// 构建JSONB查询条件
export function buildJsonbWhere(table: any, filters: Record<string, any>) {
  const conditions = []
  
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) {
      continue
    }
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      // 复杂查询条件
      if (value.$eq !== undefined) {
        conditions.push(jsonEq(table, key, value.$eq))
      } else if (value.$ne !== undefined) {
        conditions.push(jsonNeq(table, key, value.$ne))
      } else if (value.$gt !== undefined) {
        conditions.push(jsonGt(table, key, value.$gt))
      } else if (value.$gte !== undefined) {
        conditions.push(jsonGte(table, key, value.$gte))
      } else if (value.$lt !== undefined) {
        conditions.push(jsonLt(table, key, value.$lt))
      } else if (value.$lte !== undefined) {
        conditions.push(jsonLte(table, key, value.$lte))
      } else if (value.$in !== undefined) {
        conditions.push(jsonIn(table, key, value.$in))
      } else if (value.$contains !== undefined) {
        conditions.push(jsonContains(table, key, value.$contains))
      } else if (value.$like !== undefined) {
        conditions.push(jsonLike(table, key, value.$like))
      }
    } else {
      // 简单等值查询
      conditions.push(jsonEq(table, key, value))
    }
  }
  
  return conditions
}
