import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { directoryDefs, fieldDefs } from '../db/schema'
import type { FieldDef } from './processors'

// 获取目录元数据
export async function getDirectoryMeta(dirSlug: string) {
  const [directory] = await db.select()
    .from(directoryDefs)
    .where(eq(directoryDefs.slug, dirSlug))
    .limit(1)
  
  if (!directory) {
    throw new Error(`Directory not found: ${dirSlug}`)
  }
  
  // 获取字段定义
  const fields = await db.select()
    .from(fieldDefs)
    .where(eq(fieldDefs.directoryId, directory.id))
    .orderBy(fieldDefs.id)
  
  return {
    directory,
    fields: fields as FieldDef[]
  }
}

// 根据目录ID获取字段定义
export async function getFieldsByDirectoryId(directoryId: string): Promise<FieldDef[]> {
  const fields = await db.select()
    .from(fieldDefs)
    .where(eq(fieldDefs.directoryId, directoryId))
    .orderBy(fieldDefs.id)
  
  return fields as FieldDef[]
}

// 根据目录slug获取字段定义
export async function getFieldsByDirectorySlug(dirSlug: string): Promise<FieldDef[]> {
  const [directory] = await db.select()
    .from(directoryDefs)
    .where(eq(directoryDefs.slug, dirSlug))
    .limit(1)
  
  if (!directory) {
    return []
  }
  
  return getFieldsByDirectoryId(directory.id)
}

// 获取所有目录定义
export async function getAllDirectories() {
  return await db.select()
    .from(directoryDefs)
    .where(eq(directoryDefs.status, 'active'))
    .orderBy(directoryDefs.id)
}

// 验证字段定义
export function validateFieldDef(field: any): field is FieldDef {
  return (
    field &&
    typeof field.id === 'string' &&
    typeof field.key === 'string' &&
    typeof field.kind === 'string' &&
    typeof field.type === 'string' &&
    ['primitive', 'composite', 'relation', 'lookup', 'computed'].includes(field.kind)
  )
}
