import { FieldsRepository } from "./repo"
import type { 
  CreateFieldRequest, 
  UpdateFieldRequest, 
  GetFieldsRequest,
  CreateFieldCategoryRequest,
  UpdateFieldCategoryRequest
} from "./dto"

export class FieldsService {
  private repo = new FieldsRepository()

  // 字段相关业务逻辑
  async createField(data: CreateFieldRequest & { applicationId: string; directoryId: string }, userId: string) {
    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(data.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    const hasDirAccess = await this.repo.checkDirectoryAccess(data.directoryId, userId)
    if (!hasDirAccess) {
      throw new Error("无权访问该目录")
    }

    // 检查字段key是否已存在
    const keyExists = await this.repo.checkFieldKeyExists(data.key, data.directoryId)
    if (keyExists) {
      throw new Error(`字段标识符 "${data.key}" 已存在`)
    }

    // 如果指定了分类，检查分类是否存在
    if (data.categoryId) {
      const category = await this.repo.getFieldCategory(data.categoryId)
      if (!category) {
        throw new Error("指定的字段分类不存在")
      }
      if (category.directoryId !== data.directoryId) {
        throw new Error("字段分类与目录不匹配")
      }
    }

    // 创建字段
    const field = await this.repo.createField(data)
    return field
  }

  async updateField(id: string, data: UpdateFieldRequest, userId: string) {
    // 获取字段信息
    const existingField = await this.repo.getField(id)
    if (!existingField) {
      throw new Error("字段不存在")
    }

    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(existingField.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    const hasDirAccess = await this.repo.checkDirectoryAccess(existingField.directoryId, userId)
    if (!hasDirAccess) {
      throw new Error("无权访问该目录")
    }

    // 检查字段是否被锁定
    if (existingField.locked) {
      throw new Error("字段已被锁定，无法修改")
    }

    // 如果指定了分类，检查分类是否存在
    if (data.categoryId) {
      const category = await this.repo.getFieldCategory(data.categoryId)
      if (!category) {
        throw new Error("指定的字段分类不存在")
      }
      if (category.directoryId !== existingField.directoryId) {
        throw new Error("字段分类与目录不匹配")
      }
    }

    // 更新字段
    const field = await this.repo.updateField(id, data)
    return field
  }

  async deleteField(id: string, userId: string) {
    // 获取字段信息
    const existingField = await this.repo.getField(id)
    if (!existingField) {
      throw new Error("字段不存在")
    }

    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(existingField.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    const hasDirAccess = await this.repo.checkDirectoryAccess(existingField.directoryId, userId)
    if (!hasDirAccess) {
      throw new Error("无权访问该目录")
    }

    // 检查字段是否被锁定
    if (existingField.locked) {
      throw new Error("字段已被锁定，无法删除")
    }

    // 删除字段
    const field = await this.repo.deleteField(id)
    return field
  }

  async getField(id: string, userId: string) {
    // 获取字段信息
    const field = await this.repo.getField(id)
    if (!field) {
      throw new Error("字段不存在")
    }

    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(field.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    return field
  }

  async getFields(params: GetFieldsRequest, userId: string) {
    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(params.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    // 如果指定了目录，检查目录访问权限
    if (params.directoryId) {
      const hasDirAccess = await this.repo.checkDirectoryAccess(params.directoryId, userId)
      if (!hasDirAccess) {
        throw new Error("无权访问该目录")
      }
    }

    // 查询字段列表
    const result = await this.repo.getFields(params)
    return result
  }

  async getFieldsByDirectory(directoryId: string, userId: string) {
    // 权限验证
    const hasDirAccess = await this.repo.checkDirectoryAccess(directoryId, userId)
    if (!hasDirAccess) {
      throw new Error("无权访问该目录")
    }

    // 查询目录下的所有字段
    const fields = await this.repo.getFieldsByDirectory(directoryId)
    return fields
  }

  async updateFieldOrder(fieldId: string, order: number, userId: string) {
    // 获取字段信息
    const existingField = await this.repo.getField(fieldId)
    if (!existingField) {
      throw new Error("字段不存在")
    }

    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(existingField.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    const hasDirAccess = await this.repo.checkDirectoryAccess(existingField.directoryId, userId)
    if (!hasDirAccess) {
      throw new Error("无权访问该目录")
    }

    // 更新字段顺序
    const field = await this.repo.updateFieldOrder(fieldId, order)
    return field
  }

  // 字段分类相关业务逻辑
  async createFieldCategory(data: CreateFieldCategoryRequest & { applicationId: string; directoryId: string }, userId: string) {
    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(data.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    const hasDirAccess = await this.repo.checkDirectoryAccess(data.directoryId, userId)
    if (!hasDirAccess) {
      throw new Error("无权访问该目录")
    }

    // 检查分类名称是否已存在
    const nameExists = await this.repo.checkCategoryNameExists(data.name, data.directoryId)
    if (nameExists) {
      throw new Error(`分类名称 "${data.name}" 已存在`)
    }

    // 创建字段分类
    const category = await this.repo.createFieldCategory(data)
    return category
  }

  async updateFieldCategory(id: string, data: UpdateFieldCategoryRequest, userId: string) {
    // 获取分类信息
    const existingCategory = await this.repo.getFieldCategory(id)
    if (!existingCategory) {
      throw new Error("字段分类不存在")
    }

    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(existingCategory.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    const hasDirAccess = await this.repo.checkDirectoryAccess(existingCategory.directoryId, userId)
    if (!hasDirAccess) {
      throw new Error("无权访问该目录")
    }

    // 检查是否为系统分类
    if (existingCategory.system) {
      throw new Error("系统分类不能修改")
    }

    // 如果修改了名称，检查名称是否已存在
    if (data.name && data.name !== existingCategory.name) {
      const nameExists = await this.repo.checkCategoryNameExists(data.name, existingCategory.directoryId, id)
      if (nameExists) {
        throw new Error(`分类名称 "${data.name}" 已存在`)
      }
    }

    // 更新字段分类
    const category = await this.repo.updateFieldCategory(id, data)
    return category
  }

  async deleteFieldCategory(id: string, userId: string) {
    // 获取分类信息
    const existingCategory = await this.repo.getFieldCategory(id)
    if (!existingCategory) {
      throw new Error("字段分类不存在")
    }

    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(existingCategory.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    const hasDirAccess = await this.repo.checkDirectoryAccess(existingCategory.directoryId, userId)
    if (!hasDirAccess) {
      throw new Error("无权访问该目录")
    }

    // 检查是否为系统分类
    if (existingCategory.system) {
      throw new Error("系统分类不能删除")
    }

    // 检查分类下是否有字段
    const fieldsInCategory = await this.repo.getFields({
      applicationId: existingCategory.applicationId,
      directoryId: existingCategory.directoryId,
      categoryId: id,
      page: 1,
      limit: 1
    }, userId)

    if (fieldsInCategory.total > 0) {
      throw new Error(`该分类下还有 ${fieldsInCategory.total} 个字段，请先移除或重新分类这些字段`)
    }

    // 删除字段分类
    const category = await this.repo.deleteFieldCategory(id)
    return category
  }

  async getFieldCategory(id: string, userId: string) {
    // 获取分类信息
    const category = await this.repo.getFieldCategory(id)
    if (!category) {
      throw new Error("字段分类不存在")
    }

    // 权限验证
    const hasAppAccess = await this.repo.checkApplicationAccess(category.applicationId, userId)
    if (!hasAppAccess) {
      throw new Error("无权访问该应用")
    }

    return category
  }

  async getFieldCategories(applicationId: string, directoryId?: string, userId?: string) {
    // 权限验证
    if (userId) {
      const hasAppAccess = await this.repo.checkApplicationAccess(applicationId, userId)
      if (!hasAppAccess) {
        throw new Error("无权访问该应用")
      }

      if (directoryId) {
        const hasDirAccess = await this.repo.checkDirectoryAccess(directoryId, userId)
        if (!hasDirAccess) {
          throw new Error("无权访问该目录")
        }
      }
    }

    // 查询字段分类列表
    const categories = await this.repo.getFieldCategories(applicationId, directoryId)
    return categories
  }
}

