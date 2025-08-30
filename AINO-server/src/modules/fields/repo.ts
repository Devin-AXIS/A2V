import { eq, and, desc, asc, sql, count } from "drizzle-orm"
import { db } from "@/db"
import { fields, fieldCategories, directories, applications } from "@/db/schema"
import type { CreateFieldRequest, UpdateFieldRequest, GetFieldsRequest } from "./dto"
import type { CreateFieldCategoryRequest, UpdateFieldCategoryRequest } from "./dto"

export class FieldsRepository {
  // 字段相关操作
  async createField(data: CreateFieldRequest & { applicationId: string; directoryId: string }) {
    const [field] = await db
      .insert(fields)
      .values({
        applicationId: data.applicationId,
        directoryId: data.directoryId,
        categoryId: data.categoryId || null,
        key: data.key,
        label: data.label,
        type: data.type,
        required: data.required,
        unique: data.unique,
        locked: data.locked,
        enabled: data.enabled,
        desc: data.desc || null,
        placeholder: data.placeholder || null,
        min: data.min || null,
        max: data.max || null,
        step: data.step || null,
        unit: data.unit || null,
        options: data.options || null,
        default: data.default || null,
        showInList: data.showInList,
        showInForm: data.showInForm,
        showInDetail: data.showInDetail,
        trueLabel: data.trueLabel || null,
        falseLabel: data.falseLabel || null,
        accept: data.accept || null,
        maxSizeMB: data.maxSizeMB || null,
        relation: data.relation || null,
        cascaderOptions: data.cascaderOptions || null,
        dateMode: data.dateMode || null,
        preset: data.preset || null,
        skillsConfig: data.skillsConfig || null,
        progressConfig: data.progressConfig || null,
        customExperienceConfig: data.customExperienceConfig || null,
        identityVerificationConfig: data.identityVerificationConfig || null,
        certificateConfig: data.certificateConfig || null,
        otherVerificationConfig: data.otherVerificationConfig || null,
        imageConfig: data.imageConfig || null,
        videoConfig: data.videoConfig || null,
        booleanConfig: data.booleanConfig || null,
        multiselectConfig: data.multiselectConfig || null,
        order: data.order,
      })
      .returning()

    return field
  }

  async updateField(id: string, data: UpdateFieldRequest) {
    const [field] = await db
      .update(fields)
      .set({
        categoryId: data.categoryId || null,
        label: data.label,
        type: data.type,
        required: data.required,
        unique: data.unique,
        locked: data.locked,
        enabled: data.enabled,
        desc: data.desc || null,
        placeholder: data.placeholder || null,
        min: data.min || null,
        max: data.max || null,
        step: data.step || null,
        unit: data.unit || null,
        options: data.options || null,
        default: data.default || null,
        showInList: data.showInList,
        showInForm: data.showInForm,
        showInDetail: data.showInDetail,
        trueLabel: data.trueLabel || null,
        falseLabel: data.falseLabel || null,
        accept: data.accept || null,
        maxSizeMB: data.maxSizeMB || null,
        relation: data.relation || null,
        cascaderOptions: data.cascaderOptions || null,
        dateMode: data.dateMode || null,
        preset: data.preset || null,
        skillsConfig: data.skillsConfig || null,
        progressConfig: data.progressConfig || null,
        customExperienceConfig: data.customExperienceConfig || null,
        identityVerificationConfig: data.identityVerificationConfig || null,
        certificateConfig: data.certificateConfig || null,
        otherVerificationConfig: data.otherVerificationConfig || null,
        imageConfig: data.imageConfig || null,
        videoConfig: data.videoConfig || null,
        booleanConfig: data.booleanConfig || null,
        multiselectConfig: data.multiselectConfig || null,
        order: data.order,
        updatedAt: new Date(),
      })
      .where(eq(fields.id, id))
      .returning()

    return field
  }

  async deleteField(id: string) {
    const [field] = await db
      .delete(fields)
      .where(eq(fields.id, id))
      .returning()

    return field
  }

  async getField(id: string) {
    const [field] = await db
      .select()
      .from(fields)
      .where(eq(fields.id, id))

    return field
  }

  async getFields(params: GetFieldsRequest) {
    const { applicationId, directoryId, categoryId, type, enabled, page, limit } = params
    const offset = (page - 1) * limit

    // 构建查询条件
    const conditions = [eq(fields.applicationId, applicationId)]
    
    if (directoryId) {
      conditions.push(eq(fields.directoryId, directoryId))
    }
    
    if (categoryId) {
      conditions.push(eq(fields.categoryId, categoryId))
    }
    
    if (type) {
      conditions.push(eq(fields.type, type))
    }
    
    if (enabled !== undefined) {
      conditions.push(eq(fields.enabled, enabled))
    }

    // 查询字段列表
    const fieldsList = await db
      .select()
      .from(fields)
      .where(and(...conditions))
      .orderBy(asc(fields.order), asc(fields.createdAt))
      .limit(limit)
      .offset(offset)

    // 查询总数
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(fields)
      .where(and(...conditions))

    return {
      fields: fieldsList,
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
    }
  }

  async getFieldsByDirectory(directoryId: string) {
    return await db
      .select()
      .from(fields)
      .where(eq(fields.directoryId, directoryId))
      .orderBy(asc(fields.order), asc(fields.createdAt))
  }

  async checkFieldKeyExists(key: string, directoryId: string, excludeId?: string) {
    const conditions = [
      eq(fields.key, key),
      eq(fields.directoryId, directoryId)
    ]
    
    if (excludeId) {
      conditions.push(sql`${fields.id} != ${excludeId}`)
    }

    const [field] = await db
      .select({ id: fields.id })
      .from(fields)
      .where(and(...conditions))

    return !!field
  }

  async updateFieldOrder(fieldId: string, order: number) {
    const [field] = await db
      .update(fields)
      .set({ order, updatedAt: new Date() })
      .where(eq(fields.id, fieldId))
      .returning()

    return field
  }

  // 字段分类相关操作
  async createFieldCategory(data: CreateFieldCategoryRequest & { applicationId: string; directoryId: string }) {
    const [category] = await db
      .insert(fieldCategories)
      .values({
        applicationId: data.applicationId,
        directoryId: data.directoryId,
        name: data.name,
        description: data.description || null,
        order: data.order,
        enabled: data.enabled,
        system: data.system,
        predefinedFields: data.predefinedFields,
      })
      .returning()

    return category
  }

  async updateFieldCategory(id: string, data: UpdateFieldCategoryRequest) {
    const [category] = await db
      .update(fieldCategories)
      .set({
        name: data.name,
        description: data.description || null,
        order: data.order,
        enabled: data.enabled,
        system: data.system,
        predefinedFields: data.predefinedFields,
        updatedAt: new Date(),
      })
      .where(eq(fieldCategories.id, id))
      .returning()

    return category
  }

  async deleteFieldCategory(id: string) {
    const [category] = await db
      .delete(fieldCategories)
      .where(eq(fieldCategories.id, id))
      .returning()

    return category
  }

  async getFieldCategory(id: string) {
    const [category] = await db
      .select()
      .from(fieldCategories)
      .where(eq(fieldCategories.id, id))

    return category
  }

  async getFieldCategories(applicationId: string, directoryId?: string) {
    const conditions = [eq(fieldCategories.applicationId, applicationId)]
    
    if (directoryId) {
      conditions.push(eq(fieldCategories.directoryId, directoryId))
    }

    return await db
      .select()
      .from(fieldCategories)
      .where(and(...conditions))
      .orderBy(asc(fieldCategories.order), asc(fieldCategories.createdAt))
  }

  async checkCategoryNameExists(name: string, directoryId: string, excludeId?: string) {
    const conditions = [
      eq(fieldCategories.name, name),
      eq(fieldCategories.directoryId, directoryId)
    ]
    
    if (excludeId) {
      conditions.push(sql`${fieldCategories.id} != ${excludeId}`)
    }

    const [category] = await db
      .select({ id: fieldCategories.id })
      .from(fieldCategories)
      .where(and(...conditions))

    return !!category
  }

  // 权限验证相关
  async checkApplicationAccess(applicationId: string, userId: string) {
    // 这里应该检查用户是否有权限访问该应用
    // 暂时返回true，后续需要实现完整的权限系统
    return true
  }

  async checkDirectoryAccess(directoryId: string, userId: string) {
    // 这里应该检查用户是否有权限访问该目录
    // 暂时返回true，后续需要实现完整的权限系统
    return true
  }
}

